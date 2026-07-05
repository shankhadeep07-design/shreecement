var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const LocationModel = require("../../../models/masters/location.model");
const { Op } = require("sequelize");
module.exports.fetch_locations_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_location 
    LEFT JOIN t_district ON t_district.tdl_district_id = t_location.tloc_district_id 
    LEFT JOIN t_state ON t_state.tsl_state_id = t_location.tloc_state_id
    LEFT JOIN t_block ON t_block.tbl_block_id = t_location.tloc_block_id`;

    // var where = `t_location.tloc_is_active = 'true' `;
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportLocationList = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_location 
    LEFT JOIN t_district ON t_district.tdl_district_id = t_location.tloc_district_id 
    LEFT JOIN t_state ON t_state.tsl_state_id = t_location.tloc_state_id
    LEFT JOIN t_block ON t_block.tbl_block_id = t_location.tloc_block_id`;

    var where = `t_location.tloc_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createLocation = async function (req, res, next) {
  try {


    const {
      tloc_state_id,
      tloc_district_id,
      tloc_block_id,
      tloc_location_name,
      payload
    } = req.body;

    // Check if GramPanchayat name already exists for the given block
    const existingLocation = await LocationModel.findOne({
      where: {
        tloc_state_id,
        tloc_district_id,
        tloc_block_id,
        tloc_location_name: {
          [Op.iLike]: tloc_location_name,
        },
      },
    });
    if (existingLocation) {
      return res.status(409).json({
        status: false,
        message: `Location name ${tloc_location_name} already exists in this block.`,
      });
    }

    // Create the new block
    const newLocation = await LocationModel.create({
      tloc_state_id,
      tloc_district_id,
      tloc_block_id,
      tloc_location_name,
      tloc_created_by: payload?.id
    });

    return res.status(201).json({
      status: true,
      message: "Location name created successfully",
      data: newLocation,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateLocation = async (req, res, next) => {
  try {

    const {
      tloc_state_id,
      tloc_district_id,
      tloc_block_id,
      tloc_location_name,
      payload
    } = req.body;
    const { tloc_location_id } = req?.params;

    // Check if exists
    const existingLocation = await LocationModel.findOne({
      where: { tloc_location_id },
    });
    if (!existingLocation) {
      return res.status(404).json({
        status: false,
        message: "Location name not found",
      });
    }

    const duplicateLocation = await LocationModel.findOne({
      where: {
        tloc_state_id,
        tloc_district_id,
        tloc_block_id,
        tloc_location_name: {
          [Op.iLike]: tloc_location_name,
        },
      },
    });
    if (
      duplicateLocation &&
      duplicateLocation.tloc_location_id !== tloc_location_id
    ) {
      return res.status(409).json({
        status: false,
        message: `Location name ${tloc_location_name} already exists in this block.`,
      });
    }

    // Update the block
    existingLocation.tloc_state_id = tloc_state_id;
    existingLocation.tloc_district_id = tloc_district_id;
    existingLocation.tloc_block_id = tloc_block_id;
    existingLocation.tloc_location_name = tloc_location_name;
    existingLocation.tloc_updated_by = payload?.id;

    await existingLocation.save();

    return res.status(200).json({
      status: true,
      message: "Location name updated successfully",
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
          [Op.in]: sub_district_ids,   // ✅ ARRAY QUERY
        },

      },
      attributes: ["tloc_location_id", "tloc_location_name"],
      order: [["tloc_location_name", "ASC"]],
    });

    const response = locations.map(loc => ({
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