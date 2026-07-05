const express = require("express");
const router = express.Router();
const auditReportController = require("../controllers/audit_report.controller");

const masterauditReportController = require("../controllers/master_audit_report.controller");
const proposalauditReportController = require("../controllers/proposal_audit_report.controller");
const projectactivityauditReportController = require("../controllers/project_activity_audit_report.controller");
const budgetauditReportController = require("../controllers/budget_audit_report.controller");

const documentauditReportController = require("../controllers/document_audit_report.controller");
const eventauditReportController = require("../controllers/event_audit_report.controller");



router.get("/loginlogout", auditReportController.loginLogoutReport);
router.get(
  "/loginlogout-excelexport",
  auditReportController.loginLogoutReportExcel,
);

router.get("/master", masterauditReportController.masterReport);
router.get(
  "/master-excelexport",
  masterauditReportController.masterReportExcel,
);

router.get("/proposal", proposalauditReportController.proposalReport);
router.get(
  "/proposal-excelexport",
  proposalauditReportController.proposalReportExcel,
);

router.get(
  "/project-activity",
  projectactivityauditReportController.projectActivityReport,
);
router.get(
  "/project-activity-excelexport",
  projectactivityauditReportController.projectActivityReportExcel,
);

router.get("/budget", budgetauditReportController.budgetReport);
router.get(
  "/budget-excelexport",
  budgetauditReportController.budgetReportExcel,
);


router.get("/document", documentauditReportController.documentReport);
router.get(
  "/document-excelexport",
  documentauditReportController.documentReportExcel,
);


router.get("/event", eventauditReportController.eventReport);
router.get(
  "/event-excelexport",
  eventauditReportController.eventReportExcel,
);

module.exports = router;
