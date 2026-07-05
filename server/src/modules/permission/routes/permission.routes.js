const express = require('express');
const router = express.Router();
const { fetch_parent_module_permission , fetch_my_module_permission} = require('../controllers/permission.controller');

router.post('/get_parent_module_permission',  fetch_parent_module_permission);
router.post('/get_my_module_permission',  fetch_my_module_permission);

module.exports = router;
