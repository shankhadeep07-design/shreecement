const VillagesModel = require("../../../models/masters/village.model");

var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");



module.exports.fetch_type_of_beneficiary_datatable = async (req, res, next) => {
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
                t_revenue_village.trevvlg_revenue_village_name
               FROM t_villages
               LEFT JOIN t_state ON t_state.tsl_state_id = t_villages.tvl_state_id
               LEFT JOIN t_district ON t_district.tdl_district_id = t_villages.tvl_district_id
               LEFT JOIN t_block ON t_block.tbl_block_id = t_villages.tvl_block_id
               LEFT JOIN t_grampanchayat ON t_grampanchayat.tgrm_grampanchayat_id = t_villages.tvl_grampanchayat_id
               LEFT JOIN t_revenue_village ON t_revenue_village.trevvlg_revenue_village_id = t_villages.tvl_revenue_village_id`;

    var where = `t_villages.tvl_is_active = true`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportTypeOfVillageList = async (req, res, next) => {
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
                t_revenue_village.trevvlg_revenue_village_name
               FROM t_villages
               LEFT JOIN t_state ON t_state.tsl_state_id = t_villages.tvl_state_id
               LEFT JOIN t_district ON t_district.tdl_district_id = t_villages.tvl_district_id
               LEFT JOIN t_block ON t_block.tbl_block_id = t_villages.tvl_block_id
               LEFT JOIN t_grampanchayat ON t_grampanchayat.tgrm_grampanchayat_id = t_villages.tvl_grampanchayat_id
               LEFT JOIN t_revenue_village ON t_revenue_village.trevvlg_revenue_village_id = t_villages.tvl_revenue_village_id`;

    var where = `t_villages.tvl_is_active = true`;   // ✅ fixed: was checking t_grampanchayat

    //  var where = null;
    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
module.exports.createTypeOfVillage = async function (req, res, next) {
  try {
    const {
      tvl_state_id,
      tvl_district_id,
      tvl_block_id,
      tvl_grampanchayat_id,
      tvl_revenue_village_id,
      tvl_village_name,   // ✅ already destructured, just use it below
      payload
    } = req.body;

    // Check if Village already exists for the given gram panchayat
    const existingVillage = await VillagesModel.findOne({
      where: {
        tvl_state_id,
        tvl_district_id,
        tvl_block_id,
        tvl_grampanchayat_id,
        tvl_revenue_village_id,
        tvl_village_name,   // ✅ include in duplicate check too
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
      tvl_village_name,       // ✅ added
      tvl_created_by: payload?.id
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

module.exports.updateTypeOfVillage = async (req, res, next) => {
  try {
    const {
      tvl_state_id,
      tvl_district_id,
      tvl_block_id,
      tvl_grampanchayat_id,
      tvl_revenue_village_id,
      tvl_village_name,       // ✅ added
      payload,
      tvl_village_id,
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
        tvl_village_name,       // ✅ added
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
    existingVillage.tvl_village_name = tvl_village_name;   // ✅ added
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


