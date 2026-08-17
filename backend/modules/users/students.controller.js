const personalInformationModel = require('./personal_information.model');
const sequelize = require('../../config/db.config');
const studentsModel = require('./students.model');
const studentsQuery = require('./students.query');
const registrationsModel = require('./registrations.model');

exports.getStudents = async (req, res) => {
    try {
        const { id } = req.query;
        const whereCondition = {};

        if (id) whereCondition.id = id;

        const query = studentsQuery(
            whereCondition,
            []
        );

        const students = await studentsModel.findAll(query);

        return res.status(200).json({
            message: students.length === 0 ? 'Aún no hay estudiantes registrados en el sistema.' : null,
            data: students
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateStudent = async (req, res) => {
    const { id } = req.params;

    const {
        names,
        fathers_surname,
        mothers_surname,
        dni,
        email,
        phone_number,
        address,
        district,
        province,
        department,
        gender,
        description
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const student = await studentsModel.findByPk(id, { transaction });

        if (!student) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        const personalInformation = await personalInformationModel.findByPk(
            student.personal_information_id,
            { transaction }
        );

        if (!personalInformation) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Información personal no encontrada.' });
        }

        const dniExists = await personalInformationModel.findOne({
            where: { dni },
            transaction
        });

        if (dniExists && dniExists.id !== personalInformation.id) {
            await transaction.rollback();
            return res.status(409).json({ message: 'El DNI ya se encuentra registrado.' });
        }

        const emailExists = await personalInformationModel.findOne({
            where: { email },
            transaction
        });

        if (emailExists && emailExists.id !== personalInformation.id) {
            await transaction.rollback();
            return res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado.' });
        }

        const phoneExists = await personalInformationModel.findOne({
            where: { phone_number },
            transaction
        });

        if (phoneExists && phoneExists.id !== personalInformation.id) {
            await transaction.rollback();
            return res.status(409).json({ message: 'El número telefónico ya se encuentra registrado.' });
        }

        await student.update({
            description
        }, { transaction });

        await personalInformation.update({
            names,
            fathers_surname,
            mothers_surname,
            dni,
            email,
            phone_number,
            address,
            district,
            province,
            department,
            gender,
            description
        }, { transaction });

        await transaction.commit();

        return res.status(200).json({ message: 'Estudiante actualizado correctamente.' });
    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteStudent = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id, del } = req.params;

        const student = await studentsModel.findByPk(id, {
            transaction
        });

        if (!student) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Estudiante no encontrado.'
            });
        }

        const registrations = await registrationsModel.count({
            where: {
                student_id: id
            },
            transaction
        });

        /*
         * Desactivación lógica
         */
        if (del === '0') {

            await student.update({
                status: false
            }, { transaction });

            await personalInformationModel.update(
                {
                    status: false
                },
                {
                    where: {
                        id: student.personal_information_id
                    },
                    transaction
                }
            );

            await transaction.commit();

            return res.status(200).json({
                message: 'Estudiante archivado/desactivado correctamente.'
            });
        }

        /*
         * Eliminación física
         */
        if (del === '1') {

            if (registrations > 0) {
                await transaction.rollback();

                return res.status(409).json({
                    message: 'No es posible eliminar el estudiante porque tiene matrículas asociadas. Elimine primero dichas matrículas o simplemente desactívelo.'
                });
            }

            await student.destroy({
                transaction
            });

            await personalInformationModel.destroy({
                where: {
                    id: student.personal_information_id
                },
                transaction
            });

            await transaction.commit();

            return res.status(200).json({
                message: 'Estudiante eliminado correctamente.'
            });
        }

        await transaction.rollback();

        return res.status(400).json({
            message: 'Tipo de eliminación no válido.'
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};

exports.restoreStudent = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const student = await studentsModel.findByPk(id, { transaction });

        if (!student) {
            await transaction.rollback();

            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        await student.update({
            status: true
        }, { transaction });

        await personalInformationModel.update({
            status: true
        }, {
            where: {
                id: student.personal_information_id
            },
            transaction
        });

        await transaction.commit();

        return res.status(200).json({ message: 'Estudiante restaurado correctamente.' });
    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};