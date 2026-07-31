const Years = require("../temporality/years.model");
const AcademicStaff = require("./academic_staff.model");
const PersonalInformation = require("./personal_information.model");

const academicStaffContracts = (where = {}, order = [], staffWhere = {}) => {
    const hasStaffWhere = Object.keys(staffWhere).length > 0;

    return {
        where,
        include: [
            {
                model: AcademicStaff,
                as: 'academic_staff',
                where: hasStaffWhere ? staffWhere : undefined,
                required: hasStaffWhere,
                include: {
                    model: PersonalInformation,
                    as: 'personal_information'
                }
            },
            {
                model: Years,
                as: 'year'
            }
        ],
        order
    };
};

module.exports = academicStaffContracts;