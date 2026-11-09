require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/db.config');

const TeachingBlockCourseAverage = require('../modules/academic_record/teaching_block_course_average/teaching_block_course_average.model');
const CourseAverage = require('../modules/academic_record/course_average/course_average.model');
const TeacherGroups = require('../modules/academic_record/teacher_groups/teacher_groups.model');
const AcademicStaffContracts = require('../modules/users/academic_staff_contracts.model');
const TeachingBlocks = require('../modules/temporality/teachingBlocks.model');
const AcademicRecords = require('../modules/academic_record/academic_records/academic_record.model');
const SchoolDaysBySchedule = require('../modules/academic_record/school_days_by_schedule/school_days_by_schedule.model');
const Schedules = require('../modules/academic_record/schedules/schedules.model');
const SchoolDays = require('../modules/temporality/schoolDays.model');

const PASS_THRESHOLD = 13; // umbral de "riesgo", no de reprobación oficial

async function countIncidentsInBlock(registrationId, teacherGroupId, teachingBlockId) {
    const records = await AcademicRecords.findAll({
        where: { registration_id: registrationId, status: true },
        include: [
            {
                model: SchoolDaysBySchedule,
                as: 'school_day_by_schedule',
                required: true,
                include: [
                    { model: Schedules, as: 'schedule', where: { teacher_group_id: teacherGroupId }, required: true },
                    {
                        model: SchoolDays,
                        as: 'school_day',
                        required: true,
                        where: { teaching_block_id: teachingBlockId },
                    },
                ],
            },
        ],
    });

    return records.filter((r) => r.incident !== null && r.incident !== '').length;
}

async function exportDataset() {
    await sequelize.authenticate();

    const teacherGroups = await TeacherGroups.findAll({
        where: { status: true },
        include: [{ model: AcademicStaffContracts, as: 'academic_staff_contract', required: true }],
    });

    const rows = [];
    let skippedNoLabel = 0;

    for (const group of teacherGroups) {
        // TODOS los promedios finales de ESTE curso — uno por cada estudiante matriculado en él.
        const finalAverages = await CourseAverage.findAll({
            where: { teacher_group_id: group.id, status: true },
        });

        // Mapa registration_id → label, para que cada estudiante use SU PROPIO resultado final.
        const labelByRegistration = new Map(
            finalAverages
                .filter((fa) => fa.overall_course_average !== null)
                .map((fa) => [fa.registration_id, Number(fa.overall_course_average) < PASS_THRESHOLD ? 1 : 0]),
        );

        // Todos los bloques de todos los estudiantes de este curso.
        const blockAverages = await TeachingBlockCourseAverage.findAll({
            where: { teacher_group_id: group.id, status: true },
            include: [{ model: TeachingBlocks, as: 'teaching_block', required: true }],
        });

        // Agrupar por estudiante ANTES de ordenar — clave del fix.
        const byRegistration = new Map();
        for (const block of blockAverages) {
            if (block.teaching_block_average === null) continue;
            if (!byRegistration.has(block.registration_id)) byRegistration.set(block.registration_id, []);
            byRegistration.get(block.registration_id).push(block);
        }

        for (const [registrationId, studentBlocks] of byRegistration.entries()) {
            const label = labelByRegistration.get(registrationId);

            // Sin resultado final conocido para ESTE estudiante → se descarta (no se puede etiquetar).
            if (label === undefined) {
                skippedNoLabel++;
                continue;
            }

            // Ordenar SOLO los bloques de este estudiante, no los del curso completo.
            const sorted = [...studentBlocks].sort(
                (a, b) => new Date(a.teaching_block.start_day) - new Date(b.teaching_block.start_day),
            );

            for (let i = 0; i < sorted.length; i++) {
                const current = sorted[i];
                const previous = i > 0 ? sorted[i - 1] : null;

                const cumulative =
                    sorted.slice(0, i + 1).reduce((sum, s) => sum + Number(s.teaching_block_average), 0) / (i + 1);

                const trend =
                    previous !== null
                        ? Number(current.teaching_block_average) - Number(previous.teaching_block_average)
                        : '';

                const incidentCount = await countIncidentsInBlock(registrationId, group.id, current.teaching_block_id);

                rows.push({
                    daily_average: current.daily_average ?? '',
                    practice_average: current.practice_average ?? '',
                    exam_average: current.exam_average ?? '',
                    attendance_average: current.attendance_average ?? '',
                    trend,
                    cumulative_average: cumulative.toFixed(2),
                    incident_count: incidentCount,
                    label,
                });
            }
        }
    }

    if (rows.length === 0) {
        console.log('No se encontraron filas para exportar. Revisa que existan course_average y teaching_block_course_average con datos.');
        return;
    }

    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(','), ...rows.map((row) => headers.map((h) => row[h]).join(','))];

    const outputPath = path.join(__dirname, '../../service/dataset.csv');
    fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf-8');

    console.log(`Dataset exportado: ${rows.length} filas → ${outputPath}`);
    console.log(`Filas descartadas por no tener promedio final propio: ${skippedNoLabel}`);
    console.log(`Distribución del label — En riesgo: ${rows.filter((r) => r.label === 1).length}, Sin riesgo: ${rows.filter((r) => r.label === 0).length}`);
}

exportDataset()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error exportando dataset:', error);
        process.exit(1);
    });