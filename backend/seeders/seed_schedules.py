import mysql.connector
from collections import defaultdict
from ortools.sat.python import cp_model

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "sv_academic_manager",
}

DIAS = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes"
]

# -------------------------------------------------
# LOAD DATA
# -------------------------------------------------

conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor(dictionary=True)

# Solo bloques de clase
cursor.execute("""
SELECT id
FROM time_slots
WHERE status = 1
AND type='Clase'
ORDER BY id
""")

TIME_SLOTS = [r["id"] for r in cursor.fetchall()]

if len(TIME_SLOTS) != 4:
    raise Exception(
        f"Se esperaban 4 bloques de clase y existen {len(TIME_SLOTS)}."
    )

# recurrencia de cursos

cursor.execute("""
SELECT
    id,
    recurrence
FROM courses
WHERE status=1
""")

COURSE_LOAD = {
    r["id"]: int(r["recurrence"])
    for r in cursor.fetchall()
}

# teacher_groups

cursor.execute("""
SELECT
    tg.id AS teacher_group_id,
    tg.academic_staff_contract_id,
    tg.course_id,
    tg.grade_id,
    tg.section_id,
    ascn.year_id
FROM teacher_groups tg
INNER JOIN academic_staff_contracts ascn
    ON ascn.id = tg.academic_staff_contract_id
WHERE
    tg.status=1
AND ascn.status=1
ORDER BY
    tg.grade_id,
    tg.section_id,
    tg.course_id
""")

TEACHER_GROUPS = cursor.fetchall()

cursor.close()
conn.close()

# -------------------------------------------------
# GROUP BY YEAR
# -------------------------------------------------

by_year = defaultdict(list)

for row in TEACHER_GROUPS:
    by_year[row["year_id"]].append(row)

insert_rows = []

# -------------------------------------------------
# SOLVE
# -------------------------------------------------

for year_id, rows in by_year.items():

    model = cp_model.CpModel()

    groups = set()

    gc_groups = defaultdict(list)

    for row in rows:

        g = row["grade_id"]
        s = row["section_id"]
        c = row["course_id"]

        key = (g, s, c)

        gc_groups[key].append({

            "teacher_group_id":
                row["teacher_group_id"],

            "academic_staff_contract_id":
                row["academic_staff_contract_id"]

        })

        groups.add((g, s))

    x = {}

    vars_group_slot = defaultdict(list)

    vars_teacher_slot = defaultdict(list)

    vars_group_course = defaultdict(list)

    vars_group_day_course = defaultdict(list)

    vars_group_day = defaultdict(list)

    for (g, s) in groups:

        for course_id in COURSE_LOAD:

            if (g, s, course_id) not in gc_groups:
                continue

            teachers = gc_groups[(g, s, course_id)]

            for d in DIAS:

                for ts in TIME_SLOTS:

                    for teacher in teachers:

                        tg_id = teacher["teacher_group_id"]

                        contract = teacher["academic_staff_contract_id"]

                        var = model.NewBoolVar(
                            f"Y{year_id}_TG{tg_id}_{d}_{ts}"
                        )

                        x[(tg_id, d, ts)] = var

                        vars_group_slot[(g, s, d, ts)].append(var)

                        vars_teacher_slot[(contract, d, ts)].append(var)

                        vars_group_course[(g, s, course_id)].append(var)

                        vars_group_day_course[(g, s, d, course_id)].append(var)

                        vars_group_day[(g, s, d)].append(var)

    # -------------------------------------------------
    # RESTRICCIONES
    # -------------------------------------------------

    # 1. Un curso por bloque

    for vars_ in vars_group_slot.values():
        model.Add(sum(vars_) <= 1)

    # 2. Cumplir recurrencia

    for (g, s, c), vars_ in vars_group_course.items():
        model.Add(sum(vars_) == COURSE_LOAD[c])

    # 3. Docente no puede enseñar dos grupos simultáneamente

    for vars_ in vars_teacher_slot.values():
        model.Add(sum(vars_) <= 1)

    # 4. Un curso máximo una vez por día

    for vars_ in vars_group_day_course.values():
        model.Add(sum(vars_) <= 1)

    # 5. Cada grupo debe tener las 4 clases del día

    for vars_ in vars_group_day.values():
        model.Add(sum(vars_) == len(TIME_SLOTS))

    # -------------------------------------------------

    solver = cp_model.CpSolver()

    solver.parameters.max_time_in_seconds = 120

    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)

    if status not in (
        cp_model.FEASIBLE,
        cp_model.OPTIMAL
    ):
        raise Exception(
            f"No se pudo generar horario para el año {year_id}"
        )

    for (tg_id, d, ts), var in x.items():

        if solver.Value(var):

            insert_rows.append(

                (
                    tg_id,
                    ts,
                    d
                )

            )

# -------------------------------------------------
# INSERT
# -------------------------------------------------

conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()

cursor.execute("DELETE FROM schedules")

cursor.executemany("""

INSERT INTO schedules
(
    teacher_group_id,
    time_slot_id,
    day
)
VALUES
(
    %s,
    %s,
    %s
)

""", insert_rows)

conn.commit()

cursor.close()
conn.close()

print(f"Horarios creados: {len(insert_rows)}")