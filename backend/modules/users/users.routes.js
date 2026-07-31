const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');

router.get('/users/list', usersController.getUsers);
router.put('/users/update/:personal_information_id', usersController.updateUser);

module.exports = router;