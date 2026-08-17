const express = require('express');
const router = express.Router();
const academicRecordsController = require('./academic_record.controller');
const { verifyAccessToken, requireRole } = require('../../auth/auth.middleware');

router.use(verifyAccessToken);
router.get('/academic-records/by-student-group', academicRecordsController.getAcademicRecordsByStudentGroup);
router.post('/academic-records/create', academicRecordsController.createAcademicRecords);
router.get('/academic-records/list', academicRecordsController.getAcademicRecords);

router.get(
    '/academic-records/student-report/excel',
    requireRole('Administrador', 'Docente', 'Apoderado'),
    academicRecordsController.downloadStudentDetailedReportExcel
);

module.exports = router;