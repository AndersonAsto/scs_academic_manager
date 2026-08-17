const User = require('../users/users.model');
const PersonalInformation = require('../users/personal_information.model');
const AcademicStaff = require('../users/academic_staff.model');
const Parent = require('../users/parents.model');
const Student = require('../users/students.model');

async function findUserByUsername(username) {
    return User.findOne({ where: { username, status: 1 } });
}

async function findUserById(id) {
    return User.findOne({ where: { id, status: 1 } });
}

async function getPersonalInformation(personalInformationId) {
    return PersonalInformation.findOne({
        where: { id: personalInformationId, status: 1 },
    });
}

async function getAcademicStaffByPersonalInfo(personalInformationId) {
    return AcademicStaff.findOne({
        where: { personal_information_id: personalInformationId, status: 1 },
    });
}

async function getParentByPersonalInfo(personalInformationId) {
    return Parent.findOne({
        where: { personal_information_id: personalInformationId, status: 1 },
    });
}

async function getStudentByPersonalInfo(personalInformationId) {
    return Student.findOne({
        where: { personal_information_id: personalInformationId, status: 1 },
    });
}

module.exports = {
    findUserByUsername,
    findUserById,
    getPersonalInformation,
    getAcademicStaffByPersonalInfo,
    getParentByPersonalInfo,
    getStudentByPersonalInfo,
};