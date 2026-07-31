const courseModel = require('./courses.model')
const coursesQuery = require('./courses.query');

exports.createCourse = async (req, res) => {
    try {
        const { course, recurrence, description } = req.body;

        if (!course || !recurrence) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const newCourse = await courseModel.create({ course, recurrence, description });
        
        return res.status(201).json({ message: 'Curso registrado correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getCourses = async (req, res) => {
    try {
        const query = coursesQuery(
            {},
            [['recurrence', 'DESC']]
        );
        const courses = await courseModel.findAll(query);

        if (courses.length === 0)
            return res.status(200).json({ message: 'Aún no hay cursos registrados en el sistema.' });
        else
            return res.status(200).json(courses);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateCourse = async (req, res) => {
    const { id } = req.params;
    const { course, recurrence, description } = req.body;

    try {
        const uCourse = await courseModel.findByPk(id);
        if (!uCourse) return res.status(404).json({ message: 'Curso no encontrado.' });

        uCourse.course = course;
        uCourse.recurrence = recurrence;
        uCourse.description = description;

        await uCourse.save();
        return res.status(201).json(uCourse);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteCourse = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';
        const course = await courseModel.findOne({ where: { id } });

        if (!course)
            return res.status(404).json({ message: 'Curso no encontrado.' });

        if (del === '0') {
            await course.update({ status: false });
            fmessage = 'Curso archivado/desctivado correctamente.'
        } else if (del === '1') {
            await course.destroy();
            fmessage = 'Curso elimando correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}