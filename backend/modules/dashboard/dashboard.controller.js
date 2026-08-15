const { Op, fn, col } = require('sequelize');
const Registrations = require('../users/registrations.model');
const AcademicStaffContracts = require('../users/academic_staff_contracts.model');
const AcademicStaff = require('../users/academic_staff.model');
const Grades = require('../grades/grades.model');
const Sections = require('../sections/sections.model');
const GeneralAverageModel = require('../academic_record/general_average/general_average.model');
const AcademicRecords = require('../academic_record/academic_records/academic_record.model');
const SchoolDaysBySchedule = require('../academic_record/school_days_by_schedule/school_days_by_schedule.model');
const Schedules = require('../academic_record/schedules/schedules.model');
const TeacherGroups = require('../academic_record/teacher_groups/teacher_groups.model');

exports.getAdminSummary = async (req, res) => {
    try {
        const { year_id } = req.query;

        if (!year_id) {
            return res.status(400).json({ message: 'Debe especificar el año.' });
        }

        // 1. Matriculados en el año (1 registro = 1 alumno matriculado ese año)
        const totalRegistrations = await Registrations.count({
            where: { year_id, status: true },
        });

        // 2. Docentes con contrato activo en ese año
        const totalTeachers = await AcademicStaffContracts.count({
            where: { year_id, status: true },
            include: [{
                model: AcademicStaff,
                as: 'academic_staff',
                where: { staff_type: 'Docente' },
                required: true,
            }],
        });

        // 3. Matriculados por grado y sección
        const byGradeSectionRaw = await Registrations.findAll({
            where: { year_id, status: true },
            attributes: [
                'grade_id',
                'section_id',
                [fn('COUNT', col('Registrations.id')), 'count'],
            ],
            include: [
                { model: Grades, as: 'grade', attributes: ['grade'] },
                { model: Sections, as: 'section', attributes: ['section'] },
            ],
            group: ['grade_id', 'section_id', 'grade.id', 'section.id'],
            raw: true,
        });

        const byGradeSection = byGradeSectionRaw.map((row) => ({
            grade: row['grade.grade'],
            section: row['section.section'],
            count: Number(row.count),
        }));

        // 4. Promedio general del año (promedio de los general_average ya calculados)
        const generalAverageResult = await GeneralAverageModel.findOne({
            attributes: [[fn('AVG', col('general_average')), 'avg']],
            include: [{
                model: Registrations,
                as: 'registration',
                where: { year_id },
                attributes: [],
                required: true,
            }],
            where: { general_average: { [Op.ne]: null }, status: true },
            raw: true,
        });

        // 5. Asistencia: % de 'P' sobre todos los registros con asistencia marcada, en el año
        const attendanceRows = await AcademicRecords.findAll({
            attributes: ['attendance'],
            where: { attendance: { [Op.ne]: null }, status: true },
            include: [{
                model: SchoolDaysBySchedule,
                as: 'school_day_by_schedule',
                required: true,
                attributes: [],
                include: [{
                    model: Schedules,
                    as: 'schedule',
                    required: true,
                    attributes: [],
                    include: [{
                        model: TeacherGroups,
                        as: 'teacher_group',
                        required: true,
                        attributes: [],
                        include: [{
                            model: AcademicStaffContracts,
                            as: 'academic_staff_contract',
                            required: true,
                            attributes: [],
                            where: { year_id },
                        }],
                    }],
                }],
            }],
            raw: true,
        });

        const totalAttendanceRecords = attendanceRows.length;
        const presentCount = attendanceRows.filter((r) => r.attendance === 'P').length;
        const attendanceRate = totalAttendanceRecords > 0
            ? Number(((presentCount / totalAttendanceRecords) * 100).toFixed(1))
            : null;

        return res.status(200).json({
            data: {
                total_students: totalRegistrations,
                total_teachers: totalTeachers,
                total_registrations: totalRegistrations,
                attendance_rate: attendanceRate,
                general_average: generalAverageResult?.avg
                    ? Number(Number(generalAverageResult.avg).toFixed(2))
                    : null,
                by_grade_section: byGradeSection,
            },
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};