var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const FactoryMaster = require("../../../models/master_management/factory.model");
const { Op } = require("sequelize");

// module.exports.factory_master_datatable = async (req, res, next) => {
//   try {
//     var sql = `SELECT 
//     t_factory_master.*,

//     t_state.tsl_state_name,
//     t_district.tdl_district_name,
//     t_block.tbl_block_name,
//     t_location.tloc_location_name,

//     ba.tsml_sub_master_list_name AS business_area_name

// FROM t_factory_master

// LEFT JOIN t_state 
//     ON t_state.tsl_state_id = t_factory_master.tfact_state_id

// LEFT JOIN t_district 
//     ON t_district.tdl_district_id = t_factory_master.tfact_district_id

// LEFT JOIN t_block 
//     ON t_block.tbl_block_id = t_factory_master.tfact_block_id

// LEFT JOIN t_location 
//     ON t_location.tloc_location_id = t_factory_master.tfact_location_id

// LEFT JOIN t_sub_master_list AS ba
//     ON ba.tsml_id = t_factory_master.tfact_business_area_id`;

//     // var where = `t_factory_master.tfact_is_active = 'true' `;
//     var where;


//     var records = await Datatables.build(req, sql, where);

//     res.json(records);
//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };




module.exports.factory_master_datatable = async (req, res, next) => {
  try {

    var sql = `
      SELECT * FROM (
        SELECT 
          t_factory_master.*,

          t_state.tsl_state_name,
          t_district.tdl_district_name,
          t_block.tbl_block_name,
          t_location.tloc_location_name,

          ba.tsml_sub_master_list_name AS business_area_name

        FROM t_factory_master

        LEFT JOIN t_state 
          ON t_state.tsl_state_id = t_factory_master.tfact_state_id

        LEFT JOIN t_district 
          ON t_district.tdl_district_id = t_factory_master.tfact_district_id

        LEFT JOIN t_block 
          ON t_block.tbl_block_id = t_factory_master.tfact_block_id

        LEFT JOIN t_location 
          ON t_location.tloc_location_id = t_factory_master.tfact_location_id

        LEFT JOIN t_sub_master_list AS ba
          ON ba.tsml_id = t_factory_master.tfact_business_area_id

      ) AS factory_data
    `;

    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);

  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getAllFactoryList = async (req, res, next) => {
  try {

    // Fetch states
    const factory = await FactoryMaster.findAll({
      order: [["tfact_factory_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = factory.map((fact) => ({
      value: fact?.tfact_factory_id,
      label: fact?.tfact_factory_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Factory fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

// module.exports.createFactoryMaster = async function (req, res, next) {
//   try {
//     const id = req?.params?.id;
//     const { tfact_factory_name } = req?.body;

//     if (!tfact_factory_name) {
//       return next(CustomErrorHandler.validationError("Invalid request body."));
//     }


//     if (id) {
//       const existingFactory = await FactoryMaster.findOne({ where: { tfact_factory_id: id } });

//       if (!existingFactory) {
//         return next(CustomErrorHandler.validationError("No Factory Master found."));
//       }

//       // Check for duplicate factory name
//       const duplicateFactory = await FactoryMaster.findOne({
//         where: {
//           tfact_factory_name: {
//             [Op.iLike]: tfact_factory_name, // Case-insensitive check
//           },
//         },
//       });

//       if (duplicateFactory && duplicateFactory.tfact_factory_id !== id) {
//         return res.status(409).json({
//           status: false,
//           message: "Factory Master name already exists",
//         });
//       }

//       await FactoryMaster.update({ tfact_factory_name }, { where: { tfact_factory_id: id } });
//       return res.json({
//         status: 1,
//         message: "Factory Master updated successfully.",
//       });

//     } else {

//       // Check for duplicate entry
//       const existingFactory = await FactoryMaster.findOne({
//         where: {
//           tfact_factory_name: {
//             [Op.iLike]: tfact_factory_name,
//           },
//         },
//       });
//       if (existingFactory) {
//         return res.status(409).json({
//           status: false,
//           message: "Factory Master name already exists",
//         });
//       }

//       const newFactory = await FactoryMaster.create({ tfact_factory_name });
//       return res.json({
//         status: 1,
//         message: "Factory Master created successfully.",
//         data: newFactory,
//       });
//     }
//   } catch (err) {
//     return next(CustomErrorHandler.databaseError(err.message));
//   }
// };

module.exports.createFactoryMaster = async function (req, res, next) {
  try {
    const {
      tfact_state_id,
      tfact_district_id,
      tfact_block_id,
      // tfact_location_id,
      tfact_factory_name,
      tfact_business_area_id,
      payload
    } = req?.body;


    const existingFactory = await FactoryMaster.findOne({
      where: {
        tfact_state_id,
        tfact_district_id,
        tfact_block_id,
        // tfact_location_id,
        tfact_business_area_id,
        tfact_factory_name: {
          [Op.iLike]: tfact_factory_name,
        },
      },
    });
    if (existingFactory) {
      return res.status(409).json({
        status: false,
        message: `Factory name ${tfact_factory_name} already exists in this location and business area.`,
      });
    }

    // Create the new factory
    const newFactory = await FactoryMaster.create({
      tfact_state_id,
      tfact_district_id,
      tfact_block_id,
      // tfact_location_id,
      tfact_business_area_id:tfact_business_area_id,

      tfact_factory_name,
      tfact_created_by: payload?.id
    });

    // console.log('----------------',tfact_business_area_id);
    // return;
    

    return res.status(201).json({
      status: true,
      message: "Factory name created successfully",
      data: newFactory,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateFactoryMaster = async (req, res, next) => {
  try {

    const {
      tfact_state_id,
      tfact_district_id,
      tfact_block_id,
      // tfact_location_id,
      tfact_business_area_id,
      tfact_factory_name,
      payload
    } = req.body;
    const { tfact_factory_id } = req?.params;

    // Check if exists
    const existingFactory = await FactoryMaster.findOne({
      where: { tfact_factory_id },
    });
    if (!existingFactory) {
      return res.status(404).json({
        status: false,
        message: "Factory name not found",
      });
    }

    const duplicateFactory = await FactoryMaster.findOne({
      where: {
        tfact_state_id,
        tfact_district_id,
        tfact_block_id,
        // tfact_location_id,
        tfact_business_area_id,
        tfact_factory_name: {
          [Op.iLike]: tfact_factory_name,
        },
      },
    });
    if (
      duplicateFactory &&
      duplicateFactory.tfact_factory_id !== tfact_factory_id
    ) {
      return res.status(409).json({
        status: false,
        message: `Factory name ${tfact_factory_name} already exists in this location and business area.`,
      });
    }

    // Update the block
    existingFactory.tfact_state_id = tfact_state_id;
    existingFactory.tfact_district_id = tfact_district_id;
    existingFactory.tfact_block_id = tfact_block_id;
    // existingFactory.tfact_location_id = tfact_location_id;
    existingFactory.tfact_business_area_id = tfact_business_area_id;

    existingFactory.tfact_factory_name = tfact_factory_name;
    existingFactory.tfact_updated_by = payload?.id;

    await existingFactory.save();

    return res.status(200).json({
      status: true,
      message: "Factory name updated successfully",
      data: existingFactory,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};


module.exports.getExcelExportFactoryMasterList = async (req, res, next) => {
  try {
    var sql = `SELECT 
    t_factory_master.*,

    t_state.tsl_state_name,
    t_district.tdl_district_name,
    t_block.tbl_block_name,
    t_location.tloc_location_name,

    ba.tsml_sub_master_list_name AS business_area_name

FROM t_factory_master

LEFT JOIN t_state 
    ON t_state.tsl_state_id = t_factory_master.tfact_state_id

LEFT JOIN t_district 
    ON t_district.tdl_district_id = t_factory_master.tfact_district_id

LEFT JOIN t_block 
    ON t_block.tbl_block_id = t_factory_master.tfact_block_id

LEFT JOIN t_location 
    ON t_location.tloc_location_id = t_factory_master.tfact_location_id

LEFT JOIN t_sub_master_list AS ba
    ON ba.tsml_id = t_factory_master.tfact_business_area_id
   

    `;
    var where = `t_factory_master.tfact_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.getFactoryByLocation = async (req, res, next) => {
  try {
    const { tfact_location_id } = req?.params;

    // Validate ID
    if (!tfact_location_id) {
      return res.status(400).json({
        status: false,
        message: "Location ID is required",
      });
    }

    const factorys = await FactoryMaster.findAll({
      where: { tfact_location_id },
      attributes: ["tfact_factory_id", "tfact_factory_name"], // Select required fields
      order: [["tfact_factory_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = factorys.map((location) => ({
      value: location?.tfact_factory_id,
      label: location?.tfact_factory_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Factory fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getFactoryByDistrictId = async (req, res, next) => {
  try {
    let districtIds = req.body;

    console.log("Raw districtIds:", districtIds);
    console.log("Is array:", Array.isArray(districtIds));

    if (!Array.isArray(districtIds) || districtIds.length === 0) {
      return res.status(400).json({
        status: false,
        message: "District ID(s) required",
      });
    }

    const whereCondition =
      districtIds.length === 1
        ? { tfact_block_id: districtIds[0] }
        : { tfact_block_id: { [Op.in]: districtIds } };

    const factories = await FactoryMaster.findAll({
      where: whereCondition,
      order: [["tfact_factory_name", "ASC"]],
    });

    return res.status(200).json({
      status: true,
      data: factories,
    });
  } catch (err) {
    next(err);
  }
};

