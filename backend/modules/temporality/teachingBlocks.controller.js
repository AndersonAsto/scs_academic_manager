const yearsModel = require('./years.model');
const teachingBlocksModel = require('./teachingBlocks.model');
const teachingBlocksQuery = require('./teachingBlocks.query');

exports.createTeachingBlocks = async (req, res) => {
    try {
        const { year_id, teaching_blocks } = req.body;

        if (!year_id || !Array.isArray(teaching_blocks) || teaching_blocks.length !== 4) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const year = await yearsModel.findByPk(year_id);

        if (!year) return res.status(404).json({ message: 'El año indicado no está registrado.' });

        const exists = await teachingBlocksModel.count({ where: { year_id } });

        if (exists > 0) return res.status(409).json({ message: 'Este año ya posee bloques lectivos registrados.' });

        const validBlocks = [
            '1° Bimestre',
            '2° Bimestre',
            '3° Bimestre',
            '4° Bimestre'
        ];

        for (const block of teaching_blocks) {

            const {
                teaching_block,
                start_day,
                end_day
            } = block;

            if (!teaching_block || !start_day || !end_day)
                return res.status(400).json({ message: 'Todos los bloques deben tener nombre, fecha de inicio y fecha de fin.' });

            if (!validBlocks.includes(teaching_block))
                return res.status(400).json({ message: `El bloque "${teaching_block}" no es válido.` });

            if (new Date(start_day) > new Date(end_day))
                return res.status(400).json({ message: `La fecha de inicio del ${teaching_block} no puede ser mayor que la fecha de fin.` });
        }

        const data = teaching_blocks.map(block => ({
            year_id,
            teaching_block: block.teaching_block,
            start_day: block.start_day,
            end_day: block.end_day,
            description: block.description || null
        }));

        await teachingBlocksModel.bulkCreate(data);

        return res.status(201).json({ message: 'Bloques lectivos registrados correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateTeachingBlock = async (req, res) => {
    const { id } = req.params;
    const { start_day, end_day, description } = req.body;

    try {
        const uTeachingBlock = await teachingBlocksModel.findByPk(id);

        if (!uTeachingBlock) return res.status(404).json({ message: 'Bloque lectivo no encontrado.' });

        uTeachingBlock.start_day = start_day;
        uTeachingBlock.end_day = end_day;
        uTeachingBlock.description = description;

        await uTeachingBlock.save();

        return res.status(201).json({
            message: 'Bloque lectivo actualizado correctamente.',
            data: uTeachingBlock
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getTeachingBlocks = async (req, res) => {
    try {
        const query = teachingBlocksQuery(
            {},
            [[
                { model: yearsModel, as: 'year' },
                'year', 'ASC'
            ]]
        );

        const teachingBlocks = await teachingBlocksModel.findAll(query);

        return res.status(200).json({
            message: teachingBlocks.length === 0 ? 'Aún no hay bloques lectivos registrados en el sistema.' : null,
            data: teachingBlocks
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteTeachingBlocks = async (req, res) => {
    try {
        const { year_id, del } = req.params;
        let fmessage = '';

        const teachingBlocks = await teachingBlocksModel.findAll({
            where: { year_id }
        });

        if (teachingBlocks.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron bloques lectivos para el año seleccionado.'
            });
        }

        if (del === '0') {
            await teachingBlocksModel.update(
                { status: false },
                { where: { year_id } }
            );

            fmessage = 'Bloques lectivos archivados/desactivados correctamente.';

        } else if (del === '1') {
            await teachingBlocksModel.destroy({
                where: { year_id }
            });

            fmessage = 'Bloques lectivos eliminados correctamente.';

        } else {
            return res.status(400).json({
                message: 'Tipo de eliminación no válido.'
            });
        }

        return res.status(200).json({
            message: fmessage
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};

const TeachingBlocks = require('./teachingBlocks.model');

exports.getTeachingBlocksByYear = async (req, res) => {
    try {
        const { year_id } = req.query;

        if (!year_id) {
            return res.status(400).json({ message: 'Debe especificar el año.' });
        }

        const teachingBlocks = await TeachingBlocks.findAll({
            where: { year_id, status: true },
            order: [['start_day', 'ASC']],
        });

        return res.status(200).json({ length: teachingBlocks.length, data: teachingBlocks });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};