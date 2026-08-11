const express = require('express');
const router = express.Router();
const generalAverageController = require('./general_average.controller');

router.get('/general-average/list', generalAverageController.getGeneralAverage);

module.exports = router;