const TeacherGroups = require("../modules/academic_record/teacher_groups/teacher_groups.model");
const Courses = require("../modules/courses/courses.model");
const Grades = require("../modules/grades/grades.model");
const Sections = require("../modules/sections/sections.model");
const Years = require("../modules/temporality/years.model");
const Parents = require("../modules/users/parents.model");
const PersonalInformation = require("../modules/users/personal_information.model");
const Registrations = require("../modules/users/registrations.model");
const Students = require("../modules/users/students.model");
const AcademicStaff = require('../modules/users/academic_staff.model');
const AcademicStaffContracts = require('../modules/users/academic_staff_contracts.model');


module.exports = {
    TeacherGroups,
    Courses,
    Grades,
    Sections,
    Years,
    Parents,
    PersonalInformation,
    Registrations,
    Students,
    AcademicStaff,
    AcademicStaffContracts
}