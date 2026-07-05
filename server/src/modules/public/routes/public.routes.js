const express = require('express');
const { getAllThemeList } = require('../../masters/controllers/theme.controller');
const { getAllEducationList } = require('../../masters/controllers/education.controller');
const { getAllStateList } = require('../../masters/controllers/state.controller');
const { getAllCategoryList } = require('../../masters/controllers/category.controller');
const router = express.Router();

const multer = require('multer');
const { createRegNgo } = require('../../ngo/controllers/ngo_reg.controller');
const upload = multer();

router.get('/theme/all-list', getAllThemeList);
router.get('/education/all-list', getAllEducationList)
router.get('/state/all-list', getAllStateList)
router.get('/category/all-list', getAllCategoryList)
router.post('/ngo/create',upload.any(),createRegNgo);
module.exports = router;