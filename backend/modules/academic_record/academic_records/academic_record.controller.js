const { Op } = require('sequelize');
const sequelize = require('../../../config/db.config');
const AcademicRecordsQuery = require('./academic_record.query');
const AcademicRecordsModel = require('./academic_record.model');
const Registrations = require('../../users/registrations.model');
const SchoolDaysBySchedule = require('../school_days_by_schedule/school_days_by_schedule.model');
const Schedules = require('../schedules/schedules.model');
const TeacherGroups = require('../teacher_groups/teacher_groups.model');
const AcademicStaffContracts = require('../../users/academic_staff_contracts.model');

exports.createAcademicRecords = async (req, res) => {
    const {
        school_day_by_schedule_id,
        records
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        if (!school_day_by_schedule_id) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe especificar el día lectivo del horario.'
            });
        }

        if (!Array.isArray(records) || records.length === 0) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe enviar al menos un registro académico.'
            });
        }

        /*
         * 1. Obtener el día lectivo del horario y comprobar
         *    que tenga toda la relación académica necesaria.
         */
        const schoolDayBySchedule =
            await SchoolDaysBySchedule.findByPk(
                school_day_by_schedule_id,
                {
                    include: [
                        {
                            model: Schedules,
                            as: 'schedule',
                            required: true,
                            include: [
                                {
                                    model: TeacherGroups,
                                    as: 'teacher_group',
                                    required: true,
                                    include: [
                                        {
                                            model: AcademicStaffContracts,
                                            as: 'academic_staff_contract',
                                            required: true
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    transaction
                }
            );

        if (!schoolDayBySchedule) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Día lectivo del horario no encontrado.'
            });
        }

        const teacherGroup =
            schoolDayBySchedule.schedule.teacher_group;

        const academicStaffContract =
            teacherGroup.academic_staff_contract;

        /*
         * 2. Obtener las matrículas enviadas.
         */
        const registrationIds = [
            ...new Set(
                records.map(record => record.registration_id)
            )
        ];

        const registrations = await Registrations.findAll({
            where: {
                id: {
                    [Op.in]: registrationIds
                },
                status: true
            },
            transaction
        });

        /*
         * 3. Verificar que todas las matrículas existan.
         */
        if (registrations.length !== registrationIds.length) {

            const foundIds = new Set(
                registrations.map(registration => registration.id)
            );

            const missingIds = registrationIds.filter(
                id => !foundIds.has(id)
            );

            await transaction.rollback();

            return res.status(404).json({
                message: 'Una o más matrículas no fueron encontradas.',
                registration_ids: missingIds
            });
        }

        /*
         * 4. Validar que las matrículas correspondan
         *    al mismo año, grado y sección del teacher_group.
         */
        const invalidRegistrations = registrations.filter(
            registration =>
                registration.year_id !== academicStaffContract.year_id ||
                registration.grade_id !== teacherGroup.grade_id ||
                registration.section_id !== teacherGroup.section_id
        );

        if (invalidRegistrations.length > 0) {

            await transaction.rollback();

            return res.status(409).json({
                message:
                    'Una o más matrículas no corresponden al año, grado o sección del horario seleccionado.',
                registration_ids:
                    invalidRegistrations.map(
                        registration => registration.id
                    )
            });
        }

        /*
         * 5. Buscar los registros que ya existen.
         */
        const existingRecords =
            await AcademicRecordsModel.findAll({
                where: {
                    school_day_by_schedule_id,
                    registration_id: {
                        [Op.in]: registrationIds
                    }
                },
                transaction
            });

        const existingMap = new Map(
            existingRecords.map(record => [
                record.registration_id,
                record
            ])
        );

        const recordsToCreate = [];
        const recordsToUpdate = [];

        /*
         * 6. Separar creación y actualización.
         */
        for (const record of records) {

            const existingRecord =
                existingMap.get(record.registration_id);

            const data = {
                attendance:
                    record.attendance ?? null,

                score:
                    record.score ?? null,

                incident:
                    record.incident ?? null,

                description:
                    record.description ?? null,

                status: true
            };

            if (existingRecord) {

                existingRecord.set(data);

                recordsToUpdate.push(existingRecord);

            } else {

                recordsToCreate.push({
                    registration_id:
                        record.registration_id,

                    school_day_by_schedule_id:
                        school_day_by_schedule_id,

                    ...data
                });
            }
        }

        /*
         * 7. Crear los registros nuevos.
         */
        let createdRecords = [];

        if (recordsToCreate.length > 0) {
            createdRecords =
                await AcademicRecordsModel.bulkCreate(
                    recordsToCreate,
                    { transaction }
                );
        }

        /*
         * 8. Actualizar los registros existentes.
         */
        for (const record of recordsToUpdate) {
            await record.save({ transaction });
        }

        /*
         * 9. Confirmar la transacción.
         */
        await transaction.commit();

        return res.status(201).json({
            message: 'Registros académicos guardados correctamente.',
            created: createdRecords.length,
            updated: recordsToUpdate.length,
            total:
                createdRecords.length +
                recordsToUpdate.length
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message:'Error interno del servidor. Inténtelo más tarde.'});
    }
};

exports.getAcademicRecords = async (req, res) => {
    try {
        const { registration_id, school_day_by_schedule_id } = req.query;
        const whereCondition = {};

        if (registration_id) whereCondition.registration_id = registration_id;
        if (school_day_by_schedule_id) whereCondition.school_day_by_schedule_id = school_day_by_schedule_id;

        const query = AcademicRecordsQuery(
            whereCondition,
            []
        );

        const academicRecords = await AcademicRecordsModel.findAll(query);

        return res.status(200).json({
            message: academicRecords.length === 0 ? 'Aún no hay récords académicos registrado en el sistema.' : null,
            length: academicRecords.length,
            data: academicRecords
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}
