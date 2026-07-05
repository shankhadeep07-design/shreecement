
var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const GrampanchayatModel = require("../../../models/masters/grampanchayat.model");
const RevenueVillageModel = require("../../../models/masters/revenue_village.model");
const BlockModel = require("../../../models/masters/block.model");
const DistrictModel = require("../../../models/masters/district.model");
const StateModel = require("../../../models/masters/state.model");
module.exports.getRevenueVillageByGrampanchayatId = async (req, res, next) => {
  try {
    const { trevvlg_grampanchayat_id } = req.params;

    // Validate Grampanchayat ID
    if (!trevvlg_grampanchayat_id) {
      return res.status(400).json({
        status: false,
        message: "Grampanchayat ID is required",
      });
    }

    // Fetch Revenue Villages
    const villages = await RevenueVillageModel.findAll({
      where: {
        trevvlg_grampanchayat_id: trevvlg_grampanchayat_id,
        trevvlg_is_active: true,
        trevvlg_deleted_at: null,
      },
      attributes: [
        "trevvlg_revenue_village_id",
        "trevvlg_revenue_village_name",
      ],
      order: [["trevvlg_revenue_village_name", "ASC"]],
    });

    // Format dropdown response
    const response = villages.map((village) => ({
      value: village?.trevvlg_revenue_village_id,
      label: village?.trevvlg_revenue_village_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Revenue villages fetched successfully",
      data: response,
    });

  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};


module.exports.fetch_revenue_datatable = async (req, res, next) => {
    try {
        var sql = `
            SELECT 
                t_revenue_village.trevvlg_revenue_village_id,
                t_revenue_village.trevvlg_revenue_village_name,
                t_revenue_village.trevvlg_is_active,

                t_state.tsl_state_id,
                t_state.tsl_state_name,

                t_district.tdl_district_id,
                t_district.tdl_district_name,

                t_block.tbl_block_id,
                t_block.tbl_block_name,

                t_grampanchayat.tgrm_grampanchayat_id,
                t_grampanchayat.tgrm_grampanchayat_name,

                t_revenue_village.trevvlg_is_active

            FROM t_revenue_village

            LEFT JOIN t_state 
                ON t_state.tsl_state_id = t_revenue_village.trevvlg_state_id

            LEFT JOIN t_district 
                ON t_district.tdl_district_id = t_revenue_village.trevvlg_district_id

            LEFT JOIN t_block 
                ON t_block.tbl_block_id = t_revenue_village.trevvlg_block_id

            LEFT JOIN t_grampanchayat 
                ON t_grampanchayat.tgrm_grampanchayat_id = t_revenue_village.trevvlg_grampanchayat_id
        `;

        var where;

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

module.exports.createRevenueVillage = async function (req, res, next) {
    try {

        const {
            trevvlg_revenue_village_name,
            trevvlg_state_id,
            trevvlg_district_id,
            trevvlg_block_id,
            trevvlg_grampanchayat_id,
            payload
        } = req.body;

        // 1️⃣ Check State
        const existingState = await StateModel.findOne({
            where: { tsl_state_id: trevvlg_state_id }
        });

        if (!existingState) {
            return res.status(404).json({
                status: false,
                message: "State not found"
            });
        }

        // 2️⃣ Check District
        const existingDistrict = await DistrictModel.findOne({
            where: {
                tdl_district_id: trevvlg_district_id,
                tdl_state_id: trevvlg_state_id
            }
        });

        if (!existingDistrict) {
            return res.status(404).json({
                status: false,
                message: "District not found for this state"
            });
        }

        // 3️⃣ Check Block
        const existingBlock = await BlockModel.findOne({
            where: {
                tbl_block_id: trevvlg_block_id,
                tbl_district_id: trevvlg_district_id,
                tbl_state_id: trevvlg_state_id
            }
        });

        if (!existingBlock) {
            return res.status(404).json({
                status: false,
                message: "Block not found for this district"
            });
        }

        // 4️⃣ Check Gram Panchayat
        const existingGP = await GrampanchayatModel.findOne({
            where: {
                tgrm_grampanchayat_id: trevvlg_grampanchayat_id,
                tgrm_block_id: trevvlg_block_id,
                tgrm_district_id: trevvlg_district_id,
                tgrm_state_id: trevvlg_state_id
            }
        });

        if (!existingGP) {
            return res.status(404).json({
                status: false,
                message: "Gram Panchayat not found for this block"
            });
        }

        // 5️⃣ Check duplicate revenue village
        const existingVillage = await RevenueVillageModel.findOne({
            where: {
                trevvlg_state_id,
                trevvlg_district_id,
                trevvlg_block_id,
                trevvlg_grampanchayat_id,
                trevvlg_revenue_village_name: {
                    [Op.iLike]: trevvlg_revenue_village_name
                }
            }
        });

        if (existingVillage) {
            return res.status(409).json({
                status: false,
                message: `Revenue village ${trevvlg_revenue_village_name} already exists in this Gram Panchayat`
            });
        }

        // 6️⃣ Create Revenue Village
        const newVillage = await RevenueVillageModel.create({
            trevvlg_revenue_village_name,
            trevvlg_state_id,
            trevvlg_district_id,
            trevvlg_block_id,
            trevvlg_grampanchayat_id,
            trevvlg_created_by: payload?.id,
            trevvlg_updated_by: payload?.id

        });

        return res.status(201).json({
            status: true,
            message: "Revenue village created successfully",
            data: newVillage
        });

    } catch (err) {
        next(CustomErrorHandler.databaseError(err.message));
    }
};

module.exports.updateRevenueVillage = async function (req, res, next) {
    try {

        const {
            trevvlg_revenue_village_name,
            trevvlg_state_id,
            trevvlg_district_id,
            trevvlg_block_id,
            trevvlg_grampanchayat_id,
            payload
        } = req.body;

        const { trevvlg_revenue_village_id } = req?.params;

        if (!trevvlg_revenue_village_id) {
            return res.status(404).json({
                status: false,
                message: "Revenue village ID not found",
            });
        }

        // 1️⃣ Check if Revenue Village exists
        const existingVillage = await RevenueVillageModel.findOne({
            where: { trevvlg_revenue_village_id }
        });

        if (!existingVillage) {
            return res.status(404).json({
                status: false,
                message: "Revenue village not found",
            });
        }

        // 2️⃣ Check State
        const existingState = await StateModel.findOne({
            where: { tsl_state_id: trevvlg_state_id }
        });

        if (!existingState) {
            return res.status(404).json({
                status: false,
                message: "State not found"
            });
        }

        // 3️⃣ Check District
        const existingDistrict = await DistrictModel.findOne({
            where: {
                tdl_district_id: trevvlg_district_id,
                tdl_state_id: trevvlg_state_id
            }
        });

        if (!existingDistrict) {
            return res.status(404).json({
                status: false,
                message: "District not found for this state"
            });
        }

        // 4️⃣ Check Block
        const existingBlock = await BlockModel.findOne({
            where: {
                tbl_block_id: trevvlg_block_id,
                tbl_district_id: trevvlg_district_id,
                tbl_state_id: trevvlg_state_id
            }
        });

        if (!existingBlock) {
            return res.status(404).json({
                status: false,
                message: "Block not found for this district"
            });
        }

        // 5️⃣ Check Gram Panchayat
        const existingGP = await GrampanchayatModel.findOne({
            where: {
                tgrm_grampanchayat_id: trevvlg_grampanchayat_id,
                tgrm_block_id: trevvlg_block_id,
                tgrm_district_id: trevvlg_district_id,
                tgrm_state_id: trevvlg_state_id
            }
        });

        if (!existingGP) {
            return res.status(404).json({
                status: false,
                message: "Gram Panchayat not found for this block"
            });
        }

        // 6️⃣ Duplicate village check
        const duplicateVillage = await RevenueVillageModel.findOne({
            where: {
                trevvlg_state_id,
                trevvlg_district_id,
                trevvlg_block_id,
                trevvlg_grampanchayat_id,
                trevvlg_revenue_village_name: {
                    [Op.iLike]: trevvlg_revenue_village_name
                }
            }
        });

        if (
            duplicateVillage &&
            duplicateVillage.trevvlg_revenue_village_id !== trevvlg_revenue_village_id
        ) {
            return res.status(409).json({
                status: false,
                message: `Revenue village ${trevvlg_revenue_village_name} already exists in this Gram Panchayat`
            });
        }

        // 7️⃣ Update village
        existingVillage.trevvlg_revenue_village_name = trevvlg_revenue_village_name;
        existingVillage.trevvlg_state_id = trevvlg_state_id;
        existingVillage.trevvlg_district_id = trevvlg_district_id;
        existingVillage.trevvlg_block_id = trevvlg_block_id;
        existingVillage.trevvlg_grampanchayat_id = trevvlg_grampanchayat_id;
        existingVillage.trevvlg_updated_by = payload?.id;
        existingVillage.trevvlg_updated_at = new Date();


        await existingVillage.save();

        return res.status(200).json({
            status: true,
            message: "Revenue village updated successfully",
            data: existingVillage
        });

    } catch (err) {
        next(CustomErrorHandler.databaseError(err.message));
    }
};

module.exports.getExcelExportRevenueVillageList = async (req, res, next) => {
    try {

        var sql = `
        SELECT 
            t_revenue_village.trevvlg_revenue_village_id,
            t_revenue_village.trevvlg_revenue_village_name,
            
            t_state.tsl_state_name,
            t_district.tdl_district_name,
            t_block.tbl_block_name,
            t_grampanchayat.tgrm_grampanchayat_name,

            t_revenue_village.trevvlg_created_at

        FROM t_revenue_village

        LEFT JOIN t_state 
            ON t_state.tsl_state_id = t_revenue_village.trevvlg_state_id

        LEFT JOIN t_district 
            ON t_district.tdl_district_id = t_revenue_village.trevvlg_district_id

        LEFT JOIN t_block 
            ON t_block.tbl_block_id = t_revenue_village.trevvlg_block_id

        LEFT JOIN t_grampanchayat 
            ON t_grampanchayat.tgrm_grampanchayat_id = t_revenue_village.trevvlg_grampanchayat_id
        `;

        var where;

        var records = await Datatables.build(req, sql, where);

        res.json(records);

    } catch (err) {
        console.log(err);
        next(CustomErrorHandler.internalServerError(err.message));
    }
};