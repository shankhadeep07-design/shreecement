const express = require("express");
const {
  getTotalCounts,
  getBudgetChartData,
  getProposalChartData,
  getRecentProjects,
  getMonthWiseData,
  getFactoryProposalData,
  getHistoricalData,
  getEventAnalytics,
  getGalleryChartData,
  getCaseStudyChartData,
} = require("../controllers/dashboard.controller");

const router = express.Router();

router.post("/get-total-count", getTotalCounts);
router.post("/budget-chart", getBudgetChartData);
router.post("/proposal-chart", getProposalChartData);
router.post("/recent-projects", getRecentProjects);
router.post("/month-wise", getMonthWiseData);
router.post("/factory-proposals", getFactoryProposalData);
router.get("/historical-data", getHistoricalData);
router.post("/event-analytics", getEventAnalytics);
router.get("/gallery-chart", getGalleryChartData);
router.get("/case-study-chart", getCaseStudyChartData);

module.exports = router;
