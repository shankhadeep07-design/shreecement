const express = require('express');
const { createmenu, getRoles, getRolesForSingleId, createRole, updateRole, deleteRole, getRoleWisePermissions, getAllRoles,myRoleDetailsApi } = require('../controllers/role.controller');
const router = express.Router();




router.get("/",getRoles)
router.get("/all",getAllRoles)
router.get("/:id",getRolesForSingleId)
router.post("/create",createRole)
router.put("/update/:id",updateRole)
router.delete('/delete/:id',deleteRole)
router.get('/permissions/:module',getRoleWisePermissions)

router.post('/my-role',myRoleDetailsApi)

module.exports = router;
