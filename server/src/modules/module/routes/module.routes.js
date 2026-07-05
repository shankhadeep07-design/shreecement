const express = require('express');
const { createmenu, getModule, updatemenu, deletemenu } = require('../controllers/module.controller');
const router = express.Router();




router.post("/create",createmenu)
router.get("/",getModule)
router.put("/update/:id",updatemenu)
router.delete("/delete/:id",deletemenu)



module.exports = router;
