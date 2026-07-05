const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { fetch_gallery_datatable,
    createOrUpdateGallery,
    getExcelExportGalleryList ,
    themeWiseProjectsList,
    deleteGalleryImage
} = require('../controllers/gallery.controller');

router.post('/datatable',  fetch_gallery_datatable);
router.post("/create_or_update",upload.any(), createOrUpdateGallery);        // CREATE
router.post("/create_or_update/:id",upload.any(), createOrUpdateGallery);    // UPDATE
router.get("/excel-export-datatable", getExcelExportGalleryList);
router.post("/theme-wise-projects-list", themeWiseProjectsList);
router.delete("/delete-image/:tdoc_id", deleteGalleryImage);

module.exports = router;
