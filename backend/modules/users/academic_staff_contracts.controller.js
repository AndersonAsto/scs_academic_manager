const academicStaffContractsModel = require('./academic_staff_contracts.model');
const academicStaffContractsQuery = require('./academic_staff_contracts.query');
const AcademicStaff = require('./academic_staff.model');
const AcademicStaffContracts = require('./academic_staff_contracts.model');
const Years = require('../temporality/years.model');

exports.getAcademicStaffContracts = async (req, res) => {
    try {
        const { academic_staff_id, year_id, staff_type } = req.query;
        const whereCondition = {};
        const staffWhereCondition = {};

        if (academic_staff_id) whereCondition.academic_staff_id = academic_staff_id;

        if (year_id) whereCondition.year_id = year_id;

        if (staff_type) staffWhereCondition.staff_type = staff_type;

        const query = academicStaffContractsQuery(
            whereCondition,
            [],
            staffWhereCondition
        );

        const academicStaffContracts = await academicStaffContractsModel.findAll(query);

        return res.status(200).json({
            message: academicStaffContracts.length === 0 ? 'Aún no hay contratos del personal académico registrados en el sistema.' : null,
            length: academicStaffContracts.length,
            data: academicStaffContracts
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateAcademicStaffContract = async (req, res) => {
    const { id } = req.params;
    const { start_date, end_date, position, description } = req.body;

    try {
        const uAcademicStaffContracts = await academicStaffContractsModel.findByPk(id);

        if (!uAcademicStaffContracts) return res.status(404).json({ message: 'Contrato de personal académico no ecnontrado.' });

        uAcademicStaffContracts.start_date = start_date;
        uAcademicStaffContracts.end_date = end_date;
        uAcademicStaffContracts.position = position;
        uAcademicStaffContracts.description = description;

        await uAcademicStaffContracts.save();

        return res.status(201).json({
            message: 'Contrato de personal académico actualizado correctamente.',
            data: uAcademicStaffContracts
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteAcademicStaffContract = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';

        const academicStaffContract = await academicStaffContractsModel.findOne({ where: { id } });

        if (!academicStaffContract)
            return res.status(404).json({ message: 'Contrato de personal académico no encontrado.' });

        if (del === '0') {
            await academicStaffContract.update({ status: false });
            fmessage = 'Contrato de personal académico archivado/desctivado correctamente.'
        } else if (del === '1') {
            await academicStaffContract.destroy();
            fmessage = 'Contrato de personal académico elimanado correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getMyContracts = async (req, res) => {
    try {
        const { personalInformationId } = req.user;

        const academicStaff = await AcademicStaff.findOne({
            where: { personal_information_id: personalInformationId, status: true },
        });

        if (!academicStaff) {
            return res.status(404).json({
                message: 'No se encontró personal académico asociado a este usuario.',
            });
        }

        const contracts = await AcademicStaffContracts.findAll({
            where: { academic_staff_id: academicStaff.id, status: true },
            order: [['year_id', 'DESC']],
        });

        const yearIds = [...new Set(contracts.map((c) => c.year_id))];
        const years = await Years.findAll({ where: { id: yearIds } });
        const yearsById = new Map(years.map((y) => [y.id, y.year]));

        const data = contracts.map((contract) => ({
            id: contract.id,
            year_id: contract.year_id,
            year: yearsById.get(contract.year_id) ?? null,
            position: contract.position,
            start_date: contract.start_date,
            end_date: contract.end_date,
        }));

        return res.status(200).json({ length: data.length, data });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};