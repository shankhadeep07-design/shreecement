var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const ScheduleSevenMaster = require("../../../models/priority_alignment/schedule_seven.model");
const { Op } = require("sequelize");
const SubScheduleMaster = require("../../../models/priority_alignment/sub_schedule_master.model");

module.exports.scheduleSevenMasterDatatable = async (req, res, next) => {
  try {
    var sql = `SELECT 
  tssm.*,
  tm.tthm_theme_name
FROM t_schedule_seven_master tssm
LEFT JOIN t_theme_master tm 
  ON tm.tthm_theme_id = tssm.tschm_theme_id`;

    // var where = `t_schedule_seven_master.tschm_is_active = 'true' `;
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createScheduleSevenMaster = async function (req, res, next) {
  try {
    const id = req?.params?.id;
    const {
      tschm_schedule_name,
      schedule_vii_line_item,
      sub_activity_item_number,
      sub_activity_description,
      // tschm_theme_id,
    } = req.body;
            const userId = req?.user?.[0]?.id || 0;

    if (!tschm_schedule_name) {
      return next(CustomErrorHandler.validationError("Invalid request body."));
    }

    if (id) {
      const existingScheduleSeven = await ScheduleSevenMaster.findOne({
        where: { tschm_schedule_id: id },
      });

      if (!existingScheduleSeven) {
        return next(
          CustomErrorHandler.validationError("No Schedule Seven Master found."),
        );
      }

      // Check for duplicate state name
      const duplicateState = await ScheduleSevenMaster.findOne({
        where: {
          tschm_schedule_name: {
            [Op.iLike]: tschm_schedule_name, // Case-insensitive check
          },
        },
      });

      if (duplicateState && duplicateState.tschm_schedule_id !== id) {
        return res.status(409).json({
          status: false,
          message: "Item number already exists",
        });
      }

      await ScheduleSevenMaster.update(
        {
          tschm_schedule_name,
          // tschm_theme_id,
          tschm_schedule_vii_line_item: schedule_vii_line_item,
          tschm_sub_activity_item_number: sub_activity_item_number,
          tschm_sub_activity_description: sub_activity_description,
          tschm_updated_by: userId,
                          tschm_updated_at:  new Date(),
        },
        { where: { tschm_schedule_id: id } },
      );

      return res.json({
        status: 1,
        message: "Thematic Area Master updated successfully.",
      });
    } else {
      // Check for duplicate entry
      const existingScheduleSeven = await ScheduleSevenMaster.findOne({
        where: {
          tschm_schedule_name: {
            [Op.iLike]: tschm_schedule_name,
          },
        },
      });
      if (existingScheduleSeven) {
        return res.status(409).json({
          status: false,
          message: "Item number already exists",
        });
      }

      const newScheduleSeven = await ScheduleSevenMaster.create({
        tschm_schedule_name,
        // tschm_theme_id,
        tschm_schedule_vii_line_item: schedule_vii_line_item,
        tschm_sub_activity_item_number: sub_activity_item_number,
        tschm_sub_activity_description: sub_activity_description,
         tschm_updated_by: userId,
        tschm_created_by: userId,
      });

      return res.json({
        status: 1,
        message: "Thematic Area Master created successfully.",
        data: newScheduleSeven,
      });
    }
  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getAllScheduleSevenMasterList = async (req, res, next) => {
  try {
    // Fetch scheduleSeven
    const scheduleSeven = await ScheduleSevenMaster.findAll({
      order: [["tschm_schedule_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = scheduleSeven.map((state) => ({
      value: state?.tschm_schedule_id,
      label: state?.tschm_schedule_name,
      line_item: state?.tschm_schedule_vii_line_item,
      sub_activity: state?.tschm_sub_activity_item_number,
    }));

    return res.status(200).json({
      status: true,
      message: "Schedule Seven fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportScheduleSevenMasterList = async (
  req,
  res,
  next,
) => {
  try {
    var sql = `SELECT 
  tssm.*,
  tm.tthm_theme_name
FROM t_schedule_seven_master tssm
LEFT JOIN t_theme_master tm 
  ON tm.tthm_theme_id = tssm.tschm_theme_id`;
    // var where = `tssm.tschm_is_active = true `;
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getScheduleSevenByTheme = async (req, res, next) => {
  try {
    const { theme_id } = req.params;

    if (!theme_id) {
      return res.status(400).json({
        status: false,
        message: "Theme ID is required",
      });
    }

    const schedules = await ScheduleSevenMaster.findAll({
      where: {
        tschm_theme_id: theme_id,
        tschm_is_active: true,
      },
      attributes: ["tschm_schedule_id", "tschm_schedule_name"],
      order: [["tschm_schedule_name", "ASC"]],
    });

    const response = schedules.map((item) => ({
      value: item?.tschm_schedule_id,
      label: item?.tschm_schedule_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Schedule Seven list fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getSubScheduleBySchedule = async (req, res, next) => {
  try {
    const { schedule_id } = req.params;

    // Validate Schedule ID
    if (!schedule_id) {
      return res.status(400).json({
        status: false,
        message: "Schedule ID is required",
      });
    }

    // Fetch sub schedules by schedule ID
    const subSchedules = await SubScheduleMaster.findAll({
      where: {
        tsubshcm_schedule_id: schedule_id,
        tsubshcm_is_active: true,
      },
      attributes: ["tsubshcm_sub_schedule_id", "tsubshcm_sub_schedule_name"],
      order: [["tsubshcm_sub_schedule_name", "ASC"]],
    });

    // Format response
    const response = subSchedules.map((item) => ({
      value: item?.tsubshcm_sub_schedule_id,
      label: item?.tsubshcm_sub_schedule_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Sub Schedule fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
