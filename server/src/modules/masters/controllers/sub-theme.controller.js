const VillagesModel = require("../../../models/masters/village.model");

var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const SubThemeManagement = require("../../../models/master_management/sub_theme.model");

module.exports.fetch_sub_theme_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_sub_theme_master.tsthm_sub_theme_id,
                t_sub_theme_master.tsthm_theme_id,
                t_sub_theme_master.tsthm_sub_theme_name,
                t_sub_theme_master.tsthm_sub_theme_desc,
                t_sub_theme_master.tsthm_is_active,
                t_sub_theme_master.tsthm_created_at,
                t_theme_master.tthm_theme_name
               FROM t_sub_theme_master
               LEFT JOIN t_theme_master ON t_theme_master.tthm_theme_id = t_sub_theme_master.tsthm_theme_id`;

    var where = `t_sub_theme_master.tsthm_is_active = true 
                 AND t_sub_theme_master.tsthm_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.getExcelExportSubThemeList = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_sub_theme_master.tsthm_sub_theme_id,
                t_sub_theme_master.tsthm_theme_id,
                t_sub_theme_master.tsthm_sub_theme_name,
                t_sub_theme_master.tsthm_sub_theme_desc,
                t_sub_theme_master.tsthm_is_active,
                t_sub_theme_master.tsthm_created_at,
                t_theme_master.tthm_theme_name
               FROM t_sub_theme_master
               LEFT JOIN t_theme_master ON t_theme_master.tthm_theme_id = t_sub_theme_master.tsthm_theme_id`;

    var where = `t_sub_theme_master.tsthm_is_active = true 
                 AND t_sub_theme_master.tsthm_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.createSubTheme = async function (req, res, next) {
  try {
    const {
      tsthm_theme_id,
      tsthm_sub_theme_name,
      tsthm_sub_theme_desc,
      payload
    } = req.body;

    // Check if Sub Theme already exists with same name under same theme
    const existingSubTheme = await SubThemeManagement.findOne({
      where: {
        tsthm_theme_id,
        tsthm_sub_theme_name,
        tsthm_deleted_at: null
      },
    });

    if (existingSubTheme) {
      return res.status(409).json({
        status: false,
        message: `Sub Theme already exists under this Thematic Area.`,
      });
    }

    // Create the new Sub Theme
    const newSubTheme = await SubThemeManagement.create({
      tsthm_theme_id,
      tsthm_sub_theme_name,
      tsthm_sub_theme_desc,
      tsthm_created_by: payload?.id || 'SYSTEM',
    });

    return res.status(201).json({
      status: true,
      message: "Sub Theme created successfully",
      data: newSubTheme,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};


module.exports.updateSubTheme = async (req, res, next) => {
  try {
    const {
      tsthm_sub_theme_id,
      tsthm_theme_id,
      tsthm_sub_theme_name,
      tsthm_sub_theme_desc,
      payload,
    } = req.body;

    // Check if Sub Theme record exists
    const existingSubTheme = await SubThemeManagement.findOne({
      where: {
        tsthm_sub_theme_id,
        tsthm_deleted_at: null
      },
    });

    if (!existingSubTheme) {
      return res.status(404).json({
        status: false,
        message: "Sub Theme not found",
      });
    }

    // Check for duplicate (excluding current record)
    const duplicateSubTheme = await SubThemeManagement.findOne({
      where: {
        tsthm_theme_id,
        tsthm_sub_theme_name,
        tsthm_deleted_at: null
      },
    });

    if (
      duplicateSubTheme &&
      duplicateSubTheme.tsthm_sub_theme_id !== tsthm_sub_theme_id
    ) {
      return res.status(409).json({
        status: false,
        message: `Sub Theme already exists under this Thematic Area.`,
      });
    }

    // Update the Sub Theme
    existingSubTheme.tsthm_theme_id       = tsthm_theme_id;
    existingSubTheme.tsthm_sub_theme_name = tsthm_sub_theme_name;
    existingSubTheme.tsthm_sub_theme_desc = tsthm_sub_theme_desc;
    existingSubTheme.tsthm_updated_by     = payload?.id || 'SYSTEM';
    existingSubTheme.tsthm_updated_at     = new Date();

    await existingSubTheme.save();

    return res.status(200).json({
      status: true,
      message: "Sub Theme updated successfully",
      data: existingSubTheme,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};


