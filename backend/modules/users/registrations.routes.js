const express = require('express');
const router = express.Router();
const registrationsController = require('./registrations.controller');

router.post('/registrations/create', registrationsController.createRegistration);
router.get('/registrations/list', registrationsController.getRegistrations);
router.put('/registrations/update/:id', registrationsController.updateRegistration);
router.delete('/registrations/delete/:id/:del', registrationsController.deleteRegistration);
router.patch('/registrations/restore/:id', registrationsController.restoreRegistration);

module.exports = router;