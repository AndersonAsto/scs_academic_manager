const weightingsModel = require('./weightings.model');
const weightingsQuery = require('./weightings.query');
const yearsModel = require('../../temporality/years.model');

exports.createWeighting = async (req, res) => {
    try {
        const { year_id, weightings } = req.body;

        if (!year_id || !Array.isArray(weightings) || weightings.length !== 3) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const year = await yearsModel.findByPk(year_id);

        if (!year) return res.status(404).json({ message: 'El año indicado no está registrado.' });

        const exists = await weightingsModel.count({ where: { year_id } });

        if (exists > 0) return res.status(409).json({ message: 'Este año ya posee ponderaciones para calificaciones registradas.' });

        const validWeightings = ['Calificación Diaria', 'Práctica', 'Examen'];

        let totalWeight = 0;

        for (const weight of weightings) {
            const { weighting, type } = weight;

            if (!weighting || !type)
                return res.status(400).json({ message: 'Complete los campos obligatorios.' });

            if (!validWeightings.includes(type))
                return res.status(400).json({ message: `La ponderación "${type}" no es válido.` });

            const numericType = Number(weighting);

            if (isNaN(numericType) || numericType <= 0) {
                return res.status(400).json({ message: 'El valor de la ponderación debe ser un número mayor a 0.' });
            }

            totalWeight += numericType;
        }

        if (totalWeight !== 100) {
            return res.status(400).json({ message: `La suma de las ponderaciones debe ser exactamente 100. Suma actual: ${totalWeight}.` });
        }

        const data = weightings.map(weight => ({
            year_id,
            weighting: weight.weighting,
            type: weight.type,
            description: weight.description || null
        }));

        await weightingsModel.bulkCreate(data);

        return res.status(200).json({ message: 'Ponderaciones registradas correctamente.' });
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
    const { weighting, description } = req.body;

    try {
        const uWeighting = await weightingsModel.findByPk(id);

        if (!uWeighting) return res.status(404).json({ message: 'Ponderación no encontrada.' });

        uWeighting.weighting = weighting;
        uWeighting.description = description;

        await uWeighting.save();

        return res.status(200).json({
            message: 'Ponderación actualizada correctamente.',
            data: uWeighting
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteWeightings = async (req, res) => {
    try {
        const { year_id, del } = req.params;
        let fmessage = '';

        const weightings = await weightingsModel.findAll({
            where: { year_id }
        });

        if (weightings.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron ponderaciones para el año seleccionado.'
            });
        }

        if (del === '0') {

            await weightingsModel.update(
                { status: false },
                { where: { year_id } }
            );

            fmessage = 'Ponderaciones archivadas/desactivadas correctamente.';

        } else if (del === '1') {

            await weightingsModel.destroy({
                where: { year_id }
            });

            fmessage = 'Ponderaciones eliminadas correctamente.';

        } else {

            return res.status(400).json({
                message: 'Tipo de eliminación no válido.'
            });

        }

        return res.status(200).json({
            message: fmessage
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};