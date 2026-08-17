const express = require('express');
const router = express.Router();
const timeSlotsController = require('./time_slots.controller');

router.post('/time-slots/create', timeSlotsController.createTimeSlots);
router.get('/time-slots/list', timeSlotsController.getTimeSlots);
router.put('/time-slots/update/:id', timeSlotsController.updateTimeSlot);
router.delete('/time-slots/delete/:id/:del', timeSlotsController.deleteTimeSlot);

module.exports = router;