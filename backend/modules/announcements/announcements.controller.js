const AnnouncementsQuery = require('./announcements.query');
const AnnouncementsModel = require('./announcements.model');
const db = require('../../index/index.models');
const sequelize = require('../../config/db.config');

exports.createAnnouncement = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            teacher_group_id,
            registration_ids,
            type,
            priority,
            affair,
            registration_date,
            description
        } = req.body;

        // 1. Validaciones básicas
        if (
            !teacher_group_id ||
            !Array.isArray(registration_ids) ||
            registration_ids.length === 0 ||
            !type ||
            !affair ||
            !registration_date
        ) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe especificar el grupo docente, los destinatarios, el tipo, el asunto y la fecha del comunicado.'
            });
        }

        // 2. Eliminar IDs duplicados
        const uniqueRegistrationIds = [
            ...new Set(
                registration_ids
                    .map(Number)
                    .filter(id => Number.isInteger(id) && id > 0)
            )
        ];

        if (uniqueRegistrationIds.length === 0) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe especificar al menos una matrícula válida.'
            });
        }

        // 3. Obtener grupo docente
        const teacherGroup = await db.TeacherGroups.findByPk(
            teacher_group_id,
            {
                include: [
                    {
                        model: db.AcademicStaffContracts,
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

        const teacherGroupYearId =
            teacherGroup.academic_staff_contract.year_id;

        // 4. Obtener matrículas
        const registrations = await db.Registrations.findAll({
            where: {
                id: uniqueRegistrationIds,
                status: true
            },
            transaction
        });

        // 5. Verificar que todas las matrículas existan
        if (registrations.length !== uniqueRegistrationIds.length) {
            await transaction.rollback();

            const foundIds = registrations.map(
                registration => registration.id
            );

            const missingIds = uniqueRegistrationIds.filter(
                id => !foundIds.includes(id)
            );

            return res.status(404).json({
                message: 'Una o más matrículas no fueron encontradas.',
                missing_registration_ids: missingIds
            });
        }

        // 6. Validar que todas las matrículas pertenezcan al grupo docente
        const invalidRegistrations = registrations.filter(
            registration =>
                registration.year_id !== teacherGroupYearId ||
                registration.grade_id !== teacherGroup.grade_id ||
                registration.section_id !== teacherGroup.section_id
        );

        if (invalidRegistrations.length > 0) {
            await transaction.rollback();

            return res.status(409).json({
                message: 'Una o más matrículas no pertenecen al grupo docente seleccionado.',
                registration_ids: invalidRegistrations.map(
                    registration => registration.id
                )
            });
        }

        // 7. Crear un comunicado independiente para cada matrícula
        const announcementData = registrations.map(registration => ({
            teacher_group_id: teacher_group_id,
            registration_id: registration.id,
            type,
            priority: priority || null,
            affair,
            registration_date,
            reading: false,
            description: description || null,
            status: true
        }));

        const announcements = await AnnouncementsModel.bulkCreate(
            announcementData,
            {
                transaction
            }
        );

        // 8. Confirmar
        await transaction.commit();

        return res.status(201).json({
            message: announcements.length === 1
                ? 'Comunicado creado correctamente.'
                : 'Comunicados creados correctamente.',
            action: 'created',
            length: announcements.length,
            data: announcements
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error.message);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const { id, teacher_group_id, registration_id, type, priority, reading } = req.query;
        const whereCondition = {};

        if (id) whereCondition.id = id;
        if (teacher_group_id) whereCondition.teacher_group_id = teacher_group_id;
        if (registration_id) whereCondition.registration_id = registration_id;
        if (type) whereCondition.type = type;
        if (reading !== undefined) {
            whereCondition.reading = reading;
        }

        const query = AnnouncementsQuery(
            whereCondition,
            []
        );

        const announcements = await AnnouncementsModel.findAll(query);

        return res.status(200).json({
            message: announcements.length === 0 ? 'Aún no hay comunicados registrados en el sistema.' : null,
            length: announcements.length,
            data: announcements
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateAnnouncement = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const {
            type,
            priority,
            affair,
            registration_date,
            description
        } = req.body;

        // 1. Buscar comunicado
        const announcement = await AnnouncementsModel.findByPk(id, {
            transaction
        });

        if (!announcement) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Comunicado no encontrado.'
            });
        }

        // 2. Validaciones básicas
        if (
            !type ||
            !affair ||
            !registration_date
        ) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe especificar el tipo, asunto y fecha del comunicado.'
            });
        }

        // 3. Actualizar únicamente los campos permitidos
        announcement.set({
            type,
            priority: priority || null,
            affair,
            registration_date,
            description: description?.trim() || null,

            // Al modificar el comunicado vuelve a quedar como no leído
            reading: false
        });

        await announcement.save({ transaction });

        // 4. Confirmar
        await transaction.commit();

        return res.status(200).json({
            message: 'Comunicado actualizado correctamente.',
            action: 'updated',
            data: announcement
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id, del } = req.params;

        // 1. Validar parámetro del
        if (del !== '0' && del !== '1') {
            await transaction.rollback();

            return res.status(400).json({
                message: 'El parámetro del debe ser 0 o 1.'
            });
        }

        // 2. Buscar comunicado
        const announcement = await AnnouncementsModel.findByPk(id, {
            transaction
        });

        if (!announcement) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Comunicado no encontrado.'
            });
        }

        // 3. Eliminación física
        if (del === '0') {
            await announcement.destroy({
                transaction
            });

            await transaction.commit();

            return res.status(200).json({
                message: 'Comunicado eliminado correctamente.',
                action: 'deleted'
            });
        }

        // 4. Eliminación lógica
        announcement.status = false;

        await announcement.save({
            transaction
        });

        await transaction.commit();

        return res.status(200).json({
            message: 'Comunicado desactivado correctamente.',
            action: 'deactivated',
            data: announcement
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error.message);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};

exports.markAnnouncementAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await AnnouncementsModel.findByPk(id);

        if (!announcement) {
            return res.status(404).json({
                message: 'Comunicado no encontrado.'
            });
        }

        if (!announcement.status) {
            return res.status(409).json({
                message: 'El comunicado se encuentra inactivo.'
            });
        }

        if (announcement.reading) {
            return res.status(200).json({
                message: 'El comunicado ya se encuentra marcado como leído.',
                action: 'already_read',
                data: announcement
            });
        }

        announcement.reading = true;

        await announcement.save();

        return res.status(200).json({
            message: 'Comunicado marcado como leído.',
            action: 'read',
            data: announcement
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};
