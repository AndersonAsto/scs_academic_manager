const express = require('express');
const router = express.Router();
const academicStaffController = require('./academic_staff.controller');

router.post('/academic-staff/create', academicStaffController.createAcademicStaff);
router.get('/academic-staff/list', academicStaffController.getAcademicStaff);
router.put('/academic-staff/update/:id', academicStaffController.updateAcademicStaff);
router.delete('/academic-staff/delete/:id/:del', academicStaffController.deleteAcademicStaff);
router.patch('/academic-staff/restore/:id', academicStaffController.restoreAcademicStaff);

module.exports = router;