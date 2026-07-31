const express = require('express');
const router = express.Router();
const coursesController = require('./courses.controller');

router.post('/courses/create', coursesController.createCourse);
router.get('/courses/list', coursesController.getCourses);
router.put('/courses/update/:id', coursesController.updateCourse);
router.delete('/courses/delete/:id/:del', coursesController.deleteCourse);

module.exports = router;