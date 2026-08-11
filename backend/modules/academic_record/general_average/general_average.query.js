const db = require('../../../index/index.models');

const GeneralAverageQuery = (where = {}, order = []) => ({
    where,
    order,
    include: {
        model: db.Registrations,
        as: 'registration',
        include: [
            {
                model: db.Years,
                as: 'year'
            },
            {
                model: db.Students,
                as: 'student',
                include: {
                    model: db.PersonalInformation,
                    as: 'personal_information'
                }
            },
            {
                model: db.Parents,
                as: 'parent',
                include: {
                    model: db.PersonalInformation,
                    as: 'personal_information'
                }
            },
            {
                model: db.Grades,
                as: 'grade'
            },
            {
                model: db.Sections,
                as: 'section'
            },
        ]
    }
});

module.exports = GeneralAverageQuery;