const sequelize = require('../../config/db.config');
const PersonalInformation = require('./personal_information.model');
const Parents = require('./parents.model');
const Students = require('./students.model');
const Users = require('./users.model');
const Registrations = require('./registrations.model');
const Years = require('../temporality/years.model');
const Grades = require('../grades/grades.model');
const Sections = require('../sections/sections.model');
const registrationsQuery = require('./registrations.query');

exports.createRegistration = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

        const {

            year_id,
            grade_id,
            section_id,
            registration_date,
            description,

            parent_id,
            student_id,

            parent,
            student

        } = req.body;

        if (!year_id || !grade_id || !section_id) {

            await transaction.rollback();

            return res.status(400).json({
                message: 'Complete los campos obligatorios.'
            });

        }

        const year = await Years.findByPk(year_id, { transaction });
        const grade = await Grades.findByPk(grade_id, { transaction });
        const section = await Sections.findByPk(section_id, { transaction });

        if (!year || !grade || !section) {

            await transaction.rollback();

            return res.status(404).json({
                message: 'Año, grado o sección no encontrados.'
            });

        }

        let parentRecord;

        if (parent_id) {

            parentRecord = await Parents.findByPk(parent_id, {
                transaction
            });

            if (!parentRecord) {

                await transaction.rollback();

                return res.status(404).json({
                    message: 'Apoderado no encontrado.'
                });

            }

        } else {

            if (!parent) {

                await transaction.rollback();

                return res.status(400).json({
                    message: 'Debe registrar un apoderado.'
                });

            }

            const existParent = await PersonalInformation.findOne({

                where: {
                    dni: parent.dni
                },

                transaction

            });

            if (existParent) {

                await transaction.rollback();

                return res.status(409).json({
                    message: 'El DNI del apoderado ya se encuentra registrado.'
                });

            }

            const parentInformation = await PersonalInformation.create({

                ...parent,
                description

            }, { transaction });

            parentRecord = await Parents.create({

                personal_information_id: parentInformation.id,
                description

            }, { transaction });

            await Users.create({

                personal_information_id: parentInformation.id,
                username: null,
                hashed_password: null,
                role: 'Apoderado',
                description

            }, { transaction });

        }

        let studentRecord;

        if (student_id) {

            studentRecord = await Students.findByPk(student_id, {
                transaction
            });

            if (!studentRecord) {

                await transaction.rollback();

                return res.status(404).json({
                    message: 'Estudiante no encontrado.'
                });

            }

        } else {

            if (!student) {

                await transaction.rollback();

                return res.status(400).json({
                    message: 'Debe registrar un estudiante.'
                });

            }

            const existStudent = await PersonalInformation.findOne({

                where: {
                    dni: student.dni
                },

                transaction

            });

            if (existStudent) {

                await transaction.rollback();

                return res.status(409).json({
                    message: 'El estudiante ya se encuentra registrado.'
                });

            }

            const studentInformation = await PersonalInformation.create({

                ...student,
                description

            }, { transaction });

            studentRecord = await Students.create({

                personal_information_id: studentInformation.id,
                description

            }, { transaction });

        }

        const existRegistration = await Registrations.findOne({

            where: {

                year_id,
                student_id: studentRecord.id

            },

            transaction

        });

        if (existRegistration) {

            await transaction.rollback();

            return res.status(409).json({
                message: 'El estudiante ya se encuentra matriculado en este año.'
            });

        }

        const registration = await Registrations.create({

            year_id,
            student_id: studentRecord.id,
            parent_id: parentRecord.id,
            grade_id,
            section_id,
            registration_date,
            description

        }, { transaction });

        await transaction.commit();

        return res.status(201).json({

            message: student_id
                ? 'Renovación de matrícula registrada correctamente.'
                : 'Matrícula registrada correctamente.',

            data: registration

        });

    } catch (error) {

        await transaction.rollback();

        console.error(error);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });

    }

};

exports.getRegistrations = async (req, res) => {
    try {
        const { year_id, parent_id, student_id, grade_id, section_id } = req.query;
        const whereCondition = {};

        if (year_id) whereCondition.year_id = year_id;

        if (parent_id) whereCondition.parent_id = parent_id;

        if (student_id) whereCondition.student_id = student_id;

        if (grade_id) whereCondition.grade_id = grade_id;

        if (section_id) whereCondition.section_id = section_id;

        const query = registrationsQuery(
            whereCondition,
            []
        );

        const registrations = await Registrations.findAll(query);

        return res.status(200).json({
            message: registrations.length === 0 ? 'Aún no hay usuarios registrados en el sistema.' : null,
            data: registrations
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateRegistration = async (req, res) => {
    const { id } = req.params;
    const { year_id, grade_id, section_id, parent_id, registration_date, description } = req.body;

    try {
        const uRegistration = await Registrations.findByPk(id);

        if (!uRegistration) return res.status(404).json({ message: 'Matrícula no encontrada.' });

        uRegistration.year_id = year_id;
        uRegistration.grade_id = grade_id;
        uRegistration.section_id = section_id;
        uRegistration.parent_id = parent_id;
        uRegistration.registration_date = registration_date;
        uRegistration.description = description;

        await uRegistration.save();

        return res.status(200).json({
            message: 'Matrícula actualizada correctamente.',
            data: uRegistration
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteRegistration = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id, del } = req.params;

        const registration = await Registrations.findByPk(id, {
            transaction
        });

        if (!registration) {
            await transaction.rollback();

            return res.status(404).json({ message: 'Matrícula no encontrada.' });
        }

        const student = await studentsModel.findByPk(
            registration.student_id,
            { transaction }
        );

        if (!student) {
            await transaction.rollback();

            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        if (del === '0') {
            await registration.update({
                status: false
            }, { transaction });

            await student.update({
                status: false
            }, { transaction });

            await personalInformationModel.update({
                status: false
            }, {
                where: {
                    id: student.personal_information_id
                },
                transaction
            });

            await transaction.commit();

            return res.status(200).json({ message: 'Matrícula archivada/desactivada correctamente.' });
        }

        if (del === '1') {
            const totalRegistrations = await Registrations.count({
                where: {
                    student_id: registration.student_id
                },
                transaction
            });

            if (totalRegistrations > 1) {
                await transaction.rollback();

                return res.status(409).json({ message: 'No es posible eliminar el estudiante porque posee otras matrículas asociadas. Elimine primero dichos registros o simplemente desactívelo.' });
            }

            await registration.destroy({
                transaction
            });

            await student.destroy({
                transaction
            });

            await PersonalInformation.destroy({
                where: {
                    id: student.personal_information_id
                },
                transaction
            });

            await transaction.commit();

            return res.status(200).json({ message: 'Matrícula eliminada correctamente.' });
        }

        await transaction.rollback();

        return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.restoreRegistration = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const registration = await Registrations.findByPk(id, { transaction });

        if (!registration) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Matrícula no encontrada.' });
        }

        const student = await Students.findByPk(
            registration.student_id,
            { transaction }
        );

        if (!student) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        await registration.update({
            status: true
        }, { transaction });

        await student.update({
            status: true
        }, { transaction });

        await PersonalInformation.update({
            status: true
        }, {
            where: {
                id: student.personal_information_id
            },
            transaction
        });

        await transaction.commit();

        return res.status(200).json({ message: 'Matrícula restaurada correctamente.' });
    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};