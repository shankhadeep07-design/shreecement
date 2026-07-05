const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { fetch_ngo_lists, fetch_ngo_datatable, getNgoUserIdFunction, createNgo, ngoDetailsFunction, ngoExcelDownload } = require('../controllers/ngo.controller');


router.get('/all-list',  fetch_ngo_lists);
router.post('/datatable',  fetch_ngo_datatable);
router.post('/ngo_userId',getNgoUserIdFunction);
router.post('/create',upload.any(),createNgo);
router.post('/ngo_details',ngoDetailsFunction);
router.post("/excel-download", ngoExcelDownload);
module.exports = router;
