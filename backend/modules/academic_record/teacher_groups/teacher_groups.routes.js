const express = require('express');
const router = express.Router();
const teacherGroupsController = require('./teacher_groups.controller');
const { verifyAccessToken, requireRole } = require('../../auth/auth.middleware');

router.use(verifyAccessToken);

router.get('/teacher-groups/by-contract', requireRole('Docente', 'Administrador'), teacherGroupsController.getTeacherGroupsByContract);
router.get('/teacher-groups/by-section', requireRole('Docente', 'Administrador', 'Apoderado'), teacherGroupsController.getTeacherGroupsBySection);
router.get('/teacher-groups/tutor-by-section', teacherGroupsController.getTutorBySection);

router.post('/teacher-groups/create', teacherGroupsController.createTeachersGroup);
router.get('/teacher-groups/list', teacherGroupsController.getTeacherGroups);
router.put('/teacher-groups/update/:id', teacherGroupsController.updateTeacherGroup);
router.delete('/teacher-groups/delete/:id/:del', teacherGroupsController.deleteTeacherGroup);
router.get('/teacher-groups/tutor-report',requireRole('Docente', 'Administrador'), teacherGroupsController.getTutorGroupReport);

module.exports = router;