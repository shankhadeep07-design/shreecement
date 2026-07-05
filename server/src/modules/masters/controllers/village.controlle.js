const VillagesModel = require("../../../models/masters/village.model");

var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
module.exports.getVillageByRevenueVillageId = async (req, res, next) => {
  try {
    const { tvl_revenue_village_id } = req.params;

    // Validate Revenue Village ID
    if (!tvl_revenue_village_id) {
      return res.status(400).json({
        status: false,
        message: "Revenue Village ID is required",
      });
    }

    // Fetch villages
    const villages = await VillagesModel.findAll({
      where: {
        tvl_revenue_village_id: tvl_revenue_village_id,
        tvl_is_active: true,
      },
      attributes: ["tvl_village_id", "tvl_village_name"],
      order: [["tvl_village_name", "ASC"]],
    });

    // Format response for dropdown
    const response = villages.map((village) => ({
      value: village?.tvl_village_id,
      label: village?.tvl_village_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Villages fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

const UnitStateDistrictModel = require("../../../models/masters/unit_state_district.model");

module.exports.getVillagesByRevenueVillageIds = async (req, res, next) => {
  try {
    const { revenue_village_ids, unit_id } = req.body;

    if (
      !Array.isArray(revenue_village_ids) ||
      revenue_village_ids.length === 0
    ) {
      return res.status(400).json({
        status: false,
        message: "Revenue Village IDs are required",
      });
    }

    let whereConditions = {
      tvl_revenue_village_id: {
        [Op.in]: revenue_village_ids,
      },
      tvl_is_active: true,
    };

    // If unit_id is provided, filter by which villages are mapped to this unit
    if (unit_id) {
      const mappedRecords = await UnitStateDistrictModel.findAll({
        where: {
          tunsd_unit_id: unit_id,
          tunsd_is_active: true,
        },
        attributes: ["tunsd_village_id"],
      });

      const mappedVillageIds = mappedRecords
        .map((r) => r.tunsd_village_id)
        .filter(Boolean);

      whereConditions.tvl_village_id = {
        [Op.in]: mappedVillageIds,
      };
    }

    const villages = await VillagesModel.findAll({
      where: whereConditions,
      attributes: ["tvl_village_id", "tvl_village_name"],
      order: [["tvl_village_name", "ASC"]],
    });

    const response = villages.map((village) => ({
      value: village?.tvl_village_id,
      label: village?.tvl_village_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Villages fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.fetch_village_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_villages.tvl_village_id,
                t_villages.tvl_state_id,
                t_villages.tvl_district_id,
                t_villages.tvl_block_id,
                t_villages.tvl_grampanchayat_id,
                t_villages.tvl_revenue_village_id,
                 t_villages.tvl_village_name,
                t_villages.tvl_is_active,
                t_state.tsl_state_name,
                t_district.tdl_district_name,
                t_block.tbl_block_name,
                t_grampanchayat.tgrm_grampanchayat_name,
                t_revenue_village.trevvlg_revenue_village_name,
                t_type_of_village.ttovill_type_of_village
               FROM t_villages
               LEFT JOIN t_state ON t_state.tsl_state_id = t_villages.tvl_state_id
               LEFT JOIN t_district ON t_district.tdl_district_id = t_villages.tvl_district_id
               LEFT JOIN t_block ON t_block.tbl_block_id = t_villages.tvl_block_id
               LEFT JOIN t_grampanchayat ON t_grampanchayat.tgrm_grampanchayat_id = t_villages.tvl_grampanchayat_id
               LEFT JOIN t_revenue_village ON t_revenue_village.trevvlg_revenue_village_id = t_villages.tvl_revenue_village_id
               LEFT JOIN t_type_of_village ON t_type_of_village.ttovill_type_village_id = t_villages.tvl_village_type
               `;

    // var where = `t_villages.tvl_is_active = true`;
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportVillageList = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_villages.tvl_village_id,
                t_villages.tvl_state_id,
                t_villages.tvl_district_id,
                t_villages.tvl_block_id,
                t_villages.tvl_grampanchayat_id,
                t_villages.tvl_revenue_village_id,
                t_villages.tvl_village_name,
                t_villages.tvl_is_active,
                t_state.tsl_state_name,
                t_district.tdl_district_name,
                t_block.tbl_block_name,
                t_grampanchayat.tgrm_grampanchayat_name,
                t_revenue_village.trevvlg_revenue_village_name,
                t_type_of_village.ttovill_type_of_village
               FROM t_villages
               LEFT JOIN t_state ON t_state.tsl_state_id = t_villages.tvl_state_id
               LEFT JOIN t_district ON t_district.tdl_district_id = t_villages.tvl_district_id
               LEFT JOIN t_block ON t_block.tbl_block_id = t_villages.tvl_block_id
               LEFT JOIN t_grampanchayat ON t_grampanchayat.tgrm_grampanchayat_id = t_villages.tvl_grampanchayat_id
               LEFT JOIN t_revenue_village ON t_revenue_village.trevvlg_revenue_village_id = t_villages.tvl_revenue_village_id
               LEFT JOIN t_type_of_village ON t_type_of_village.ttovill_type_village_id = t_villages.tvl_village_type
               `;

    // var where = `t_villages.tvl_is_active = true`; // ✅ fixed: was checking t_grampanchayat
    var where;

    //  var where = null;
    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
module.exports.createVillage = async function (req, res, next) {
  try {
    const {
      tvl_state_id,
      tvl_district_id,
      tvl_block_id,
      tvl_grampanchayat_id,
      tvl_revenue_village_id,
      tvl_village_name, // ✅ already destructured, just use it below
      tvl_village_type_id,
      payload,
    } = req.body;

    // Check if Village already exists for the given gram panchayat
    const existingVillage = await VillagesModel.findOne({
      where: {
        tvl_state_id,
        tvl_district_id,
        tvl_block_id,
        tvl_grampanchayat_id,
        tvl_revenue_village_id,
        tvl_village_name, // ✅ include in duplicate check too
        tvl_village_type: tvl_village_type_id,
      },
    });

    if (existingVillage) {
      return res.status(409).json({
        status: false,
        message: `Village already exists in this Gram Panchayat.`,
      });
    }

    // Create the new Village
    const newVillage = await VillagesModel.create({
      tvl_state_id,
      tvl_district_id,
      tvl_block_id,
      tvl_grampanchayat_id,
      tvl_revenue_village_id,
      tvl_village_name, // ✅ added
      tvl_created_by: payload?.id,
            tvl_updated_by: payload?.id,

      tvl_village_type: tvl_village_type_id,
    });

    return res.status(201).json({
      status: true,
      message: "Village created successfully",
      data: newVillage,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateVillage = async (req, res, next) => {
  try {
    const {
      tvl_state_id,
      tvl_district_id,
      tvl_block_id,
      tvl_grampanchayat_id,
      tvl_revenue_village_id,
      tvl_village_name, // ✅ added
      payload,
      tvl_village_id,
      tvl_village_type_id,
    } = req.body;

    // Check if village exists
    const existingVillage = await VillagesModel.findOne({
      where: { tvl_village_id },
    });

    if (!existingVillage) {
      return res.status(404).json({
        status: false,
        message: "Village not found",
      });
    }

    // Check for duplicate village in same gram panchayat (excluding current record)
    const duplicateVillage = await VillagesModel.findOne({
      where: {
        tvl_state_id,
        tvl_district_id,
        tvl_block_id,
        tvl_grampanchayat_id,
        tvl_revenue_village_id,
        tvl_village_name, // ✅ added
        tvl_village_type: tvl_village_type_id,
      },
    });

    if (
      duplicateVillage &&
      duplicateVillage.tvl_village_id !== tvl_village_id
    ) {
      return res.status(409).json({
        status: false,
        message: `Village already exists in this Gram Panchayat.`,
      });
    }

    // Update the Village
    existingVillage.tvl_state_id = tvl_state_id;
    existingVillage.tvl_district_id = tvl_district_id;
    existingVillage.tvl_block_id = tvl_block_id;
    existingVillage.tvl_grampanchayat_id = tvl_grampanchayat_id;
    existingVillage.tvl_revenue_village_id = tvl_revenue_village_id;
    existingVillage.tvl_village_name = tvl_village_name; // ✅ added
    existingVillage.tvl_village_type = tvl_village_type_id; // ✅ added
    existingVillage.tvl_updated_by = payload?.id;
    existingVillage.tvl_updated_at = new Date();

    await existingVillage.save();

    return res.status(200).json({
      status: true,
      message: "Village updated successfully",
      data: existingVillage,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getVillageByType = async (req, res, next) => {
  try {
    const { tvl_village_type, tvl_revenue_village_id } = req.body; // ✅ POST body

    if (!tvl_village_type) {
      return res.status(400).json({
        status: false,
        message: "Village type is required",
      });
    }

    if (!tvl_revenue_village_id) {
      return res.status(400).json({
        status: false,
        message: "Revenue Village ID is required",
      });
    }

    const villages = await VillagesModel.findAll({
      where: {
        tvl_village_type: tvl_village_type, // ✅ filter by type
        tvl_revenue_village_id: tvl_revenue_village_id, // ✅ filter by revenue village
      },
      attributes: ["tvl_village_id", "tvl_village_name"],
      order: [["tvl_village_name", "ASC"]],
    });

    const response = villages.map((village) => ({
      value: village?.tvl_village_id,
      label: village?.tvl_village_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Type wise Villages fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
