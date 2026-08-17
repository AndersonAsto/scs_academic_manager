const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { verifyAccessToken, requireRole } = require('../auth/auth.middleware');

router.use(verifyAccessToken);

router.get('/dashboard/admin-summary', requireRole('Administrador'), dashboardController.getAdminSummary);
router.get('/dashboard/admin-groups-summary', requireRole('Administrador'), dashboardController.getAdminGroupsSummary);
router.get('/dashboard/teacher-summary', requireRole('Docente'), dashboardController.getTeacherSummary);
router.get('/dashboard/parent-summary', requireRole('Apoderado'), dashboardController.getParentSummary);

module.exports = router;