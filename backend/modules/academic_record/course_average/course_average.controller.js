const { Op } = require('sequelize');
const sequelize = require('../../../config/db.config');
const Registrations = require('../../users/registrations.model');
const TeacherGroups = require('../teacher_groups/teacher_groups.model');
const AcademicStaffContracts = require('../../users/academic_staff_contracts.model');
const TeachingBlockCourseAverageModel = require('../teaching_block_course_average/teaching_block_course_average.model');
const CourseAverageModel = require('./course_average.model');
const CourseAverageQuery = require('./course_average.query');

exports.createCourseAverage = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { registration_id, teacher_group_id } = req.body;

        // 1. Validar datos obligatorios
        if (!registration_id || !teacher_group_id) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe especificar el estudiante y el grupo docente.'
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

        // 3. Verificar grupo docente y obtener su contrato
        const teacherGroup = await TeacherGroups.findByPk(
            teacher_group_id,
            {
                include: [
                    {
                        model: AcademicStaffContracts,
                        as: 'academic_staff_contract'
                    }
                ],
                transaction
            }
        );

        if (!teacherGroup) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Grupo docente no encontrado.'
            });
        }

        // 4. Validar que el contrato exista
        if (!teacherGroup.academic_staff_contract) {
            await transaction.rollback();

            return res.status(409).json({
                message: 'El grupo docente no tiene un contrato académico válido.'
            });
        }

        const teacherGroupYearId =
            teacherGroup.academic_staff_contract.year_id;

        // 5. Validar que matrícula y grupo docente pertenezcan
        //    al mismo año, grado y sección
        if (
            registration.year_id !== teacherGroupYearId ||
            registration.grade_id !== teacherGroup.grade_id ||
            registration.section_id !== teacherGroup.section_id
        ) {
            await transaction.rollback();

            return res.status(409).json({
                message: 'La matrícula no corresponde al grupo docente seleccionado.'
            });
        }

        // 6. Buscar los promedios de bloques lectivos
        //
        //    Solo interesan aquellos que ya tienen
        //    teaching_block_average calculado.
        const blockAverages =
            await TeachingBlockCourseAverageModel.findAll({
                where: {
                    registration_id,
                    teacher_group_id,
                    teaching_block_average: {
                        [Op.ne]: null
                    },
                    status: true
                },
                transaction
            });

        // 7. Extraer únicamente los promedios válidos
        const validAverages = blockAverages
            .map(record => Number(record.teaching_block_average))
            .filter(value => Number.isFinite(value));

        // 8. Calcular promedio acumulado del curso
        let overallCourseAverage = null;

        if (validAverages.length > 0) {
            const total = validAverages.reduce(
                (sum, value) => sum + value,
                0
            );

            overallCourseAverage = total / validAverages.length;
        }

        // 9. Redondear a dos decimales
        const round = value => {
            if (value === null) return null;

            return Number(value.toFixed(2));
        };

        overallCourseAverage = round(overallCourseAverage);

        // 10. Datos que se guardarán
        const data = {
            registration_id,
            teacher_group_id,
            overall_course_average: overallCourseAverage
        };

        // 11. Buscar si ya existe el promedio del curso
        const existing = await CourseAverageModel.findOne({
            where: {
                registration_id,
                teacher_group_id
            },
            transaction
        });

        let result;
        let action;

        // 12. Crear o actualizar
        if (existing) {
            existing.set(data);

            await existing.save({
                transaction
            });

            result = existing;
            action = 'updated';
        } else {
            result = await CourseAverageModel.create(
                data,
                { transaction }
            );

            action = 'created';
        }

        // 13. Confirmar transacción
        await transaction.commit();

        return res.status(action === 'created' ? 201 : 200).json({
            message: action === 'created'
                ? 'Promedio del curso calculado correctamente.'
                : 'Promedio del curso actualizado correctamente.',
            action,
            blocks_used: validAverages.length,
            data: result
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

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