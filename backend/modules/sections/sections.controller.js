const sectionModel = require('./sections.model');
const sectionQuery = require('./sections.query');

exports.createSection = async (req, res) => {
    try {
        const { section, description } = req.body;

        if (!section) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const newSection = await sectionModel.create({ section, description });

        return res.status(201).json({ message: 'Sección registrada correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getSections = async (req, res) => {
    try {
        const query = sectionQuery(
            {},
            [['section', 'ASC']]
        );

        const sections = await sectionModel.findAll(query);

        if (sections.length === 0)
            return res.status(200).json({ message: 'Aún no hay secciones registradas en el sistema.' });
        else
            return res.status(200).json(sections);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateSection = async (req, res) => {
    const {id} = req.params;
    const {section, description} = req.body;

    try {
        const uSection = await sectionModel.findByPk(id);

        if (!uSection) return res.status(404).json({message: 'Sección no encontrada.'});

        uSection.section = section;
        uSection.description = description;

        await uSection.save();

        return res.status(200).json(uSection);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteSection = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';
        const section = await sectionModel.findOne({ where: { id } });

        if (!section) return res.status(404).json({ message: 'Sección no encontrada.' });

        if (del === '0') {
            await section.update({ status: false });
            fmessage = 'Sección archivada/desactivada correctamente.'
        } else if (del === '1') {
            await section.destroy();
            fmessage = 'Sección eliminada correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}