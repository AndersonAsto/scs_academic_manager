const express = require('express');
const router = express.Router();
const personalInformationController = require('./personal_information.controller');

router.get('/personal-information/list', personalInformationController.getPersonalInformation);

module.exports = router;