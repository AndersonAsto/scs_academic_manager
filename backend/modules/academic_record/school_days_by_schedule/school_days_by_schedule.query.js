const Schedules = require('../schedules/schedules.model');
const TeacherGroups = require('../teacher_groups/teacher_groups.model');
const TimeSlots = require('../../time_slots/time_slots.model');
const AcademicStaffContracts = require('../../users/academic_staff_contracts.model');
const Courses = require('../../courses/courses.model');
const Grades = require('../../grades/grades.model');
const Sections = require('../../sections/sections.model');
const Years = require('../../temporality/years.model');
const AcademicStaff = require('../../users/academic_staff.model');
const PersonalInformation = require('../../users/personal_information.model');
const SchoolDays = require('../../temporality/schoolDays.model');
const TeachingBlocks = require('../../temporality/teachingBlocks.model');

const schoolDaysByScheduleQuery = (where = {}, order = []) => ({
    where,
    include: [
        {
            model: Schedules,
            as: 'schedule',
            include: [
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
                {
                    model: TimeSlots,
                    as: 'time_slot'
                }
            ]
        },
        {
            model: SchoolDays,
            as: 'school_day',
            include: {
                model: TeachingBlocks,
                as: 'teaching_block',
                include: {
                    model: Years,
                    as: 'year',
                    attributes: ['id', 'year', 'status'],
                    order: [['year', 'ASC']]
                },
                attributes: ['id', 'year_id', 'teaching_block', 'start_day', 'end_day', 'status']
            },
        }
    ],
    order
});

module.exports = schoolDaysByScheduleQuery;