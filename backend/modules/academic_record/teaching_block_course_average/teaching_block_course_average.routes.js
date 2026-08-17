const express = require('express');
const router = express.Router();
const teachingBlockCourseAverageController = require('./teaching_block_course_average.controller');
const { verifyAccessToken, requireRole } = require('../../auth/auth.middleware');

router.use(verifyAccessToken);

router.post('/teaching-block-course-averages/create', requireRole('Docente', 'Administrador'), teachingBlockCourseAverageController.createTeachingBlockCourseAverage);
router.get('/teaching-block-course-averages/list', requireRole('Docente', 'Administrador', 'Apoderado'), teachingBlockCourseAverageController.getTeachingBlockCourseAverage);

module.exports = router;