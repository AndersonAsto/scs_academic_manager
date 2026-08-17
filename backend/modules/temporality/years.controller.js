const { where } = require('sequelize');
const yearsModel = require('./years.model');
const yearsQuery = require('./years.query');

exports.createYear = async (req, res) => {
    try {
        const { year, description } = req.body;

        if (!year) return res.status(400).json({ message: 'Complete los campos obligatorios.' });
        if (year <= 1950 || year >= 2100) return res.status(400).json({ message: 'Ingresa un año correcto.' });

        const createYear = await yearsModel.create({ year, description });

        return res.status(201).json({ message: 'Año registrado correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getYears = async (req, res) => {
    try {
        const query = yearsQuery(
            {},
            [['year', 'ASC']]
        );

        const years = await yearsModel.findAll(query);

        return res.status(200).json({
            message: years.length === 0 ? 'Aún no hay años registrados en el sistema.' : null,
            data: years
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateYear = async (req, res) => {
    const { id } = req.params;
    const { year, description } = req.body;

    try {
        const uYear = await yearsModel.findByPk(id);

        if (!uYear) return res.status(404).json({ message: 'Año no encontrado.' });

        uYear.year = year;
        uYear.description = description;

        await uYear.save();

        return res.status(201).json({
            message: 'Año actualizado correctamente.',
            data: uYear
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteYear = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';
        const year = await yearsModel.findOne({ where: { id } });

        if (!year)
            return res.status(404).json({ message: 'Año no encontrado.' });

        if (del === '0') {
            await year.update({ status: false });
            fmessage = 'Año archivado/desactivado correctamente.'
        } else if (del === '1') {
            await year.destroy();
            fmessage = 'Año eliminado correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}