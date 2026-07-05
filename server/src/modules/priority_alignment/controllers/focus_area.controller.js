var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const FocusAreaMaster = require("../../../models/priority_alignment/focus_area.model");
const ScheduleSevenMaster = require("../../../models/priority_alignment/schedule_seven.model");

module.exports.focusAreaMasterDatatable = async (req, res, next) => {
  try {
    var sql = `select * from t_focus_area_master inner join t_schedule_seven_master on t_schedule_seven_master.tschm_schedule_id = t_focus_area_master.tfam_schedule_id
    `;

    var where = `t_focus_area_master.tfam_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.getFocusAreaMasterList = async (req, res, next) => {
  try {

    // Fetch scheduleSeven
    const scheduleSeven = await FocusAreaMaster.findAll({
      order: [["tfam_focus_area_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = scheduleSeven.map((state) => ({
      value: state?.tfam_focus_area_id,
      label: state?.tfam_focus_area_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Focus Area Master fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.createFocusAreaMaster = async function (req, res, next) {
  try {


    const { tfam_focus_area_name, tfam_schedule_id, payload } = req.body;


    // Check if Schedule Seven exists
    const existingScheduleSeven = await ScheduleSevenMaster.findOne({
      where: { tschm_schedule_id: tfam_schedule_id },
    });
    if (!existingScheduleSeven) {
      return res.status(404).json({
        status: false,
        message: "Schedule Seven name not found",
      });
    }


    // Check if focus area name already exists for the given schedule seven

    const existingFocusArea = await FocusAreaMaster.findOne({
      where: {
        tfam_schedule_id,
        tfam_focus_area_name: {
          [Op.iLike]: tfam_focus_area_name,
        },
      },
    });
    if (existingFocusArea) {
      return res.status(409).json({
        status: false,
        message: `Focus Area name ${tfam_focus_area_name} already exists in this Schedule Seven.`,
      });
    }

    // Create the new Focus Area
    const newFocusArea = await FocusAreaMaster.create({
      tfam_focus_area_name,
      tfam_schedule_id,
      tfam_created_by: payload?.id
    });

    return res.status(201).json({
      status: true,
      message: "Focus Area name created successfully",
      data: newFocusArea,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateFocusAreaMaster = async (req, res, next) => {
  try {

    const { tfam_focus_area_id } = req.params; // Focus Area ID
    const { tfam_focus_area_name, tfam_schedule_id, payload } = req.body;

    if (!tfam_focus_area_id) {
      return res.status(404).json({
        status: false,
        message: "Focus Area ID not found",
      });
    }


    const existingScheduleSeven = await ScheduleSevenMaster.findOne({
      where: { tschm_schedule_id: tfam_schedule_id },
    });
    if (!existingScheduleSeven) {
      return res.status(404).json({
        status: false,
        message: "Schedule Seven name not found",
      });
    }


    const existingFocusArea = await FocusAreaMaster.findOne({
      where: { tfam_focus_area_id },
    });
    if (!existingFocusArea) {
      return res.status(404).json({
        status: false,
        message: "Focus name not found",
      });
    }

    // Check if the updated focus area name already exists in the same schedule seven
    const duplicateFocusArea = await FocusAreaMaster.findOne({
      where: {
        tfam_schedule_id,
        tfam_focus_area_name: {
          [Op.iLike]: tfam_focus_area_name,
        },
      },
    });

    if (duplicateFocusArea && duplicateFocusArea?.tfam_focus_area_id != tfam_focus_area_id) {
      return res.status(409).json({
        status: false,
        message: `Focus Area name ${tfam_focus_area_name} already exists in this schedule seven.`,
      });
    }

    // Update the focus area
    existingFocusArea.tfam_focus_area_name = tfam_focus_area_name;
    existingFocusArea.tfam_schedule_id = tfam_schedule_id;
    existingFocusArea.tfam_updated_by = payload?.id;
    await existingFocusArea.save();

    return res.status(200).json({
      status: true,
      message: "Focus Area name updated successfully",
      data: existingFocusArea,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getExcelExportFocusAreaMasterList = async (req, res, next) => {
  try {
    var sql = `select * from t_focus_area_master inner join t_schedule_seven_master on t_schedule_seven_master.tschm_schedule_id = t_focus_area_master.tfam_schedule_id`;
    var where = ` t_focus_area_master.tfam_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getFocusAreasByScheduleSeven = async (req, res, next) => {
  try {
    const { tfam_schedule_id } = req?.params;

    // Validate schedule seven ID
    if (!tfam_schedule_id) {
      return res.status(400).json({
        status: false,
        message: "Schedule seven ID is required",
      });
    }

    // Fetch focus areas by schedule seven ID
    const focusAreas = await FocusAreaMaster.findAll({
      where: { tfam_schedule_id },
      attributes: ["tfam_focus_area_id", "tfam_focus_area_name"],
      order: [["tfam_focus_area_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = focusAreas.map((farea) => ({
      value: farea?.tfam_focus_area_id,
      label: farea?.tfam_focus_area_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Focus Areas fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};