var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const GrampanchayatModel = require("../../../models/masters/grampanchayat.model");

// const GramPanchayatModel = require("../../../models/masters/gram_panchayat.model");
module.exports.getGrampanchayatByBlockId = async (req, res, next) => {
  try {
    const { tgrm_block_id } = req.params;

    // Validate Block ID
    if (!tgrm_block_id) {
      return res.status(400).json({
        status: false,
        message: "Block ID is required",
      });
    }

    // Fetch Grampanchayats by Block ID
    const grampanchayats = await GrampanchayatModel.findAll({
      where: {
        tgrm_block_id: tgrm_block_id,
        tgrm_is_active: true,
      },
      attributes: ["tgrm_grampanchayat_id", "tgrm_grampanchayat_name"],
      order: [["tgrm_grampanchayat_name", "ASC"]],
    });

    // Format response
    const response = grampanchayats.map((gp) => ({
      value: gp?.tgrm_grampanchayat_id,
      label: gp?.tgrm_grampanchayat_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Grampanchayat fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.fetch_gram_panchayat_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_grampanchayat.*,
                t_state.tsl_state_name,
                t_district.tdl_district_name,
                t_block.tbl_block_name
               FROM t_grampanchayat 
               LEFT JOIN t_district ON t_district.tdl_district_id = t_grampanchayat.tgrm_district_id 
               LEFT JOIN t_state ON t_state.tsl_state_id = t_grampanchayat.tgrm_state_id
               LEFT JOIN t_block ON t_block.tbl_block_id = t_grampanchayat.tgrm_block_id`;

    // var where = `t_grampanchayat.tgrm_is_active = true AND t_grampanchayat.tgrm_deleted_at IS NULL`;
    var where = `t_grampanchayat.tgrm_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportGramPanchayatList = async (req, res, next) => {
  try {
    var sql = `SELECT 
                t_grampanchayat.*,
                t_state.tsl_state_name,
                t_district.tdl_district_name,
                t_block.tbl_block_name
               FROM t_grampanchayat 
               LEFT JOIN t_district ON t_district.tdl_district_id = t_grampanchayat.tgrm_district_id 
               LEFT JOIN t_state ON t_state.tsl_state_id = t_grampanchayat.tgrm_state_id
               LEFT JOIN t_block ON t_block.tbl_block_id = t_grampanchayat.tgrm_block_id`;

    // var where = `t_grampanchayat.tgrm_is_active = true AND t_grampanchayat.tgrm_deleted_at IS NULL`;
    var where = `t_grampanchayat.tgrm_deleted_at IS NULL`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
module.exports.createGramPanchayat = async function (req, res, next) {
  try {
    const {
      tgrm_state_id,
      tgrm_district_id,
      tgrm_block_id,
      tgrm_grampanchayat_name,
      payload,
    } = req.body;

    // Check if GramPanchayat name already exists for the given block
    const existingLocation = await GrampanchayatModel.findOne({
      where: {
        tgrm_state_id,
        tgrm_district_id,
        tgrm_block_id,
        tgrm_grampanchayat_name: {
          [Op.iLike]: tgrm_grampanchayat_name,
        },
      },
    });

    if (existingLocation) {
      return res.status(409).json({
        status: false,
        message: `Gram Panchayat name ${tgrm_grampanchayat_name} already exists in this block.`,
      });
    }

    // Create the new Gram Panchayat
    const newLocation = await GrampanchayatModel.create({
      tgrm_state_id,
      tgrm_district_id,
      tgrm_block_id,
      tgrm_grampanchayat_name,
      tgrm_created_by: payload?.id,
      tgrm_updated_by: payload?.id,

    });

    return res.status(201).json({
      status: true,
      message: "Gram Panchayat created successfully",
      data: newLocation,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateGramPanchayat = async (req, res, next) => {
  try {
    const {
      tgrm_state_id,
      tgrm_district_id,
      tgrm_block_id,
      tgrm_grampanchayat_name,
      payload,
      tgrm_grampanchayat_id,
    } = req.body;

    // const { tgrm_grampanchayat_id } = req?.params;

    // Check if exists
    const existingLocation = await GrampanchayatModel.findOne({
      where: { tgrm_grampanchayat_id },
    });

    if (!existingLocation) {
      return res.status(404).json({
        status: false,
        message: "Gram Panchayat not found",
      });
    }

    // Check for duplicate name in same block (excluding current record)
    const duplicateLocation = await GrampanchayatModel.findOne({
      where: {
        tgrm_state_id,
        tgrm_district_id,
        tgrm_block_id,
        tgrm_grampanchayat_name: {
          [Op.iLike]: tgrm_grampanchayat_name,
        },
      },
    });

    if (
      duplicateLocation &&
      duplicateLocation.tgrm_grampanchayat_id !== tgrm_grampanchayat_id
    ) {
      return res.status(409).json({
        status: false,
        message: `Gram Panchayat name ${tgrm_grampanchayat_name} already exists in this block.`,
      });
    }

    // Update the Gram Panchayat
    existingLocation.tgrm_state_id = tgrm_state_id;
    existingLocation.tgrm_district_id = tgrm_district_id;
    existingLocation.tgrm_block_id = tgrm_block_id;
    existingLocation.tgrm_grampanchayat_name = tgrm_grampanchayat_name;
    existingLocation.tgrm_updated_by = payload?.id;
    existingLocation.tgrm_updated_at = new Date();

    await existingLocation.save();

    return res.status(200).json({
      status: true,
      message: "Gram Panchayat updated successfully",
      data: existingLocation,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
module.exports.getLocationByBlock = async (req, res, next) => {
  try {
    const { tloc_block_id } = req.params;

    // Validate ID
    if (!tloc_block_id) {
      return res.status(400).json({
        status: false,
        message: "Block ID is required",
      });
    }

    const locations = await LocationModel.findAll({
      where: { tloc_block_id },
      attributes: ["tloc_location_id", "tloc_location_name"], // Select required fields
      order: [["tloc_location_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = locations.map((location) => ({
      value: location?.tloc_location_id,
      label: location?.tloc_location_name,
    }));

    return res.status(200).json({
      status: true,
      message: "location fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getLocationByFactory = async (req, res, next) => {
  try {
    const { tloc_factory_id } = req.params;

    // Validate ID
    if (!tloc_factory_id) {
      return res.status(400).json({
        status: false,
        message: "Factory ID is required",
      });
    }

    const locations = await LocationModel.findAll({
      where: { tloc_factory_id },
      attributes: ["tloc_location_id", "tloc_location_name"], // Select required fields
      order: [["tloc_location_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = locations.map((location) => ({
      value: location?.tloc_location_id,
      label: location?.tloc_location_name,
    }));

    return res.status(200).json({
      status: true,
      message: "location fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getAllLocationList = async (req, res, next) => {
  try {
    const locations = await LocationModel.findAll({
      order: [["tloc_location_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = locations.map((loc) => ({
      value: loc?.tloc_location_id,
      label: loc?.tloc_location_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Locations fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getLocationByDistrictId = async (req, res, next) => {
  try {
    const { tloc_district_id } = req.params;

    // Validate ID
    if (!tloc_district_id) {
      return res.status(400).json({
        status: false,
        message: "District ID is required",
      });
    }

    const locations = await LocationModel.findAll({
      where: { tloc_district_id },
      attributes: ["tloc_location_id", "tloc_location_name"], // Select required fields
      order: [["tloc_location_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = locations.map((location) => ({
      value: location?.tloc_location_id,
      label: location?.tloc_location_name,
    }));

    return res.status(200).json({
      status: true,
      message: "location by district fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getLocationBySubdistrictId = async (req, res, next) => {
  try {
    const { sub_district_ids } = req.body;

    // ✅ Validation
    if (!Array.isArray(sub_district_ids) || sub_district_ids.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Sub district IDs array is required",
      });
    }

    const locations = await LocationModel.findAll({
      where: {
        tloc_block_id: {
          [Op.in]: sub_district_ids, // ✅ ARRAY QUERY
        },
      },
      attributes: ["tloc_location_id", "tloc_location_name"],
      order: [["tloc_location_name", "ASC"]],
    });

    const response = locations.map((loc) => ({
      value: loc.tloc_location_id,
      label: loc.tloc_location_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Locations fetched successfully",
      data: response,
    });
  } catch (err) {
    next(err);
  }
};
