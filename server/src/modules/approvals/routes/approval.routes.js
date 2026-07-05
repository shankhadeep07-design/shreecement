const express = require('express');
const router = express.Router();
// const { fetch_parent_module_permission , fetch_my_module_permission} = require('../controllers/permission.controller');
const { getAllApprovalMasterList, getDepartmentList,getLocationsList, datatable, 
    approvalPathCreate,
    approvalPathUpdate,
    approvalListDetails,
    approvalPathStatusUpdate,
    copyApprovalPathFunction,
    approvalUsersFunction,
    approvalProjectClosureUsersFunction,
} = require('../controllers/approval.controller');

// router.post('/get_parent_module_permission',  fetch_parent_module_permission);
// router.post('/get_my_module_permission',  fetch_my_module_permission);

// Approval Router
router.get("/all_approval_master_list", getAllApprovalMasterList);
router.post("/department_list", getDepartmentList);
router.post("/locations_list", getLocationsList);
router.post('/datatable', datatable)


router.post("/create", approvalPathCreate);
router.put("/update/:id", approvalPathUpdate);
router.post("/details/:id", approvalListDetails);

router.put("/status_update/:id", approvalPathStatusUpdate);
router.put("/copy_approval/:id", copyApprovalPathFunction);

router.post('/approval-users',approvalUsersFunction);
router.post('/approval-project-closure-users',approvalProjectClosureUsersFunction);

module.exports = router;
