const express = require('express');
const router = express.Router();
const schoolDaysByScheduleController = require('./school_days_by_schedule.controller');

router.post('/school-days-by-schedules/create', schoolDaysByScheduleController.createSchoolDaysBySchedule);
router.get('/school-days-by-schedules/list', schoolDaysByScheduleController.getSchoolDaysBySchedule);
router.put('/school-days-by-schedules/update/:id', schoolDaysByScheduleController.updateSchoolDayBySchedule);

module.exports = router;