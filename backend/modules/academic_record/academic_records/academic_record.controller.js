const { Op } = require('sequelize');
const sequelize = require('../../../config/db.config');
const AcademicRecordsQuery = require('./academic_record.query');
const AcademicRecordsModel = require('./academic_record.model');
const Registrations = require('../../users/registrations.model');
const SchoolDaysBySchedule = require('../school_days_by_schedule/school_days_by_schedule.model');
const Schedules = require('../schedules/schedules.model');
const TeacherGroups = require('../teacher_groups/teacher_groups.model');
const AcademicStaffContracts = require('../../users/academic_staff_contracts.model');
const AcademicRecords = require('./academic_record.model');
const SchoolDays = require('../../temporality/schoolDays.model');
const TimeSlots = require('../../time_slots/time_slots.model');
const TeachingBlocks = require('../../temporality/teachingBlocks.model');

exports.createAcademicRecords = async (req, res) => {
    const {
        school_day_by_schedule_id,
        records
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        if (!school_day_by_schedule_id) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe especificar el día lectivo del horario.'
            });
        }

        if (!Array.isArray(records) || records.length === 0) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'Debe enviar al menos un registro académico.'
            });
        }

        /*
         * 1. Obtener el día lectivo del horario y comprobar
         *    que tenga toda la relación académica necesaria.
         */
        const schoolDayBySchedule =
            await SchoolDaysBySchedule.findByPk(
                school_day_by_schedule_id,
                {
                    include: [
                        {
                            model: Schedules,
                            as: 'schedule',
                            required: true,
                            include: [
                                {
                                    model: TeacherGroups,
                                    as: 'teacher_group',
                                    required: true,
                                    include: [
                                        {
                                            model: AcademicStaffContracts,
                                            as: 'academic_staff_contract',
                                            required: true
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    transaction
                }
            );

        if (!schoolDayBySchedule) {
            await transaction.rollback();

            return res.status(404).json({
                message: 'Día lectivo del horario no encontrado.'
            });
        }

        const teacherGroup =
            schoolDayBySchedule.schedule.teacher_group;

        const academicStaffContract =
            teacherGroup.academic_staff_contract;

        /*
         * 2. Obtener las matrículas enviadas.
         */
        const registrationIds = [
            ...new Set(
                records.map(record => record.registration_id)
            )
        ];

        const registrations = await Registrations.findAll({
            where: {
                id: {
                    [Op.in]: registrationIds
                },
                status: true
            },
            transaction
        });

        /*
         * 3. Verificar que todas las matrículas existan.
         */
        if (registrations.length !== registrationIds.length) {

            const foundIds = new Set(
                registrations.map(registration => registration.id)
            );

            const missingIds = registrationIds.filter(
                id => !foundIds.has(id)
            );

            await transaction.rollback();

            return res.status(404).json({
                message: 'Una o más matrículas no fueron encontradas.',
                registration_ids: missingIds
            });
        }

        /*
         * 4. Validar que las matrículas correspondan
         *    al mismo año, grado y sección del teacher_group.
         */
        const invalidRegistrations = registrations.filter(
            registration =>
                registration.year_id !== academicStaffContract.year_id ||
                registration.grade_id !== teacherGroup.grade_id ||
                registration.section_id !== teacherGroup.section_id
        );

        if (invalidRegistrations.length > 0) {

            await transaction.rollback();

            return res.status(409).json({
                message:
                    'Una o más matrículas no corresponden al año, grado o sección del horario seleccionado.',
                registration_ids:
                    invalidRegistrations.map(
                        registration => registration.id
                    )
            });
        }

        /*
         * 5. Buscar los registros que ya existen.
         */
        const existingRecords =
            await AcademicRecordsModel.findAll({
                where: {
                    school_day_by_schedule_id,
                    registration_id: {
                        [Op.in]: registrationIds
                    }
                },
                transaction
            });

        const existingMap = new Map(
            existingRecords.map(record => [
                record.registration_id,
                record
            ])
        );

        const recordsToCreate = [];
        const recordsToUpdate = [];

        /*
         * 6. Separar creación y actualización.
         */
        for (const record of records) {

            const existingRecord =
                existingMap.get(record.registration_id);

            const data = {
                attendance:
                    record.attendance ?? null,

                score:
                    record.score ?? null,

                incident:
                    record.incident ?? null,

                description:
                    record.description ?? null,

                status: true
            };

            if (existingRecord) {

                existingRecord.set(data);

                recordsToUpdate.push(existingRecord);

            } else {

                recordsToCreate.push({
                    registration_id:
                        record.registration_id,

                    school_day_by_schedule_id:
                        school_day_by_schedule_id,

                    ...data
                });
            }
        }

        /*
         * 7. Crear los registros nuevos.
         */
        let createdRecords = [];

        if (recordsToCreate.length > 0) {
            createdRecords =
                await AcademicRecordsModel.bulkCreate(
                    recordsToCreate,
                    { transaction }
                );
        }

        /*
         * 8. Actualizar los registros existentes.
         */
        for (const record of recordsToUpdate) {
            await record.save({ transaction });
        }

        /*
         * 9. Confirmar la transacción.
         */
        await transaction.commit();

        return res.status(201).json({
            message: 'Registros académicos guardados correctamente.',
            created: createdRecords.length,
            updated: recordsToUpdate.length,
            total:
                createdRecords.length +
                recordsToUpdate.length
        });

    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.getAcademicRecords = async (req, res) => {
    try {
        const { registration_id, school_day_by_schedule_id } = req.query;
        const whereCondition = {};

        if (registration_id) whereCondition.registration_id = registration_id;
        if (school_day_by_schedule_id) whereCondition.school_day_by_schedule_id = school_day_by_schedule_id;

        const query = AcademicRecordsQuery(
            whereCondition,
            []
        );

        const academicRecords = await AcademicRecordsModel.findAll(query);

        return res.status(200).json({
            message: academicRecords.length === 0 ? 'Aún no hay récords académicos registrado en el sistema.' : null,
            length: academicRecords.length,
            data: academicRecords
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.getAcademicRecordsByStudentGroup = async (req, res) => {
    try {
        const { registration_id, teacher_group_id } = req.query;

        if (!registration_id || !teacher_group_id) {
            return res.status(400).json({ message: 'Debe especificar la matrícula y el grupo docente.' });
        }

        const records = await AcademicRecords.findAll({
            where: { registration_id, status: true },
            include: [
                {
                    model: SchoolDaysBySchedule,
                    as: 'school_day_by_schedule',
                    required: true,
                    include: [
                        {
                            model: Schedules,
                            as: 'schedule',
                            where: { teacher_group_id },
                            required: true,
                            include: [{ model: TimeSlots, as: 'time_slot' }]
                        },
                        {
                            model: SchoolDays,
                            as: 'school_day',
                            include: [{ model: TeachingBlocks, as: 'teaching_block' }]
                        }
                    ]
                }
            ]
        });

        const data = records
            .map((r) => ({
                school_day: r.school_day_by_schedule.school_day.school_day,
                type: r.school_day_by_schedule.type,
                day: r.school_day_by_schedule.school_day.day,
                week_number: r.school_day_by_schedule.school_day.week_number,
                teaching_block: r.school_day_by_schedule.school_day.teaching_block.teaching_block,
                time_slot: r.school_day_by_schedule.schedule.time_slot.time_slot,
                attendance: r.attendance,
                score: r.score,
                incident: r.incident,
            }))
            .sort((a, b) => a.school_day.localeCompare(b.school_day));

        return res.status(200).json({ length: data.length, data });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

const ExcelJS = require('exceljs');
const Courses = require('../../courses/courses.model');
const Grades = require('../../grades/grades.model');
const Sections = require('../../sections/sections.model');
const Years = require('../../temporality/years.model');
const Students = require('../../users/students.model');
const PersonalInformation = require('../../users/personal_information.model');
const AcademicStaff = require('../../users/academic_staff.model');

const INSTITUTION_NAME = 'Institución Educativa N° 22234 Santiago Calle Santos';

/*
 * Arma, por cada curso del grado/sección del estudiante en el año dado,
 * TODOS los días lectivos programados (school_days_by_schedule) cruzados
 * con los registros existentes en academic_records.
 *
 * Si un día no tiene registro (o el score es null), la celda queda vacía.
 */
async function buildStudentDetailedReport(registrationId, yearId) {
    const registration = await Registrations.findByPk(registrationId, {
        include: [
            { model: Years, as: 'year' },
            { model: Grades, as: 'grade' },
            { model: Sections, as: 'section' },
            {
                model: Students,
                as: 'student',
                include: { model: PersonalInformation, as: 'personal_information' },
            },
        ],
    });

    if (!registration) return null;

    // Cursos (teacher_groups) dictados a esa sección, en ese año
    const teacherGroups = await TeacherGroups.findAll({
        where: {
            grade_id: registration.grade_id,
            section_id: registration.section_id,
            status: true,
        },
        include: [
            { model: Courses, as: 'course' },
            {
                model: AcademicStaffContracts,
                as: 'academic_staff_contract',
                where: { year_id: yearId },
                required: true,
                include: {
                    model: AcademicStaff,
                    as: 'academic_staff',
                    include: { model: PersonalInformation, as: 'personal_information' },
                },
            },
        ],
    });

    const courses = [];

    for (const group of teacherGroups) {
        const schedules = await Schedules.findAll({
            where: { teacher_group_id: group.id, status: true },
            include: [{ model: TimeSlots, as: 'time_slot' }],
        });

        const scheduleIds = schedules.map((s) => s.id);
        const scheduleById = new Map(schedules.map((s) => [s.id, s]));

        if (scheduleIds.length === 0) {
            courses.push({
                teacher_group_id: group.id,
                course: group.course.course,
                teacher_names: group.academic_staff_contract.academic_staff.personal_information.names,
                teacher_fathers_surname:
                    group.academic_staff_contract.academic_staff.personal_information.fathers_surname,
                teacher_mothers_surname:
                    group.academic_staff_contract.academic_staff.personal_information.mothers_surname,
                rows: [],
            });
            continue;
        }

        // Todos los días lectivos PROGRAMADOS para este curso, sin importar si tienen registro
        const schoolDaysBySchedule = await SchoolDaysBySchedule.findAll({
            where: { schedule_id: { [Op.in]: scheduleIds }, status: true },
            include: [
                {
                    model: SchoolDays,
                    as: 'school_day',
                    required: true,
                    where: { type: 'Día Lectivo' },
                    include: [
                        {
                            model: TeachingBlocks,
                            as: 'teaching_block',
                            where: { year_id: yearId },
                            required: true,
                        },
                    ],
                },
            ],
        });

        const academicRecords = await AcademicRecords.findAll({
            where: {
                registration_id: registrationId,
                school_day_by_schedule_id: { [Op.in]: schoolDaysBySchedule.map((s) => s.id) },
            },
        });

        const recordsBySchoolDaySchedule = new Map(
            academicRecords.map((r) => [r.school_day_by_schedule_id, r]),
        );

        const rows = schoolDaysBySchedule
            .map((sds) => {
                const schedule = scheduleById.get(sds.schedule_id);
                const record = recordsBySchoolDaySchedule.get(sds.id);

                return {
                    school_day: sds.school_day.school_day,
                    day: sds.school_day.day,
                    week_number: sds.school_day.week_number,
                    teaching_block: sds.school_day.teaching_block.teaching_block,
                    time_slot: schedule?.time_slot?.time_slot ?? null,
                    type: sds.type,
                    attendance: record?.attendance ?? null,
                    score: record?.score ?? null, // null → celda vacía en el excel
                    incident: record?.incident ?? null,
                };
            })
            .sort((a, b) => a.school_day.localeCompare(b.school_day));

        courses.push({
            teacher_group_id: group.id,
            course: group.course.course,
            teacher_names: group.academic_staff_contract.academic_staff.personal_information.names,
            teacher_fathers_surname:
                group.academic_staff_contract.academic_staff.personal_information.fathers_surname,
            teacher_mothers_surname:
                group.academic_staff_contract.academic_staff.personal_information.mothers_surname,
            rows,
        });
    }

    return {
        year: registration.year.year,
        grade: registration.grade.grade,
        section: registration.section.section,
        registration: registration.id,
        student: {
            names: registration.student.personal_information.names,
            fathers_surname: registration.student.personal_information.fathers_surname,
            mothers_surname: registration.student.personal_information.mothers_surname,
        },
        courses,
    };
}

exports.downloadStudentDetailedReportExcel = async (req, res) => {
    try {
        const { registration_id, year_id } = req.query;

        if (!registration_id || !year_id) {
            return res.status(400).json({ message: 'Debe especificar la matrícula y el año.' });
        }

        if (req.user.role === 'Docente') {
            const isTutor = await verifyDocenteIsTutorOfRegistration(req.user.sub, registration_id, year_id);

            if (!isTutor) {
                return res.status(403).json({
                    message: 'No tienes permisos para descargar el reporte de este estudiante.'
                });
            }
        }

        const reportData = await buildStudentDetailedReport(registration_id, year_id);

        if (!reportData) {
            return res.status(404).json({ message: 'Matrícula no encontrada.' });
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = INSTITUTION_NAME;
        workbook.created = new Date();

        const studentFullName = `${reportData.student.fathers_surname} ${reportData.student.mothers_surname}, ${reportData.student.names}`;

        for (const course of reportData.courses) {
            // Excel limita nombres de hoja a 31 caracteres y prohíbe ciertos símbolos
            const safeName = course.course.replace(/[\\/*?:[\]]/g, '').substring(0, 31);
            const sheet = workbook.addWorksheet(safeName || `Curso ${course.teacher_group_id}`);

            sheet.mergeCells('A1:H1');
            sheet.getCell('A1').value = INSTITUTION_NAME;
            sheet.getCell('A1').font = { bold: true, size: 13 };
            sheet.getCell('A1').alignment = { horizontal: 'center' };

            const infoRows = [
                ['Estudiante:', studentFullName],
                ['Curso:', course.course],
                ['Docente:', `${course.teacher_fathers_surname} ${course.teacher_mothers_surname}, ${course.teacher_names}`],
                ['Año:', reportData.year],
                ['Grado y Sección:', `${reportData.grade} ${reportData.section}`],
            ];

            infoRows.forEach(([label, value], i) => {
                const rowNumber = 3 + i;
                sheet.getCell(`A${rowNumber}`).value = label;
                sheet.getCell(`A${rowNumber}`).font = { bold: true };
                sheet.getCell(`B${rowNumber}`).value = value;
            });

            const headerRowNumber = 9;
            const headerRow = sheet.getRow(headerRowNumber);
            headerRow.values = ['Fecha', 'Día', 'Semana', 'Bloque', 'Tipo', 'Asistencia', 'Calificación', 'Incidencia'];
            headerRow.font = { bold: true };
            headerRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
                cell.border = { bottom: { style: 'thin' } };
            });

            course.rows.forEach((row, index) => {
                const excelRow = sheet.getRow(headerRowNumber + 1 + index);
                excelRow.values = [
                    row.school_day,
                    row.day,
                    row.week_number ?? '',
                    row.teaching_block,
                    row.type ?? '',
                    row.attendance ?? '',
                    row.score ?? '', // null → celda vacía
                    row.incident ?? '',
                ];
            });

            sheet.columns = [
                { width: 14 }, { width: 12 }, { width: 10 }, { width: 14 },
                { width: 18 }, { width: 12 }, { width: 14 }, { width: 30 },
            ];
        }

        const fileName = [
            'Reporte_Detallado',
            reportData.registration,
            reportData.student.fathers_surname,
            reportData.student.mothers_surname,
            reportData.year,
            reportData.grade,
            reportData.section,
        ]
            .join('_')
            .replace(/\s+/g, '_')       // espacios → guion bajo (ej. "1° Grado" → "1°_Grado")
            .replace(/[\\/:*?"<>|]/g, '') // caracteres no válidos en nombres de archivo
            + '.xlsx';

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

const Users = require('../../users/users.model');

async function verifyDocenteIsTutorOfRegistration(userId, registrationId, yearId) {
    const registration = await Registrations.findByPk(registrationId);
    if (!registration) return false;

    const user = await Users.findByPk(userId);
    if (!user) return false;

    const academicStaff = await AcademicStaff.findOne({
        where: { personal_information_id: user.personal_information_id, status: true },
    });
    if (!academicStaff) return false;

    const contract = await AcademicStaffContracts.findOne({
        where: { academic_staff_id: academicStaff.id, year_id: yearId, status: true },
    });
    if (!contract) return false;

    const tutorGroup = await TeacherGroups.findOne({
        where: {
            academic_staff_contract_id: contract.id,
            grade_id: registration.grade_id,
            section_id: registration.section_id,
            tutor: true,
            status: true,
        },
    });

    return !!tutorGroup;
}