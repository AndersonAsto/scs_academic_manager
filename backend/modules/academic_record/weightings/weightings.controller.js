const weightingsModel = require('./weightings.model');
const weightingsQuery = require('./weightings.query');

exports.createWeighting = async (req, res) => {
    try {
        const { year_id, weighting, type, description } = req.body;

        if (!year_id || !weighting || !type || !description) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const newWeighting = await weightingsModel.create({
            year_id, weighting, type, description
        });

        return res.status(200).json({ message: 'Ponderación registrada correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getWeightings = async (req, res) => {
    try {
        const { year_id } = req.query;
        const whereCondition = {};

        if (year_id) whereCondition.year_id = year_id;

        const query = weightingsQuery(
            whereCondition,
            []
        );

        const weightings = await weightingsModel.findAll(query);

        return res.status(200).json({
            message: weightings.length === 0 ? 'Aún no hay ponderaciones registradas en el sistema.' : null,
            length: weightings.length,
            data: weightings
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateWeighting = async (req, res) => {
    const { id } = req.params;
    const { year_id, weighting, type, description } = req.body;

    try {
        const uWeighting = await weightingsModel.findByPk(id);

        if (uWeighting) return res.status(404).json({ message: 'Ponderación no encontrada.' });

        uWeighting.year_id = year_id;
        uWeighting.weighting = weighting;
        uWeighting.type = type;
        uWeighting.description = description;

        await uWeighting.save();

        return res.status(201).json({
            message: 'Ponderación actualizada correctamente.',
            data: uWeighting
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteWeighting = async (req, res) => {
    try {
        const { id, del } = req.params;

        const weighting = await weightingsModel.findOne({ where: { id } });

        if (!weighting) return res.status(404).json({ message: 'Ponderación no encontrada.' });

        if (del === '0')
            await weighting.update({ status: false });
        else if (del === '1')
            await weighting.destroy();
        else
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });

        return res.status(200).json({ message: del === '0' ? 'Sección archivada/desactivada correctamente.' : 'Sección eliminada correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}
