const TeachingBlockCourseAverageQuery = require('./teaching_block_course_average.query');
const TeachingBlockCourseAverageModel = require('./teaching_block_course_average.model');

exports.createTeachingBlockCourseAverage = async (req, res) => {
    try {

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getTeachingBlockCourseAverage = async (req, res) => {
    try {
        const { registration_id, teacher_group_id, teaching_block_id } = req.query;
        const whereCondition = {};

        if (registration_id) whereCondition.registration_id = registration_id;
        if (teacher_group_id) whereCondition.teacher_group_id = teacher_group_id;
        if (teaching_block_id) whereCondition.teaching_block_id = teaching_block_id;

        const query = TeachingBlockCourseAverageQuery(
            whereCondition,
            []
        );

        const teachingBlockCourseAverage = await TeachingBlockCourseAverageModel.findAll(query);

        return res.status(200).json({
            message: teachingBlockCourseAverage.length === 0 ? 'Aún no hay promedios de bloques lectivos registrados en el sistema.' : null,
            length: teachingBlockCourseAverage.length,
            data: teachingBlockCourseAverage
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}