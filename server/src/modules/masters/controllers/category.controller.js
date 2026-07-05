var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const CategoryModel = require("../../../models/masters/category.model");

module.exports.getAllCategoryList = async (req, res, next) => {
  try {
    const categorys = await CategoryModel.findAll({
      order: [["tcat_category_type", "ASC"]],
    });

    // Format response as label-value pairs
    const response = categorys.map((ct) => ({
      value: ct?.tcat_id,
      label: ct?.tcat_category_type,
    }));

    return res.status(200).json({
      status: true,
      message: "Categories fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.fetch_category_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_category.tcat_id,
                t_category.tcat_category_type,
                t_category.tcat_category_desc,
                t_category.tcat_is_active,
                t_category.tcat_created_at
               FROM t_category`;

    // var where = `t_category.tcat_is_active = true
    //              AND t_category.tcat_deleted_at IS NULL`;

    var where = `t_category.tcat_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportCategoryList = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_category.tcat_id,
                t_category.tcat_category_type,
                t_category.tcat_category_desc,
                t_category.tcat_is_active,
                t_category.tcat_created_at
               FROM t_category`;

    // var where = `t_category.tcat_is_active = true
    //              AND t_category.tcat_deleted_at IS NULL`;

    var where = `t_category.tcat_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createCategory = async function (req, res, next) {
  try {
    const { tcat_category_type, tcat_category_desc, payload } = req.body;

    // Check if record already exists with same category type
    const existingRecord = await CategoryModel.findOne({
      where: {
        tcat_category_type,
        tcat_deleted_at: null,
      },
    });

    if (existingRecord) {
      return res.status(409).json({
        status: false,
        message: `Category already exists.`,
      });
    }

    // Create new record
    const newRecord = await CategoryModel.create({
      tcat_category_type,
      tcat_category_desc,
      tcat_created_by: payload?.id || "SYSTEM",
            tcat_updated_by: payload?.id || "SYSTEM",

    });

    return res.status(201).json({
      status: true,
      message: "Category created successfully",
      data: newRecord,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateCategory = async (req, res, next) => {
  try {
    const { tcat_id, tcat_category_type, tcat_category_desc, payload } =
      req.body;

    // Check if record exists
    const existingRecord = await CategoryModel.findOne({
      where: {
        tcat_id,
        tcat_deleted_at: null,
      },
    });

    if (!existingRecord) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    // Check for duplicate (excluding current record)
    const duplicateRecord = await CategoryModel.findOne({
      where: {
        tcat_category_type,
        tcat_deleted_at: null,
      },
    });

    if (duplicateRecord && duplicateRecord.tcat_id !== tcat_id) {
      return res.status(409).json({
        status: false,
        message: `Category already exists.`,
      });
    }

    // Update the record
    existingRecord.tcat_category_type = tcat_category_type;
    existingRecord.tcat_category_desc = tcat_category_desc;
    existingRecord.tcat_updated_by = payload?.id || "SYSTEM";
    existingRecord.tcat_updated_at = new Date();

    await existingRecord.save();

    return res.status(200).json({
      status: true,
      message: "Category updated successfully",
      data: existingRecord,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
