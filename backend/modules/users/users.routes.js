const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { verifyAccessToken } = require('../auth/auth.middleware');
const { uploadProfilePicture } = require('./upload.config');

router.get('/users/list', usersController.getUsers);
router.put('/users/update/:personal_information_id', usersController.updateUser);

router.get('/users/me/profile', verifyAccessToken, usersController.getMyProfile);
router.put('/users/me/profile', verifyAccessToken, usersController.updateMyProfile);
router.post(
    '/users/me/profile-picture',
    verifyAccessToken,
    uploadProfilePicture.single('profile_picture'),
    usersController.updateMyProfilePicture
);
router.delete('/users/me/profile-picture', verifyAccessToken, usersController.deleteMyProfilePicture);

module.exports = router;