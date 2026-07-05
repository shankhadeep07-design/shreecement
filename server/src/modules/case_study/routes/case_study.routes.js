const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { fetch_case_study_datatable,
    createOrUpdateCaseStudy,
    getExcelExportCaseStudyList ,
    themeWiseProjectsList,
    deleteCaseStudyDocument
} = require('../controllers/case_study.controller');

router.post('/datatable',  fetch_case_study_datatable);
router.post("/create_or_update",upload.any(), createOrUpdateCaseStudy);        // CREATE
router.post("/create_or_update/:id",upload.any(), createOrUpdateCaseStudy);    // UPDATE
router.get("/excel-export-datatable", getExcelExportCaseStudyList);
router.post("/theme-wise-projects-list", themeWiseProjectsList);
router.delete("/delete-document/:tdoc_id", deleteCaseStudyDocument);

module.exports = router;
