const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { fetch_best_practices_datatable,createOrUpdateBestPractice,getExcelExportBestPracticeList } = require('../controllers/best_practice.controller');


router.post('/datatable',  fetch_best_practices_datatable);

 
 

router.post("/create_or_update",upload.any(), createOrUpdateBestPractice);        // CREATE
router.post("/create_or_update/:id",upload.any(), createOrUpdateBestPractice);    // UPDATE
router.get("/excel-export-datatable", getExcelExportBestPracticeList);




module.exports = router;
