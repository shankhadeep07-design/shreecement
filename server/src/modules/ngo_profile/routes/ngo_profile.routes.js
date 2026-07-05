const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { fetch_ngo_profile_datatable, getNgoProfileUserIdFunction, createNgoProfile, ngoProfileDetailsFunction } = require('../controllers/ngo_profile.controller');


router.post('/datatable',  fetch_ngo_profile_datatable);
router.post('/ngo_userId',getNgoProfileUserIdFunction);
router.post('/create',upload.any(),createNgoProfile);
router.post('/ngo_details',ngoProfileDetailsFunction);

module.exports = router;
