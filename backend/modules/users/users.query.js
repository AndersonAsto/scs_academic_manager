const PersonalInformation = require("./personal_information.model");

const usersQuery = (where = {}, order = []) => ({
    where,
    include: {
        model: PersonalInformation,
        as: 'personal_information'
    },
    attributes: ['id','personal_information_id','username','role','description','status','createdAt', 'createdAt'],
    order
});

module.exports = usersQuery;