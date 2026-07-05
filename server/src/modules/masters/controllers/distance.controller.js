const VillagesModel = require("../../../models/masters/village.model");

var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const DistanceModel = require("../../../models/masters/distance.model");

module.exports.fetch_distance_datatable = async (req, res, next) => {
  try {
    // var sql = `SELECT
    //             t_distance.tdis_distance_id,
    //             t_distance.tdis_distance_id,
    //             t_distance.tdis_state_id,
    //             t_distance.tdis_district_id,
    //             t_distance.tdis_block_id,
    //             t_distance.tdis_grampanchayat_id,
    //             t_distance.tdis_revenue_village_id,
    //             t_distance.tdis_village_id,
    //             t_distance.tdis_village_type_id,
    //             t_distance.tdis_value,
    //             t_distance.tdis_is_active,
    //             t_state.tsl_state_name,
    //             t_district.tdl_district_name,
    //             t_block.tbl_block_name,
    //             t_grampanchayat.tgrm_grampanchayat_name,
    //             t_revenue_village.trevvlg_revenue_village_name,
    //             t_villages.tvl_village_name
    //            FROM t_distance
    //            LEFT JOIN t_state        ON t_state.tsl_state_id                         = t_distance.tdis_state_id
    //            LEFT JOIN t_district     ON t_district.tdl_district_id                   = t_distance.tdis_district_id
    //            LEFT JOIN t_block        ON t_block.tbl_block_id                         = t_distance.tdis_block_id
    //            LEFT JOIN t_grampanchayat ON t_grampanchayat.tgrm_grampanchayat_id       = t_distance.tdis_grampanchayat_id
    //            LEFT JOIN t_revenue_village ON t_revenue_village.trevvlg_revenue_village_id = t_distance.tdis_revenue_village_id
    //            LEFT JOIN t_villages     ON t_villages.tvl_village_id                    = t_distance.tdis_village_id`;

    var sql = `SELECT 
    t_distance.tdis_distance_id,
    t_distance.tdis_state_id,
    t_distance.tdis_district_id,
    t_distance.tdis_block_id,
    t_distance.tdis_grampanchayat_id,
    t_distance.tdis_revenue_village_id,
    t_distance.tdis_village_id,
    t_distance.tdis_village_type_id,
    t_distance.tdis_value,
    t_distance.tdis_is_active,

    t_state.tsl_state_name,
    t_district.tdl_district_name,
    t_block.tbl_block_name,
    t_grampanchayat.tgrm_grampanchayat_name,
    t_revenue_village.trevvlg_revenue_village_name,
    t_villages.tvl_village_name,

    -- 🔥 NEW FIELD
    t_type_of_village.ttovill_type_of_village

FROM t_distance

LEFT JOIN t_state 
  ON t_state.tsl_state_id = t_distance.tdis_state_id

LEFT JOIN t_district 
  ON t_district.tdl_district_id = t_distance.tdis_district_id

LEFT JOIN t_block 
  ON t_block.tbl_block_id = t_distance.tdis_block_id

LEFT JOIN t_grampanchayat 
  ON t_grampanchayat.tgrm_grampanchayat_id = t_distance.tdis_grampanchayat_id

LEFT JOIN t_revenue_village 
  ON t_revenue_village.trevvlg_revenue_village_id = t_distance.tdis_revenue_village_id

LEFT JOIN t_villages 
  ON t_villages.tvl_village_id = t_distance.tdis_village_id

-- ✅ NEW JOIN
LEFT JOIN t_type_of_village 
  ON t_type_of_village.ttovill_type_village_id = t_distance.tdis_village_type_id
`;
    var where = `t_distance.tdis_is_active = true`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportDistanceList = async (req, res, next) => {
  try {
    // var sql = `SELECT
    //             t_distance.tdis_distance_id,
    //             t_distance.tdis_state_id,
    //             t_distance.tdis_district_id,
    //             t_distance.tdis_block_id,
    //             t_distance.tdis_grampanchayat_id,
    //             t_distance.tdis_revenue_village_id,
    //             t_distance.tdis_village_id,
    //             t_distance.tdis_village_type_id,
    //             t_distance.tdis_value,
    //             t_distance.tdis_is_active,
    //             t_state.tsl_state_name,
    //             t_district.tdl_district_name,
    //             t_block.tbl_block_name,
    //             t_grampanchayat.tgrm_grampanchayat_name,
    //             t_revenue_village.trevvlg_revenue_village_name,
    //             t_villages.tvl_village_name
    //            FROM t_distance
    //            LEFT JOIN t_state        ON t_state.tsl_state_id                            = t_distance.tdis_state_id
    //            LEFT JOIN t_district     ON t_district.tdl_district_id                      = t_distance.tdis_district_id
    //            LEFT JOIN t_block        ON t_block.tbl_block_id                            = t_distance.tdis_block_id
    //            LEFT JOIN t_grampanchayat ON t_grampanchayat.tgrm_grampanchayat_id          = t_distance.tdis_grampanchayat_id
    //            LEFT JOIN t_revenue_village ON t_revenue_village.trevvlg_revenue_village_id = t_distance.tdis_revenue_village_id
    //            LEFT JOIN t_villages     ON t_villages.tvl_village_id                       = t_distance.tdis_village_id`;

    var sql = `SELECT 
    t_distance.tdis_distance_id,
    t_distance.tdis_state_id,
    t_distance.tdis_district_id,
    t_distance.tdis_block_id,
    t_distance.tdis_grampanchayat_id,
    t_distance.tdis_revenue_village_id,
    t_distance.tdis_village_id,
    t_distance.tdis_village_type_id,
    t_distance.tdis_value,
    t_distance.tdis_is_active,

    t_state.tsl_state_name,
    t_district.tdl_district_name,
    t_block.tbl_block_name,
    t_grampanchayat.tgrm_grampanchayat_name,
    t_revenue_village.trevvlg_revenue_village_name,
    t_villages.tvl_village_name,

    COALESCE(t_type_of_village.ttovill_type_of_village, '-') AS village_type

FROM t_distance

LEFT JOIN t_state 
  ON t_state.tsl_state_id = t_distance.tdis_state_id

LEFT JOIN t_district 
  ON t_district.tdl_district_id = t_distance.tdis_district_id

LEFT JOIN t_block 
  ON t_block.tbl_block_id = t_distance.tdis_block_id

LEFT JOIN t_grampanchayat 
  ON t_grampanchayat.tgrm_grampanchayat_id = t_distance.tdis_grampanchayat_id

LEFT JOIN t_revenue_village 
  ON t_revenue_village.trevvlg_revenue_village_id = t_distance.tdis_revenue_village_id

LEFT JOIN t_villages 
  ON t_villages.tvl_village_id = t_distance.tdis_village_id

LEFT JOIN t_type_of_village 
  ON t_type_of_village.ttovill_type_village_id = t_distance.tdis_village_type_id
`;

    var where = `t_distance.tdis_is_active = true`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createDistance = async function (req, res, next) {
  try {
    const {
      tdis_state_id,
      tdis_district_id,
      tdis_block_id,
      tdis_grampanchayat_id,
      tdis_revenue_village_id,
      tdis_village_id,
      tdis_village_type_id,
      tdis_value,
      payload,
    } = req.body;

    // Check if distance record already exists for the same village + type
    const existingDistance = await DistanceModel.findOne({
      where: {
        tdis_state_id,
        tdis_district_id,
        tdis_block_id,
        tdis_grampanchayat_id,
        tdis_revenue_village_id,
        tdis_village_id,
        tdis_village_type_id,
      },
    });

    // if (existingDistance) {
    //   return res.status(409).json({
    //     status: false,
    //     message: `Distance record already exists for this Village and Type.`,
    //   });
    // }

    // Create the new Distance record
    const newDistance = await DistanceModel.create({
      tdis_state_id,
      tdis_district_id,
      tdis_block_id,
      tdis_grampanchayat_id,
      tdis_revenue_village_id,
      tdis_village_id,
      tdis_village_type_id,
      tdis_value,
      tdis_created_by: payload?.id,
    });

    return res.status(201).json({
      status: true,
      message: "Distance created successfully",
      data: newDistance,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateDistance = async (req, res, next) => {
  try {
    const {
      tdis_distance_id,
      tdis_state_id,
      tdis_district_id,
      tdis_block_id,
      tdis_grampanchayat_id,
      tdis_revenue_village_id,
      tdis_village_id,
      tdis_village_type_id,
      tdis_value,
      payload,
    } = req.body;

    // Check if distance record exists
    const existingDistance = await DistanceModel.findOne({
      where: { tdis_distance_id },
    });

    if (!existingDistance) {
      return res.status(404).json({
        status: false,
        message: "Distance record not found",
      });
    }

    // Check for duplicate (excluding current record)
    const duplicateDistance = await DistanceModel.findOne({
      where: {
        tdis_state_id,
        tdis_district_id,
        tdis_block_id,
        tdis_grampanchayat_id,
        tdis_revenue_village_id,
        tdis_village_id,
        tdis_village_type_id,
      },
    });

    // if (duplicateDistance && duplicateDistance.tdis_distance_id !== tdis_distance_id) {
    //   return res.status(409).json({
    //     status: false,
    //     message: `Distance record already exists for this Village and Type.`,
    //   });
    // }

    // Update the Distance record
    existingDistance.tdis_state_id = tdis_state_id;
    existingDistance.tdis_district_id = tdis_district_id;
    existingDistance.tdis_block_id = tdis_block_id;
    existingDistance.tdis_grampanchayat_id = tdis_grampanchayat_id;
    existingDistance.tdis_revenue_village_id = tdis_revenue_village_id;
    existingDistance.tdis_village_id = tdis_village_id;
    existingDistance.tdis_village_type_id = tdis_village_type_id;
    existingDistance.tdis_value = tdis_value;
    existingDistance.tdis_updated_by = payload?.id;
    existingDistance.tdis_updated_at = new Date();

    await existingDistance.save();

    return res.status(200).json({
      status: true,
      message: "Distance updated successfully",
      data: existingDistance,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getDistanceByStateDistrictList = async (req, res, next) => {
  try {
    const { tdis_state_id, tdis_district_id } = req.body;

    if (!tdis_state_id || !tdis_district_id) {
      return res.status(400).json({
        status: false,
        message: "State ID and District ID are required",
      });
    }

    const distances = await DistanceModel.findAll({
      where: {
        tdis_state_id,
        tdis_district_id,
        // tdis_is_active: true,
      },
      attributes: ["tdis_value"],
      group: ["tdis_value"],
      order: [["tdis_value", "ASC"]],
    });

    const response = distances.map((d) => ({
      value: d.tdis_value,
      label: `${d.tdis_value}`,
    }));

    return res.status(200).json({
      status: true,
      message: "Distances fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
