const express = require('express');
const router = express.Router();
const { fetchAllUsers, listUsers, getExcelExportUserList, createUser, userDetails, changePassword, users_role_slug_wise_function } = require('../controllers/user.controller');
const authMiddleware = require('../../../middlewares/authMiddleware');



// router.get('/', authMiddleware, fetchAllUsers);
router.post("/datatable/list", listUsers);
router.post("/excel-export-datatable", getExcelExportUserList);
router.post("/create", createUser);
router.post("/details/:id", userDetails);
router.post("/change_password", changePassword);
router.get("/role_slug_wise/:id", users_role_slug_wise_function);
module.exports = router;
