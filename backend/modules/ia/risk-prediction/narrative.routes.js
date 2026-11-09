const express = require('express');
const router = express.Router();
const controller = require('./risk-prediction.controller');
const { verifyAccessToken, requireRole } = require('../../auth/auth.middleware');

router.use(verifyAccessToken);

router.post('/ai/risk-prediction/calculate', requireRole('Docente', 'Administrador'), controller.predictRisk);
router.get('/ai/risk-prediction/list', requireRole('Docente', 'Administrador'), controller.getRiskPredictions);

module.exports = router;