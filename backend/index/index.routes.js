const AuthRoutes = require('../modules/auth/auth.routes');

const CoursesRoutes = require('../modules/courses/courses.routes');
const GradesRoutes = require('../modules/grades/grades.routes');
const SectionsRoutes = require('../modules/sections/sections.routes');
const TimeSlotsRoutes = require('../modules/time_slots/time_slots.routes');
const YearsRoutes = require('../modules/temporality/years.routes');
const TeachingBlocksRoutes = require('../modules/temporality/teachingBlocks.routes');
const SchoolDaysRoutes = require('../modules/temporality/schoolDays.routes');
const AcademicStaffRoutes = require('../modules/users/academic_staff.routes');
const PersonalInformationRoutes = require('../modules/users/personal_information.routes');
const AcademicStaffContractsRoutes = require('../modules/users/academic_staff_contracts.routes');
const UsersRoutes = require('../modules/users/users.routes');
const RegistrationsRoutes = require('../modules/users/registrations.routes');
const ParentsRoutes = require('../modules/users/parents.routes');
const StduentsRoutes = require('../modules/users/students.routes');
const WeightingsRoutes = require('../modules/academic_record/weightings/weightings.routes');
const TeacherGroupsRoutes = require('../modules/academic_record/teacher_groups/teacher_groups.routes');
const SchedulesRoutes = require('../modules/academic_record/schedules/schedules.routes');
const SchoolDaysBySchedule = require('../modules/academic_record/school_days_by_schedule/school_days_by_schedule.routes');
const AcademicRecordsRoutes = require('../modules/academic_record/academic_records/academic_record.routes');
const TeachingBlockCourseAverageRoutes = require('../modules/academic_record/teaching_block_course_average/teaching_block_course_average.routes');
const CourseAverageRoutes = require('../modules/academic_record/course_average/course_average.routes');
const GeneralAverageRoutes = require('../modules/academic_record/general_average/general_average.routes');
const AnnouncementsRoutes = require('../modules/announcements/announcements.routes');
const DashboardRoutes = require('../modules/dashboard/dashboard.routes');

module.exports = {
    CoursesRoutes,
    GradesRoutes,
    SectionsRoutes,
    TimeSlotsRoutes,
    YearsRoutes,
    TeachingBlocksRoutes,
    SchoolDaysRoutes,
    AcademicStaffRoutes,
    PersonalInformationRoutes,
    AcademicStaffContractsRoutes,
    UsersRoutes,
    RegistrationsRoutes,
    ParentsRoutes,
    StduentsRoutes,
    WeightingsRoutes,
    TeacherGroupsRoutes,
    SchedulesRoutes,
    SchoolDaysBySchedule,
    AcademicRecordsRoutes,
    TeachingBlockCourseAverageRoutes,
    CourseAverageRoutes,
    GeneralAverageRoutes,
    AuthRoutes,
    AnnouncementsRoutes,
    DashboardRoutes
}