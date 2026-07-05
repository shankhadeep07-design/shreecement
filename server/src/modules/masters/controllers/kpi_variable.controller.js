const VillagesModel = require("../../../models/masters/village.model");

var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const TypeOfBeneficiaryModel = require("../../../models/masters/type_of_beneficiary.model");
const KpiVariableMasterModel = require("../../../models/masters/kpi_variable_master.model");

module.exports.fetch_kpi_variable_datatable = async (req, res, next) => {
  try {
    var sql = `
SELECT 
    t_kpi_variable_master.tkpiv_id,
    t_kpi_variable_master.tkpiv_thematic_area_id,
    t_kpi_variable_master.tkpiv_kpi_details,
    t_kpi_variable_master.tkpiv_kpi_variable,
    t_kpi_variable_master.tkpiv_desc,
    t_kpi_variable_master.tkpiv_is_active,
    t_kpi_variable_master.tkpiv_created_at,

    t_schedule_seven_master.tschm_schedule_id,
    t_schedule_seven_master.tschm_schedule_name,

    t_kpi_master.tkpi_details AS kpi_name

FROM t_kpi_variable_master

LEFT JOIN t_schedule_seven_master 
    ON t_schedule_seven_master.tschm_schedule_id = t_kpi_variable_master.tkpiv_thematic_area_id

LEFT JOIN t_kpi_master 
    ON t_kpi_master.tkpi_id = t_kpi_variable_master.tkpiv_kpi_details
`;

    var where = `t_kpi_variable_master.tkpiv_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportKpiVariableList = async (req, res, next) => {
  try {
    var sql = `
SELECT 
    t_kpi_variable_master.tkpiv_id,
    t_kpi_variable_master.tkpiv_thematic_area_id,
    t_kpi_variable_master.tkpiv_kpi_details,
    t_kpi_variable_master.tkpiv_kpi_variable,
    t_kpi_variable_master.tkpiv_desc,
    t_kpi_variable_master.tkpiv_is_active,
    t_kpi_variable_master.tkpiv_created_at,

    t_schedule_seven_master.tschm_schedule_id,
    t_schedule_seven_master.tschm_schedule_name,

    t_kpi_master.tkpi_details AS kpi_name

FROM t_kpi_variable_master

LEFT JOIN t_schedule_seven_master 
    ON t_schedule_seven_master.tschm_schedule_id = t_kpi_variable_master.tkpiv_thematic_area_id

LEFT JOIN t_kpi_master 
    ON t_kpi_master.tkpi_id = t_kpi_variable_master.tkpiv_kpi_details
`;

    var where = `t_kpi_variable_master.tkpiv_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.getExcelExportKpiVariableList = async (req, res, next) => {
  try {
   
 var sql = `
SELECT 
    t_kpi_variable_master.tkpiv_id,
    t_kpi_variable_master.tkpiv_thematic_area_id,
    t_kpi_variable_master.tkpiv_kpi_details,
    t_kpi_variable_master.tkpiv_kpi_variable,
    t_kpi_variable_master.tkpiv_desc,
    t_kpi_variable_master.tkpiv_is_active,
    t_kpi_variable_master.tkpiv_created_at,

    t_schedule_seven_master.tschm_schedule_id,
    t_schedule_seven_master.tschm_schedule_name,

    t_kpi_master.tkpi_details AS kpi_name

FROM t_kpi_variable_master

LEFT JOIN t_schedule_seven_master 
    ON t_schedule_seven_master.tschm_schedule_id = t_kpi_variable_master.tkpiv_thematic_area_id

LEFT JOIN t_kpi_master 
    ON t_kpi_master.tkpi_id = t_kpi_variable_master.tkpiv_kpi_details
`;
 
    var where = `t_kpi_variable_master.tkpiv_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.createKpiVariable = async function (req, res, next) {
  try {
    const {
      tkpiv_thematic_area_id,
      tkpiv_kpi_details,
      tkpiv_kpi_variable,
      tkpiv_desc,
      payload
    } = req.body;

    // Check if record already exists with same variable under same theme
    const existingRecord = await KpiVariableMasterModel.findOne({
      where: {
        // tkpiv_thematic_area_id,
        tkpiv_kpi_details,
        tkpiv_kpi_variable,
        tkpiv_deleted_at: null
      },
    });

    if (existingRecord) {
      return res.status(409).json({
        status: false,
        message: `KPI Variable already exists under this KPI.`,
      });
    }

    // Create new record
    const newRecord = await KpiVariableMasterModel.create({
      tkpiv_thematic_area_id,
      tkpiv_kpi_details,
      tkpiv_kpi_variable,
      tkpiv_desc,
      tkpiv_created_by: payload?.id || 0,
            tkpiv_updated_by: payload?.id || 0,

    });

    return res.status(201).json({
      status: true,
      message: "KPI Variable created successfully",
      data: newRecord,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};


module.exports.updateKpiVariable = async (req, res, next) => {
  try {
    const {
      tkpiv_id,
      tkpiv_thematic_area_id,
      tkpiv_kpi_details,
      tkpiv_kpi_variable,
      tkpiv_desc,
      payload,
    } = req.body;

    // Check if record exists
    const existingRecord = await KpiVariableMasterModel.findOne({
      where: {
        tkpiv_id,
        tkpiv_deleted_at: null
      },
    });

    if (!existingRecord) {
      return res.status(404).json({
        status: false,
        message: "KPI Variable not found",
      });
    }

    // Check for duplicate (excluding current record)
    const duplicateRecord = await KpiVariableMasterModel.findOne({
      where: {
        // tkpiv_thematic_area_id,
        tkpiv_kpi_details,
        tkpiv_kpi_variable,
        tkpiv_deleted_at: null
      },
    });

    if (
      duplicateRecord &&
      duplicateRecord.tkpiv_id !== tkpiv_id
    ) {
      return res.status(409).json({
        status: false,
        message: `KPI Variable already exists under this KPI.`,
      });
    }

    // Update the record
    existingRecord.tkpiv_thematic_area_id = tkpiv_thematic_area_id;
    existingRecord.tkpiv_kpi_details      = tkpiv_kpi_details;
    existingRecord.tkpiv_kpi_variable     = tkpiv_kpi_variable;
    existingRecord.tkpiv_desc             = tkpiv_desc;
    existingRecord.tkpiv_updated_by       = payload?.id || 0;
    existingRecord.tkpiv_updated_at       = new Date();

    await existingRecord.save();

    return res.status(200).json({
      status: true,
      message: "KPI Variable updated successfully",
      data: existingRecord,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
