const express = require('express');
const router = express.Router();
const weightingsController = require('./weightings.controller');

router.post('/weightings/create', weightingsController.createWeighting);
router.get('/weightings/list', weightingsController.getWeightings);
router.put('/weightings/update/:id', weightingsController.updateWeighting);
router.delete('/weightings/delete/:year_id/:del', weightingsController.deleteWeightings);

module.exports = router;