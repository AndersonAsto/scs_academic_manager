const personalInformationModel = require('./personal_information.model');
const personalInformationQuery = require('./personal_information.query');

exports.getPersonalInformation = async (req, res) => {
    try {
        const query = personalInformationQuery();
        const personalInformation = await personalInformationModel.findAll(query);

        return res.status(200).json({
            message: personalInformation.length === 0 ? 'Aún no hay información personal registrada en el sistema.' : null,
            data: personalInformation
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}