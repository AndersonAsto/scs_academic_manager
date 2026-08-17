const sequelize = require('../../config/db.config');
const parentsModel = require('./parents.model');
const parentsQuery = require('./parents.query');
const registrationsModel = require('./registrations.model');
const personalInformationModel = require('./personal_information.model');
const usersModel = require('./users.model');

exports.getParents = async (req, res) => {
    try {
        const { id } = req.query;
        const whereCondition = {};

        if (id) whereCondition.id = id;

        const query = parentsQuery(
            whereCondition,
            []
        );

        const parents = await parentsModel.findAll(query);

        return res.status(200).json({
            message: parents.length === 0 ? 'Aún no hay apoderados registrados en el sistema.' : null,
            data: parents
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateParent = async (req, res) => {
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
        const parent = await parentsModel.findByPk(id, { transaction });

        if (!parent) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Apoderado no encontrado.' });
        }

        const personalInformation = await personalInformationModel.findByPk(
            parent.personal_information_id,
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

        await parent.update({
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

        return res.status(200).json({ message: 'Apoderado actualizado correctamente.' });
    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteParent = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id, del } = req.params;

        const parent = await parentsModel.findByPk(id, { transaction });

        if (!parent) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Apoderado no encontrado.' });
        }

        const user = await usersModel.findOne({
            where: {
                personal_information_id: parent.personal_information_id
            },
            transaction
        });

        const registrations = await registrationsModel.count({
            where: {
                parent_id: id
            },
            transaction
        });

        if (del === '0') {

            await parent.update({
                status: false
            }, { transaction });

            await personalInformationModel.update({
                status: false
            }, {
                where: {
                    id: parent.personal_information_id
                },
                transaction
            });

            if (user) {
                await user.update({
                    status: false
                }, { transaction });
            }

            await transaction.commit();

            return res.status(200).json({ message: 'Apoderado archivado/desactivado correctamente.' });
        }

        if (del === '1') {

            if (registrations > 0) {
                await transaction.rollback();

                return res.status(409).json({ message: 'No es posible eliminar el apoderado porque tiene matrículas asociadas. Elimine primero dichas matrículas o simplemente desactívelo.' });
            }

            if (user) {
                await user.destroy({ transaction });
            }

            await parent.destroy({ transaction });

            await personalInformationModel.destroy({
                where: {
                    id: parent.personal_information_id
                },
                transaction
            });

            await transaction.commit();

            return res.status(200).json({ message: 'Apoderado eliminado correctamente.' });
        }

        await transaction.rollback();

        return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
    } catch (error) {
        await transaction.rollback();
        console.error(error);

        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.restoreParent = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const parent = await parentsModel.findByPk(id, { transaction });

        if (!parent) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Apoderado no encontrado.' });
        }

        const personalInformation = await personalInformationModel.findByPk(
            parent.personal_information_id,
            { transaction }
        );

        if (!personalInformation) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Información personal no encontrada.' });
        }

        const user = await usersModel.findOne({
            where: {
                personal_information_id: parent.personal_information_id
            },
            transaction
        });

        await parent.update({
            status: true
        }, { transaction });

        await personalInformation.update({
            status: true
        }, { transaction });

        if (user) {
            await user.update({
                status: true
            }, { transaction });
        }

        await transaction.commit();

        return res.status(200).json({ message: 'Apoderado restaurado correctamente.' });

    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};