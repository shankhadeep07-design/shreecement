const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {createVendor,fetch_vendor_datatable,vendorDetails, vendorDetailsFunction} = require('../controllers/vendor.controller');


router.post("/details/:id", vendorDetails);
router.post('/datatable',  fetch_vendor_datatable);
// router.post('/ngo_userId',getNgoUserIdFunction);
router.post('/create',upload.any(),createVendor);
router.post('/vendor_details',vendorDetailsFunction);

module.exports = router;
