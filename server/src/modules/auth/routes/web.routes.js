const express = require('express');
const router = express.Router();
const { login, logout,forgetPassword, region_list_fun,volunteerCreateFun, state_list_fun, company_list_fun, get_public_districts_list_by_state_fun, ngoRegisterUserCreateFun, subMasterListByMasterSlug } = require('../controllers/web.controller'); // good
const multer = require('multer');
const upload = multer();
const { authMiddleware } = require("../../../middlewares/authMiddleware");

router.post('/login', login); // good
router.post('/logout',authMiddleware, logout); // this method used to handle logout activity for audit log

router.post('/forgot-password', forgetPassword); // good
router.post('/forgot-password/verify-otp', login); // good
router.post('/forgot-password/reset-password', login); // good
router.get('/region_list', region_list_fun); // good
router.post('/volunteer_create', volunteerCreateFun); // good
// router.post('/ngo_register_user_create',upload.any(), ngoRegisterUserCreateFun); // good
router.post('/ngo_register_user_create',upload.any(), ngoRegisterUserCreateFun); // good
router.get('/state_list', state_list_fun); // good
router.get('/company_list', company_list_fun); // good
router.post('/districts/districts_list_by_state_id', get_public_districts_list_by_state_fun); // good
router.post("/sub-master-list/sub-master-list-by-master-slug", subMasterListByMasterSlug);
module.exports = router;
