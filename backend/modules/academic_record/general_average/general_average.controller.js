const { Op } = require('sequelize');
const sequelize = require('../../../config/db.config');
const Registrations = require('../../users/registrations.model');
const CourseAverageModel = require('../course_average/course_average.model');
const GeneralAverageQuery = require('./general_average.query');
const GeneralAverageModel = require('./general_average.model');

exports.createGeneralAverage = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { registration_id } = req.body;

        // 1. Validar dato obligatorio
        if (!registration_id) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe especificar la matrícula del estudiante.'
            });
        }

        // 2. Verificar matrícula
        const registration = await Registrations.findByPk(
            registration_id,
            { transaction }
        );

        if (!registration) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Matrícula no encontrada.'
            });
        }

        // 3. Obtener los promedios de los cursos
        //
        // Solo se consideran cursos que ya tienen
        // un promedio calculado.
        const courseAverages =
            await CourseAverageModel.findAll({
                where: {
                    registration_id,
                    overall_course_average: {
                        [Op.ne]: null
                    },
                    status: true
                },
                transaction
            });

        // 4. Extraer promedios válidos
        const validAverages = courseAverages
            .map(record => Number(record.overall_course_average))
            .filter(value => Number.isFinite(value));

        // 5. Calcular promedio general
        let generalAverage = null;

        if (validAverages.length > 0) {
            const total = validAverages.reduce(
                (sum, value) => sum + value,
                0
            );

            generalAverage = total / validAverages.length;
        }

        // 6. Redondear a dos decimales
        const round = value => {
            if (value === null) return null;

            return Number(value.toFixed(2));
        };

        generalAverage = round(generalAverage);

        // 7. Datos que se guardarán
        const data = {
            registration_id,
            general_average: generalAverage
        };

        // 8. Buscar si ya existe el promedio general
        const existing = await GeneralAverageModel.findOne({
            where: {
                registration_id
            },
            transaction
        });

        let result;
        let action;

        // 9. Crear o actualizar
        if (existing) {
            existing.set(data);

            await existing.save({
                transaction
            });

            result = existing;
            action = 'updated';
        } else {
            result = await GeneralAverageModel.create(
                data,
                { transaction }
            );

            action = 'created';
        }

        // 10. Confirmar transacción
        await transaction.commit();

        return res.status(action === 'created' ? 201 : 200).json({
            message: action === 'created'
                ? 'Promedio general calculado correctamente.'
                : 'Promedio general actualizado correctamente.',
            action,
            courses_used: validAverages.length,
            data: result
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error.message);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};

exports.getGeneralAverage = async (req, res) => {
    try {
        const { registration_id } = req.query;
        const whereCondition = {};

        if (registration_id) whereCondition.registration_id = registration_id;

        const query = GeneralAverageQuery(whereCondition, []);

        const generalAverage = await GeneralAverageModel.findAll(query);

        return res.status(200).json({
            message: generalAverage.length === 0 ? 'Aún no hay promedios generales registrados en el sistema.' : null,
            length: generalAverage.length,
            data: generalAverage
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};