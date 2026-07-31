const schoolDaysByScheduleModel = require('./school_days_by_schedule.model');
const schoolDaysByScheduleQuery = require('./school_days_by_schedule.query');

exports.getSchoolDaysBySchedule = async (req, res) => {
    try {
        const { schedule_id, school_day_id, type } = req.query;
        const whereCondition = {};

        if (schedule_id) whereCondition.schedule_id = schedule_id;
        if (school_day_id) whereCondition.school_day_id = school_day_id;
        if (type) whereCondition.type = type;

        const query = schoolDaysByScheduleQuery(
            whereCondition,
            []
        );

        const schoolDaysBySchedule = await schoolDaysByScheduleModel.findAll(query);

        return res.status(200).json({
            message: schoolDaysBySchedule.length === 0 ? 'Aún no hay días lectivos para horarios registrados en el sistema.' : null,
            length: schoolDaysBySchedule.length,
            data: schoolDaysBySchedule
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}