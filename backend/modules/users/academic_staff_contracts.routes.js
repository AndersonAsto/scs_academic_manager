const express = require('express');
const router = express.Router();
const academicStaffContractsController = require('./academic_staff_contracts.controller');
const { verifyAccessToken, requireRole } = require('../auth/auth.middleware');

router.use(verifyAccessToken);

router.get('/academic-staff-contracts/mine', requireRole('Docente', 'Administrador'), academicStaffContractsController.getMyContracts);

router.get('/academic-staff-contracts/list', academicStaffContractsController.getAcademicStaffContracts);
router.put('/academic-staff-contracts/update/:id', academicStaffContractsController.updateAcademicStaffContract);
router.delete('/academic-staff-contracts/delete/:id/:del', academicStaffContractsController.deleteAcademicStaffContract);

module.exports = router;