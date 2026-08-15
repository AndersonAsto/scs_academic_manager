const express = require('express');
const router = express.Router();
const teachingBlocksController = require('./teachingBlocks.controller');
const { verifyAccessToken, requireRole } = require('../auth/auth.middleware');

router.use(verifyAccessToken);

router.get('/teaching-blocks/by-year', requireRole('Docente', 'Administrador', 'Apoderado'), teachingBlocksController.getTeachingBlocksByYear);

router.post('/teaching-blocks/create', teachingBlocksController.createTeachingBlocks);
router.get('/teaching-blocks/list', teachingBlocksController.getTeachingBlocks);
router.put('/teaching-blocks/update/:id', teachingBlocksController.updateTeachingBlock);
router.delete('/teaching-blocks/delete/:year_id/:del', teachingBlocksController.deleteTeachingBlocks);

module.exports = router;