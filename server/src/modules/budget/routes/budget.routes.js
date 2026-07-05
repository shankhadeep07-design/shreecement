const express = require('express');
const { budget_transfer_Datatable } = require('../controllers/budget_transfer.controller');
const { budgeting_list_datatable,
    create_budgeting_fun,
    budgeting_list_fun,
    budgeting_details_fun,
    delete_budgeting_row_fun, 
    send_budgeting_for_approval_fun,
    create_ammendment_budgeting_fun,
    getPendingUser,
    budgeting_details_by_budget_id_fun,
    getBudgetAmountByLocationTheme
} = require('../controllers/budget.controller');

const router = express.Router();


router.post('/budget-transfer-list/datatable', budget_transfer_Datatable);
router.post('/budgeting_list/datatable', budgeting_list_datatable);
router.get('/budgeting_list', budgeting_list_fun);
router.post('/create_budgeting', create_budgeting_fun);
router.post('/budgeting_details', budgeting_details_fun);
router.post('/delete_budgeting_row', delete_budgeting_row_fun);
router.post('/send_budgeting_for_approval', send_budgeting_for_approval_fun);
router.post('/create_ammendment_budgeting', create_ammendment_budgeting_fun);
router.post('/get-pending-user', getPendingUser);

router.post('/budgeting_details_by_budget_id', budgeting_details_by_budget_id_fun);

router.post("/get_budget_amount_by_location_theme", getBudgetAmountByLocationTheme);


module.exports = router;
