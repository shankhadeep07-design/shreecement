var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const ProfitCenterMaster = require("../../../models/master_management/profit_center.model");

module.exports.profit_center_master_list_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT *,
    t_state.tsl_state_name,
    t_district.tdl_district_name,
    t_location.tloc_location_name
    FROM t_profit_center_master
    LEFT JOIN t_state ON t_state.tsl_state_id = t_profit_center_master.tprofc_state_id
    LEFT JOIN t_district ON t_district.tdl_district_id = t_profit_center_master.tprofc_district_id
    LEFT JOIN t_location ON t_location.tloc_location_id = t_profit_center_master.tprofc_location_id
    `;

    // var where = `t_profit_center_master.tprofc_is_active = 'true' `;
        var where;


    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.createProfitCenterMaster = async function (req, res, next) {
  try {
    const {
      tprofc_corporate,
      tprofc_bu,
      tprofc_gl_account,
      tprofc_profit_centre,
      tprofc_cost_centre,
      tprofc_state_id,
      tprofc_district_id,
      tprofc_location_id,
      payload
    } = req?.body;

    // 🔎 Check if Profit Centre already exists for given location
    const existingProfitCenter = await ProfitCenterMaster.findOne({
      where: {
        tprofc_state_id,
        tprofc_district_id,
        tprofc_location_id,
        tprofc_profit_centre: {
          [Op.iLike]: tprofc_profit_centre
        }
      },
    });

    if (existingProfitCenter) {
      return res.status(409).json({
        status: false,
        message: `Profit centre '${tprofc_profit_centre}' already exists in this location.`,
      });
    }

    // 🆕 Create new Profit Centre
    const newProfitCenter = await ProfitCenterMaster.create({
      tprofc_corporate,
      tprofc_bu,
      tprofc_gl_account,
      tprofc_profit_centre,
      tprofc_cost_centre,
      tprofc_state_id,
      tprofc_district_id,
      tprofc_location_id,
      tprofc_created_by: payload?.id,
    });

    return res.status(201).json({
      status: true,
      message: "Profit centre created successfully",
      data: newProfitCenter,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};


module.exports.updateProfitCenterMaster = async (req, res, next) => {
  try {
    const {
      tprofc_corporate,
      tprofc_bu,
      tprofc_gl_account,
      tprofc_profit_centre,
      tprofc_cost_centre,
      tprofc_state_id,
      tprofc_district_id,
      tprofc_location_id,
      payload
    } = req.body;

    const { tprofc_id } = req?.params;

    // 🔎 Check if record exists
    const existingProfitCenter = await ProfitCenterMaster.findOne({
      where: { tprofc_id },
    });

    if (!existingProfitCenter) {
      return res.status(404).json({
        status: false,
        message: "Profit centre not found",
      });
    }

    // 🔎 Check for duplicate profit centre name in same location
    const duplicateProfitCenter = await ProfitCenterMaster.findOne({
      where: {
        tprofc_state_id,
        tprofc_district_id,
        tprofc_location_id,
        tprofc_profit_centre: {
          [Op.iLike]: tprofc_profit_centre,
        },
      },
    });

    if (
      duplicateProfitCenter &&
      duplicateProfitCenter.tprofc_id !== tprofc_id
    ) {
      return res.status(409).json({
        status: false,
        message: `Profit centre '${tprofc_profit_centre}' already exists in this location.`,
      });
    }

    // 📝 Update record
    existingProfitCenter.tprofc_corporate = tprofc_corporate;
    existingProfitCenter.tprofc_bu = tprofc_bu;
    existingProfitCenter.tprofc_gl_account = tprofc_gl_account;
    existingProfitCenter.tprofc_profit_centre = tprofc_profit_centre;
    existingProfitCenter.tprofc_cost_centre = tprofc_cost_centre;
    existingProfitCenter.tprofc_state_id = tprofc_state_id;
    existingProfitCenter.tprofc_district_id = tprofc_district_id;
    existingProfitCenter.tprofc_location_id = tprofc_location_id;
    existingProfitCenter.tprofc_updated_by = payload?.id;
    existingProfitCenter.tprofc_updated_at = new Date();

    await existingProfitCenter.save();

    return res.status(200).json({
      status: true,
      message: "Profit centre updated successfully",
      data: existingProfitCenter,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getAllProfitCenterList = async (req, res, next) => {
  try {

    const profit_center = await ProfitCenterMaster.findAll({
      order: [["tprofc_profit_centre", "ASC"]],
    });

    // Format response as label-value pairs
    const response = profit_center.map((fact) => ({
      value: fact?.tprofc_id,
      label: fact?.tprofc_profit_centre,
    }));

    return res.status(200).json({
      status: true,
      message: "Profit Center fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.getAllProfitCenterListSubDistrictWise = async (req, res, next) => {
  try {
    const profit_center = await ProfitCenterMaster.findAll({
      attributes: {
        exclude: ["wkb_geometry"], // exclude geometry only
      },
      order: [["tprofc_profit_centre", "ASC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Profit Center fetched successfully",
      data: profit_center,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


