const express = require('express');
const router = express.Router();
const academicRecordsController = require('./academic_record.controller');

router.get('/academic-records/by-student-group', academicRecordsController.getAcademicRecordsByStudentGroup);
router.post('/academic-records/create', academicRecordsController.createAcademicRecords);
router.get('/academic-records/list', academicRecordsController.getAcademicRecords);

module.exports = router;