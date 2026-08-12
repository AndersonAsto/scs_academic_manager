const express = require('express');
const router = express.Router();
const registrationsController = require('./registrations.controller');
const { verifyAccessToken, requireRole } = require('../auth/auth.middleware');

router.use(verifyAccessToken);

router.get('/registrations/by-group', requireRole('Docente', 'Administrador'), registrationsController.getRegistrationsForGroup);
router.get('/registrations/my-children', requireRole('Apoderado'), registrationsController.getMyChildrenRegistrations);

router.post('/registrations/create', registrationsController.createRegistration);
router.get('/registrations/list', registrationsController.getRegistrations);
router.put('/registrations/update/:id', registrationsController.updateRegistration);
router.delete('/registrations/delete/:id/:del', registrationsController.deleteRegistration);
router.patch('/registrations/restore/:id', registrationsController.restoreRegistration);

module.exports = router;