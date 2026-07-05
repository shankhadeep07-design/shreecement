var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const ScheduleSevenMaster = require("../../../models/priority_alignment/schedule_seven.model");
const FocusAreaMaster = require("../../../models/priority_alignment/focus_area.model");
const ActivityMaster = require("../../../models/priority_alignment/activity.model");
const { Op } = require("sequelize");
const SubActivityMaster = require("../../../models/priority_alignment/sub_activity.model");

// module.exports.subActivityMasterDatatable = async (req, res, next) => {
//     try {
//         var sql = `SELECT * FROM t_sub_activity_master
//     LEFT JOIN t_schedule_seven_master ON t_schedule_seven_master.tschm_schedule_id = t_sub_activity_master.tsactm_schedule_id
  
//     LEFT JOIN t_activity_master ON t_activity_master.tactm_activity_id = t_sub_activity_master.tsactm_activity_id
//     `;
//     //   LEFT JOIN t_focus_area_master ON t_focus_area_master.tfam_focus_area_id = t_sub_activity_master.tsactm_focus_area_id
//         // var where = `t_sub_activity_master.tsactm_is_active = 'true' `;
//         var where;
//         var records = await Datatables.build(req, sql, where);
//         res.json(records);
//     } catch (err) {
//         next(CustomErrorHandler.internalServerError(err.message));
//     }
// };

module.exports.subActivityMasterDatatable = async (req, res, next) => {
    try {
        const sql = `
            SELECT
                sam.*,
                s7m.tschm_schedule_name,
                am.tactm_activity_name,
                ssm.tsubshcm_sub_schedule_name
            FROM t_sub_activity_master sam

            LEFT JOIN t_schedule_seven_master s7m
                ON s7m.tschm_schedule_id = sam.tsactm_schedule_id

            LEFT JOIN t_activity_master am
                ON am.tactm_activity_id = sam.tsactm_activity_id

            LEFT JOIN t_sub_schedule_master ssm
                ON ssm.tsubshcm_sub_schedule_id = sam.tsactm_focus_area_id
        `;

        const records = await Datatables.build(req, sql, null);
        res.json(records);
    } catch (err) {
        next(CustomErrorHandler.internalServerError(err.message));
    }
};






module.exports.createSubActivityMaster = async function (req, res, next) {
    try {


        const {
            tsactm_schedule_id,
            tsactm_focus_area_id,
            tsactm_activity_id,
            tsactm_sub_activity_name,
            payload
        } = req?.body;


        const existingSubActivity = await SubActivityMaster.findOne({
            where: {
                tsactm_schedule_id,
                tsactm_focus_area_id,
                tsactm_activity_id,
                tsactm_sub_activity_name: {
                    [Op.iLike]: tsactm_sub_activity_name,
                },
            },
        });
        if (existingSubActivity) {
            return res.status(409).json({
                status: false,
                message: `Sub activity name ${tsactm_sub_activity_name} already exists in this Activity.`,
            });
        }

        // Create the new activity
        const newSubActivity = await SubActivityMaster.create({
            tsactm_schedule_id,
            tsactm_focus_area_id,
            tsactm_activity_id,
            tsactm_sub_activity_name,
            tsactm_created_by: payload?.id
        });

        return res.status(201).json({
            status: true,
            message: "Sub activity name created successfully",
            data: newSubActivity,
        });
    } catch (err) {
        console.log("err------------ ", err);

        next(CustomErrorHandler.databaseError(err.message));
    }
};

module.exports.updateSubActivityMaster = async (req, res, next) => {
    try {

        const {
            tsactm_schedule_id,
            tsactm_focus_area_id,
            tsactm_activity_id,
            tsactm_sub_activity_name,
            payload
        } = req?.body;
        const { tsactm_sub_activity_id } = req?.params;

        // Check if exists
        const existingSubActivity = await SubActivityMaster.findOne({
            where: { tsactm_sub_activity_id },
        });
        if (!existingSubActivity) {
            return res.status(404).json({
                status: false,
                message: "Sub activity name not found",
            });
        }

        const duplicateSubActivity = await SubActivityMaster.findOne({
            where: {
                tsactm_schedule_id,
                tsactm_focus_area_id,
                tsactm_activity_id,
                tsactm_sub_activity_name: {
                    [Op.iLike]: tsactm_sub_activity_name,
                },
            },
        });
        if (
            duplicateSubActivity &&
            duplicateSubActivity.tsactm_sub_activity_id !== tsactm_sub_activity_id
        ) {
            return res.status(409).json({
                status: false,
                message: `Sub activity name ${tsactm_sub_activity_name} already exists in this activity.`,
            });
        }

        // Update the block
        existingSubActivity.tsactm_schedule_id = tsactm_schedule_id;
        existingSubActivity.tsactm_focus_area_id = tsactm_focus_area_id;
        existingSubActivity.tsactm_activity_id = tsactm_activity_id;
        existingSubActivity.tsactm_sub_activity_name = tsactm_sub_activity_name;
        existingSubActivity.tsactm_updated_by = payload?.id;

        await existingSubActivity.save();

        return res.status(200).json({
            status: true,
            message: "Sub activity name updated successfully",
            data: existingSubActivity,
        });
    } catch (err) {
        next(CustomErrorHandler.databaseError(err.message));
    }
};


module.exports.getExcelExportSubActivityMasterList = async (req, res, next) => {
    try {
        var sql = `SELECT
                sam.*,
                s7m.tschm_schedule_name,
                am.tactm_activity_name,
                ssm.tsubshcm_sub_schedule_name
            FROM t_sub_activity_master sam

            LEFT JOIN t_schedule_seven_master s7m
                ON s7m.tschm_schedule_id = sam.tsactm_schedule_id

            LEFT JOIN t_activity_master am
                ON am.tactm_activity_id = sam.tsactm_activity_id

            LEFT JOIN t_sub_schedule_master ssm
                ON ssm.tsubshcm_sub_schedule_id = sam.tsactm_focus_area_id
    `;
        var where = null;

        var records = await Datatables.build(req, sql, where);

        res.json(records);
    } catch (err) {
        console.log(err);
        next(CustomErrorHandler.internalServerError(err.message));
    }
};


module.exports.getSubActivityByActivity = async (req, res, next) => {
  try {
    const { tsactm_activity_id } = req?.params; 

    // Validate activity seven ID
    if (!tsactm_activity_id) {
      return res.status(400).json({
        status: false,
        message: "Focus area ID is required",
      });
    }

    // Fetch activity by focus area ID
    const activityData = await SubActivityMaster.findAll({
      where: { tsactm_activity_id },
      attributes: ["tsactm_sub_activity_id", "tsactm_sub_activity_name"], 
      order: [["tsactm_sub_activity_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = activityData.map((farea) => ({
      value: farea?.tsactm_sub_activity_id,
      label: farea?.tsactm_sub_activity_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Sub Activity fetched successfully",
      data: response,
    });
  } catch (err) {
    
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getAllSubActivityMasterList = async (req, res, next) => {
  try {

    // Fetch subActivity
    const subActivity = await SubActivityMaster.findAll({
      order: [["tsactm_sub_activity_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = subActivity.map((state) => ({
      value: state?.tsactm_sub_activity_id,
      label: state?.tsactm_sub_activity_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Sub Activity fetched successfully",
      data: response,
    });
  } catch (err) {    
    next(CustomErrorHandler.internalServerError(err.message));
  }
};