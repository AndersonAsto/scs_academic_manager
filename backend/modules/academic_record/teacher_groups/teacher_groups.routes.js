const express = require('express');
const router = express.Router();
const teacherGroupsController = require('./teacher_groups.controller');

router.post('/teacher-groups/create', teacherGroupsController.createTeachersGroup);
router.get('/teacher-groups/list', teacherGroupsController.getTeacherGroups);
router.put('/teacher-groups/update/:id', teacherGroupsController.updateTeacherGroup);
router.delete('/teacher-groups/delete/:id/:del', teacherGroupsController.deleteTeacherGroup);

module.exports = router;