const PersonalInformation = require('./personal_information.model');

const studentsQuery = (where = {}, order = []) => ({
    where,
    include: {
        model: PersonalInformation,
        as: 'personal_information'
    },
    order
});

module.exports = studentsQuery;