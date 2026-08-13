const db = require('../../index/index.models');

const AnnouncementsQuery = (where = {}, order = []) => ({
    where,
    order,
    include: [
        {
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
        },
        {
            model: db.TeacherGroups,
            as: 'teacher_group',
            include: [
                {
                    model: db.AcademicStaffContracts,
                    as: 'academic_staff_contract',
                    include: [
                        {
                            model: db.AcademicStaff,
                            as: 'academic_staff',
                            include: {
                                model: db.PersonalInformation,
                                as: 'personal_information'
                            }
                        },
                        {
                            model: db.Years,
                            as: 'year'
                        }
                    ]
                },
                {
                    model: db.Courses,
                    as: 'course'
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
        },
    ]
});

module.exports = AnnouncementsQuery;