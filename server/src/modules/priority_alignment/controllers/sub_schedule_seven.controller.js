var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");

const { Op } = require("sequelize");
const SubScheduleMaster = require("../../../models/priority_alignment/sub_schedule_master.model");

// module.exports.SubScheduleMasterDatatable = async (req, res, next) => {
//   try {
//     var sql = `SELECT * FROM t_sub_schedule_master`;

//     var where = `t_sub_schedule_master.tsubshcm_is_active = 'true' `;

//     var records = await Datatables.build(req, sql, where);

//     res.json(records);
//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };
module.exports.SubScheduleMasterDatatable = async (req, res, next) => {
  try {

    const sql = `
      SELECT
        tssm.tsubshcm_sub_schedule_id,
        tssm.tsubshcm_sub_schedule_name,
        tssm.tsubshcm_desc,
        tssm.tsubshcm_is_active,
        tssm.tsubshcm_created_at,

        tssm.tsubshcm_schedule_id,

        tss.tschm_schedule_name

      FROM t_sub_schedule_master tssm

      LEFT JOIN t_schedule_seven_master tss
        ON tss.tschm_schedule_id = tssm.tsubshcm_schedule_id
    `;

    // ✅ Recommended filter
    const where = null;

    const records = await Datatables.build(req, sql, where);

    res.json(records);

  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
// module.exports.SubScheduleMasterDatatable = async (req, res, next) => {
//   try {
//     const sql = `
//             SELECT
//                 t_sub_schedule_master.*,
//                 t_schedule_seven_master.tschm_schedule_name
//             FROM t_sub_schedule_master

//             LEFT JOIN t_schedule_seven_master
//                 ON t_schedule_seven_master.tschm_schedule_id =
//                    t_sub_schedule_master.tsubshcm_schedule_id
//         `;

//     // const where = `t_sub_schedule_master.tsubshcm_is_active = true`;
//     const where = null;


//     const records = await Datatables.build(req, sql, where);

//     res.json(records);
//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };


// module.exports.createSubScheduleMaster = async function (req, res, next) {
//   try {
//     const id = req?.params?.id;
//     // const { tfam_focus_area_name } = req?.body;
//     const {
//       tsubshcm_sub_schedule_name,
//       tsubshcm_schedule_id,
//       tsubshcm_theme_id
//     } = req.body;


//     if (!tsubshcm_sub_schedule_name || !tsubshcm_schedule_id || !tsubshcm_theme_id) {
//       return next(CustomErrorHandler.validationError("Invalid request body."));
//     }


//     if (id) {
//       const existingScheduleSeven = await SubScheduleMaster.findOne({ where: { tsubshcm_sub_schedule_id: id } });

//       if (!existingScheduleSeven) {
//         return next(CustomErrorHandler.validationError("No Schedule Seven Master found."));
//       }

//       // Check for duplicate state name
//       const duplicateState = await SubScheduleMaster.findOne({
//         where: {
//           tsubshcm_sub_schedule_name: {
//             [Op.iLike]: tfam_focus_area_name, // Case-insensitive check
//           },
//         },
//       });

//       if (duplicateState && duplicateState.tsubshcm_sub_schedule_id !== id) {
//         return res.status(409).json({
//           status: false,
//           message: "Schedule Seven Master name already exists",
//         });
//       }

//       await SubScheduleMaster.update(
//         {
//           tsubshcm_sub_schedule_name,
//           tsubshcm_schedule_id,
//           tsubshcm_theme_id
//         },
//         { where: { tsubshcm_sub_schedule_id: id } }
//       );
//       return res.json({
//         status: 1,
//         message: "Schedule Seven Master updated successfully.",
//       });

//     } else {

//       // Check for duplicate entry
//       const existingScheduleSeven = await SubScheduleMaster.findOne({
//         where: {
//           tsubshcm_sub_schedule_name: {
//             [Op.iLike]: tfam_focus_area_name,
//           },
//         },
//       });
//       if (existingScheduleSeven) {
//         return res.status(409).json({
//           status: false,
//           message: "Schedule Seven Master name already exists",
//         });
//       }

//       const newScheduleSeven = await SubScheduleMaster.create({
//         tsubshcm_sub_schedule_name,
//         tsubshcm_schedule_id,
//         tsubshcm_theme_id
//       });
//       return res.json({
//         status: 1,
//         message: "Schedule Seven Master created successfully.",
//         data: newScheduleSeven,
//       });
//     }
//   } catch (err) {
//     return next(CustomErrorHandler.databaseError(err.message));
//   }
// };

module.exports.createSubScheduleMaster = async function (req, res, next) {
  try {
    const id = req?.params?.id;
            const userId = req?.user?.[0]?.id || 0;

    const {
      tsubshcm_sub_schedule_name,
      tsubshcm_schedule_id,
      tsubshcm_desc // ✅ NEW FIELD
    } = req.body;

    // ✅ VALIDATION
    if (!tsubshcm_sub_schedule_name || !tsubshcm_schedule_id) {
      return next(CustomErrorHandler.validationError("All fields are required."));
    }

    // ================= UPDATE =================
    if (id) {

      const existingData = await SubScheduleMaster.findOne({
        where: { tsubshcm_sub_schedule_id: id }
      });

      if (!existingData) {
        return next(CustomErrorHandler.validationError("Sub Theme not found."));
      }

      // ✅ DUPLICATE CHECK (FIXED)
      const duplicate = await SubScheduleMaster.findOne({
        where: {
          tsubshcm_sub_schedule_name: {
            [Op.iLike]: tsubshcm_sub_schedule_name,
          },
          tsubshcm_schedule_id,
        },
      });

      if (duplicate && duplicate.tsubshcm_sub_schedule_id !== id) {
        return res.status(409).json({
          status: false,
          message: "Sub Theme name already exists",
        });
      }

      await SubScheduleMaster.update(
        {
          tsubshcm_sub_schedule_name,
          tsubshcm_schedule_id,
          tsubshcm_desc,
           tsubshcm_updated_by: userId,
        tsubshcm_updated_at: new Date(),
        },
        { where: { tsubshcm_sub_schedule_id: id } }
      );

      return res.json({
        status: true,
        message: "Sub Theme updated successfully.",
      });
    }

    // ================= CREATE =================

    const existingData = await SubScheduleMaster.findOne({
      where: {
        tsubshcm_sub_schedule_name: {
          [Op.iLike]: tsubshcm_sub_schedule_name,
        },
        tsubshcm_schedule_id,
      },
    });

    if (existingData) {
      return res.status(409).json({
        status: false,
        message: "Sub Theme name already exists",
      });
    }

    const newData = await SubScheduleMaster.create({
      tsubshcm_sub_schedule_name,
      tsubshcm_schedule_id,
      tsubshcm_desc,
      tsubshcm_created_by: userId,
                        tsubshcm_updated_by: userId,
    });

    return res.json({
      status: true,
      message: "Sub Theme created successfully.",
      data: newData,
    });

  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};
module.exports.getAllSubScheduleMasterList = async (req, res, next) => {
  try {
    const { schedule_id } = req.body;

    let subSchedules;

    if (schedule_id && schedule_id !== '') {
      subSchedules = await SubScheduleMaster.findAll({
        where: {
          tsubshcm_schedule_id: schedule_id, // ✅ correct column
        },
        order: [['tsubshcm_sub_schedule_name', 'ASC']],
      });
    } else {
      subSchedules = await SubScheduleMaster.findAll({
        order: [['tsubshcm_sub_schedule_name', 'ASC']],
      });
    }

    // Format response as label-value pairs
    const response = subSchedules.map((item) => ({
      value: item.tsubshcm_sub_schedule_id,
      label: item.tsubshcm_sub_schedule_name,
    }));

    return res.status(200).json({
      status: true,
      message: 'Sub Schedule fetched successfully',
      data: response,
    });

  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
module.exports.getExcelExportSubScheduleMasterList = async (req, res, next) => {
  try {

    const sql = `
      SELECT
        tssm.tsubshcm_sub_schedule_id,
        tssm.tsubshcm_sub_schedule_name,
        tssm.tsubshcm_desc,
        tssm.tsubshcm_is_active,

        tss.tschm_schedule_name

      FROM t_sub_schedule_master tssm

      LEFT JOIN t_schedule_seven_master tss
        ON tss.tschm_schedule_id = tssm.tsubshcm_schedule_id
    `;

    // ✅ Optional filter (recommended)
    const where = null;

    const records = await Datatables.build(req, sql, where);
    
    res.json(records);

  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

// module.exports.getExcelExportSubScheduleMasterList = async (req, res, next) => {
//   try {
//     var sql = `SELECT
//                 t_sub_schedule_master.*,
//                 t_schedule_seven_master.tschm_schedule_name
//             FROM t_sub_schedule_master

//             LEFT JOIN t_schedule_seven_master
//                 ON t_schedule_seven_master.tschm_schedule_id =
//                    t_sub_schedule_master.tsubshcm_schedule_id`;
//     // var where = `t_sub_schedule_master.tschm_is_active = 'true' `;
//     var where = null;


//     var records = await Datatables.build(req, sql, where);

//     res.json(records);
//   } catch (err) {
//     console.log(err);
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };