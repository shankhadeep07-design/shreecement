const VillagesModel = require("../../../models/masters/village.model");

var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const TypeOfBeneficiaryModel = require("../../../models/masters/type_of_beneficiary.model");
const KpiOutcomeMasterModel = require("../../../models/masters/kpi_out_come_master.model");

module.exports.fetch_kpi_outcome_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT 
    t_kpi_outcome_master.tkpio_id,
    t_kpi_outcome_master.tkpio_thematic_area_id,
    t_kpi_outcome_master.tkpio_kpi,
    t_kpi_outcome_master.tkpio_outcome_name,
    t_kpi_outcome_master.tkpio_desc,
    t_kpi_outcome_master.tkpio_is_active,
    t_kpi_outcome_master.tkpio_created_at,

    t_schedule_seven_master.tschm_schedule_id,
    t_schedule_seven_master.tschm_schedule_name,

    -- KPI fields
    t_kpi_master.tkpi_desc,
    t_kpi_master.tkpi_details

FROM t_kpi_outcome_master

LEFT JOIN t_schedule_seven_master 
  ON t_schedule_seven_master.tschm_schedule_id = t_kpi_outcome_master.tkpio_thematic_area_id

LEFT JOIN t_kpi_master 
  ON t_kpi_master.tkpi_id = t_kpi_outcome_master.tkpio_kpi
  AND t_kpi_master.tkpi_deleted_at IS NULL
`;

    var where = `t_kpi_outcome_master.tkpio_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportKpiOutcomeList = async (req, res, next) => {
  try {
    var sql = `SELECT 
    t_kpi_outcome_master.tkpio_id,
    t_kpi_outcome_master.tkpio_thematic_area_id,
    t_kpi_outcome_master.tkpio_kpi,
    t_kpi_outcome_master.tkpio_outcome_name,
    t_kpi_outcome_master.tkpio_desc,
    t_kpi_outcome_master.tkpio_is_active,
    t_kpi_outcome_master.tkpio_created_at,

    t_schedule_seven_master.tschm_schedule_id,
    t_schedule_seven_master.tschm_schedule_name,

    -- KPI fields
    t_kpi_master.tkpi_desc,
    t_kpi_master.tkpi_details

FROM t_kpi_outcome_master

LEFT JOIN t_schedule_seven_master 
  ON t_schedule_seven_master.tschm_schedule_id = t_kpi_outcome_master.tkpio_thematic_area_id

LEFT JOIN t_kpi_master 
  ON t_kpi_master.tkpi_id = t_kpi_outcome_master.tkpio_kpi
  AND t_kpi_master.tkpi_deleted_at IS NULL
`;

    var where = `t_kpi_outcome_master.tkpio_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createKpiOutcome = async function (req, res, next) {
  try {
    const {
      tkpio_thematic_area_id,
      tkpio_kpi,
      tkpio_outcome_name,
      tkpio_desc,
      payload,
    } = req.body;

    // Check if record already exists with same outcome name under same theme
    const existingRecord = await KpiOutcomeMasterModel.findOne({
      where: {
        // tkpio_thematic_area_id,
        tkpio_kpi,
        tkpio_outcome_name,
        tkpio_deleted_at: null,
      },
    });

    if (existingRecord) {
      return res.status(409).json({
        status: false,
        message: `KPI Outcome already exists under this KPI.`,
      });
    }

    // Create new record
    const newRecord = await KpiOutcomeMasterModel.create({
      tkpio_thematic_area_id,
      tkpio_kpi,
      tkpio_outcome_name,
      tkpio_desc,
      tkpio_created_by: payload?.id || 0,
      tkpio_updated_by: payload?.id || 0,

    });

    return res.status(201).json({
      status: true,
      message: "KPI Outcome created successfully",
      data: newRecord,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateKpiOutcome = async (req, res, next) => {
  try {
    const {
      tkpio_id,
      tkpio_thematic_area_id,
      tkpio_kpi,
      tkpio_outcome_name,
      tkpio_desc,
      payload,
    } = req.body;

    // Check if record exists
    const existingRecord = await KpiOutcomeMasterModel.findOne({
      where: {
        tkpio_id,
        tkpio_deleted_at: null,
      },
    });

    if (!existingRecord) {
      return res.status(404).json({
        status: false,
        message: "KPI Outcome not found",
      });
    }

    // Check for duplicate (excluding current record)
    const duplicateRecord = await KpiOutcomeMasterModel.findOne({
      where: {
        // tkpio_thematic_area_id,
        tkpio_kpi,
        tkpio_outcome_name,
        tkpio_deleted_at: null,
      },
    });

    if (duplicateRecord && duplicateRecord.tkpio_id !== tkpio_id) {
      return res.status(409).json({
        status: false,
        message: `KPI Outcome already exists under this KPI.`,
      });
    }

    // Update the record
    existingRecord.tkpio_thematic_area_id = tkpio_thematic_area_id;
    existingRecord.tkpio_kpi = tkpio_kpi;
    existingRecord.tkpio_outcome_name = tkpio_outcome_name;
    existingRecord.tkpio_desc = tkpio_desc;
    existingRecord.tkpio_updated_by = payload?.id || 0;
    existingRecord.tkpio_updated_at = new Date();

    await existingRecord.save();

    return res.status(200).json({
      status: true,
      message: "KPI Outcome updated successfully",
      data: existingRecord,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
