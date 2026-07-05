var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const KpiMasterModel = require("../../../models/masters/kpi_master.model");

module.exports.getAllKpiList = async (req, res, next) => {
  try {


    // const categorys = await KpiMasterModel.findAll({
    //   order: [["tkpi_desc", "ASC"]],
    // });

    // const response = categorys.map((ct) => ({
    //   value: ct?.tkpi_id,
    //   label: ct?.tkpi_desc,
    // }));

     const categorys = await KpiMasterModel.findAll({
      order: [["tkpi_details", "ASC"]],
    });

    const response = categorys.map((ct) => ({
      value: ct?.tkpi_id,
      label: ct?.tkpi_details,
    }));


    return res.status(200).json({
      status: true,
      message: "KPI fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.getThemewiseAllKpiList = async (req, res, next) => {
  try {
    const thematicId = req.query.thematic_area_id; // ✅ get from query

    const whereCondition = {
      tkpi_is_active: true,
      tkpi_deleted_at: null,
    };

    // ✅ Apply filter only if theme id is passed
    if (thematicId) {
      whereCondition.tkpi_thematic_area_id = thematicId;
    }

    const categorys = await KpiMasterModel.findAll({
      where: whereCondition,
      order: [["tkpi_details", "ASC"]],
    });

    const response = categorys.map((ct) => ({
      value: ct?.tkpi_id,
      label: ct?.tkpi_details,
    }));

    return res.status(200).json({
      status: true,
      message: "KPI fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};




module.exports.fetch_kpi_datatable = async (req, res, next) => {
  try {
    const sql = `
SELECT
    t_kpi_master.tkpi_id,
    t_kpi_master.tkpi_desc,
    t_kpi_master.tkpi_details,
    t_kpi_master.tkpi_is_active,
    t_schedule_seven_master.tschm_schedule_id,
    t_schedule_seven_master.tschm_theme_id,
    t_schedule_seven_master.tschm_schedule_name

FROM t_kpi_master

LEFT JOIN t_schedule_seven_master
  ON t_schedule_seven_master.tschm_schedule_id = t_kpi_master.tkpi_thematic_area_id
`;

    // WHERE condition
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      }),
    );
  }
};

module.exports.createKpi = async function (req, res, next) {
  try {
    const {
      tkpi_thematic_area_id,
      tkpi_details,
      tkpi_desc,
      payload
    } = req.body;

    const newKpi = await KpiMasterModel.create({
      tkpi_thematic_area_id,
      tkpi_details,
      tkpi_desc,
      tkpi_created_by: payload?.id,
      tkpi_updated_by: payload?.id

    });

    return res.status(201).json({
      status: true,
      message: "KPI created successfully",
      data: newKpi
    });

  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateKpi = async function (req, res, next) {
  try {

    const { tkpi_id } = req.params;

    const {
      tkpi_thematic_area_id,
      tkpi_details,
      tkpi_desc,
      payload
    } = req.body;

    const existingKpi = await KpiMasterModel.findOne({
      where: { tkpi_id }
    });

    if (!existingKpi) {
      return res.status(404).json({
        status: false,
        message: "KPI not found"
      });
    }

    existingKpi.tkpi_thematic_area_id = tkpi_thematic_area_id;
    existingKpi.tkpi_details = tkpi_details;
    existingKpi.tkpi_desc = tkpi_desc;
    existingKpi.tkpi_updated_by = payload?.id;
    existingKpi.tkpi_updated_at = new Date();

    await existingKpi.save();

    return res.status(200).json({
      status: true,
      message: "KPI updated successfully"
    });

  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getExcelExportKpiList = async (req, res, next) => {
  try {

    const sql = `
SELECT
    t_kpi_master.tkpi_id,
    t_schedule_seven_master.tschm_schedule_name,
    t_kpi_master.tkpi_details,
    t_kpi_master.tkpi_desc

FROM t_kpi_master

LEFT JOIN t_schedule_seven_master
  ON t_schedule_seven_master.tschm_schedule_id = t_kpi_master.tkpi_thematic_area_id
`;

    var where;

    const records = await Datatables.build(req, sql, where);

    res.json(records);

  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getKpiListByThemeId = async (req, res, next) => {
  try {
    const { theme_id } = req.params;

    if (!theme_id) {
      return res.status(400).json({
        status: false,
        message: "Theme ID is required",
      });
    }
    console.log("theme_id-------- ",theme_id);
    
    const kpis = await KpiMasterModel.findAll({
      attributes: ["tkpi_id", "tkpi_desc"],
      where: {
        tkpi_thematic_area_id: theme_id,
        tkpi_is_active: true
      },
      order: [["tkpi_desc", "ASC"]],
    });

    const response = kpis.map((kpi) => ({
      value: kpi.tkpi_id,
      label: kpi.tkpi_desc
    }));

    console.log("response-------- ",response);
    

    return res.status(200).json({
      status: true,
      message: "KPI fetched successfully",
      data: response,
    });

  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
module.exports.getKpiListByScheduleSevenId = async (req, res, next) => {
  try {
    const { schedule_seven_id } = req.params;

    if (!schedule_seven_id) {
      return res.status(400).json({
        status: false,
        message: "Schedule seven ID is required",
      });
    }
    
    const kpis = await KpiMasterModel.findAll({
      attributes: ["tkpi_id", "tkpi_details"],
      where: {
        tkpi_thematic_area_id: schedule_seven_id,
        tkpi_is_active: true
      },
      order: [["tkpi_details", "ASC"]],
    });

    const response = kpis.map((kpi) => ({
      value: kpi.tkpi_id,
      label: kpi.tkpi_details
    }));

    console.log("response-------- ",response);
    

    return res.status(200).json({
      status: true,
      message: "KPI fetched successfully",
      data: response,
    });

  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};