const CourseAverageQuery = require('./course_average.query');
const CourseAverageModel = require('./course_average.model');

exports.createCourseAverage = async (req, res) => {
    try {

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getCourseAverage = async (req, res) => {
    try {
        const { registration_id, teacher_group_id } = req.query;
        const whereCondition = {};

        if (registration_id) whereCondition.registration_id = registration_id;
        if (teacher_group_id) whereCondition.teacher_group_id = teacher_group_id;

        const query = CourseAverageQuery(
            whereCondition,
            []
        );

        const courseAverage = await CourseAverageModel.findAll(query);

        return res.status(200).json({
            message: courseAverage.length === 0 ? 'Aún no hay promedios de cursos registrados en el sistema.' : null,
            length: courseAverage.length,
            data: courseAverage
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}