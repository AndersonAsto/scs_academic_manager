const express = require('express');
const router = express.Router();
const gradesController = require('./grades.controller');

router.post('/grades/create', gradesController.createGrade);
router.get('/grades/list', gradesController.getGrades);
router.put('/grades/update/:id', gradesController.updateGrade);
router.delete('/grades/delete/:id/:del', gradesController.deleteGrade);

module.exports = router;