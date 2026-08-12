const Courses = require("../../courses/courses.model");
const Grades = require("../../grades/grades.model");
const Sections = require("../../sections/sections.model");
const Years = require("../../temporality/years.model");
const AcademicStaff = require("../../users/academic_staff.model");
const AcademicStaffContracts = require("../../users/academic_staff_contracts.model");
const Parents = require("../../users/parents.model");
const PersonalInformation = require("../../users/personal_information.model");
const Registrations = require("../../users/registrations.model");
const Students = require("../../users/students.model");
const TeacherGroups = require("../teacher_groups/teacher_groups.model");

const CourseAverageQuery = (where = {}, order = []) => ({
    where,
    order,
    include: [
        {
            model: Registrations,
            as: 'registration',
            include: [
                {
                    model: Years,
                    as: 'year'
                },
                {
                    model: Students,
                    as: 'student',
                    include: {
                        model: PersonalInformation,
                        as: 'personal_information'
                    }
                },
                {
                    model: Parents,
                    as: 'parent',
                    include: {
                        model: PersonalInformation,
                        as: 'personal_information'
                    }
                },
                {
                    model: Grades,
                    as: 'grade'
                },
                {
                    model: Sections,
                    as: 'section'
                },
            ]
        },
        {
            model: TeacherGroups,
            as: 'teacher_group',
            include: [
                {
                    model: AcademicStaffContracts,
                    as: 'academic_staff_contract',
                    include: [
                        {
                            model: AcademicStaff,
                            as: 'academic_staff',
                            include: {
                                model: PersonalInformation,
                                as: 'personal_information'
                            }
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
                },
            ]
        },
    ]
});

module.exports = CourseAverageQuery;