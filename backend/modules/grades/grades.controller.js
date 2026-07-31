const gradesModel = require('./grades.model');
const gradesQuery = require('./grades.query');

exports.createGrade = async (req, res) => {
    try {
        const { grade, description } = req.body;

        if (!grade) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const newGrade = await gradesModel.create({ grade, description });

        return res.status(201).json({ message: 'Grado registrado correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getGrades = async (req, res) => {
    try {
        const query = gradesQuery();
        const grades = await gradesModel.findAll(query);

        if (grades.length === 0)
            return res.status(200).json({ message: 'Aún no hay grados registrados en el sistema.' });
        else
            return res.status(200).json(grades);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateGrade = async (req, res) => {
    const { id } = req.params;
    const { grade, description } = req.body;

    try {
        const uGrade = await gradesModel.findByPk(id);

        if (!uGrade) return res.status(404).json({ message: 'Grado no encontrado.' });

        uGrade.grade = grade;
        uGrade.description = description;

        await uGrade.save();
        return res.status(201).json(uGrade);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteGrade = async (req, res) => {

    try {
        const { id, del } = req.params;
        let fmessage = '';
        const grade = await gradesModel.findOne({ where: { id } });

        if (!grade)
            return res.status(404).json({ message: 'Grado no encontrado.' });

        if (del === '0') {
            await grade.update({ status: false });
            fmessage = 'Grado archivado/desctivado correctamente.'
        } else if (del === '1') {
            await grade.destroy();
            fmessage = 'Grado elimando correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}