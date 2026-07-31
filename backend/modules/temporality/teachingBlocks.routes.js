const express = require('express');
const router = express.Router();
const teachingBlocksController = require('./teachingBlocks.controller');

router.post('/teaching-blocks/create', teachingBlocksController.createTeachingBlocks);
router.get('/teaching-blocks/list', teachingBlocksController.getTeachingBlocks);
router.delete('/teaching-blocks/delete/:year_id/:del', teachingBlocksController.deleteTeachingBlocks);

module.exports = router;