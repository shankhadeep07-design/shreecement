var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const StateModel = require("../../../models/masters/state.model");
const DistrictModel = require("../../../models/masters/district.model");
const { Op } = require("sequelize");


module.exports.fetch_districts_datatable = async (req, res, next) => {
     try {
    var sql = `select * from t_district inner join t_state on t_state.tsl_state_id = t_district.tdl_state_id`;
    // var where = ` t_district.tdl_is_active = 'true' `;
     var where;
    // var data = getAllDatatable(req, sql);
    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      })
    );
  }
};

module.exports.createDistrict = async function (req, res, next) {
  try {
    

    const { tdl_district_name, tdl_state_id, payload } = req.body;

    // Check if state exists
    const existingState = await StateModel.findOne({
      where: { tsl_state_id: tdl_state_id },
    });
    if (!existingState) {
      return res.status(404).json({
        status: false,
        message: "State name not found",
      });
    }

    // Check if district name already exists for the given state
    const existingDistrict = await DistrictModel.findOne({
      where: {
        tdl_state_id,
        tdl_district_name: {
          [Op.iLike]: tdl_district_name,
        },
      },
    });
    if (existingDistrict) {
      return res.status(409).json({
        status: false,
        message: `District name ${tdl_district_name} already exists in this state.`,
      });
    }

    // Create the new district
    const newDistrict = await DistrictModel.create({
      tdl_district_name,
      tdl_state_id,
      tdl_created_by: payload?.id,
      tdl_updated_by: payload?.id

    });

    return res.status(201).json({
      status: true,
      message: "District name created successfully",
      data: newDistrict,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateDistrict = async (req, res, next) => {
  try {
    
    const { tdl_district_id } = req.params; // District ID
    const { tdl_district_name, tdl_state_id, payload } = req.body;

    if (!tdl_district_id) {
      return res.status(404).json({
        status: false,
        message: "District ID not found",
      });
    }

    // Check if state exists
    const existingState = await StateModel.findOne({
      where: { tsl_state_id: tdl_state_id },
    });
    if (!existingState) {
      return res.status(404).json({
        status: false,
        message: "State name not found",
      });
    }

    // Check if district exists
    const existingDistrict = await DistrictModel.findOne({
      where: { tdl_district_id },
    });
    if (!existingDistrict) {
      return res.status(404).json({
        status: false,
        message: "District name not found",
      });
    }

    // Check if the updated district name already exists in the same state
    const duplicateDistrict = await DistrictModel.findOne({
      where: {
        tdl_state_id,
        tdl_district_name: {
          [Op.iLike]: tdl_district_name,
        },
      },
    });

    if (
      duplicateDistrict &&
      duplicateDistrict?.tdl_district_id != tdl_district_id
    ) {
      return res.status(409).json({
        status: false,
        message: `District name ${tdl_district_name} already exists in this state.`,
      });
    }

    // Update the district
    existingDistrict.tdl_district_name = tdl_district_name;
    existingDistrict.tdl_state_id = tdl_state_id;
    existingDistrict.tdl_updated_by = payload?.id;
        existingDistrict.tdl_updated_at = new Date();

    await existingDistrict.save();

    return res.status(200).json({
      status: true,
      message: "District name updated successfully",
      data: existingDistrict,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getExcelExportDistrictList = async (req, res, next) => {
  try {
    var sql = `select * from t_district inner join t_state on t_state.tsl_state_id = t_district.tdl_state_id`;
    // var where = ` t_district.tdl_is_active = 'true' `;
        var where;


    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
     next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getDistrictsByState = async (req, res, next) => {
  try {
    const { tdl_state_id } = req.params; 

    // Validate state ID
    if (!tdl_state_id) {
      return res.status(400).json({
        status: false,
        message: "State ID is required",
      });
    }

    // Fetch districts by state ID
    const districts = await DistrictModel.findAll({
      where: { tdl_state_id },
      attributes: ["tdl_district_id", "tdl_district_name"], 
      order: [["tdl_district_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = districts.map((district) => ({
      value: district?.tdl_district_id,
      label: district?.tdl_district_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Districts fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getDistrictsListByState = async function (req, res, next) {
  let state_ids = req?.body?.state_ids; // Assuming this is an array of IDs

  // 🔐 Ensure it's an array (even if a single value is passed)
  if (typeof state_ids === "string") {
    try {
      state_ids = JSON.parse(state_ids); // In case it's a JSON string
    } catch {
      state_ids = [state_ids]; // Fallback if it's a single value
    }
  }

   if (!Array.isArray(state_ids)) {
    state_ids = [state_ids]; // Normalize to array
  }

  if (state_ids && state_ids.length > 0) {
    try {
      // Join the array values with commas and wrap each one with single quotes
      const formattedStateIds = state_ids.map((id) => `'${id}'`).join(",");
      const sql = `SELECT tdl_district_id, tdl_district_name,tdl_state_id FROM t_district WHERE tdl_state_id IN (${formattedStateIds})`;

      const districsDetails = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      });

      // console.log("districsDetails----------- ",districsDetails);
      
      if (districsDetails.length > 0) {
        // Send the response with status 200
        return res.status(200).json({
          status: 1,
          message: "District lists fetched successfully",
          data: districsDetails,
        });
      } else {
        // Send a response indicating no data found
        return res.status(200).json({
          status: 0,
          message: "No data found",
          data: [],
        });
      }
    } catch (error) {
      // Pass the error to the error handler
      return next(error);
    }
  } else {
    // Send a response if `state_ids` is empty or invalid
    return res.status(400).json({
      status: 0,
      message: "Region IDs cannot be empty",
    });
  }
};


