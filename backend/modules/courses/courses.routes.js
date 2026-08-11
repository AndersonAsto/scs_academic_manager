const express = require('express');
const router = express.Router();
const coursesController = require('./courses.controller');
const { verifyAccessToken, requireRole } = require('../auth/auth.middleware');

router.use(verifyAccessToken);

router.post('/courses/create', requireRole('Administrador', 'Docente'), coursesController.createCourse);
router.get('/courses/list', requireRole('Administrador'), coursesController.getCourses);
router.put('/courses/update/:id', coursesController.updateCourse);
router.delete('/courses/delete/:id/:del', coursesController.deleteCourse);

module.exports = router;