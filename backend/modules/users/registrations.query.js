const Grades = require("../grades/grades.model");
const Sections = require("../sections/sections.model");
const Years = require("../temporality/years.model");
const Parents = require("./parents.model");
const PersonalInformation = require("./personal_information.model");
const Students = require("./students.model");

const registrationsQuery = (where = {}, order = []) => ({
    where,
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
    ],
    order
});

module.exports = registrationsQuery;