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



const AcademicStaff = require('../../users/academic_staff.model');
const PersonalInformation = require('../../users/personal_information.model');
const Years = require('../../temporality/years.model');

const Registrations = require('../../users/registrations.model');
const Students = require('../../users/students.model');

exports.getTutorGroupReport = async (req, res) => {
    try {
        const { year_id, grade_id, section_id } = req.query;

        if (!year_id || !grade_id || !section_id) {
            return res.status(400).json({
                message: 'Debe especificar año, grado y sección.'
            });
        }

        /*
         * ---------------------------------------------------------
         * 1. OBTENER EL GRUPO DE DOCENTE QUE ES TUTOR
         * ---------------------------------------------------------
         */

        const teacherGroup = await TeacherGroups.findOne({
            where: {
                grade_id,
                section_id,
                tutor: true,
                status: true
            },

            include: [
                {
                    model: AcademicStaffContracts,
                    as: 'academic_staff_contract',

                    where: {
                        year_id,
                        status: true
                    },

                    include: [
                        {
                            model: AcademicStaff,
                            as: 'academic_staff',

                            where: {
                                status: true
                            },

                            include: [
                                {
                                    model: PersonalInformation,
                                    as: 'personal_information'
                                }
                            ]
                        },
                        {
                            model: Years,
                            as: 'year'
                        }
                    ]
                },

                {
                    model: Courses,
                    as: 'course'
                },

                {
                    model: Grades,
                    as: 'grade'
                },

                {
                    model: Sections,
                    as: 'section'
                }
            ]
        });

        if (!teacherGroup) {
            return res.status(404).json({
                message: 'No se encontró un docente tutor para el grupo especificado.'
            });
        }

        /*
         * ---------------------------------------------------------
         * 2. OBTENER LAS MATRÍCULAS DEL GRUPO
         * ---------------------------------------------------------
         */

        const registrations = await Registrations.findAll({
            where: {
                year_id,
                grade_id,
                section_id,
                status: true
            }
        });

        /*
         * ---------------------------------------------------------
         * 3. OBTENER LOS ESTUDIANTES
         * ---------------------------------------------------------
         */

        const studentIds = [
            ...new Set(
                registrations.map(registration => registration.student_id)
            )
        ];

        const students = studentIds.length
            ? await Students.findAll({
                where: {
                    id: studentIds,
                    status: true
                }
            })
            : [];

        /*
         * ---------------------------------------------------------
         * 4. OBTENER INFORMACIÓN PERSONAL
         * ---------------------------------------------------------
         */

        const personalInformationIds = [
            ...new Set(
                students.map(student => student.personal_information_id)
            )
        ];

        const personalInformation = personalInformationIds.length
            ? await PersonalInformation.findAll({
                where: {
                    id: personalInformationIds
                }
            })
            : [];

        /*
         * ---------------------------------------------------------
         * 5. MAPAS PARA RELACIONAR LOS DATOS
         * ---------------------------------------------------------
         */

        const studentsById = new Map(
            students.map(student => [
                student.id,
                student
            ])
        );

        const personalInformationById = new Map(
            personalInformation.map(person => [
                person.id,
                person
            ])
        );

        /*
         * ---------------------------------------------------------
         * 6. ARMAR LISTA DE ESTUDIANTES
         * ---------------------------------------------------------
         */

        const studentData = registrations
            .map(registration => {
                const student = studentsById.get(
                    registration.student_id
                );

                if (!student) {
                    return null;
                }

                const person = personalInformationById.get(
                    student.personal_information_id
                );

                if (!person) {
                    return null;
                }

                return {
                    registration_id: registration.id,

                    student_id: student.id,

                    names: person.names,

                    fathers_surname: person.fathers_surname,

                    mothers_surname: person.mothers_surname,

                    dni: person.dni,

                    email: person.email,

                    phone_number: person.phone_number,

                    status: student.status
                };
            })
            .filter(Boolean)
            .sort((a, b) =>
                a.fathers_surname.localeCompare(
                    b.fathers_surname,
                    'es'
                )
            );

        /*
         * ---------------------------------------------------------
         * 7. RESPUESTA FINAL
         * ---------------------------------------------------------
         *
         * Aquí dejamos TODO el resultado en una sola variable.
         * Más adelante podremos agregar:
         *
         * - academic_records
         * - teaching_block_course_average
         * - course_average
         * - general_average
         * - asistencia
         * - etc.
         *
         * sin modificar la estructura principal del reporte.
         */

        const data = {
            teacher_group: teacherGroup,
            students: studentData
        };

        return res.status(200).json({
            length: studentData.length,
            data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo más tarde.'
        });
    }
};

exports.getTutorBySection = async (req, res) => {
    try {
        const { year_id, grade_id, section_id } = req.query;

        if (!year_id || !grade_id || !section_id) {
            return res.status(400).json({ message: 'Debe especificar año, grado y sección.' });
        }

        const tutorGroup = await TeacherGroups.findOne({
            where: { grade_id, section_id, tutor: true, status: true },
            include: [
                {
                    model: AcademicStaffContracts,
                    as: 'academic_staff_contract',
                    where: { year_id },
                    required: true,
                    include: {
                        model: AcademicStaff,
                        as: 'academic_staff',
                        include: { model: PersonalInformation, as: 'personal_information' },
                    },
                },
            ],
        });

        if (!tutorGroup) {
            return res.status(200).json({ data: null });
        }

        const person = tutorGroup.academic_staff_contract.academic_staff.personal_information;

        return res.status(200).json({
            data: {
                names: person.names,
                fathers_surname: person.fathers_surname,
                mothers_surname: person.mothers_surname,
            },
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};