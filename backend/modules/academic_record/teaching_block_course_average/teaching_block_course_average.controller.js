const { Op } = require('sequelize');
const sequelize = require('../../../config/db.config');
const AcademicRecordsModel = require('../academic_records/academic_record.model');
const SchoolDaysBySchedule = require('../school_days_by_schedule/school_days_by_schedule.model');
const Schedules = require('../schedules/schedules.model');
const TeacherGroups = require('../teacher_groups/teacher_groups.model');
const AcademicStaffContracts = require('../../users/academic_staff_contracts.model');
const TeachingBlocks = require('../../temporality/teachingBlocks.model');
const Registrations = require('../../users/registrations.model');
const TeachingBlockCourseAverageQuery = require('./teaching_block_course_average.query');
const TeachingBlockCourseAverageModel = require('./teaching_block_course_average.model');
const Weightings = require('../weightings/weightings.model');
const SchoolDays = require('../../temporality/schoolDays.model');

exports.createTeachingBlockCourseAverage = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            registration_id,
            teacher_group_id,
            teaching_block_id
        } = req.body;

        // 1. Validar parámetros
        if (
            !registration_id ||
            !teacher_group_id ||
            !teaching_block_id
        ) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe especificar el estudiante, grupo docente y bloque lectivo.'
            });
        }

        // 2. Verificar matrícula
        const registration = await Registrations.findByPk(
            registration_id,
            { transaction }
        );

        if (!registration) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Matrícula no encontrada.'
            });
        }

        // 3. Verificar grupo docente
        const teacherGroup = await TeacherGroups.findByPk(
            teacher_group_id,
            {
                include: [
                    {
                        model: AcademicStaffContracts,
                        as: 'academic_staff_contract'
                    }
                ],
                transaction
            }
        );

        if (!teacherGroup) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Grupo docente no encontrado.'
            });
        }

        // 4. Verificar bloque lectivo
        const teachingBlock = await TeachingBlocks.findByPk(
            teaching_block_id,
            { transaction }
        );

        if (!teachingBlock) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Bloque lectivo no encontrado.'
            });
        }

        // 5. Verificar año
        const teacherGroupYearId =
            teacherGroup.academic_staff_contract.year_id;

        if (teacherGroupYearId !== teachingBlock.year_id) {
            await transaction.rollback();

            return res.status(409).json({
                message: 'El grupo docente y el bloque lectivo no pertenecen al mismo año.'
            });
        }

        // 6. Verificar que la matrícula corresponda al grupo docente
        if (
            registration.year_id !== teacherGroupYearId ||
            registration.grade_id !== teacherGroup.grade_id ||
            registration.section_id !== teacherGroup.section_id
        ) {
            await transaction.rollback();

            return res.status(409).json({
                message: 'La matrícula no corresponde al grupo docente seleccionado.'
            });
        }

        // 7. Obtener ponderaciones
        const weightingRows = await Weightings.findAll({
            where: {
                year_id: teachingBlock.year_id,
                status: true
            },
            transaction
        });

        if (weightingRows.length === 0) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'No existen ponderaciones configuradas para este año.'
            });
        }

        // 8. Obtener registros académicos | El bloque se filtra directamente mediante school_days.teaching_block_id
        const academicRecords = await AcademicRecordsModel.findAll({
            where: {
                registration_id,
                status: true
            },

            include: [
                {
                    model: SchoolDaysBySchedule,
                    as: 'school_day_by_schedule',
                    required: true,

                    include: [
                        {
                            model: Schedules,
                            as: 'schedule',
                            required: true,
                            where: {
                                teacher_group_id,
                                status: true
                            }
                        },
                        {
                            model: SchoolDays,
                            as: 'school_day',
                            required: true,
                            where: {
                                teaching_block_id,
                                status: true
                            }
                        }
                    ]
                }
            ],

            transaction
        });

        // 9. Acumuladores
        const scores = {
            'Calificación Diaria': [],
            'Práctica': [],
            'Examen': []
        };

        const attendanceValues = [];

        /*
         * Por ahora:
         *
         * P = 1
         * J = 0.5
         * T = 0.5
         * F = 0
         *
         * Si posteriormente J/T deben representar 0,
         * simplemente modificamos este mapa.
         */

        const attendanceMap = {
            P: 1,
            J: 0.5,
            T: 0.5,
            F: 0
        };

        // 10. Procesar registros
        for (const record of academicRecords) {

            const schoolDayBySchedule =
                record.school_day_by_schedule;

            if (!schoolDayBySchedule) {
                continue;
            }

            /*
             * IMPORTANTE:
             *
             * El type está en:
             *
             * school_days_by_schedule.type
             *
             * NO en:
             *
             * school_days.type
             */

            const type = schoolDayBySchedule.type;

            // Procesar calificación
            if (
                record.score !== null &&
                record.score !== undefined &&
                scores[type]
            ) {
                const score = Number(record.score);

                if (
                    !Number.isNaN(score) &&
                    score >= 0 &&
                    score <= 20
                ) {
                    scores[type].push(score);
                }
            }

            // Procesar asistencia
            if (
                record.attendance !== null &&
                record.attendance !== undefined &&
                attendanceMap[record.attendance] !== undefined
            ) {
                attendanceValues.push(
                    attendanceMap[record.attendance]
                );
            }
        }

        // 11. Función promedio
        const calculateAverage = (values) => {

            if (values.length === 0) {
                return null;
            }

            const total = values.reduce(
                (sum, value) => sum + value,
                0
            );

            return total / values.length;
        };

        // 12. Promedios por tipo
        const dailyAverage = calculateAverage(
            scores['Calificación Diaria']
        );

        const practiceAverage = calculateAverage(
            scores['Práctica']
        );

        const examAverage = calculateAverage(
            scores['Examen']
        );

        const attendanceAverage = calculateAverage(
            attendanceValues
        );

        // 13. Crear mapa de ponderaciones
        const weightingMap = {};

        for (const weighting of weightingRows) {

            weightingMap[weighting.type] =
                Number(weighting.weighting);
        }

        // 14. Determinar componentes disponibles
        const availableComponents = [
            {
                type: 'Calificación Diaria',
                average: dailyAverage
            },
            {
                type: 'Práctica',
                average: practiceAverage
            },
            {
                type: 'Examen',
                average: examAverage
            }
        ].filter(component =>
            component.average !== null
        );

        // 15. Calcular promedio del bloque
        let teachingBlockAverage = null;

        if (availableComponents.length > 0) {

            /*
             * Solo se consideran las ponderaciones
             * correspondientes a tipos que realmente
             * tienen notas.
             *
             * Ejemplo:
             *
             * Diaria = 6 notas
             * Práctica = 2 notas
             * Examen = 1 nota
             *
             * Primero:
             *
             * promedio diaria
             * promedio práctica
             * promedio examen
             *
             * Luego:
             *
             * diaria × ponderación
             * práctica × ponderación
             * examen × ponderación
             */

            const availableWeight =
                availableComponents.reduce(
                    (total, component) => {

                        return total +
                            (weightingMap[component.type] || 0);

                    },
                    0
                );

            if (availableWeight > 0) {

                teachingBlockAverage =
                    availableComponents.reduce(
                        (total, component) => {

                            const weight =
                                weightingMap[component.type] || 0;

                            return total +
                                (
                                    component.average *
                                    (weight / availableWeight)
                                );

                        },
                        0
                    );
            }
        }

        // 16. Redondear
        const round = (value) => {

            if (value === null || value === undefined) {
                return null;
            }

            return Number(
                Number(value).toFixed(2)
            );
        };

        // 17. Datos finales

        const data = {
            registration_id,
            teacher_group_id,
            teaching_block_id,

            daily_average:
                round(dailyAverage),

            practice_average:
                round(practiceAverage),

            exam_average:
                round(examAverage),

            attendance_average:
                round(attendanceAverage),

            teaching_block_average:
                round(teachingBlockAverage)
        };

        // 18. Crear o actualizar
        const existing =
            await TeachingBlockCourseAverageModel.findOne({
                where: {
                    registration_id,
                    teacher_group_id,
                    teaching_block_id
                },
                transaction
            });

        let result;
        let action;

        if (existing) {

            existing.set(data);

            await existing.save({
                transaction
            });

            result = existing;
            action = 'updated';

        } else {
            result = await TeachingBlockCourseAverageModel.create(
                data,
                { transaction }
            );

            action = 'created';
        }

        // 19. Confirmar
        await transaction.commit();

        return res.status(
            action === 'created' ? 201 : 200
        ).json({
            message:
                action === 'created'
                    ? 'Promedio del bloque lectivo calculado correctamente.'
                    : 'Promedio del bloque lectivo actualizado correctamente.',
            action,
            data: result
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.getTeachingBlockCourseAverage = async (req, res) => {
    try {
        const { registration_id, teacher_group_id, teaching_block_id } = req.query;
        const whereCondition = {};

        if (registration_id) whereCondition.registration_id = registration_id;
        if (teacher_group_id) whereCondition.teacher_group_id = teacher_group_id;
        if (teaching_block_id) whereCondition.teaching_block_id = teaching_block_id;

        const query = TeachingBlockCourseAverageQuery(
            whereCondition,
            []
        );

        const teachingBlockCourseAverage = await TeachingBlockCourseAverageModel.findAll(query);

        return res.status(200).json({
            message: teachingBlockCourseAverage.length === 0 ? 'Aún no hay promedios de bloques lectivos registrados en el sistema.' : null,
            length: teachingBlockCourseAverage.length,
            data: teachingBlockCourseAverage
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}