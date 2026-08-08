const sequelize = require('../../config/db.config');
const PersonalInformationModel = require('./personal_information.model');
const UsersModel = require('./users.model');
const AcademicStaffModel = require('./academic_staff.model');
const AcademicStaffContractsModel = require('./academic_staff_contracts.model');
const YearsModel = require('../temporality/years.model');
const academicStaffQuery = require('./academic_staff.query');

exports.createAcademicStaff = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {
        const {
            academic_staff_id,

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

            role,
            position,

            start_date,
            end_date,

            description

        } = req.body;

        if (!role || !start_date || !end_date) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Complete los campos obligatorios.'
            });
        }

        if (new Date(start_date) > new Date(end_date)) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'La fecha de inicio no puede ser mayor que la fecha de fin.'
            });
        }

        let academicStaff;

        if (academic_staff_id) {
            academicStaff = await AcademicStaffModel.findByPk(
                academic_staff_id,
                { transaction }
            );

            if (!academicStaff) {
                await transaction.rollback();
                return res.status(404).json({
                    message: 'El personal académico no existe.'
                });
            }
        } else {

            if (
                !names ||
                !fathers_surname ||
                !mothers_surname ||
                !dni ||
                !phone_number
            ) {

                await transaction.rollback();

                return res.status(400).json({
                    message: 'Complete los campos obligatorios.'
                });

            }

            const existDni = await PersonalInformationModel.findOne({

                where: { dni },

                transaction

            });

            if (existDni) {

                await transaction.rollback();

                return res.status(409).json({
                    message: 'El DNI ya se encuentra registrado.'
                });

            }

            personalInformation = await PersonalInformationModel.create({

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

            await UsersModel.create({

                personal_information_id: personalInformation.id,
                username: null,
                hashed_password: null,
                role,
                description

            }, { transaction });

            academicStaff = await AcademicStaffModel.create({

                personal_information_id: personalInformation.id,
                staff_type: role,
                description

            }, { transaction });

        }

        const startYear = Number(start_date.substring(0, 4));
        const endYear = Number(end_date.substring(0, 4));

        const contracts = [];

        for (let year = startYear; year <= endYear; year++) {
            const yearRecord = await YearsModel.findOne({
                where: { year },
                transaction
            });

            if (!yearRecord) {
                await transaction.rollback();
                return res.status(404).json({
                    message: `El año ${year} no se encuentra registrado en el sistema.`
                });
            }

            const existContract = await AcademicStaffContractsModel.findOne({
                where: {
                    academic_staff_id: academicStaff.id,
                    year_id: yearRecord.id

                },
                transaction

            });

            if (existContract) {
                await transaction.rollback();

                return res.status(409).json({
                    message: `Ya existe un contrato para el año ${year}.`
                });
            }

            contracts.push({
                academic_staff_id: academicStaff.id,

                year_id: yearRecord.id,
                start_date:
                    year === startYear
                        ? start_date
                        : `${year}-01-01`,
                end_date:
                    year === endYear
                        ? end_date
                        : `${year}-12-31`,
                position,
                description
            });
        }

        await AcademicStaffContractsModel.bulkCreate(
            contracts,
            { transaction }
        );

        await transaction.commit();

        return res.status(201).json({
            message: academic_staff_id
                ? 'Contratos registrados correctamente.'
                : 'Personal académico registrado correctamente.'
        });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.updateAcademicStaff = async (req, res) => {
    const { id } = req.params;

    const {
        staff_type,
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
        const academicStaff = await AcademicStaffModel.findByPk(id, { transaction });

        if (!academicStaff) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Personal académico no encontrado.' });
        }

        const personalInformation = await PersonalInformationModel.findByPk(
            academicStaff.personal_information_id,
            { transaction }
        );

        if (!personalInformation) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Información personal no encontrada.' });
        }

        const dniExists = await PersonalInformationModel.findOne({
            where: { dni },
            transaction
        });

        if (dniExists && dniExists.id !== personalInformation.id) {
            await transaction.rollback();
            return res.status(409).json({ message: 'El DNI ya se encuentra registrado.' });
        }

        const emailExists = await PersonalInformationModel.findOne({
            where: { email },
            transaction
        });

        if (emailExists && emailExists.id !== personalInformation.id) {
            await transaction.rollback();
            return res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado.' });
        }

        const phoneExists = await PersonalInformationModel.findOne({
            where: { phone_number },
            transaction
        });

        if (phoneExists && phoneExists.id !== personalInformation.id) {
            await transaction.rollback();
            return res.status(409).json({ message: 'El número telefónico ya se encuentra registrado.' });
        }

        await academicStaff.update({
            staff_type,
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

        return res.status(200).json({ message: 'Personal académico actualizado correctamente.' });
    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.getAcademicStaff = async (req, res) => {
    try {
        const { staff_type } = req.query;
        const whereCondition = {};

        if (staff_type) whereCondition.staff_type = staff_type;

        const query = academicStaffQuery(
            whereCondition,
            []
        );
        const academicStaff = await AcademicStaffModel.findAll(query);

        return res.status(200).json({
            message: academicStaff.length === 0 ? 'Aún no hay personal académico registrado en el sistema.' : null,
            length: academicStaff.length,
            data: academicStaff
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteAcademicStaff = async (req, res) => {
    const { id, del } = req.params;
    const transaction = await sequelize.transaction();

    try {
        const academicStaff = await AcademicStaffModel.findByPk(id, { transaction });

        if (!academicStaff) {
            await transaction.rollback();

            return res.status(404).json({ message: 'Personal académico no encontrado.' });
        }

        if (del === '0') {
            await academicStaff.update(
                { status: false },
                { transaction }
            );

            await PersonalInformationModel.update(
                { status: false },
                {
                    where: {
                        id: academicStaff.personal_information_id
                    },
                    transaction
                }
            );

            await UsersModel.update(
                { status: false },
                {
                    where: {
                        personal_information_id: academicStaff.personal_information_id
                    },
                    transaction
                }
            );

            await AcademicStaffContractsModel.update(
                { status: false },
                {
                    where: {
                        academic_staff_id: academicStaff.id
                    },
                    transaction
                }
            );

            await transaction.commit();

            return res.status(200).json({ message: 'Personal académico archivado correctamente.' });
        }

        if (del === '1') {
            const contracts = await AcademicStaffContractsModel.count({
                where: {
                    academic_staff_id: academicStaff.id
                },
                transaction
            });

            if (contracts > 0) {
                await transaction.rollback();

                return res.status(409).json({ message: 'No es posible eliminar un personal académico que posee contratos registrados. Primero elimine todos sus contratos.' });
            }

            await academicStaff.destroy({
                transaction
            });

            await UsersModel.destroy({
                where: {
                    personal_information_id: academicStaff.personal_information_id
                },
                transaction
            });

            await PersonalInformationModel.destroy({
                where: {
                    id: academicStaff.personal_information_id
                },
                transaction
            });

            await transaction.commit();

            return res.status(200).json({ message: 'Personal académico eliminado correctamente.' });
        }

        await transaction.rollback();

        return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }

};

exports.restoreAcademicStaff = async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
        const academicStaff = await AcademicStaffModel.findByPk(id, {
            transaction
        });

        if (!academicStaff) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Personal académico no encontrado.' });
        }

        await academicStaff.update({
            status: true
        }, { transaction });

        await PersonalInformationModel.update(
            { status: true },
            {
                where: {
                    id: academicStaff.personal_information_id
                },
                transaction
            }
        );

        await UsersModel.update(
            { status: true },
            {
                where: {
                    personal_information_id: academicStaff.personal_information_id
                },
                transaction
            }
        );

        await AcademicStaffContractsModel.update(
            { status: true },
            {
                where: {
                    academic_staff_id: academicStaff.id
                },
                transaction
            }
        );

        await transaction.commit();

        return res.status(200).json({ message: 'Personal académico reactivado correctamente.' });
    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};
