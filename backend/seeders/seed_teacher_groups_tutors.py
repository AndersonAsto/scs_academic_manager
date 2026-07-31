import random
import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "sv_academic_manager",
}

conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor(dictionary=True)

# Obtener todos los registros de teacher_groups
cursor.execute("""
SELECT
    id,
    academic_staff_contract_id,
    grade_id,
    section_id
FROM teacher_groups
WHERE status = 1
ORDER BY grade_id, section_id
""")

rows = cursor.fetchall()

# Agrupar por grupo (grado-sección)
groups = {}

for row in rows:
    key = (row["grade_id"], row["section_id"])
    groups.setdefault(key, []).append(row)

used_contracts = set()
selected_ids = []

# Procesar grupos en orden aleatorio
group_keys = list(groups.keys())
random.shuffle(group_keys)

for group in group_keys:

    candidates = groups[group][:]
    random.shuffle(candidates)

    for candidate in candidates:

        contract_id = candidate["academic_staff_contract_id"]

        if contract_id not in used_contracts:
            used_contracts.add(contract_id)
            selected_ids.append(candidate["id"])
            break

# Limpiar tutores anteriores
cursor.execute("""
UPDATE teacher_groups
SET tutor = 0
""")

# Asignar nuevos tutores
for teacher_group_id in selected_ids:
    cursor.execute("""
    UPDATE teacher_groups
    SET tutor = 1
    WHERE id = %s
    """, (teacher_group_id,))

conn.commit()

print(f"Se asignaron {len(selected_ids)} tutores.")

cursor.close()
conn.close()