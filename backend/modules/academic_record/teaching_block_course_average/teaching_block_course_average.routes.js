const express = require('express');
const router = express.Router();
const teachingBlockCourseAverageController = require('./teaching_block_course_average.controller');

router.get('/teaching-block-course-average/list', teachingBlockCourseAverageController.getTeachingBlockCourseAverage);

module.exports = router;