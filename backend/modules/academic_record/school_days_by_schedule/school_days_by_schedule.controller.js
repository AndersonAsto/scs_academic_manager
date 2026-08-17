const { Op } = require('sequelize');
const schoolDaysByScheduleModel = require('./school_days_by_schedule.model');
const schoolDaysByScheduleQuery = require('./school_days_by_schedule.query');
const Schedules = require('../schedules/schedules.model');
const TeacherGroups = require('../teacher_groups/teacher_groups.model');
const AcademicStaffContracts = require('../../users/academic_staff_contracts.model');
const Years = require('../../temporality/years.model');
const SchoolDays = require('../../temporality/schoolDays.model');
const TeachingBlocks = require('../../temporality/teachingBlocks.model');
const SchoolDaysBySchedule = require('./school_days_by_schedule.model');

exports.createSchoolDaysBySchedule = async (req, res) => {
    const { year_id } = req.body;

    try {
        if (!year_id) {
            return res.status(400).json({
                message: 'Debe especificar el año académico.'
            });
        }

        // 1. Verificar que el año exista
        const year = await Years.findByPk(year_id);

        if (!year) {
            return res.status(404).json({
                message: 'Año académico no encontrado.'
            });
        }

        // 2. Obtener todos los horarios activos pertenecientes al año
        const schedules = await Schedules.findAll({
            where: {
                status: true
            },
            include: [
                {
                    model: TeacherGroups,
                    as: 'teacher_group',
                    required: true,
                    where: {
                        status: true
                    },
                    include: [
                        {
                            model: AcademicStaffContracts,
                            as: 'academic_staff_contract',
                            required: true,
                            where: {
                                year_id,
                                status: true
                            }
                        }
                    ]
                }
            ]
        });

        if (schedules.length === 0) {
            return res.status(404).json({
                message: 'No existen horarios registrados para el año académico seleccionado.'
            });
        }

        // 3. Obtener todos los días lectivos del año
        const schoolDays = await SchoolDays.findAll({
            where: {
                status: true,
                type: 'Día Lectivo'
            },
            include: [
                {
                    model: TeachingBlocks,
                    as: 'teaching_block',
                    required: true,
                    where: {
                        year_id,
                        status: true
                    }
                }
            ]
        });

        if (schoolDays.length === 0) {
            return res.status(404).json({
                message: 'No existen días lectivos registrados para el año académico seleccionado.'
            });
        }

        // 4. Obtener los registros que ya existen
        const scheduleIds = schedules.map(schedule => schedule.id);
        const schoolDayIds = schoolDays.map(schoolDay => schoolDay.id);

        const existingRecords = await schoolDaysByScheduleModel.findAll({
            where: {
                schedule_id: {
                    [Op.in]: scheduleIds
                },
                school_day_id: {
                    [Op.in]: schoolDayIds
                }
            },
            attributes: [
                'schedule_id',
                'school_day_id'
            ]
        });

        // 5. Crear un Set para comprobar rápidamente los duplicados
        const existingSet = new Set(
            existingRecords.map(record =>
                `${record.schedule_id}-${record.school_day_id}`
            )
        );

        // 6. Generar las relaciones schedule + school_day
        const recordsToCreate = [];

        for (const schedule of schedules) {

            for (const schoolDay of schoolDays) {

                // Solo relacionar si coinciden los días de la semana
                if (schedule.day !== schoolDay.day) {
                    continue;
                }

                const key = `${schedule.id}-${schoolDay.id}`;

                // Evitar registros duplicados
                if (existingSet.has(key)) {
                    continue;
                }

                recordsToCreate.push({
                    schedule_id: schedule.id,
                    school_day_id: schoolDay.id,
                    type: 'Calificación Diaria',
                    description: null,
                    status: true
                });
            }
        }

        // 7. Si no hay nada nuevo que crear
        if (recordsToCreate.length === 0) {
            return res.status(200).json({
                message: 'Todos los días lectivos de los horarios ya se encuentran registrados.',
                length: 0,
                data: []
            });
        }

        // 8. Crear todos los registros
        const createdRecords =
            await schoolDaysByScheduleModel.bulkCreate(recordsToCreate);

        return res.status(201).json({
            message: 'Días lectivos de los horarios generados correctamente.',
            length: createdRecords.length,
            data: createdRecords
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};

exports.getSchoolDaysBySchedule = async (req, res) => {
    try {
        const { schedule_id, school_day_id, type } = req.query;
        const whereCondition = {};

        if (schedule_id) whereCondition.schedule_id = schedule_id;
        if (school_day_id) whereCondition.school_day_id = school_day_id;
        if (type) whereCondition.type = type;

        const query = schoolDaysByScheduleQuery(
            whereCondition,
            []
        );

        const schoolDaysBySchedule = await schoolDaysByScheduleModel.findAll(query);

        return res.status(200).json({
            message: schoolDaysBySchedule.length === 0 ? 'Aún no hay días lectivos para horarios registrados en el sistema.' : null,
            length: schoolDaysBySchedule.length,
            data: schoolDaysBySchedule
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateSchoolDayBySchedule = async (req, res) => {
    const { id } = req.params;
    const { type, description } = req.body;

    try {
        const schoolDay = await schoolDaysByScheduleModel.findByPk(id);

        if (!schoolDay) return res.status(404).json({ message: 'Día lectivo no encontrado.' });

        schoolDay.type = type;
        schoolDay.description = description;

        await schoolDay.save();

        return res.status(200).json({ message: 'Día lectivo actualizado correctamente.', data: schoolDay });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}


exports.getLectiveDaysBySchedule = async (req, res) => {
    try {
        const { schedule_id } = req.query;

        if (!schedule_id) {
            return res.status(400).json({ message: 'Debe especificar el horario.' });
        }

        const daysBySchedule = await SchoolDaysBySchedule.findAll({
            where: { schedule_id, status: true },
        });

        const schoolDayIds = [...new Set(daysBySchedule.map((d) => d.school_day_id))];

        const schoolDays = await SchoolDays.findAll({
            where: { id: schoolDayIds, type: 'Día Lectivo', status: true },
        });

        const schoolDaysById = new Map(schoolDays.map((d) => [d.id, d]));

        // Nuevo: resolver el bloque lectivo de cada school_day.
        const teachingBlockIds = [...new Set(schoolDays.map((d) => d.teaching_block_id))];

        const teachingBlocks = await TeachingBlocks.findAll({
            where: { id: teachingBlockIds },
        });

        const teachingBlocksById = new Map(teachingBlocks.map((tb) => [tb.id, tb.teaching_block]));

        const data = daysBySchedule
            .filter((d) => schoolDaysById.has(d.school_day_id))
            .map((d) => {
                const schoolDay = schoolDaysById.get(d.school_day_id);

                return {
                    id: d.id, // este es el school_day_by_schedule_id que se manda a createAcademicRecords
                    date: schoolDay.school_day,
                    day: schoolDay.day,
                    week_number: schoolDay.week_number,
                    teaching_block: teachingBlocksById.get(schoolDay.teaching_block_id) ?? null,
                    type: d.type,
                };
            });

        return res.status(200).json({ length: data.length, data });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.deleteSchoolDaysBySchedule = async (req, res) => {
    try {
        const { year_id, del } = req.params;

        if (!year_id) {
            return res.status(400).json({
                message: 'Debe especificar el año académico.'
            });
        }

        if (del !== '0' && del !== '1') {
            return res.status(400).json({
                message: 'Tipo de eliminación no válido.'
            });
        }

        const year = await Years.findByPk(year_id);

        if (!year) {
            return res.status(404).json({
                message: 'Año académico no encontrado.'
            });
        }

        const schedules = await Schedules.findAll({
            attributes: ['id'],
            include: [
                {
                    model: TeacherGroups,
                    as: 'teacher_group',
                    attributes: [],
                    required: true,
                    include: [
                        {
                            model: AcademicStaffContracts,
                            as: 'academic_staff_contract',
                            attributes: [],
                            required: true,
                            where: {
                                year_id
                            }
                        }
                    ]
                }
            ]
        });

        if (schedules.length === 0) {
            return res.status(404).json({
                message: 'No existen horarios asociados al año académico seleccionado.'
            });
        }

        const scheduleIds = schedules.map(schedule => schedule.id);

        const records = await schoolDaysByScheduleModel.findAll({
            where: {
                schedule_id: {
                    [Op.in]: scheduleIds
                }
            }
        });

        if (records.length === 0) {
            return res.status(404).json({
                message: 'No existen sesiones lectivas registradas para el año académico seleccionado.'
            });
        }

        if (del === '0') {

            await schoolDaysByScheduleModel.update(
                { status: false },
                {
                    where: {
                        schedule_id: {
                            [Op.in]: scheduleIds
                        }
                    }
                }
            );

            return res.status(200).json({
                message: 'Sesiones lectivas archivadas/desactivadas correctamente.'
            });

        }

        await schoolDaysByScheduleModel.destroy({
            where: {
                schedule_id: {
                    [Op.in]: scheduleIds
                }
            }
        });

        return res.status(200).json({
            message: 'Sesiones lectivas eliminadas correctamente.'
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};