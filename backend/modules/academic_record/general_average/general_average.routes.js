const express = require('express');
const router = express.Router();
const generalAverageController = require('./general_average.controller');

router.post('/general-average/create', generalAverageController.createGeneralAverage);
router.get('/general-average/list', generalAverageController.getGeneralAverage);

module.exports = router;