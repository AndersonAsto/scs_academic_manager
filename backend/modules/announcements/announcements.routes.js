const express = require('express');
const router = express.Router();
const announcementsController = require('./announcements.controller');

router.post('/announcements/create', announcementsController.createAnnouncement);
router.get('/announcements/list', announcementsController.getAnnouncements);
router.put('/announcements/update/:id', announcementsController.updateAnnouncement);
router.delete('/announcements/delete/:id/:del', announcementsController.deleteAnnouncement);
router.patch('/announcements/reading/:id', announcementsController.markAnnouncementAsRead);

module.exports = router;