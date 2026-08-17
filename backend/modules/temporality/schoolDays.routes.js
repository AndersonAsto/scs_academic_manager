const express = require('express');
const router = express.Router();
const schoolDaysController = require('./schoolDays.controller');

router.post('/school-days/create', schoolDaysController.createSchoolDays);
router.get('/school-days/list', schoolDaysController.getSchoolDays);
router.put('/school-days/update/:id', schoolDaysController.updateSchoolDay);
router.delete('/school-days/delete/:year_id/:del', schoolDaysController.deleteSchoolDays);

module.exports = router;