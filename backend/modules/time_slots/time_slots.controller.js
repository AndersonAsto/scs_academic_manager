const timeSlotsModel = require('./time_slots.model');
const timeSlotsQuery = require('./time_slots.query');

exports.createTimeSlots = async (req, res) => {
    try {
        const { time_slot, start_time, end_time, type, description } = req.body;

        if (!time_slot || !start_time || !end_time || !type) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const newTimeSlot = await timeSlotsModel.create({ time_slot, start_time, end_time, type, description });

        return res.status(201).json({ message: 'Franja horaria registrada correctamente.' })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getTimeSlots = async (req, res) => {
    try {
        const query = timeSlotsQuery();
        const timeSlots = await timeSlotsModel.findAll(query);

        return res.status(200).json({
            message: timeSlots === 0 ? 'Aún no hay franjas horarias registradas en el sistema.' : null,
            length: timeSlots.length,
            data: timeSlots
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateTimeSlot = async (req, res) => {
    const { id } = req.params;
    const { time_slot, start_time, end_time, type, description } = req.body;

    try {
        const uTimeSlot = await timeSlotsModel.findByPk(id);

        if (!uTimeSlot) return res.status(404).json({ message: 'Franja horaria no encontrada.' });

        uTimeSlot.time_slot = time_slot;
        uTimeSlot.start_time = start_time;
        uTimeSlot.end_time = end_time;
        uTimeSlot.type = type;
        uTimeSlot.description = description;

        await uTimeSlot.save();
        return res.status(201).json({
            message: 'Franja horaria actualizada correctamente.',
            data: uTimeSlot
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteTimeSlot = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';
        const timeSlot = await timeSlotsModel.findOne({ where: { id } });

        if (!timeSlot)
            return res.status(404).json({ message: 'Franja horaria no encontrada.' });

        if (del === '0') {
            await timeSlot.update({ status: false });
            fmessage = 'Franja horaria archivada/desctivada correctamente.'
        } else if (del === '1') {
            await timeSlot.destroy();
            fmessage = 'Franja horaria elimanada correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}