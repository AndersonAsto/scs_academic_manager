const express = require('express');
const router = express.Router();
const schedulesController = require('./schedules.controller');
const { verifyAccessToken, requireRole } = require('../../auth/auth.middleware');

router.use(verifyAccessToken);

router.get('/schedules/by-teacher-group', requireRole('Docente', 'Administrador'), schedulesController.getSchedulesByTeacherGroup);
router.get(
    '/schedules/report',
    requireRole('Docente', 'Administrador'),
    schedulesController.getScheduleReport
);

router.post('/schedules/create', schedulesController.createSchedule);
router.get('/schedules/list', schedulesController.getSchedules);
router.put('/schedules/update/:id', schedulesController.updateSchedule);
router.delete('/schedules/delete/:id/:del', schedulesController.deleteSchedule);

module.exports = router;