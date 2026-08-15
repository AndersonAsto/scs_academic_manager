const schedulesModel = require('./schedules.model');
const schedulesQuery = require('./schedules.query');
const db = require('../../../index/index.models');

exports.createSchedule = async (req, res) => {
    try {
        const { teacher_group_id, time_slot_id, day, description } = req.body;

        if (!teacher_group_id || !time_slot_id || !day) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const newSchedule = await schedulesModel.create({
            teacher_group_id, time_slot_id, day, description
        });

        return res.status(200).json({ message: 'Horario registrado correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateSchedule = async (req, res) => {
    const { id } = req.params;
    const { teacher_group_id, time_slot_id, day, description } = req.body;

    try {
        const uSchedules = await schedulesModel.findByPk(id);

        if (!uSchedules) return res.status(404).json({ message: 'Horario no encontrado.' });

        uSchedules.teacher_group_id = teacher_group_id;
        uSchedules.time_slot_id = time_slot_id;
        uSchedules.day = day;
        uSchedules.description = description;

        await uSchedules.save();

        return res.status(201).json({
            message: 'Horario actualizado correctamente.',
            data: uSchedules
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteSchedule = async (req, res) => {
    try {
        const { id, del } = req.params;

        const schedule = await schedulesModel.findOne({ where: { id } });

        if (!schedule) return res.status(404).json({ message: 'Horario no encontrado.' });

        if (del === '0')
            await schedule.update({ status: false });
        else if (del === '1')
            await schedule.destroy();
        else
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });

        return res.status(200).json({ message: del === '0' ? 'Horario archivado/desactivado correctamente.' : 'Horario eliminado correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

const Schedules = require('./schedules.model');
const TimeSlots = require('../../time_slots/time_slots.model');

exports.getSchedules = async (req, res) => {
    try {
        const { teacher_group_id, time_slot_id, day } = req.query;
        const whereCondition = {};

        if (teacher_group_id) whereCondition.teacher_group_id = teacher_group_id;
        if (time_slot_id) whereCondition.time_slot_id = time_slot_id;
        if (day) whereCondition.day = day;

        const query = schedulesQuery(
            whereCondition,
            []
        );

        const schedules = await schedulesModel.findAll(query);

        return res.status(200).json({
            message: schedules.length === 0 ? 'Aún no hay horarios registrados en el sistema.' : null,
            length: schedules.length,
            data: schedules
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}


exports.getSchedulesByTeacherGroup = async (req, res) => {
    try {
        const { teacher_group_id } = req.query;

        if (!teacher_group_id) {
            return res.status(400).json({ message: 'Debe especificar el grupo de enseñanza.' });
        }

        const schedules = await Schedules.findAll({
            where: { teacher_group_id, status: true },
        });

        const timeSlotIds = [...new Set(schedules.map((s) => s.time_slot_id))];
        const timeSlots = await TimeSlots.findAll({ where: { id: timeSlotIds } });
        const timeSlotsById = new Map(timeSlots.map((t) => [t.id, t]));

        const data = schedules.map((schedule) => {
            const timeSlot = timeSlotsById.get(schedule.time_slot_id);

            return {
                id: schedule.id,
                day: schedule.day,
                time_slot_id: schedule.time_slot_id,
                time_slot: timeSlot?.time_slot ?? null,
                start_time: timeSlot?.start_time ?? null,
                end_time: timeSlot?.end_time ?? null,
            };
        });

        return res.status(200).json({ length: data.length, data });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.getScheduleReport = async (req, res) => {
    try {
        const {
            year_id,
            grade_id,
            section_id
        } = req.query;

        if (!year_id || !grade_id || !section_id) {
            return res.status(400).json({
                message: 'Debe especificar año, grado y sección.'
            });
        }

        const schedules = await schedulesModel.findAll({
            where: {
                status: true
            },

            include: [
                {
                    model: db.TeacherGroups,
                    as: 'teacher_group',

                    where: {
                        grade_id,
                        section_id,
                        status: true
                    },

                    include: [
                        {
                            model: db.AcademicStaffContracts,
                            as: 'academic_staff_contract',

                            where: {
                                year_id,
                                status: true
                            },

                            include: [
                                {
                                    model: db.AcademicStaff,
                                    as: 'academic_staff',

                                    where: {
                                        status: true
                                    },

                                    include: [
                                        {
                                            model: db.PersonalInformation,
                                            as: 'personal_information'
                                        }
                                    ]
                                },

                                {
                                    model: db.Years,
                                    as: 'year'
                                }
                            ]
                        },

                        {
                            model: db.Courses,
                            as: 'course'
                        },

                        {
                            model: db.Grades,
                            as: 'grade'
                        },

                        {
                            model: db.Sections,
                            as: 'section'
                        }
                    ]
                },

                {
                    model: TimeSlots,
                    as: 'time_slot'
                }
            ],

            order: [
                ['day', 'ASC'],
                [
                    { model: TimeSlots, as: 'time_slot' },
                    'start_time',
                    'ASC'
                ]
            ]
        });

        const data = schedules.map(schedule => {
            const person =
                schedule.teacher_group
                    ?.academic_staff_contract
                    ?.academic_staff
                    ?.personal_information;

            return {
                id: schedule.id,

                day: schedule.day,

                description: schedule.description,

                time_slot: {
                    id: schedule.time_slot?.id ?? null,
                    time_slot: schedule.time_slot?.time_slot ?? null,
                    start_time: schedule.time_slot?.start_time ?? null,
                    end_time: schedule.time_slot?.end_time ?? null
                },

                course: {
                    id: schedule.teacher_group?.course?.id ?? null,
                    course: schedule.teacher_group?.course?.course ?? null
                },

                teacher_group: {
                    id: schedule.teacher_group?.id ?? null,
                    tutor: schedule.teacher_group?.tutor ?? false,

                    grade: {
                        id: schedule.teacher_group?.grade?.id ?? null,
                        grade: schedule.teacher_group?.grade?.grade ?? null
                    },

                    section: {
                        id: schedule.teacher_group?.section?.id ?? null,
                        section: schedule.teacher_group?.section?.section ?? null
                    },

                    academic_staff_contract: {
                        year: {
                            id:
                                schedule.teacher_group
                                    ?.academic_staff_contract
                                    ?.year?.id ?? null,

                            year:
                                schedule.teacher_group
                                    ?.academic_staff_contract
                                    ?.year?.year ?? null
                        },

                        academic_staff: {
                            personal_information: {
                                names: person?.names ?? null,
                                fathers_surname:
                                    person?.fathers_surname ?? null,
                                mothers_surname:
                                    person?.mothers_surname ?? null
                            }
                        }
                    }
                }
            };
        });

        return res.status(200).json({
            length: data.length,
            data
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};