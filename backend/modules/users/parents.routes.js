const express = require('express');
const router = express.Router();
const parentsController = require('./parents.controller');

router.get('/parents/list', parentsController.getParents);
router.put('/parents/update/:id', parentsController.updateParent);
router.delete('/parents/delete/:id/:del', parentsController.deleteParent);
router.patch('/parents/restore/:id', parentsController.restoreParent);

module.exports = router;