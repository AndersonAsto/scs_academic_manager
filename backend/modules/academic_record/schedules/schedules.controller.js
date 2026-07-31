const schedulesModel = require('./schedules.model');
const schedulesQuery = require('./schedules.query');

exports.createSchedule = async (req, res) => {
    try {
        const { teacher_group_id, time_slot_id, day, description } = req.body;

        if (!teacher_group_id || !time_slot_id || !day) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const newSchedule = await schedulesModel.create({
            teacher_group_id, time_slot_id, day, description
        });

        return res.status(200).json({ message: 'Horario registrado correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getSchedules = async (req, res) => {
    try {
        const { teacher_group_id, time_slot_id, day } = req.query;
        const whereCondition = {};

        if (teacher_group_id) whereCondition.teacher_group_id = teacher_group_id;
        if (time_slot_id) whereCondition.time_slot_id = time_slot_id;
        if (day) whereCondition.day = day;

        const query = schedulesQuery(
            whereCondition,
            []
        );

        const schedules = await schedulesModel.findAll(query);

        return res.status(200).json({
            message: schedules.length === 0 ? 'Aún no hay horarios registrados en el sistema.' : null,
            length: schedules.length,
            data: schedules
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateSchedule = async (req, res) => {
    const { id } = req.params;
    const { teacher_group_id, time_slot_id, day, description } = req.body;

    try {
        const uSchedules = await schedulesModel.findByPk(id);

        if (uSchedules) return res.status(404).json({ message: 'Horario no encontrado.' });

        uSchedules.academic_staff_contract_id = academic_staff_contract_id;
        uSchedules.course_id = course_id;
        uSchedules.grade_id = grade_id;
        uSchedules.section_id = section_id;
        uSchedules.tutor = tutor;
        uSchedules.description = description;

        await uSchedules.save();

        return res.status(201).json({
            message: 'Horario actualizado correctamente.',
            data: uSchedules
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteSchedule = async (req, res) => {
    try {
        const { id, del } = req.params;

        const schedule = await schedulesModel.findOne({ where: { id } });

        if (!schedule) return res.status(404).json({ message: 'Horario no encontrado.' });

        if (del === '0')
            await schedule.update({ status: false });
        else if (del === '1')
            await schedule.destroy();
        else
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });

        return res.status(200).json({ message: del === '0' ? 'Horario archivado/desactivado correctamente.' : 'Horario eliminado correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}