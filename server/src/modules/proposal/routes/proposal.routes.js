const express = require('express');
const { 
    getBudgetingAmountFetchByFocusAreaActivityId, 
    createOrUpdateProposal, 
    proposal_list_datatable, 
    proposal_details_fun,
    send_proposal_for_approval_fun,
    getExcelExportProposalList,
    deleteProposalDocument
} = require('../controllers/proposal.controller');

const router = express.Router();
const multer = require('multer');
const upload = multer();
router.post('/budgeting_amount_fetch_by_focus_area_activity_id', getBudgetingAmountFetchByFocusAreaActivityId);
router.post('/create_or_update_proposal',upload.any(),createOrUpdateProposal);
router.post('/proposal_details', proposal_details_fun);
router.post('/datatable', proposal_list_datatable);
router.post('/send_proposal_for_approval', send_proposal_for_approval_fun);

router.get('/excel-export-datatable', getExcelExportProposalList)
router.post('/delete', deleteProposalDocument);



module.exports = router;
