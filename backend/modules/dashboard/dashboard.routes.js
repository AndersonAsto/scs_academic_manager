const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { verifyAccessToken, requireRole } = require('../auth/auth.middleware');

router.use(verifyAccessToken);

router.get('/dashboard/admin-summary', requireRole('Administrador'), dashboardController.getAdminSummary);

module.exports = router;