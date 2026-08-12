const express = require('express');
const router = express.Router();
const courseAverageController = require('./course_average.controller');

router.post('/course-average/create', courseAverageController.createCourseAverage);
router.get('/course-average/list', courseAverageController.getCourseAverage);

module.exports = router;