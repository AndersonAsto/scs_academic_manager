const teachingBlocksModel = require('./teachingBlocks.model');
const schoolDaysModel = require('./schoolDays.model');
const yearsModel = require('./years.model');
const schoolDaysQuery = require('./schoolDays.query');
const schoolDaysHelpers = require('./schoolDays.helpers');
const { Op } = require('sequelize');

exports.createSchoolDays = async (req, res) => {
    try {
        const { year_id } = req.body;

        if (!year_id) return res.status(400).json({ message: 'Debe indicar el año.' })

        const year = await yearsModel.findByPk(year_id);

        if (!year) return res.status(404).json({ message: 'El año indicado no existe.' });

        const blocks = await teachingBlocksModel.findAll({
            where: { year_id },
            order: [['start_day', 'ASC']]
        });

        if (blocks.length !== 4) {
            return res.status(400).json({
                message: 'El año no posee sus cuatro bloques lectivos.'
            });
        }

        const exists = await schoolDaysModel.count({
            where: {
                teaching_block_id: {
                    [Op.in]: blocks.map(x => x.id)
                }
            }
        });

        if (exists > 0) {
            return res.status(409).json({
                message: 'Este año ya posee días lectivos registrados.'
            });
        }

        const days = [];
        let week = 1;

        for (const block of blocks) {

            let current = schoolDaysHelpers.parseDateOnly(block.start_day);
            const end = schoolDaysHelpers.parseDateOnly(block.end_day);

            let previousWeekDay = -1;

            while (current <= end) {

                const jsDay = current.getDay();

                if (jsDay >= 1 && jsDay <= 5) {

                    if (jsDay <= previousWeekDay) {
                        week++;
                    }

                    previousWeekDay = jsDay;

                    const dayName = [
                        '',
                        'Lunes',
                        'Martes',
                        'Miércoles',
                        'Jueves',
                        'Viernes'
                    ][jsDay];

                    days.push({
                        teaching_block_id: block.id,
                        school_day: schoolDaysHelpers.formatDateOnly(current),
                        day: dayName,
                        week_number: week,
                        type: 'Día Lectivo',
                        description: null
                    });

                }
                current.setDate(current.getDate() + 1);
            }
            week++;
        }

        await schoolDaysModel.bulkCreate(days);

        return res.status(201).json({ message: 'Días lectivos registrados correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getSchoolDays = async (req, res) => {
    try {
        const query = schoolDaysQuery();

        const schoolDays = await schoolDaysModel.findAll(query);

        return res.status(200).json({
            message: schoolDays.length === 0 ? 'Aún no hay días lectivos registrados en el sistema.' : null,
            data: schoolDays
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateSchoolDay = async (req, res) => {
    const { id } = req.params;
    const { type, description } = req.body;

    try {
        const uSchoolDay = await schoolDaysModel.findByPk(id);

        if (!uSchoolDay) return res.status(404).json({ message: 'Día lectivo no encontrado' });

        uSchoolDay.type = type;
        uSchoolDay.description = description;

        await uSchoolDay.save();

        return res.status(201).json({
            message: 'Día lectivo actualizado correctamente.',
            data: uSchoolDay
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteSchoolDays = async (req, res) => {
    try {
        const { year_id, del } = req.params;
        let fmessage = '';

        const teachingBlocks = await teachingBlocksModel.findAll({
            where: { year_id },
            attributes: ['id']
        });

        if (!teachingBlocks) return res.status(404).json({ message: 'Días lectivos no encontrados.' });

        const blockIds = teachingBlocks.map(block => block.id);

        const total = await schoolDaysModel.count({
            where: {
                teaching_block_id: {
                    [Op.in]: blockIds
                }
            }
        });

        if (total === 0) return res.status(404).json({ message: 'Días lectivos no encontrados.' });

        if (del === '0') {
            await schoolDaysModel.update(
                { status: false },
                {
                    where: {
                        teaching_block_id: {
                            [Op.in]: blockIds
                        }
                    }
                }
            );

            fmessage = 'Días lectivos archivados/desactivados correctamente.'
        } else if (del === '1') {
            await schoolDaysModel.destroy({
                where: {
                    teaching_block_id: {
                        [Op.in]: blockIds
                    }
                }
            });

            fmessage = 'Días lectivos eliminados correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}