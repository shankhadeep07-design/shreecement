var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const StateModel = require("../../../models/masters/state.model");
const DistrictModel = require("../../../models/masters/district.model");
const BlockModel = require("../../../models/masters/block.model");
const { Op } = require("sequelize");

module.exports.fetch_blocks_datatable = async (req, res, next) => {
  try {
    var sql = `select * from t_block 
            LEFT JOIN t_district ON t_district.tdl_district_id = t_block.tbl_district_id 
            LEFT JOIN t_state ON t_state.tsl_state_id = t_district.tdl_state_id`;

    // var where = ` t_block.tbl_is_active = 'true' `;
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      }),
    );
  }
};

module.exports.createBlock = async function (req, res, next) {
  try {
    const { tbl_block_name, tbl_state_id, tbl_district_id, payload } = req.body;

    // Check if state exists
    const existingState = await StateModel.findOne({
      where: { tsl_state_id: tbl_state_id },
    });
    if (!existingState) {
      return res.status(404).json({
        status: false,
        message: "State name not found",
      });
    }

    // Check if district exists
    const existingDistrict = await DistrictModel.findOne({
      where: { tdl_district_id: tbl_district_id, tdl_state_id: tbl_state_id },
    });
    if (!existingDistrict) {
      return res.status(404).json({
        status: false,
        message: "District name not found for the given state.",
      });
    }

    // Check if block name already exists for the given district
    const existingBlock = await BlockModel.findOne({
      where: {
        tbl_state_id,
        tbl_district_id,
        tbl_block_name: {
          [Op.iLike]: tbl_block_name,
        },
      },
    });
    if (existingBlock) {
      return res.status(409).json({
        status: false,
        message: `Block name ${tbl_block_name} already exists in this district.`,
      });
    }

    // Create the new block
    const newBlock = await BlockModel.create({
      tbl_block_name,
      tbl_state_id,
      tbl_district_id,
      tbl_created_by: payload?.id,
            tbl_updated_by: payload?.id,

    });

    return res.status(201).json({
      status: true,
      message: "Block name created successfully",
      data: newBlock,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateBlock = async function (req, res, next) {
  try {
    const { tbl_block_name, tbl_district_id, tbl_state_id, payload } = req.body;
    const { tbl_block_id } = req?.params; // Block ID from URL params

    if (!tbl_block_id) {
      return res.status(404).json({
        status: false,
        message: "Block ID not found",
      });
    }

    // Check if the block exists
    const existingBlock = await BlockModel.findOne({
      where: { tbl_block_id },
    });
    if (!existingBlock) {
      return res.status(404).json({
        status: false,
        message: "Block name not found",
      });
    }

    // Check if the state exists
    const existingState = await StateModel.findOne({
      where: { tsl_state_id: tbl_state_id },
    });
    if (!existingState) {
      return res.status(404).json({
        status: false,
        message: "State name not found",
      });
    }

    // Check if the district exists and belongs to the provided state
    const existingDistrict = await DistrictModel.findOne({
      where: {
        tdl_district_id: tbl_district_id,
        tdl_state_id: tbl_state_id,
      },
    });
    if (!existingDistrict) {
      return res.status(404).json({
        status: false,
        message:
          "District name not found or does not belong to the given state.",
      });
    }

    // Check for duplicate block names in the same district
    const duplicateBlock = await BlockModel.findOne({
      where: {
        tbl_state_id,
        tbl_district_id,
        tbl_block_name: {
          [Op.iLike]: tbl_block_name,
        },
      },
    });
    if (duplicateBlock && duplicateBlock.tbl_block_id !== tbl_block_id) {
      return res.status(409).json({
        status: false,
        message: `Block name ${tbl_block_name} already exists in this district.`,
      });
    }

    // Update the block
    existingBlock.tbl_block_name = tbl_block_name;
    existingBlock.tbl_district_id = tbl_district_id;
    existingBlock.tbl_state_id = tbl_state_id;
    existingBlock.tbl_updated_by = payload?.id;
        existingBlock.tbl_updated_at =new Date();


    await existingBlock.save();

    return res.status(200).json({
      status: true,
      message: "Block name updated successfully",
      data: existingBlock,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getExcelExportBlockList = async (req, res, next) => {
  try {
    var sql = `select * from t_block 
            LEFT JOIN t_district ON t_district.tdl_district_id = t_block.tbl_district_id 
            LEFT JOIN t_state ON t_state.tsl_state_id = t_district.tdl_state_id`;

    // var where = ` t_block.tbl_is_active = 'true' `;
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

// module.exports.getBlocksByDistrict = async (req, res, next) => {
//     try {
//         // 🔍 Debug (you can remove later)
//         console.log("Query:", req.query);
//         console.log("Body keys:", Object.keys(req.body));

//         // ✅ 1️⃣ READ ONLY district_ids
//         let districtIds = req.body.district_ids;

//         console.log("districtIds:", districtIds);

//         // ✅ 2️⃣ Normalize
//         if (typeof districtIds === "string") {
//             districtIds = [districtIds];
//         }

//         if (!Array.isArray(districtIds)) {
//             return res.status(400).json({
//                 status: false,
//                 message: "district_ids must be an array",
//             });
//         }

//         // ✅ 3️⃣ Clean
//         districtIds = districtIds.filter(Boolean);

//         // ✅ 4️⃣ Validation
//         if (districtIds.length === 0) {
//             return res.status(400).json({
//                 status: false,
//                 message: "District ID(s) required",
//             });
//         }

//         // ✅ 5️⃣ Sequelize query
//         const whereCondition =
//             districtIds.length === 1
//                 ? { tbl_district_id: districtIds[0] }
//                 : { tbl_district_id: { [Op.in]: districtIds } };

//         const blocks = await BlockModel.findAll({
//             where: whereCondition,
//             attributes: ["tbl_block_id", "tbl_block_name"],
//             order: [["tbl_block_name", "ASC"]],
//         });

//         // ✅ 6️⃣ Response
//         return res.status(200).json({
//             status: true,
//             message: "Blocks fetched successfully",
//             data: blocks.map(b => ({
//                 value: b.tbl_block_id,
//                 label: b.tbl_block_name,
//             })),
//         });

//     } catch (err) {
//         next(CustomErrorHandler.databaseError(err.message));
//     }
// };

module.exports.getBlocksByDistrictForProposalCreationWithOutLabelValuePair =
  async (req, res) => {
    try {
      const district_id = req.params.tbl_district_id;
      if (!district_id) {
        return res.json({
          status: false,
          message: "district_id is required",
        });
      }
      const blocks = await BlockModel.findAll({
        where: {
          tbl_district_id: district_id, // ✅ SINGLE VALUE ONLY
        },
      });
      return res.json({
        status: true,
        data: blocks,
      });
    } catch (err) {
      return res.json({
        status: false,
        message: "Something went wrong",
      });
    }
  };

module.exports.getBlocksByDistrictForProposalCreation = async (req, res) => {
  try {
    const district_id = req.params.tbl_district_id;

    if (!district_id) {
      return res.json({
        status: false,
        message: "district_id is required",
      });
    }

    const blocks = await BlockModel.findAll({
      where: {
        tbl_district_id: district_id,
        tbl_is_active: true,
      },
      attributes: ["tbl_block_id", "tbl_block_name"],
    });

    // ✅ Transform into value-label structure
    const formattedData = blocks.map((block) => ({
      value: block.tbl_block_id,
      label: block.tbl_block_name?.trim(),
    }));

    return res.json({
      status: true,
      message: "Blocks fetched successfully",
      data: formattedData,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      status: false,
      message: "Something went wrong",
    });
  }
};

module.exports.getBlockByDistrictForProposalCreation = async (
  req,
  res,
  next,
) => {
  try {
    const { tbl_district_id } = req.params;

    // Validate state ID
    if (!tbl_district_id) {
      return res.status(400).json({
        status: false,
        message: "District ID is required",
      });
    }

    // Fetch districts by state ID
    const blocks = await BlockModel.findAll({
      where: { tbl_district_id },
      attributes: ["tbl_block_id", "tbl_block_name"],
      order: [["tbl_block_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = blocks.map((block) => ({
      value: block?.tbl_block_id,
      label: block?.tbl_block_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Blocks fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getBlocksByDistrict = async (req, res, next) => {
  try {
    // 🔍 Debug (you can remove later)
    console.log("Query:", req.query);
    console.log("Body keys:", Object.keys(req.body));

    // ✅ 1️⃣ READ ONLY district_ids
    let districtIds = req.body.district_ids;

    console.log("districtIds:", districtIds);

    // ✅ 2️⃣ Normalize
    if (typeof districtIds === "string") {
      districtIds = [districtIds];
    }

    if (!Array.isArray(districtIds)) {
      return res.status(400).json({
        status: false,
        message: "district_ids must be an array",
      });
    }

    // ✅ 3️⃣ Clean
    districtIds = districtIds.filter(Boolean);

    // ✅ 4️⃣ Validation
    if (districtIds.length === 0) {
      return res.status(400).json({
        status: false,
        message: "District ID(s) required",
      });
    }

    // ✅ 5️⃣ Sequelize query
    const whereCondition =
      districtIds.length === 1
        ? { tbl_district_id: districtIds[0] }
        : { tbl_district_id: { [Op.in]: districtIds } };

    const blocks = await BlockModel.findAll({
      where: whereCondition,
      attributes: ["tbl_block_id", "tbl_block_name", "tbl_district_id"],
      order: [["tbl_block_name", "ASC"]],
    });

    // ✅ 6️⃣ Response
    return res.status(200).json({
      status: true,
      message: "Blocks fetched successfully",
      data: blocks.map((b) => ({
        value: b.tbl_block_id,
        label: b.tbl_block_name,
        districtId: b.tbl_district_id, // 🔥 ADD THIS
      })),
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
