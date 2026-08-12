const teacherGroupsModel = require('./teacher_groups.model');
const teacherGroupsQuery = require('./teacher_groups.query');

exports.createTeachersGroup = async (req, res) => {
    try {
        const { academic_staff_contract_id, course_id, grade_id, section_id, tutor, description } = req.body;

        if (!academic_staff_contract_id || !course_id || !grade_id || !section_id) return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const newTeacherGroup = await teacherGroupsModel.create({
            academic_staff_contract_id, course_id, grade_id, section_id, tutor, description
        });

        return res.status(200).json({ message: 'Grupo de docente registrado correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateTeacherGroup = async (req, res) => {
    const { id } = req.params;
    const { academic_staff_contract_id, course_id, grade_id, section_id, tutor, description } = req.body;

    try {
        const uTeacherGroup = await teacherGroupsModel.findByPk(id);

        if (!uTeacherGroup) return res.status(404).json({ message: 'Grupo de docente no encontrado.' });

        uTeacherGroup.academic_staff_contract_id = academic_staff_contract_id;
        uTeacherGroup.course_id = course_id;
        uTeacherGroup.grade_id = grade_id;
        uTeacherGroup.section_id = section_id;
        uTeacherGroup.tutor = tutor;
        uTeacherGroup.description = description;

        await uTeacherGroup.save();

        return res.status(201).json({
            message: 'Grupo de docente actualizado correctamente.',
            data: uTeacherGroup
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.getTeacherGroups = async (req, res) => {
    try {
        const { academic_staff_contract_id, course_id, grade_id, section_id, tutor } = req.query;
        const whereCondition = {};

        if (academic_staff_contract_id) whereCondition.academic_staff_contract_id = academic_staff_contract_id;
        if (course_id) whereCondition.course_id = course_id;
        if (grade_id) whereCondition.grade_id = grade_id;
        if (section_id) whereCondition.section_id = section_id;
        if (tutor) whereCondition.tutor = tutor;

        const query = teacherGroupsQuery(
            whereCondition,
            []
        );

        const teacherGroups = await teacherGroupsModel.findAll(query);

        return res.status(200).json({
            message: teacherGroups.length === 0 ? 'Aún no hay grupos de docentes registrados en el sistema.' : null,
            length: teacherGroups.length,
            data: teacherGroups
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.deleteTeacherGroup = async (req, res) => {
    try {
        const { id, del } = req.params;

        const teacherGroup = await teacherGroupsModel.findOne({ where: { id } });

        if (!teacherGroup) return res.status(404).json({ message: 'Grupo de docente no encontrado.' });

        if (del === '0')
            await teacherGroup.update({ status: false });
        else if (del === '1')
            await teacherGroup.destroy();
        else
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });

        return res.status(200).json({ message: del === '0' ? 'Grupo de docente archivado/desactivado correctamente.' : 'Grupo de docente eliminado correctamente.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

const TeacherGroups = require('./teacher_groups.model');
const Courses = require('../../courses/courses.model');
const Grades = require('../../grades/grades.model');
const Sections = require('../../sections/sections.model');
const AcademicStaffContracts = require('../../users/academic_staff_contracts.model');

exports.getTeacherGroupsByContract = async (req, res) => {
    try {
        const { academic_staff_contract_id } = req.query;

        if (!academic_staff_contract_id) {
            return res.status(400).json({ message: 'Debe especificar el contrato del docente.' });
        }

        const teacherGroups = await TeacherGroups.findAll({
            where: { academic_staff_contract_id, status: true },
        });

        const courseIds = [...new Set(teacherGroups.map((g) => g.course_id))];
        const gradeIds = [...new Set(teacherGroups.map((g) => g.grade_id))];
        const sectionIds = [...new Set(teacherGroups.map((g) => g.section_id))];

        const [courses, grades, sections] = await Promise.all([
            Courses.findAll({ where: { id: courseIds } }),
            Grades.findAll({ where: { id: gradeIds } }),
            Sections.findAll({ where: { id: sectionIds } }),
        ]);

        const coursesById = new Map(courses.map((c) => [c.id, c.course]));
        const gradesById = new Map(grades.map((g) => [g.id, g.grade]));
        const sectionsById = new Map(sections.map((s) => [s.id, s.section]));

        const data = teacherGroups.map((group) => ({
            id: group.id,
            course_id: group.course_id,
            course: coursesById.get(group.course_id) ?? null,
            grade_id: group.grade_id,
            grade: gradesById.get(group.grade_id) ?? null,
            section_id: group.section_id,
            section: sectionsById.get(group.section_id) ?? null,
            tutor: group.tutor,
        }));

        return res.status(200).json({ length: data.length, data });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.getTeacherGroupsBySection = async (req, res) => {
    try {
        const { year_id, grade_id, section_id } = req.query;

        if (!year_id || !grade_id || !section_id) {
            return res.status(400).json({ message: 'Debe especificar año, grado y sección.' });
        }

        const teacherGroups = await TeacherGroups.findAll({
            where: { grade_id, section_id, status: true },
            include: [
                {
                    model: AcademicStaffContracts,
                    as: 'academic_staff_contract',
                    where: { year_id },
                    attributes: []
                }
            ]
        });

        const courseIds = [...new Set(teacherGroups.map((g) => g.course_id))];
        const courses = await Courses.findAll({ where: { id: courseIds } });
        const coursesById = new Map(courses.map((c) => [c.id, c.course]));

        const data = teacherGroups.map((group) => ({
            id: group.id,
            course_id: group.course_id,
            course: coursesById.get(group.course_id) ?? null,
        }));

        return res.status(200).json({ length: data.length, data });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};