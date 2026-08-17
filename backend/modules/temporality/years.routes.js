const express = require('express');
const router = express.Router();
const yearsController = require('./years.controller');

router.post('/years/create', yearsController.createYear);
router.get('/years/list', yearsController.getYears);
router.put('/years/update/:id', yearsController.updateYear);
router.delete('/years/delete/:id/:del', yearsController.deleteYear);

module.exports = router;