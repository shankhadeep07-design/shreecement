var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const ThemeMasterModel = require("../../../models/master_management/theme.model");
const { Op } = require("sequelize");
const { saveUpdateAndPrepareDocumentMetadata } = require("../../../helpers/document.helper");

const fs = require("fs/promises");



module.exports.getAllThemeMasterList = async (req, res, next) => {
  try {

    // Fetch Theme
    const themeData = await ThemeMasterModel.findAll({
      order: [["tthm_theme_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = themeData.map((theme) => ({
      value: theme?.tthm_theme_id,
      label: theme?.tthm_theme_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Theme fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



