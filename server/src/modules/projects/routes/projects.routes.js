const express = require("express");
const {
  budget_transfer_Datatable,
  projects_list_datatable,
  project_details_fun,
  milestone_paymenst_add_fun,
  milestone_paymenst_list_fun,
  milestone_paymenst_delete_fun,
  milestone_paymenst_status_update_fun,
  project_target_beneficiaries,
  getAllProjectList,
  create_project_fun,
  createOrUpdateProject,
  submit_project_fun,
} = require("../controllers/projects.controller");
// const { budget_transfer_Datatable, projects_list_datatable, project_details_fun } = require('../controllers/projects.controller');
const {
  projects_monitoring_datatable,
  projects_monitoring_create_update,
  projectMonitoringDetailsFunction,
} = require("../controllers/projects_monitoring.controller");
const {
  projects_implementation_datatable,
} = require("../controllers/projects_implementation.controller");
const {
  projects_closure_datatable,
  projects_closure_save,
  projects_closure_details_fun,
  send_project_closure_for_approval_fun,
  getProjectClosurePendingUser,
} = require("../controllers/projects_closure.controller");
const {
  projects_impact_assessment_datatable,
  projects_impact_assessment_create_update,
  projectImpactAssessmentDetailsFunction,
} = require("../controllers/projects_impact_assessment.controller");

const router = express.Router();

const multer = require("multer");
const {
  createProjectPoUpload,
  projectPoUploadDetails,
} = require("../controllers/project_po_upload.controller");
const {
  createProjectMouUpload,
  projectMouUploadDetails,
} = require("../controllers/project_mou_upload.controller");

const {
  createProjectPayment,
  projectPaymentDetails,
} = require("../controllers/project_payment.controller");
const {
  createProjectPaymentTerms,
  projectPaymentTermsDetails,
} = require("../controllers/project_payment_terms.controller");
const {
  createProjectFinancialReport,
  projects_financial_report_datatable,
} = require("../controllers/projects_financial_report.controller");
const {
  createProjectAnnualReport,
  projects_annual_report_datatable,
} = require("../controllers/projects_annual_report.controller");

const {
  createProjectCollateral,
  projects_collateral_datatable,
} = require("../controllers/projects_collateral.controller");

const {
  createProjectDeviation,
  projectDeviationDetails,
} = require("../controllers/project_deviation.controller");

const {
  project_task_sub_task_list_fun,
  project_task_sub_task_create_update_fun,
  project_task_sub_task_order_changed_fun,
  project_parent_task_start_fun,
  project_parent_task_end_fun,
  project_child_task_start_fun,
  project_activity_submit_fun,
  project_activity_list_fun,
} = require("../controllers/project_gantt.controller");
const {
  createProjectBeneficiary,
  projects_beneficiary_datatable,
  projects_beneficiary_all_lists,
  project_beneficiary_details_fun,
} = require("../controllers/project_beneficiary.controller");
const upload = multer();

router.post("/projects-list/datatable", projects_list_datatable);

router.post("/implementation/datatable", projects_implementation_datatable);

// router.post('/milestone-payment', upload.any(), milestone_paymenst_add_fun);
// router.post('/milestone-payment-list', milestone_paymenst_list_fun);
// router.delete('/milestone-payment-delete/:id', milestone_paymenst_delete_fun);
// router.post('/milestone-payment-status-update/:id', milestone_paymenst_status_update_fun);

router.post("/project_details", project_details_fun);
router.post("/upsert", createOrUpdateProject);
router.post("/target_beneficiaries", project_target_beneficiaries);

// Project Monitoring
router.post("/monitoring/datatable", projects_monitoring_datatable);
router.post(
  "/monitoring/createUpdate",
  upload.any(),
  projects_monitoring_create_update,
);
router.post("/monitoring/details", projectMonitoringDetailsFunction);

// Task/ Subtask
router.get("/project_task_sub_task_list/:id", project_task_sub_task_list_fun);
router.post(
  "/project_task_sub_task_create_update",
  upload.any(),
  project_task_sub_task_create_update_fun,
);
router.post(
  "/project_task_sub_task_order_changed",
  upload.any(),
  project_task_sub_task_order_changed_fun,
);
router.post(
  "/project_parent_task_start",
  upload.any(),
  project_parent_task_start_fun,
);
router.post(
  "/project_parent_task_end",
  upload.any(),
  project_parent_task_end_fun,
);
router.post(
  "/project_child_task_start",
  upload.any(),
  project_child_task_start_fun,
);
router.post(
  "/project_activity_submit",
  upload.any(),
  project_activity_submit_fun,
);
router.post("/project_activity_list", project_activity_list_fun);

// Project Closure
router.post("/closure/datatable", projects_closure_datatable); ///// listing route
router.post("/closure/createUpdate", upload.any(), projects_closure_save);
router.post("/closure/details", projects_closure_details_fun);
router.post("/closure/send-for-approval", send_project_closure_for_approval_fun);
router.post("/closure/get-pending-user", getProjectClosurePendingUser);

// Project ImpactAssessment
router.post(
  "/impact-assessment/datatable",
  projects_impact_assessment_datatable,
);
router.post(
  "/impact-assessment/createUpdate",
  upload.any(),
  projects_impact_assessment_create_update,
);
router.post(
  "/impact-assessment/details",
  projectImpactAssessmentDetailsFunction,
);

// Project PO Upload
router.post("/po-upload/createUpdate", upload.any(), createProjectPoUpload);
router.post("/po-upload/details", projectPoUploadDetails);

// Project MOU Upload
router.post("/mou-upload/createUpdate", upload.any(), createProjectMouUpload);
router.post("/mou-upload/details", projectMouUploadDetails);

//Project Beneficiary Start
router.post(
  "/beneficiary/createUpdate",
  upload.any(),
  createProjectBeneficiary,
);
router.post("/beneficiary/datatable/:tproj_id", projects_beneficiary_datatable);
router.post("/beneficiary/all-list", projects_beneficiary_all_lists);
router.post(
  "/beneficiary/details/:beneficiary_id",
  project_beneficiary_details_fun,
);

// Project Payment
router.post("/payment/createUpdate", upload.any(), createProjectPayment);
router.post("/payment/details", projectPaymentDetails);

// Project Deviation Start
router.post("/deviation/createUpdate", upload.any(), createProjectDeviation);
router.post("/deviation/details", projectDeviationDetails);
// Project Deviation End

// Project PaymentTerms Start
router.post(
  "/payment-terms/createUpdate",
  upload.any(),
  createProjectPaymentTerms,
);
router.post("/payment-terms/details", projectPaymentTermsDetails);
// Project PaymentTerms End

// Project Financial Report Start
router.post(
  "/financial-report/createUpdate",
  upload.any(),
  createProjectFinancialReport,
);
router.post("/financial-report/details", projects_financial_report_datatable);
// Project Financial Report End

// Project Financial Report Start
router.post(
  "/annual-report/createUpdate",
  upload.any(),
  createProjectAnnualReport,
);
router.post("/annual-report/details", projects_annual_report_datatable);
// Project Financial Report End

// Project collateral Report Start
router.post("/collateral/createUpdate", upload.any(), createProjectCollateral);
router.post("/collateral/details", projects_collateral_datatable);
// Project collateral Report End

router.get("/all-list", getAllProjectList);
router.post("/create", create_project_fun);
router.post("/submit", submit_project_fun);

module.exports = router;
