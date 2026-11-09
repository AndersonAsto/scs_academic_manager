const axios = require('axios');
const { Op } = require('sequelize');

const TeachingBlockCourseAverageModel = require('../../academic_record/teaching_block_course_average/teaching_block_course_average.model');
const AcademicRecordsModel = require('../../academic_record/academic_records/academic_record.model');
const TeachingBlocks = require('../../temporality/teachingBlocks.model');
const AiRiskPrediction = require('./ai_risk_prediction.model');

const AI_SERVICE_URL = process.env.AI_RISK_SERVICE_URL || 'http://localhost:8001';

exports.predictRisk = async (req, res) => {
    try {
        const { registration_id, teacher_group_id, teaching_block_id } = req.body;

        // Todos los bloques del curso con promedio ya calculado, para ubicar
        // cronológicamente cuál es "el actual" y cuáles son "los anteriores".
        const blockAverages = await TeachingBlockCourseAverageModel.findAll({
            where: { registration_id, teacher_group_id, status: true },
            include: [{ model: TeachingBlocks, as: 'teaching_block', required: true }],
        });

        const sorted = blockAverages
            .filter((b) => b.teaching_block_average !== null)
            .sort((a, b) => new Date(a.teaching_block.start_day) - new Date(b.teaching_block.start_day));

        const currentIndex = sorted.findIndex((b) => b.teaching_block_id === teaching_block_id);

        if (currentIndex === -1) {
            return res.status(404).json({
                message: 'Aún no existe un promedio calculado para este bloque lectivo. Calcula el promedio antes de predecir el riesgo.',
            });
        }

        const current = sorted[currentIndex];
        const previous = currentIndex > 0 ? sorted[currentIndex - 1] : null;

        const uptoCurrent = sorted.slice(0, currentIndex + 1);
        const cumulativeAverage =
            uptoCurrent.reduce((sum, b) => sum + Number(b.teaching_block_average), 0) / uptoCurrent.length;

        const incidentCount = await AcademicRecordsModel.count({
            where: { registration_id, incident: { [Op.ne]: null } },
        });

        const features = {
            daily_average: current.daily_average !== null ? Number(current.daily_average) : null,
            practice_average: current.practice_average !== null ? Number(current.practice_average) : null,
            exam_average: current.exam_average !== null ? Number(current.exam_average) : null,
            attendance_average: current.attendance_average !== null ? Number(current.attendance_average) : null,
            trend:
                previous !== null
                    ? Number(current.teaching_block_average) - Number(previous.teaching_block_average)
                    : null,
            cumulative_average: cumulativeAverage,
            incident_count: incidentCount,
        };

        const { data } = await axios.post(`${AI_SERVICE_URL}/predict`, features);

        const [prediction] = await AiRiskPrediction.upsert({
            registration_id,
            teacher_group_id,
            teaching_block_id,
            risk_level: data.risk_level,
            probability: data.probability,
            model_version: data.model_version,
            features_snapshot: features,
        });

        return res.status(200).json({ data: { ...data, prediction_id: prediction.id } });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error al calcular el riesgo académico.' });
    }
};

exports.getRiskPredictions = async (req, res) => {
    try {
        const { teacher_group_id, teaching_block_id } = req.query;

        if (!teacher_group_id || !teaching_block_id) {
            return res.status(400).json({ message: 'Debe especificar el grupo docente y el bloque lectivo.' });
        }

        const predictions = await AiRiskPrediction.findAll({
            where: { teacher_group_id, teaching_block_id, status: true },
        });

        return res.status(200).json({ length: predictions.length, data: predictions });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};