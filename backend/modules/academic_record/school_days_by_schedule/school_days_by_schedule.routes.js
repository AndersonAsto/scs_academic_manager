const express = require('express');
const router = express.Router();
const schoolDaysByScheduleController = require('./school_days_by_schedule.controller');
const { verifyAccessToken, requireRole } = require('../../auth/auth.middleware');

router.use(verifyAccessToken);

router.get('/school-days-by-schedule/lective', requireRole('Docente', 'Administrador'), schoolDaysByScheduleController.getLectiveDaysBySchedule);

router.post('/school-days-by-schedules/create', schoolDaysByScheduleController.createSchoolDaysBySchedule);
router.get('/school-days-by-schedules/list', schoolDaysByScheduleController.getSchoolDaysBySchedule);
router.put('/school-days-by-schedules/update/:id', schoolDaysByScheduleController.updateSchoolDayBySchedule);
router.delete(
    '/school-days-by-schedules/delete/:year_id/:del',
    schoolDaysByScheduleController.deleteSchoolDaysBySchedule
);

module.exports = router;