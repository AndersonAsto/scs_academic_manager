const express = require('express');
const router = express.Router();
const studentsController = require('./students.controller');

router.get('/students/list', studentsController.getStudents);
router.put('/students/update/:id', studentsController.updateStudent);
router.delete(
    '/students/delete/:id/:del',
    studentsController.deleteStudent
);
router.patch('/students/restore/:id', studentsController.restoreStudent);

module.exports = router;