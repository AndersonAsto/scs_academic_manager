const { Op, fn, col } = require('sequelize');
const Registrations = require('../users/registrations.model');
const AcademicStaffContracts = require('../users/academic_staff_contracts.model');
const AcademicStaff = require('../users/academic_staff.model');
const Grades = require('../grades/grades.model');
const Sections = require('../sections/sections.model');
const GeneralAverageModel = require('../academic_record/general_average/general_average.model');
const AcademicRecords = require('../academic_record/academic_records/academic_record.model');
const SchoolDaysBySchedule = require('../academic_record/school_days_by_schedule/school_days_by_schedule.model');
const Schedules = require('../academic_record/schedules/schedules.model');
const TeacherGroups = require('../academic_record/teacher_groups/teacher_groups.model');
const Courses = require('../courses/courses.model');
const TeachingBlockCourseAverageModel = require('../academic_record/teaching_block_course_average/teaching_block_course_average.model');
const CourseAverageModel = require('../academic_record/course_average/course_average.model');
const TeachingBlocks = require('../temporality/teachingBlocks.model');
const Users = require('../users/users.model');
const Parents = require('../users/parents.model');

exports.getAdminSummary = async (req, res) => {
    try {
        const { year_id } = req.query;

        if (!year_id) {
            return res.status(400).json({ message: 'Debe especificar el año.' });
        }

        // 1. Matriculados en el año (1 registro = 1 alumno matriculado ese año)
        const totalRegistrations = await Registrations.count({
            where: { year_id, status: true },
        });

        // 2. Docentes con contrato activo en ese año
        const totalTeachers = await AcademicStaffContracts.count({
            where: { year_id, status: true },
            include: [{
                model: AcademicStaff,
                as: 'academic_staff',
                where: { staff_type: 'Docente' },
                required: true,
            }],
        });

        // 3. Matriculados por grado y sección
        const byGradeSectionRaw = await Registrations.findAll({
            where: { year_id, status: true },
            attributes: [
                'grade_id',
                'section_id',
                [fn('COUNT', col('Registrations.id')), 'count'],
            ],
            include: [
                { model: Grades, as: 'grade', attributes: ['grade'] },
                { model: Sections, as: 'section', attributes: ['section'] },
            ],
            group: ['grade_id', 'section_id', 'grade.id', 'section.id'],
            raw: true,
        });

        const byGradeSection = byGradeSectionRaw.map((row) => ({
            grade: row['grade.grade'],
            section: row['section.section'],
            count: Number(row.count),
        }));

        // 4. Promedio general del año (promedio de los general_average ya calculados)
        const generalAverageResult = await GeneralAverageModel.findOne({
            attributes: [[fn('AVG', col('general_average')), 'avg']],
            include: [{
                model: Registrations,
                as: 'registration',
                where: { year_id },
                attributes: [],
                required: true,
            }],
            where: { general_average: { [Op.ne]: null }, status: true },
            raw: true,
        });

        // 5. Asistencia: % de 'P' sobre todos los registros con asistencia marcada, en el año
        const attendanceRows = await AcademicRecords.findAll({
            attributes: ['attendance'],
            where: { attendance: { [Op.ne]: null }, status: true },
            include: [{
                model: SchoolDaysBySchedule,
                as: 'school_day_by_schedule',
                required: true,
                attributes: [],
                include: [{
                    model: Schedules,
                    as: 'schedule',
                    required: true,
                    attributes: [],
                    include: [{
                        model: TeacherGroups,
                        as: 'teacher_group',
                        required: true,
                        attributes: [],
                        include: [{
                            model: AcademicStaffContracts,
                            as: 'academic_staff_contract',
                            required: true,
                            attributes: [],
                            where: { year_id },
                        }],
                    }],
                }],
            }],
            raw: true,
        });

        const totalAttendanceRecords = attendanceRows.length;
        const presentCount = attendanceRows.filter((r) => r.attendance === 'P').length;
        const attendanceRate = totalAttendanceRecords > 0
            ? Number(((presentCount / totalAttendanceRecords) * 100).toFixed(1))
            : null;

        return res.status(200).json({
            data: {
                total_students: totalRegistrations,
                total_teachers: totalTeachers,
                total_registrations: totalRegistrations,
                attendance_rate: attendanceRate,
                general_average: generalAverageResult?.avg
                    ? Number(Number(generalAverageResult.avg).toFixed(2))
                    : null,
                by_grade_section: byGradeSection,
            },
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

/*
exports.getAdminGroupsSummary = async (req, res) => {
    try {
        const { year_id } = req.query;

        if (!year_id) {
            return res.status(400).json({ message: 'Debe especificar el año.' });
        }

        // 1. TODOS los grupos docentes del año (curriculum completo, tengan o no cálculos)
        const teacherGroups = await TeacherGroups.findAll({
            where: { status: true },
            include: [
                { model: Courses, as: 'course', attributes: ['course'] },
                { model: Grades, as: 'grade', attributes: ['grade'] },
                { model: Sections, as: 'section', attributes: ['section'] },
                {
                    model: AcademicStaffContracts,
                    as: 'academic_staff_contract',
                    where: { year_id },
                    required: true,
                    attributes: [],
                },
            ],
        });

        // 2. Cálculos existentes de bloque, indexados por teacher_group_id
        const blockRows = await TeachingBlockCourseAverageModel.findAll({
            where: {
                status: true,
                teacher_group_id: { [Op.in]: teacherGroups.map((tg) => tg.id) },
            },
            attributes: ['teacher_group_id', 'teaching_block_average', 'attendance_average'],
        });

        const blocksByTeacherGroup = new Map();
        for (const row of blockRows) {
            if (!blocksByTeacherGroup.has(row.teacher_group_id)) {
                blocksByTeacherGroup.set(row.teacher_group_id, { averages: [], attendance: [] });
            }
            const bucket = blocksByTeacherGroup.get(row.teacher_group_id);
            if (row.teaching_block_average !== null) bucket.averages.push(Number(row.teaching_block_average));
            if (row.attendance_average !== null) bucket.attendance.push(Number(row.attendance_average));
        }

        // 3. Promedios generales de estudiantes matriculados ese año
        const generalRows = await GeneralAverageModel.findAll({
            where: { general_average: { [Op.ne]: null }, status: true },
            include: [{
                model: Registrations,
                as: 'registration',
                required: true,
                where: { year_id },
                include: [
                    { model: Grades, as: 'grade', attributes: ['grade'] },
                    { model: Sections, as: 'section', attributes: ['section'] },
                ],
            }],
            attributes: ['general_average'],
        });

        // 4. Armar estructura por grado + sección, arrancando de TODOS los teacher_groups
        const groupsMap = new Map();

        function getGroup(grade, section) {
            const key = `${grade}||${section}`;
            if (!groupsMap.has(key)) {
                groupsMap.set(key, { grade, section, attendanceValues: [], generalValues: [], courses: [] });
            }
            return groupsMap.get(key);
        }

        const avg = (values) => values.length > 0
            ? Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(2))
            : null;

        for (const tg of teacherGroups) {
            const group = getGroup(tg.grade.grade, tg.section.section);
            const bucket = blocksByTeacherGroup.get(tg.id) ?? { averages: [], attendance: [] };

            group.attendanceValues.push(...bucket.attendance);

            group.courses.push({
                course: tg.course.course,
                average: avg(bucket.averages), // null → '-' en el frontend, sin ocultar el curso
            });
        }

        for (const row of generalRows) {
            const reg = row.registration;
            const group = groupsMap.get(`${reg.grade.grade}||${reg.section.section}`);
            if (group) group.generalValues.push(Number(row.general_average));
        }

        const data = [...groupsMap.values()]
            .map((group) => ({
                grade: group.grade,
                section: group.section,
                attendance_average: avg(group.attendanceValues),
                general_average: avg(group.generalValues),
                courses: group.courses.sort((a, b) => a.course.localeCompare(b.course)),
            }))
            .sort((a, b) => a.grade.localeCompare(b.grade) || a.section.localeCompare(b.section));

        return res.status(200).json({ data });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

*/

const BLOCK_ORDER = ['1° Bimestre', '2° Bimestre', '3° Bimestre', '4° Bimestre'];

exports.getAdminGroupsSummary = async (req, res) => {
    try {
        const { year_id } = req.query;

        if (!year_id) {
            return res.status(400).json({ message: 'Debe especificar el año.' });
        }

        // 1. TODOS los grupos docentes del año
        const teacherGroups = await TeacherGroups.findAll({
            where: { status: true },
            include: [
                { model: Courses, as: 'course', attributes: ['course'] },
                { model: Grades, as: 'grade', attributes: ['grade'] },
                { model: Sections, as: 'section', attributes: ['section'] },
                {
                    model: AcademicStaffContracts,
                    as: 'academic_staff_contract',
                    where: { year_id },
                    required: true,
                    attributes: [],
                },
            ],
        });

        const teacherGroupIds = teacherGroups.map((tg) => tg.id);

        // 2. Promedios de bloque, CON el nombre del bloque, para desglosar por bimestre
        const blockRows = await TeachingBlockCourseAverageModel.findAll({
            where: { status: true, teacher_group_id: { [Op.in]: teacherGroupIds } },
            include: [{ model: TeachingBlocks, as: 'teaching_block', attributes: ['teaching_block'] }],
            attributes: ['teacher_group_id', 'teaching_block_average', 'attendance_average'],
        });

        // 3. Promedios de curso YA calculados (tabla course_average — mismo dato que ve el docente)
        const courseAverageRows = await CourseAverageModel.findAll({
            where: {
                status: true,
                teacher_group_id: { [Op.in]: teacherGroupIds },
                overall_course_average: { [Op.ne]: null },
            },
            attributes: ['teacher_group_id', 'overall_course_average'],
        });

        // 4. Promedios generales de estudiantes matriculados ese año
        const generalRows = await GeneralAverageModel.findAll({
            where: { general_average: { [Op.ne]: null }, status: true },
            include: [{
                model: Registrations,
                as: 'registration',
                required: true,
                where: { year_id },
                include: [
                    { model: Grades, as: 'grade', attributes: ['grade'] },
                    { model: Sections, as: 'section', attributes: ['section'] },
                ],
            }],
            attributes: ['general_average'],
        });

        const avg = (values) => values.length > 0
            ? Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(2))
            : null;

        // 5. Indexar bloques y asistencia por teacher_group_id + nombre de bloque
        const blocksByTeacherGroup = new Map(); // tg_id -> Map(block_name -> values[])
        const attendanceByTeacherGroup = new Map(); // tg_id -> values[]

        for (const row of blockRows) {
            if (!blocksByTeacherGroup.has(row.teacher_group_id)) {
                blocksByTeacherGroup.set(row.teacher_group_id, new Map());
            }
            if (!attendanceByTeacherGroup.has(row.teacher_group_id)) {
                attendanceByTeacherGroup.set(row.teacher_group_id, []);
            }

            if (row.teaching_block_average !== null) {
                const blockName = row.teaching_block.teaching_block;
                const blocksMap = blocksByTeacherGroup.get(row.teacher_group_id);
                if (!blocksMap.has(blockName)) blocksMap.set(blockName, []);
                blocksMap.get(blockName).push(Number(row.teaching_block_average));
            }

            if (row.attendance_average !== null) {
                attendanceByTeacherGroup.get(row.teacher_group_id).push(Number(row.attendance_average));
            }
        }

        // 6. Indexar promedio de curso por teacher_group_id
        const courseAveragesByTeacherGroup = new Map();
        for (const row of courseAverageRows) {
            if (!courseAveragesByTeacherGroup.has(row.teacher_group_id)) {
                courseAveragesByTeacherGroup.set(row.teacher_group_id, []);
            }
            courseAveragesByTeacherGroup.get(row.teacher_group_id).push(Number(row.overall_course_average));
        }

        // 7. Armar por grado + sección
        const groupsMap = new Map();

        function getGroup(grade, section) {
            const key = `${grade}||${section}`;
            if (!groupsMap.has(key)) {
                groupsMap.set(key, { grade, section, attendanceValues: [], generalValues: [], courses: [] });
            }
            return groupsMap.get(key);
        }

        for (const tg of teacherGroups) {
            const group = getGroup(tg.grade.grade, tg.section.section);

            const blocksMap = blocksByTeacherGroup.get(tg.id) ?? new Map();
            const attendanceValues = attendanceByTeacherGroup.get(tg.id) ?? [];
            const courseAverageValues = courseAveragesByTeacherGroup.get(tg.id) ?? [];

            group.attendanceValues.push(...attendanceValues);

            const blocks = BLOCK_ORDER.map((label) => ({
                teaching_block: label,
                average: avg(blocksMap.get(label) ?? []),
            }));

            group.courses.push({
                course: tg.course.course,
                average: avg(courseAverageValues),
                attendance_average: avg(attendanceValues),
                blocks,
            });
        }

        for (const row of generalRows) {
            const reg = row.registration;
            const group = groupsMap.get(`${reg.grade.grade}||${reg.section.section}`);
            if (group) group.generalValues.push(Number(row.general_average));
        }

        const data = [...groupsMap.values()]
            .map((group) => ({
                grade: group.grade,
                section: group.section,
                attendance_average: avg(group.attendanceValues),
                general_average: avg(group.generalValues),
                courses: group.courses.sort((a, b) => a.course.localeCompare(b.course)),
            }))
            .sort((a, b) => a.grade.localeCompare(b.grade) || a.section.localeCompare(b.section));

        return res.status(200).json({ data });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

function averageOf(values) {
    return values.length > 0
        ? Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(2))
        : null;
}

function buildBlockBreakdown(blockRows) {
    // Retorna Map(teacher_group_id -> { blocksMap: Map(nombre_bloque -> valores[]), attendance: valores[] })
    const byGroup = new Map();

    for (const row of blockRows) {
        if (!byGroup.has(row.teacher_group_id)) {
            byGroup.set(row.teacher_group_id, { blocksMap: new Map(), attendance: [] });
        }
        const bucket = byGroup.get(row.teacher_group_id);

        if (row.teaching_block_average !== null) {
            const name = row.teaching_block.teaching_block;
            if (!bucket.blocksMap.has(name)) bucket.blocksMap.set(name, []);
            bucket.blocksMap.get(name).push(Number(row.teaching_block_average));
        }

        if (row.attendance_average !== null) {
            bucket.attendance.push(Number(row.attendance_average));
        }
    }

    return byGroup;
}

function toBlocksArray(blocksMap) {
    return BLOCK_ORDER.map((label) => ({
        teaching_block: label,
        average: averageOf(blocksMap.get(label) ?? []),
    }));
}

exports.getTeacherSummary = async (req, res) => {
    try {
        const { academic_staff_contract_id } = req.query;

        if (!academic_staff_contract_id) {
            return res.status(400).json({ message: 'Debe especificar el contrato.' });
        }

        const contract = await AcademicStaffContracts.findByPk(academic_staff_contract_id);

        if (!contract) {
            return res.status(404).json({ message: 'Contrato no encontrado.' });
        }

        const yearId = contract.year_id;

        // 1. Los grupos que el docente dicta (normalmente uno o pocos cursos, en distintos grados/secciones)
        const myGroups = await TeacherGroups.findAll({
            where: { academic_staff_contract_id, status: true },
            include: [
                { model: Courses, as: 'course', attributes: ['course'] },
                { model: Grades, as: 'grade', attributes: ['grade'] },
                { model: Sections, as: 'section', attributes: ['section'] },
            ],
        });

        const myGroupIds = myGroups.map((g) => g.id);

        const myBlockRows = await TeachingBlockCourseAverageModel.findAll({
            where: { status: true, teacher_group_id: { [Op.in]: myGroupIds } },
            include: [{ model: TeachingBlocks, as: 'teaching_block', attributes: ['teaching_block'] }],
            attributes: ['teacher_group_id', 'teaching_block_average', 'attendance_average'],
        });

        const myBreakdown = buildBlockBreakdown(myBlockRows);

        const courses = myGroups.map((tg) => {
            const bucket = myBreakdown.get(tg.id) ?? { blocksMap: new Map(), attendance: [] };

            return {
                teacher_group_id: tg.id,
                course: tg.course.course,
                grade: tg.grade.grade,
                section: tg.section.section,
                tutor: !!tg.tutor,
                blocks: toBlocksArray(bucket.blocksMap),
                attendance_average: averageOf(bucket.attendance),
            };
        });

        // 2. Si es tutor de algún grupo, agregar el resumen COMPLETO de esa sección
        //    (todos los cursos, no solo el propio)
        const tutorGroup = myGroups.find((tg) => tg.tutor);
        let tutorSectionSummary = null;

        if (tutorGroup) {
            const sectionGroups = await TeacherGroups.findAll({
                where: { grade_id: tutorGroup.grade_id, section_id: tutorGroup.section_id, status: true },
                include: [
                    { model: Courses, as: 'course', attributes: ['course'] },
                    {
                        model: AcademicStaffContracts,
                        as: 'academic_staff_contract',
                        where: { year_id: yearId },
                        required: true,
                        attributes: [],
                    },
                ],
            });

            const sectionGroupIds = sectionGroups.map((g) => g.id);

            const sectionBlockRows = await TeachingBlockCourseAverageModel.findAll({
                where: { status: true, teacher_group_id: { [Op.in]: sectionGroupIds } },
                include: [{ model: TeachingBlocks, as: 'teaching_block', attributes: ['teaching_block'] }],
                attributes: ['teacher_group_id', 'teaching_block_average', 'attendance_average'],
            });

            const sectionBreakdown = buildBlockBreakdown(sectionBlockRows);

            const sectionCourses = sectionGroups.map((sg) => {
                const bucket = sectionBreakdown.get(sg.id) ?? { blocksMap: new Map(), attendance: [] };
                return {
                    course: sg.course.course,
                    blocks: toBlocksArray(bucket.blocksMap),
                    attendance_average: averageOf(bucket.attendance),
                };
            });

            const allSectionAttendance = sectionBlockRows
                .map((r) => r.attendance_average)
                .filter((v) => v !== null)
                .map(Number);

            const sectionGeneralRows = await GeneralAverageModel.findAll({
                where: { general_average: { [Op.ne]: null }, status: true },
                include: [{
                    model: Registrations,
                    as: 'registration',
                    required: true,
                    where: { year_id: yearId, grade_id: tutorGroup.grade_id, section_id: tutorGroup.section_id },
                    attributes: [],
                }],
                attributes: ['general_average'],
            });

            tutorSectionSummary = {
                grade: tutorGroup.grade.grade,
                section: tutorGroup.section.section,
                attendance_average: averageOf(allSectionAttendance),
                general_average: averageOf(sectionGeneralRows.map((r) => Number(r.general_average))),
                courses: sectionCourses,
            };
        }

        return res.status(200).json({
            data: { courses, tutor_section_summary: tutorSectionSummary },
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

async function verifyRegistrationBelongsToParent(userId, registrationId) {
    const user = await Users.findByPk(userId);
    if (!user) return false;

    const parent = await Parents.findOne({
        where: { personal_information_id: user.personal_information_id, status: true },
    });
    if (!parent) return false;

    const registration = await Registrations.findOne({
        where: { id: registrationId, parent_id: parent.id, status: true },
    });

    return !!registration;
}

exports.getParentSummary = async (req, res) => {
    try {
        const { registration_id } = req.query;

        if (!registration_id) {
            return res.status(400).json({ message: 'Debe especificar la matrícula.' });
        }

        const belongsToParent = await verifyRegistrationBelongsToParent(req.user.sub, registration_id);

        if (!belongsToParent) {
            return res.status(403).json({ message: 'No tienes permisos para ver esta información.' });
        }

        const registration = await Registrations.findByPk(registration_id, {
            include: [
                { model: Grades, as: 'grade', attributes: ['grade'] },
                { model: Sections, as: 'section', attributes: ['section'] },
            ],
        });

        if (!registration) {
            return res.status(404).json({ message: 'Matrícula no encontrada.' });
        }

        const { year_id, grade_id, section_id } = registration;

        // 1. Todos los cursos de esa sección, ese año (esto sí sigue siendo por sección — es el catálogo de cursos)
        const sectionGroups = await TeacherGroups.findAll({
            where: { grade_id, section_id, status: true },
            include: [
                { model: Courses, as: 'course', attributes: ['course'] },
                {
                    model: AcademicStaffContracts,
                    as: 'academic_staff_contract',
                    where: { year_id },
                    required: true,
                    attributes: [],
                },
            ],
        });

        const sectionGroupIds = sectionGroups.map((g) => g.id);

        // 2. Promedios de bloque del ESTUDIANTE (no de toda la sección) — CAMBIO: agregado registration_id
        const studentBlockRows = await TeachingBlockCourseAverageModel.findAll({
            where: {
                status: true,
                registration_id, // CLAVE: filtra solo los bloques de este estudiante
                teacher_group_id: { [Op.in]: sectionGroupIds },
            },
            include: [{ model: TeachingBlocks, as: 'teaching_block', attributes: ['teaching_block'] }],
            attributes: ['teacher_group_id', 'teaching_block_average', 'attendance_average'],
        });

        const studentBreakdown = buildBlockBreakdown(studentBlockRows); // ahora ya está filtrado por estudiante

        const sectionCourses = sectionGroups.map((sg) => {
            const bucket = studentBreakdown.get(sg.id) ?? { blocksMap: new Map(), attendance: [] };
            return {
                course: sg.course.course,
                blocks: toBlocksArray(bucket.blocksMap),
                attendance_average: averageOf(bucket.attendance), // asistencia del ESTUDIANTE en ese curso
            };
        });

        // 3. Asistencia y promedio general de TODA LA SECCIÓN (contexto grupal — se mantiene igual, sin filtrar por estudiante)
        const sectionBlockRows = await TeachingBlockCourseAverageModel.findAll({
            where: { status: true, teacher_group_id: { [Op.in]: sectionGroupIds } },
            attributes: ['attendance_average'],
        });

        const allSectionAttendance = sectionBlockRows
            .map((r) => r.attendance_average)
            .filter((v) => v !== null)
            .map(Number);

        const sectionGeneralRows = await GeneralAverageModel.findAll({
            where: { general_average: { [Op.ne]: null }, status: true },
            include: [{
                model: Registrations,
                as: 'registration',
                required: true,
                where: { year_id, grade_id, section_id },
                attributes: [],
            }],
            attributes: ['general_average'],
        });

        // 4. Promedio general del hijo específico
        const studentGeneralAverage = await GeneralAverageModel.findOne({
            where: { registration_id, status: true },
            attributes: ['general_average'],
        });

        return res.status(200).json({
            data: {
                grade: registration.grade.grade,
                section: registration.section.section,
                student_general_average: studentGeneralAverage?.general_average ?? null,
                section_attendance_average: averageOf(allSectionAttendance),
                section_general_average: averageOf(sectionGeneralRows.map((r) => Number(r.general_average))),
                courses: sectionCourses,
            },
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};