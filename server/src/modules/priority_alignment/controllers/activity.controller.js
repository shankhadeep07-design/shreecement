var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const ScheduleSevenMaster = require("../../../models/priority_alignment/schedule_seven.model");
const ActivityMaster = require("../../../models/priority_alignment/activity.model");

const SubScheduleMaster = require("../../../models/priority_alignment/sub_schedule_master.model");

const { Op } = require("sequelize");

module.exports.activityMasterDatatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_activity_master
    LEFT JOIN t_schedule_seven_master ON t_schedule_seven_master.tschm_schedule_id = t_activity_master.tactm_schedule_id
    LEFT JOIN t_sub_schedule_master ON t_sub_schedule_master.tsubshcm_sub_schedule_id = t_activity_master.tactm_focus_area_id
    `;

    // var where = `t_activity_master.tactm_is_active = 'true' `;
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createActivityMaster = async function (req, res, next) {
  try {
    const {
      tactm_activity_name,
      tactm_schedule_id,
      tactm_focus_area_id,
      payload,
    } = req?.body;

    // Check if schedule seven exists
    const existingScheduleSeven = await ScheduleSevenMaster.findOne({
      where: { tschm_schedule_id: tactm_schedule_id },
    });
    if (!existingScheduleSeven) {
      return res.status(404).json({
        status: false,
        message: "Schedule Seven name not found",
      });
    }

    // Check if focus exists
    const existingFocusArea = await SubScheduleMaster.findOne({
      where: {
        tsubshcm_sub_schedule_id: tactm_focus_area_id,
        tsubshcm_schedule_id: tactm_schedule_id,
      },
    });
    if (!existingFocusArea) {
      return res.status(404).json({
        status: false,
        message: "Focus Area name not found for the given Schedule Seven.",
      });
    }

    // Check if Activity name already exists for the given Focus
    const existingActivity = await ActivityMaster.findOne({
      where: {
        tactm_schedule_id,
        tactm_focus_area_id,
        tactm_activity_name: {
          [Op.iLike]: tactm_activity_name,
        },
      },
    });
    if (existingActivity) {
      return res.status(409).json({
        status: false,
        message: `Activity name ${tactm_activity_name} already exists in this Sub Schedule.`,
      });
    }

    // Create the new Activity
    const newActivity = await ActivityMaster.create({
      tactm_activity_name,
      tactm_schedule_id,
      tactm_focus_area_id,
      tactm_created_by: payload?.id,
            tactm_updated_by: payload?.id,

    });

    return res.status(201).json({
      status: true,
      message: "Activity name created successfully",
      data: newActivity,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateActivityMaster = async function (req, res, next) {
  try {
    const {
      tactm_activity_name,
      tactm_focus_area_id,
      tactm_schedule_id,
      payload,
    } = req?.body;
    const { tactm_activity_id } = req?.params;

    if (!tactm_activity_id) {
      return res.status(404).json({
        status: false,
        message: "Activity ID not found",
      });
    }

    // Check if the activity exists
    const existingActivity = await ActivityMaster.findOne({
      where: { tactm_activity_id },
    });
    if (!existingActivity) {
      return res.status(404).json({
        status: false,
        message: "Activity name not found",
      });
    }

    // Check if the Schedule seven exists
    const existingSchedule = await ScheduleSevenMaster.findOne({
      where: { tschm_schedule_id: tactm_schedule_id },
    });
    if (!existingSchedule) {
      return res.status(404).json({
        status: false,
        message: "Schedule seven name not found",
      });
    }

    // Check if the focus area exists and belongs to the provided schedule seven
    const existingFocusArea = await SubScheduleMaster.findOne({
      where: {
        tsubshcm_sub_schedule_id: tactm_focus_area_id,
        tsubshcm_schedule_id: tactm_schedule_id,
      },
    });
    if (!existingFocusArea) {
      return res.status(404).json({
        status: false,
        message:
          "Focus Are name not found or does not belong to the given Schedule Seven.",
      });
    }

    // Check for duplicate Activity names in the same focus
    const duplicateActivity = await ActivityMaster.findOne({
      where: {
        tactm_schedule_id,
        tactm_focus_area_id,
        tactm_activity_name: {
          [Op.iLike]: tactm_activity_name,
        },
      },
    });
    if (
      duplicateActivity &&
      duplicateActivity.tactm_activity_id !== tactm_activity_id
    ) {
      return res.status(409).json({
        status: false,
        message: `Activity name ${tactm_activity_name} already exists in this Sub Schedule.`,
      });
    }

    // Update the block
    existingActivity.tactm_activity_name = tactm_activity_name;
    existingActivity.tactm_focus_area_id = tactm_focus_area_id;
    existingActivity.tactm_schedule_id = tactm_schedule_id;
    existingActivity.tactm_updated_by = payload?.id;
        existingActivity.tactm_updated_at = new Date();


    await existingActivity.save();

    return res.status(200).json({
      status: true,
      message: "Activity name updated successfully",
      data: existingActivity,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getExcelExportActivityMasterList = async (req, res, next) => {
  try {
    var sql = `select * from t_activity_master inner join 
    t_schedule_seven_master on t_schedule_seven_master.tschm_schedule_id = t_activity_master.tactm_schedule_id
    LEFT JOIN t_sub_schedule_master ON t_sub_schedule_master.tsubshcm_sub_schedule_id = t_activity_master.tactm_focus_area_id
    `;
    // var where = ` t_activity_master.tactm_is_active = 'true' `;
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getActivityByFocusArea = async (req, res, next) => {
  try {
    const { tactm_focus_area_id } = req?.params;

    // Validate activity seven ID
    if (!tactm_focus_area_id) {
      return res.status(400).json({
        status: false,
        message: "Focus area ID is required",
      });
    }

    // Fetch activity by focus area ID
    const activityData = await ActivityMaster.findAll({
      where: { tactm_focus_area_id },
      attributes: ["tactm_activity_id", "tactm_activity_name"],
      order: [["tactm_activity_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = activityData.map((farea) => ({
      value: farea?.tactm_activity_id,
      label: farea?.tactm_activity_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Activity fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
