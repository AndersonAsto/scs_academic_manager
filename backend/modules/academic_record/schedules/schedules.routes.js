const express = require('express');
const router = express.Router();
const schedulesController = require('./schedules.controller');

router.post('/schedules/create', schedulesController.createSchedule);
router.get('/schedules/list', schedulesController.getSchedules);
router.put('/schedules/update/:id', schedulesController.updateSchedule);
router.delete('/schedules/delete/:id/:del', schedulesController.deleteSchedule);

module.exports = router;