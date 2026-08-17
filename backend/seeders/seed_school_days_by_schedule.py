"""
Genera los registros de school_days_by_schedule a partir del nuevo esquema.

Reglas de negocio:
- Por cada curso (teacher_group) y por cada bloque lectivo (teaching_block):
    * 1ra Práctica  -> semana intermedia del bloque
    * 2da Práctica  -> penúltima semana en que se dicta el curso
    * Examen        -> última semana en que se dicta el curso
    * El resto de días -> "Calificación Diaria"
- Si el curso se dicta 2 o 3 veces por semana, la evaluación cae en el
  ÚLTIMO día (cronológicamente) en que se dicta esa semana.
- school_days solo contiene 'Día Lectivo' (los feriados ya vienen
  descartados por el WHERE), así que si el día "teórico" de evaluación
  era feriado, automáticamente el último día disponible de esa semana
  pasa a ser el día anterior más próximo -> "antepone al día anterior".
- Si TODA la semana objetivo se queda sin días para ese curso (curso de
  1 vez por semana y su único día cayó feriado), se retrocede una
  semana completa -> "antepone una semana antes".
"""

import mysql.connector
from collections import defaultdict

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "sv_academic_manager",
    "charset": "utf8mb4",
}

conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor(dictionary=True)

# -----------------------------
# 1. BLOQUES LECTIVOS
# -----------------------------
cursor.execute("""
    SELECT id, year_id, start_day, end_day
    FROM teaching_blocks
    WHERE status = 1
""")
blocks = cursor.fetchall()
blocks_by_year = defaultdict(list)
for b in blocks:
    blocks_by_year[b['year_id']].append(b)

# -----------------------------
# 2. DIAS LECTIVOS (feriados ya excluidos aquí)
# -----------------------------
cursor.execute("""
    SELECT id, teaching_block_id, school_day, day, week_number
    FROM school_days
    WHERE status = 1 AND type = 'Día Lectivo'
""")
school_days = cursor.fetchall()
school_days_by_block = defaultdict(list)
for d in school_days:
    school_days_by_block[d['teaching_block_id']].append(d)

# -----------------------------
# 3. GRUPOS DE ENSEÑANZA (cursos dictados) + su año
# -----------------------------
cursor.execute("""
    SELECT tg.id AS teacher_group_id, tg.course_id, asc_.year_id
    FROM teacher_groups tg
    JOIN academic_staff_contracts asc_
        ON asc_.id = tg.academic_staff_contract_id
    WHERE tg.status = 1 AND asc_.status = 1
""")
teacher_groups = cursor.fetchall()

# -----------------------------
# 4. HORARIOS (schedules) agrupados por curso
# -----------------------------
cursor.execute("""
    SELECT id AS schedule_id, teacher_group_id, day
    FROM schedules
    WHERE status = 1
""")
schedules = cursor.fetchall()
schedules_by_group = defaultdict(list)
for s in schedules:
    schedules_by_group[s['teacher_group_id']].append(s)

cursor.close()

print(f"[debug] teaching_blocks activos: {len(blocks)}")
print(f"[debug] school_days 'Día Lectivo' activos: {len(school_days)}")
print(f"[debug] teacher_groups activos: {len(teacher_groups)}")
print(f"[debug] schedules activos: {len(schedules)}")


# -----------------------------
# 5. FUNCIONES AUXILIARES
# -----------------------------
def agrupar_por_semana(dias_bloque, dias_horario):
    """Filtra los días lectivos del bloque que coinciden con los días de
    la semana en que se dicta el curso y los agrupa por week_number."""
    semanas = defaultdict(list)
    for d in dias_bloque:
        if d['day'] in dias_horario:
            semanas[d['week_number']].append(d)
    for lista in semanas.values():
        lista.sort(key=lambda x: x['school_day'])
    return semanas


def elegir_dia_evaluacion(semanas_ordenadas, semanas, idx_objetivo, usados):
    """Busca el día de evaluación partiendo de la semana objetivo y
    retrocediendo semana a semana si hace falta (semana vacía por
    feriado, o día ya usado por otra evaluación). Dentro de cada semana
    toma el día más tardío disponible."""
    total = len(semanas_ordenadas)
    idx = idx_objetivo if idx_objetivo >= 0 else total + idx_objetivo

    while idx >= 0:
        semana_key = semanas_ordenadas[idx]
        for dia in reversed(semanas.get(semana_key, [])):
            if dia['id'] not in usados:
                return dia
        idx -= 1  # semana sin días disponibles -> antepone una semana antes

    return None


# -----------------------------
# 6. CONSTRUCCIÓN
# -----------------------------
insert_data = []

for group in teacher_groups:
    group_id = group['teacher_group_id']
    year_id = group['year_id']

    group_schedules = schedules_by_group.get(group_id, [])
    if not group_schedules:
        print(f"[debug] grupo {group_id}: sin schedules activos, se salta")
        continue

    dia_a_schedule = {s['day']: s['schedule_id'] for s in group_schedules}
    dias_horario = set(dia_a_schedule.keys())

    bloques_del_anio = blocks_by_year.get(year_id, [])
    if not bloques_del_anio:
        print(f"[debug] grupo {group_id}: no hay teaching_blocks para year_id={year_id}, se salta")
        continue

    for block in bloques_del_anio:
        dias_bloque = school_days_by_block.get(block['id'], [])
        if not dias_bloque:
            print(f"[debug] grupo {group_id}, bloque {block['id']}: sin school_days lectivos, se salta")
            continue

        semanas = agrupar_por_semana(dias_bloque, dias_horario)
        semanas_ordenadas = sorted(semanas.keys())

        if not semanas_ordenadas:
            print(f"[debug] grupo {group_id}, bloque {block['id']}: ningún día del bloque "
                  f"coincide con los días de horario {dias_horario} (revisa 'day' en schedules vs school_days)")
            continue

        usados = set()
        evaluaciones = {}  # school_day_id -> tipo

        objetivos = [
            (-1, "Examen"),                          # última semana
            (-2, "Práctica"),                         # penúltima semana
            (len(semanas_ordenadas) // 2, "Práctica"),  # semana intermedia
        ]

        for idx_objetivo, tipo in objetivos:
            dia = elegir_dia_evaluacion(semanas_ordenadas, semanas, idx_objetivo, usados)
            if dia is None:
                print(f"  Aviso: grupo {group_id}, bloque {block['id']}, "
                      f"no se encontró día disponible para {tipo}")
                continue
            usados.add(dia['id'])
            evaluaciones[dia['id']] = tipo

        # generar registros para todos los horarios (días de la semana) del grupo
        for s in group_schedules:
            schedule_id = s['schedule_id']
            dia_semana = s['day']

            dias_de_ese_horario = [
                d for d in dias_bloque if d['day'] == dia_semana
            ]

            for d in dias_de_ese_horario:
                tipo = evaluaciones.get(d['id'], "Calificación Diaria")
                insert_data.append((
                    schedule_id,
                    d['id'],
                    tipo,
                ))

# -----------------------------
# 7. INSERTAR
# -----------------------------
conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()

print(f"Insertando {len(insert_data)} registros...")

cursor.executemany("""
    INSERT INTO school_days_by_schedule
        (schedule_id, school_day_id, type)
    VALUES (%s, %s, %s)
""", insert_data)

conn.commit()
cursor.close()
conn.close()

print("Simulación completada correctamente")