const GeneralAverageQuery = require('./general_average.query');
const GeneralAverageModel = require('./general_average.model');

exports.createGeneralAverage = async (req, res) => {
    try {

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getGeneralAverage = async (req, res) => {
    try {
        const { registration_id } = req.query;
        const whereCondition = {};

        if (registration_id) whereCondition.registration_id = registration_id;

        const query = GeneralAverageQuery(
            whereCondition,
            []
        );

        const generalAverage = await GeneralAverageModel.findAll(query);

        return res.status(200).json({
            message: generalAverage.length === 0 ? 'Aún no hay promedios generales registrados en el sistema.' : null,
            length: generalAverage.length,
            data: generalAverage
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}