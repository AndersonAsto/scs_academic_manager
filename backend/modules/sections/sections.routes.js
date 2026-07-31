const express = require('express');
const router = express.Router();
const sectionsController = require('./sections.controller');

router.post('/sections/create', sectionsController.createSection);
router.get('/sections/list', sectionsController.getSections);
router.put('/sections/update/:id', sectionsController.updateSection);
router.delete('/sections/delete/:id/:del', sectionsController.deleteSection);

module.exports = router;
