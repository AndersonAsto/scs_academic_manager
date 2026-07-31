const express = require('express');
const router = express.Router();
const schoolDaysByScheduleController = require('./school_days_by_schedule.controller');

router.get('/school-days-by-schedule/list', schoolDaysByScheduleController.getSchoolDaysBySchedule);

module.exports = router;