import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "sv_academic_manager",
}

# course_id : [academic_staff_contract_id]
COURSE_CONTRACTS = {
    1: [12],
    2: [15, 17, 19],
    3: [21, 23],
    4: [25],
    5: [27, 29, 31],
    6: [33],
    7: [35, 37],
    8: [39, 41, 43],
    9: [45, 47, 49],
    10: [51]
}

SECTION_GROUPS = {
    1: [
        [(1,1),(1,2),(2,1),(2,2),(3,1),(3,2),(4,1),(4,2),(5,1),(5,2)]
    ],
    2: [
        [(1,1),(1,2),(2,1),(2,2),(3,1)],
        [(3,2),(4,1),(4,2),(5,1),(5,2)]
    ],
    3: [
        [(1,1),(1,2),(2,1),(2,2)],
        [(3,1),(3,2),(4,1),(4,2)],
        [(5,1),(5,2)]
    ]
}

conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor(dictionary=True)

cursor.execute("""
SELECT id, recurrence
FROM courses
WHERE status = 1
""")

COURSES = {
    row["id"]: row["recurrence"]
    for row in cursor.fetchall()
}

insert_sql = """
INSERT INTO teacher_groups
(
    academic_staff_contract_id,
    course_id,
    grade_id,
    section_id
)
VALUES (%s,%s,%s,%s)
"""

count = 0

for course_id, contracts in COURSE_CONTRACTS.items():

    recurrence = COURSES[course_id]

    if recurrence != len(contracts):
        print(
            f"Advertencia -> Curso {course_id}: "
            f"recurrence={recurrence}, contratos={len(contracts)}"
        )
        continue

    groups = SECTION_GROUPS[recurrence]

    for contract_id, section_group in zip(contracts, groups):

        for grade_id, section_id in section_group:

            cursor.execute(
                insert_sql,
                (
                    contract_id,
                    course_id,
                    grade_id,
                    section_id
                )
            )

            count += 1

conn.commit()

cursor.close()
conn.close()

print(f"Se insertaron {count} registros.")