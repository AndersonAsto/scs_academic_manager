const express = require('express');
const router = express.Router();
const courseAverageController = require('./course_average.controller');

router.get('/course-average/list', courseAverageController.getCourseAverage);

module.exports = router;