const VillagesModel = require("../../../models/masters/village.model");

var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const TypeOfBeneficiaryModel = require("../../../models/masters/type_of_beneficiary.model");

module.exports.fetch_type_of_beneficiary_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_type_of_beneficiary.tben_beneficiary_type_id,
                t_type_of_beneficiary.tben_beneficiary_type_name,
                t_type_of_beneficiary.tben_beneficiary_desc,
                t_type_of_beneficiary.tben_is_active,
                t_type_of_beneficiary.tben_created_at
               FROM t_type_of_beneficiary`;

    // var where = `t_type_of_beneficiary.tben_is_active = true
    //              AND t_type_of_beneficiary.tben_deleted_at IS NULL`;

    var where = `t_type_of_beneficiary.tben_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportTypeOfBeneficiaryList = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_type_of_beneficiary.tben_beneficiary_type_id,
                t_type_of_beneficiary.tben_beneficiary_type_name,
                t_type_of_beneficiary.tben_beneficiary_desc,
                t_type_of_beneficiary.tben_is_active,
                t_type_of_beneficiary.tben_created_at
               FROM t_type_of_beneficiary`;

    // var where = `t_type_of_beneficiary.tben_is_active = true
    //              AND t_type_of_beneficiary.tben_deleted_at IS NULL`;
    var where = `t_type_of_beneficiary.tben_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createTypeOfBeneficiary = async function (req, res, next) {
  try {
    const { tben_beneficiary_type_name, tben_beneficiary_desc, payload } =
      req.body;

    // Check if record already exists with same name
    const existingRecord = await TypeOfBeneficiaryModel.findOne({
      where: {
        tben_beneficiary_type_name,
        tben_deleted_at: null,
      },
    });

    if (existingRecord) {
      return res.status(409).json({
        status: false,
        message: `Type of Beneficiary already exists.`,
      });
    }

    // Create new record
    const newRecord = await TypeOfBeneficiaryModel.create({
      tben_beneficiary_type_name,
      tben_beneficiary_desc,
      tben_created_by: payload?.id || "SYSTEM",
            tben_updated_by: payload?.id || "SYSTEM",

    });

    return res.status(201).json({
      status: true,
      message: "Type of Beneficiary created successfully",
      data: newRecord,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateTypeOfBeneficiary = async (req, res, next) => {
  try {
    const {
      tben_beneficiary_type_id,
      tben_beneficiary_type_name,
      tben_beneficiary_desc,
      payload,
    } = req.body;

    // Check if record exists
    const existingRecord = await TypeOfBeneficiaryModel.findOne({
      where: {
        tben_beneficiary_type_id,
        tben_deleted_at: null,
      },
    });

    if (!existingRecord) {
      return res.status(404).json({
        status: false,
        message: "Type of Beneficiary not found",
      });
    }

    // Check for duplicate (excluding current record)
    const duplicateRecord = await TypeOfBeneficiaryModel.findOne({
      where: {
        tben_beneficiary_type_name,
        tben_deleted_at: null,
      },
    });

    if (
      duplicateRecord &&
      duplicateRecord.tben_beneficiary_type_id !== tben_beneficiary_type_id
    ) {
      return res.status(409).json({
        status: false,
        message: `Type of Beneficiary already exists.`,
      });
    }

    // Update the record
    existingRecord.tben_beneficiary_type_name = tben_beneficiary_type_name;
    existingRecord.tben_beneficiary_desc = tben_beneficiary_desc;
    existingRecord.tben_updated_by = payload?.id || "SYSTEM";
    existingRecord.tben_updated_at = new Date();

    await existingRecord.save();

    return res.status(200).json({
      status: true,
      message: "Type of Beneficiary updated successfully",
      data: existingRecord,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
