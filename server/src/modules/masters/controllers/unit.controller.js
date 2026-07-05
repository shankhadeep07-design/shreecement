var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const UnitModel = require("../../../models/masters/unit.model");
const UnitStateDistrictModel = require("../../../models/masters/unit_state_district.model");
const BlockModel = require("../../../models/masters/block.model");
const GrampanchayatModel = require("../../../models/masters/grampanchayat.model");
const RevenueVillageModel = require("../../../models/masters/revenue_village.model");
const VillagesModel = require("../../../models/masters/village.model");
const {
  BudgetMasterModel,
} = require("../../../models/budget/budget_master.model");
module.exports.getAllUnitList = async (req, res, next) => {
  try {
    const units = await UnitModel.findAll({
      where: {
        tun_is_active: true,
      },
      attributes: ["tun_id", "tun_name"],
      order: [["tun_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = units.map((unit) => ({
      value: unit?.tun_id,
      label: unit?.tun_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Units fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};




module.exports.getUnitLocationDetails = async (req, res, next) => {
  try {
    const { unit_id } = req.params;

    const records = await UnitStateDistrictModel.findAll({
      where: {
        tunsd_unit_id: unit_id,
        tunsd_is_active: true,
      },
      attributes: [
        "tunsd_state_id",
        "tunsd_district_id",
        "tunsd_block_id",
        "tunsd_grampanchayat_id",
        "tunsd_revenue_village_id",
        "tunsd_village_id",
      ],
    });

    if (!records.length) {
      return res.status(404).json({
        status: false,
        message: "Unit location not found",
      });
    }

    const state_id = records[0].tunsd_state_id;
    const district_id = records[0].tunsd_district_id;

    const block_ids = [
      ...new Set(records.map((r) => r.tunsd_block_id).filter(Boolean)),
    ];
    const gp_ids = [
      ...new Set(records.map((r) => r.tunsd_grampanchayat_id).filter(Boolean)),
    ];
    const revenue_village_ids = [
      ...new Set(
        records.map((r) => r.tunsd_revenue_village_id).filter(Boolean),
      ),
    ];
    const village_ids = [
      ...new Set(records.map((r) => r.tunsd_village_id).filter(Boolean)),
    ];

    const [blocks, gps, rvs, villages] = await Promise.all([
      BlockModel.findAll({
        where: { tbl_block_id: block_ids },
        attributes: ["tbl_block_id", "tbl_block_name"],
      }),

      GrampanchayatModel.findAll({
        where: { tgrm_grampanchayat_id: gp_ids },
        attributes: ["tgrm_grampanchayat_id", "tgrm_grampanchayat_name"],
      }),

      RevenueVillageModel.findAll({
        where: { trevvlg_revenue_village_id: revenue_village_ids },
        attributes: [
          "trevvlg_revenue_village_id",
          "trevvlg_revenue_village_name",
        ],
      }),

      VillagesModel.findAll({
        where: { tvl_village_id: village_ids },
        attributes: ["tvl_village_id", "tvl_village_name"],
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Unit location fetched successfully",
      data: {
        unit_id,
        state_id,
        district_id,

        blocks: blocks.map((b) => ({
          value: b.tbl_block_id,
          label: b.tbl_block_name,
        })),

        grampanchayats: gps.map((g) => ({
          value: g.tgrm_grampanchayat_id,
          label: g.tgrm_grampanchayat_name,
        })),

        revenue_villages: rvs.map((rv) => ({
          value: rv.trevvlg_revenue_village_id,
          label: rv.trevvlg_revenue_village_name,
        })),

        villages: villages.map((v) => ({
          value: v.tvl_village_id,
          label: v.tvl_village_name,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
module.exports.getApprovedBudgetUnitLocations = async (req, res, next) => {
  try {
    const { unit_id } = req.params;
    const { fy_id } = req.query;

    if (!unit_id) {
      return res.status(400).json({
        status: false,
        message: "unit_id is required",
      });
    }

    /* ======================================================
       1️⃣ FETCH LATEST APPROVED BUDGET MASTER
    ====================================================== */

    const whereCondition = {
      tbm_unit_id: unit_id,
      tbm_status: "approved",
    };

    if (fy_id) {
      whereCondition.tbm_fy_id = fy_id;
    }

    const masters = await BudgetMasterModel.findAll({
      where: whereCondition,
      attributes: [
        "tbm_state_id",
        "tbm_district_id",
        "tbm_block_id",
        "tbm_gram_panchayat_id",
        "tbm_revenue_village_id",
        "tbm_village_id",
      ],
      order: [["tbm_created_at", "DESC"]],
      limit: 1,
    });

    if (!masters.length) {
      return res.status(404).json({
        status: false,
        message: "No approved budget locations found",
      });
    }

    /* ======================================================
       2️⃣ EXTRACT DATA FROM SINGLE MASTER
    ====================================================== */

    const master = masters[0];

    const state_id = master.tbm_state_id;
    const district_id = master.tbm_district_id;

    const block_ids = master.tbm_block_id
      ? master.tbm_block_id.split(",")
      : [];

    const gp_ids = master.tbm_gram_panchayat_id
      ? master.tbm_gram_panchayat_id.split(",")
      : [];

    const revenue_village_ids = master.tbm_revenue_village_id
      ? master.tbm_revenue_village_id.split(",")
      : [];

    const village_ids = master.tbm_village_id
      ? master.tbm_village_id.split(",")
      : [];

    /* ======================================================
       3️⃣ FETCH MASTER DATA
    ====================================================== */

    const [blocks, gps, rvs, villages] = await Promise.all([
      block_ids.length
        ? BlockModel.findAll({
            where: { tbl_block_id: block_ids },
            attributes: ["tbl_block_id", "tbl_block_name"],
          })
        : [],

      gp_ids.length
        ? GrampanchayatModel.findAll({
            where: { tgrm_grampanchayat_id: gp_ids },
            attributes: [
              "tgrm_grampanchayat_id",
              "tgrm_grampanchayat_name",
            ],
          })
        : [],

      revenue_village_ids.length
        ? RevenueVillageModel.findAll({
            where: { trevvlg_revenue_village_id: revenue_village_ids },
            attributes: [
              "trevvlg_revenue_village_id",
              "trevvlg_revenue_village_name",
            ],
          })
        : [],

      village_ids.length
        ? VillagesModel.findAll({
            where: { tvl_village_id: village_ids },
            attributes: ["tvl_village_id", "tvl_village_name"],
          })
        : [],
    ]);

    /* ======================================================
       4️⃣ FINAL RESPONSE
    ====================================================== */

    return res.status(200).json({
      status: true,
      message: "Approved budget locations fetched successfully",
      data: {
        unit_id,
        state_id,
        district_id,

        blocks: blocks.map((b) => ({
          value: b.tbl_block_id,
          label: b.tbl_block_name,
        })),

        grampanchayats: gps.map((g) => ({
          value: g.tgrm_grampanchayat_id,
          label: g.tgrm_grampanchayat_name,
        })),

        revenue_villages: rvs.map((rv) => ({
          value: rv.trevvlg_revenue_village_id,
          label: rv.trevvlg_revenue_village_name,
        })),

        villages: villages.map((v) => ({
          value: v.tvl_village_id,
          label: v.tvl_village_name,
        })),
      },
    });
  } catch (err) {
    console.error("Approved Budget Location Error:", err);
    next(err);
  }
};



// module.exports.fetch_unit_datatable = async (req, res, next) => {
//   try {
//     // var sql = `
//     //     SELECT
//     //         t_unit.tun_id,
//     //         t_unit.tun_name,

//     //         t_state.tsl_state_id,
//     //         t_state.tsl_state_name,

//     //         t_district.tdl_district_id,
//     //         t_district.tdl_district_name

//     //     FROM t_unit

//     //     LEFT JOIN t_unit_state_district
//     //         ON t_unit_state_district.tunsd_unit_id = t_unit.tun_id

//     //     LEFT JOIN t_state
//     //         ON t_state.tsl_state_id = t_unit_state_district.tunsd_state_id

//     //     LEFT JOIN t_district
//     //         ON t_district.tdl_district_id = t_unit_state_district.tunsd_district_id
//     // `;

//     var where = ` t_unit.tun_is_active = true `;

//     var records = await Datatables.build(req, sql, where);

//     res.json(records);
//   } catch (err) {
//     console.log(err);
//     next(
//       CustomErrorHandler.internalServerError({
//         message: err.message,
//         stack: err.stack,
//       }),
//     );
//   }
// };

module.exports.fetch_unit_datatable = async (req, res, next) => {
  try {

    const sql = `
SELECT 
    t_unit.tun_id,
    t_unit.tun_name,
    t_unit.tun_is_active,

MAX(t_state.tsl_state_id) AS tsl_state_id,
MAX(t_state.tsl_state_name) AS tsl_state_name,

MAX(t_district.tdl_district_id) AS tdl_district_id,
MAX(t_district.tdl_district_name) AS tdl_district_name,

JSON_AGG(
    DISTINCT JSONB_BUILD_OBJECT(
        'block_id', t_block.tbl_block_id,
        'block_name', t_block.tbl_block_name,

        'gp_id', t_grampanchayat.tgrm_grampanchayat_id,
        'gp_name', t_grampanchayat.tgrm_grampanchayat_name,

        'revenue_village_id', t_revenue_village.trevvlg_revenue_village_id,
        'revenue_village_name', t_revenue_village.trevvlg_revenue_village_name,

        'village_id', t_villages.tvl_village_id,
        'village_name', t_villages.tvl_village_name,

        'distance', t_unit_state_district.tunsd_distance,
        'type_of_village_id', t_unit_state_district.tunsd_type_of_village_id
    )
) AS locations

FROM t_unit

LEFT JOIN t_unit_state_district 
    ON t_unit_state_district.tunsd_unit_id = t_unit.tun_id

LEFT JOIN t_state
    ON t_state.tsl_state_id = t_unit_state_district.tunsd_state_id

LEFT JOIN t_district
    ON t_district.tdl_district_id = t_unit_state_district.tunsd_district_id

LEFT JOIN t_block
    ON t_block.tbl_block_id = t_unit_state_district.tunsd_block_id

LEFT JOIN t_grampanchayat
    ON t_grampanchayat.tgrm_grampanchayat_id = t_unit_state_district.tunsd_grampanchayat_id

LEFT JOIN t_revenue_village
    ON t_revenue_village.trevvlg_revenue_village_id = t_unit_state_district.tunsd_revenue_village_id

LEFT JOIN t_villages
    ON t_villages.tvl_village_id = t_unit_state_district.tunsd_village_id
`;

    // WHERE goes here
    var where;

    // GROUP BY passed separately
    // var groupBy = `t_unit.tun_id, t_unit.tun_name`;
    const groupBy = `
t_unit.tun_id,
t_unit.tun_name,
t_unit.tun_is_active
`;

    var records = await Datatables.build(req, sql, where, {}, null, groupBy);

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
module.exports.createUnit = async function (req, res, next) {
  try {
    const {
      tun_name,
      tun_state_id,
      tun_district_id,
      locations,
      payload,
    } = req.body;

    /* --------------------------------------------------
       1️⃣ Check duplicate locations inside payload
    -------------------------------------------------- */

    const seen = new Set();

    for (const loc of locations) {
      const key = `${loc.block_id}-${loc.gp_id}-${loc.revenue_village_id}-${loc.village_id}-${loc.distance}`;

      if (seen.has(key)) {
        return res.status(400).json({
          status: false,
          message: "Duplicate location selected in form",
        });
      }

      seen.add(key);
    }

    /* --------------------------------------------------
       2️⃣ Find existing units with same name
    -------------------------------------------------- */

    const existingUnits = await UnitModel.findAll({
      where: {
        tun_name: {
          [Op.iLike]: tun_name,
        },
      },
      attributes: ["tun_id"],
    });

    const unitIds = existingUnits.map((u) => u.tun_id);

    /* --------------------------------------------------
       3️⃣ Check duplicate in DB
    -------------------------------------------------- */

    if (unitIds.length > 0) {
      for (const loc of locations) {
        const duplicate = await UnitStateDistrictModel.findOne({
          where: {
            tunsd_unit_id: { [Op.in]: unitIds },
            tunsd_state_id: tun_state_id,
            tunsd_district_id: tun_district_id,
            tunsd_block_id: loc.block_id,
            tunsd_grampanchayat_id: loc.gp_id,
            tunsd_revenue_village_id: loc.revenue_village_id,
            tunsd_village_id: loc.village_id,
            tunsd_distance: loc.distance,
          },
        });

        if (duplicate) {
          return res.status(409).json({
            status: false,
            message: `Unit "${tun_name}" already exists for this location`,
          });
        }
      }
    }

    /* --------------------------------------------------
       4️⃣ Create unit
    -------------------------------------------------- */

    const newUnit = await UnitModel.create({
      tun_name,
      tun_created_by: payload?.id,
            tun_updated_by: payload?.id,

    });

    /* --------------------------------------------------
       5️⃣ Insert locations
    -------------------------------------------------- */

    const locationRows = locations.map((loc) => ({
      tunsd_unit_id: newUnit.tun_id,
      tunsd_state_id: tun_state_id,
      tunsd_district_id: tun_district_id,
      tunsd_block_id: loc.block_id,
      tunsd_grampanchayat_id: loc.gp_id,
      tunsd_revenue_village_id: loc.revenue_village_id,
      tunsd_village_id: loc.village_id,
      tunsd_type_of_village_id: loc.type_of_village_id,
       tunsd_distance: loc.distance,
      tunsd_created_by: payload?.id,
    }));

    await UnitStateDistrictModel.bulkCreate(locationRows);

    return res.status(201).json({
      status: true,
      message: "Unit created successfully",
      data: newUnit,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.updateUnit = async function (req, res, next) {
  try {
    const { tun_id } = req.params;

    const {
      tun_name,
      tun_state_id,
      tun_district_id,
      locations,
      payload,
    } = req.body;

    const seen = new Set();

    for (const loc of locations) {
      const key = `${loc.block_id}-${loc.gp_id}-${loc.revenue_village_id}-${loc.village_id}-${loc.distance}`;

      if (seen.has(key)) {
        return res.status(400).json({
          status: false,
          message: "Duplicate location selected in form",
        });
      }

      seen.add(key);
    }

    const existingUnit = await UnitModel.findOne({
      where: { tun_id },
    });

    if (!existingUnit) {
      return res.status(404).json({
        status: false,
        message: "Unit not found",
      });
    }

    // Duplicate check
    // const sameNameUnits = await UnitModel.findAll({
    //   where: {
    //     tun_name: { [Op.iLike]: tun_name },
    //   },
    //   attributes: ["tun_id"],
    // });
    const sameNameUnits = await UnitModel.findAll({
      where: {
        tun_name: { [Op.iLike]: tun_name },
        tun_id: { [Op.ne]: tun_id }, // IMPORTANT: ignore current unit
      },
      attributes: ["tun_id"],
    });

    const unitIds = sameNameUnits.map((u) => u.tun_id);

    for (const loc of locations) {
      const duplicate = await UnitStateDistrictModel.findOne({
        where: {
          tunsd_unit_id: { [Op.in]: unitIds },
          tunsd_state_id: tun_state_id,
          tunsd_district_id: tun_district_id,
          tunsd_block_id: loc.block_id,
          tunsd_grampanchayat_id: loc.gp_id,
          tunsd_revenue_village_id: loc.revenue_village_id,
          tunsd_village_id: loc.village_id,
          tunsd_distance: loc.distance,
        },
      });

      if (duplicate && duplicate.tunsd_unit_id !== tun_id) {
        return res.status(409).json({
          status: false,
          message: `Unit ${tun_name} already exists in this location`,
        });
      }
    }

    // Update unit
    existingUnit.tun_name = tun_name;
    existingUnit.tun_updated_by = payload?.id;
        existingUnit.tun_updated_at = new Date();


    await existingUnit.save();

    // Remove old locations
    await UnitStateDistrictModel.destroy({
      where: { tunsd_unit_id: tun_id },
    });

    // Insert new locations
    const locationRows = locations.map((loc) => ({
      tunsd_unit_id: tun_id,
      tunsd_state_id: tun_state_id,
      tunsd_district_id: tun_district_id,
      tunsd_block_id: loc.block_id,
      tunsd_grampanchayat_id: loc.gp_id,
      tunsd_revenue_village_id: loc.revenue_village_id,
      tunsd_village_id: loc.village_id,
      tunsd_type_of_village_id: loc.type_of_village_id,
      tunsd_distance: loc.distance,
      tunsd_created_by: payload?.id,
    }));

    await UnitStateDistrictModel.bulkCreate(locationRows);

    return res.status(200).json({
      status: true,
      message: "Unit updated successfully",
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getExcelExportUnitList = async (req, res, next) => {
  try {

    const sql = `
      SELECT 
    t_unit.tun_id,
    t_unit.tun_name,

    t_state.tsl_state_name,
    t_district.tdl_district_name,

    t_block.tbl_block_name,
    t_grampanchayat.tgrm_grampanchayat_name,
    t_revenue_village.trevvlg_revenue_village_name,
    t_villages.tvl_village_name,

    t_type_of_village.ttovill_type_of_village,

    t_unit_state_district.tunsd_distance

FROM t_unit

LEFT JOIN t_unit_state_district
    ON t_unit_state_district.tunsd_unit_id = t_unit.tun_id

LEFT JOIN t_state
    ON t_state.tsl_state_id = t_unit_state_district.tunsd_state_id

LEFT JOIN t_district
    ON t_district.tdl_district_id = t_unit_state_district.tunsd_district_id

LEFT JOIN t_block
    ON t_block.tbl_block_id = t_unit_state_district.tunsd_block_id

LEFT JOIN t_grampanchayat
    ON t_grampanchayat.tgrm_grampanchayat_id = t_unit_state_district.tunsd_grampanchayat_id

LEFT JOIN t_revenue_village
    ON t_revenue_village.trevvlg_revenue_village_id = t_unit_state_district.tunsd_revenue_village_id

LEFT JOIN t_villages
    ON t_villages.tvl_village_id = t_unit_state_district.tunsd_village_id

LEFT JOIN t_type_of_village
    ON t_type_of_village.ttovill_type_village_id = t_unit_state_district.tunsd_type_of_village_id
    `;

    var where;

    const records = await Datatables.build(req, sql, where);

    res.json(records);

  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
