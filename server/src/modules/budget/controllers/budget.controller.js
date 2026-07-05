var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes, Op } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const {
  BudgetAmountMasterModel,
} = require("../../../models/budget/budget_amount_master_model");
const { BudgetsModel } = require("../../../models/budget/budgets.model");
const {
  BudgetMasterModel,
} = require("../../../models/budget/budget_master.model");

const {
  ApprovalPathList,
  getUserByRoleId,
  generateTenDigitNumber,
  notificationStatusChange,
  ApprovalDetails,
} = require("../../../helpers/web.helper");
const NotificationModel = require("../../../models/notification/notifications.model");
const ApprovalProcessTrackModel = require("../../../models/approval/ApprovalProcessTrackModel");
const {
  BudgetAmmendmentMasterModel,
} = require("../../../models/budget/budget_ammendment.model");
const BlockModel = require("../../../models/masters/block.model");
const GrampanchayatModel = require("../../../models/masters/grampanchayat.model");
const RevenueVillageModel = require("../../../models/masters/revenue_village.model");
const VillagesModel = require("../../../models/masters/village.model");
const UnitStateDistrictModel = require("../../../models/masters/unit_state_district.model");
const ProjectModel = require("../../../models/projects/projects.model");

// old
// module.exports.budgeting_list_datatable = async (req, res, next) => {
//   try {
//     var sql = `
//         select
//             master.*,
//             master.tbm_budget_list as tbm_budget_list_data,
//             budget_list.tbm_budget_list,
//             t_financial_year.tfy_year_label,
//             users.name
//         FROM t_budget_master as master
//         LEFT JOIN (SELECT
//                 tbad_budget_master_id,
//             json_agg(t_budgets.*) as tbm_budget_list
//             FROM t_budgets
//             group by tbad_budget_master_id
// ) budget_list ON budget_list.tbad_budget_master_id = master.tbm_id
//         LEFT JOIN t_financial_year ON t_financial_year.tfy_id = master.tbm_fy_id
//         LEFT JOIN users ON users.id = master.tbm_created_by
//       `;

//     // let where = ` 1=1 `;

//     var records = await Datatables.build(req, sql);

//     res.json(records);
//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };

module.exports.budgeting_list_datatable = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        master.*,
        budget_list.tbm_budget_list,
        t_financial_year.tfy_year_label,
        users.name AS created_by_name

      FROM t_budget_master AS master

      LEFT JOIN (
        SELECT 
          b.tbad_budget_master_id,

          json_agg(
            json_build_object(
              'tbad_id', b.tbad_id,
              'tbad_theme_id', b.tbad_theme_id,
              'tbad_sch_vii_id', b.tbad_sch_vii_id,
              'tbad_sub_theme', b.tbad_sub_theme,
              'tbad_project_identified', b.tbad_project_identified,
              'tbad_description', b.tbad_description,
              'tbad_amount', b.tbad_amount,

              'theme_name', th.tthm_theme_name,
              'schedule_name', sch.tschm_schedule_name,
              'sub_schedule_name', sub.tsubshcm_sub_schedule_name
            )
            ORDER BY b.tbad_id
          ) AS tbm_budget_list

        FROM t_budgets b

        LEFT JOIN t_theme_master th
        ON th.tthm_theme_id = b.tbad_theme_id

        LEFT JOIN t_schedule_seven_master sch
        ON sch.tschm_schedule_id = b.tbad_sch_vii_id

        LEFT JOIN t_sub_schedule_master sub
        ON sub.tsubshcm_sub_schedule_id = b.tbad_sub_theme

        GROUP BY b.tbad_budget_master_id
      ) AS budget_list
      ON budget_list.tbad_budget_master_id = master.tbm_id

      LEFT JOIN t_financial_year 
      ON t_financial_year.tfy_id = master.tbm_fy_id

      LEFT JOIN users 
      ON users.id = master.tbm_created_by
    `;

    const records = await Datatables.build(req, sql);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

// module.exports.create_budgeting_fun = async (req, res, next) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const formData = req.body;
//     const created_by = formData.payload.id;
//     const isUpdate = !!formData.tbm_id;

//     let masterId;

//     // Optional: Validate total budget amount
//     // Example: If you have a max limit per FY, add check here

//     if (isUpdate) {
//       // 🔁 Update existing master
//       const master = await BudgetMasterModel.findByPk(formData.tbm_id, { transaction });
//       if (!master) {
//         throw new Error('Master record not found for update.');
//       }

//       await master.update({
//         tbm_type: formData.tbm_type,
//         tbm_fy_id: formData.tbm_fy_id,
//         tbm_total_budget_amount: formData.tbm_total_budget_amount,
//         tbm_budget_list: formData.tbm_budget_list, // JSONB array of details
//         tbm_updated_by: created_by,
//         tbm_updated_at: new Date(),
//       }, { transaction });

//       masterId = formData.tbm_id;

//       // ✅ Update or insert detail rows in t_budgets
//       if (Array.isArray(formData.tbm_budget_list)) {
//         for (const item of formData.tbm_budget_list) {
//           if (item.tbad_id) {
//             // Update existing budget detail
//             await BudgetsModel.update({
//               tbad_budget_master_id: masterId,
//               tbad_fy_id: formData.tbm_fy_id,
//               tbad_sch_vii_id: item.tbad_sch_vii_id,
//               tbad_focus_area_id: item.tbad_focus_area_id,
//               tbad_activity_id: item.tbad_activity_id,
//               tbad_budget_type: item.tbad_budget_type,
//               tbad_amount: item.tbad_amount,
//               tbad_total_budget: item.tbad_total_budget,
//               tbad_used_budget: item.tbad_used_budget || 0,
//               tbad_remaining_budget: item.tbad_remaining_budget || 0,
//               tbad_description: item.tbad_description,
//               tbad_target_beneficiary: item.tbad_target_beneficiary,
//               tbad_remarks: item.tbad_remarks,
//               tbad_status: 'pending',
//               tbad_updated_by: created_by,
//               tbad_updated_at: new Date(),
//             }, {
//               where: { tbad_id: item.tbad_id },
//               transaction,
//             });
//           } else {
//             // Insert new budget detail
//             await BudgetsModel.create({
//                 tbad_budget_master_id: masterId,
//               tbad_fy_id: formData.tbm_fy_id,
//               tbad_sch_vii_id: item.tbad_sch_vii_id,
//               tbad_focus_area_id: item.tbad_focus_area_id,
//               tbad_activity_id: item.tbad_activity_id,
//               tbad_budget_type: item.tbad_budget_type,
//               tbad_amount: item.tbad_amount,
//               tbad_total_budget: item.tbad_total_budget,
//               tbad_used_budget: item.tbad_used_budget || 0,
//               tbad_remaining_budget: item.tbad_remaining_budget || 0,
//               tbad_description: item.tbad_description,
//               tbad_target_beneficiary: item.tbad_target_beneficiary,
//               tbad_remarks: item.tbad_remarks,
//               tbad_status: 'pending',
//               tbad_created_by: created_by,
//             }, { transaction });
//           }
//         }
//       }

//     } else {
//       // ➕ Create new master
//       const master = await BudgetMasterModel.create({
//         tbm_type: formData.tbm_type,
//         tbm_fy_id: formData.tbm_fy_id,
//         tbm_total_budget_amount: formData.tbm_total_budget_amount,
//         tbm_budget_list: formData.tbm_budget_list, // JSONB array of details
//         tbm_created_by: created_by,
//       }, { transaction });

//       masterId = master.tbm_id;

//       // ✅ Insert detail rows
//       if (Array.isArray(formData.tbm_budget_list)) {
//         for (const item of formData.tbm_budget_list) {
//           await BudgetsModel.create({
//             tbad_budget_master_id: masterId,
//             tbad_fy_id: formData.tbm_fy_id,
//             tbad_sch_vii_id: item.tbad_sch_vii_id,
//             tbad_focus_area_id: item.tbad_focus_area_id,
//             tbad_activity_id: item.tbad_activity_id,
//             tbad_budget_type: item.tbad_budget_type,
//             tbad_amount: item.tbad_amount,
//             tbad_total_budget: formData.tbm_total_budget_amount,
//             tbad_used_budget: item.tbad_used_budget || 0,
//             tbad_remaining_budget: item.tbad_remaining_budget || 0,
//             tbad_description: item.tbad_description,
//             tbad_target_beneficiary: item.tbad_target_beneficiary,
//             tbad_remarks: item.tbad_remarks,
//             tbad_status: 'pending',
//             tbad_created_by: created_by,
//           }, { transaction });
//         }
//       }
//     }

//     // ✅ Commit the transaction
//     await transaction.commit();

//     return res.status(200).json({
//       message: isUpdate ? 'Budget updated successfully.' : 'Budget created successfully.',
//       data: { tbm_id: masterId },
//       status: true,
//     });

//   } catch (err) {
//     if (transaction) await transaction.rollback();
//     console.error("Budget Create/Update Error:", err);
//     return next(CustomErrorHandler.internalServerError({
//       message: err.message,
//       stack: err.stack,
//     }));
//   }
// };

// New code
// module.exports.create_budgeting_fun = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const formData = req.body;
//     const created_by = formData.payload?.id || 0;

//     const isUpdate = !!formData.tbm_id;

//     let masterId;

//     // =========================
//     // UPDATE MASTER
//     // =========================
//     if (isUpdate) {
//       const master = await BudgetMasterModel.findByPk(formData.tbm_id);

//       if (!master) {
//         return res.status(404).json({
//           status: false,
//           message: "Budget master not found",
//         });
//       }

//       await master.update(
//         {
//           tbm_fy_id: formData.tbm_fy_id,
//           tbm_unit_id: formData.tbm_unit_id,
//           tbm_proposed_total_amount: formData.tbm_proposed_total_amount,
//           tbm_state_id: formData.tbm_state_id,
//           tbm_district_id: formData.tbm_district_id,
//           tbm_village_type_id: formData.tbm_village_type_id,
//           tbm_updated_by: created_by,
//           tbm_updated_at: new Date(),
//         },
//         { transaction },
//       );

//       masterId = formData.tbm_id;

//       // delete old details
//       await BudgetsModel.destroy({
//         where: { tbad_budget_master_id: masterId },
//         transaction,
//       });
//     }

//     // =========================
//     // CREATE MASTER
//     // =========================
//     else {
//       const master = await BudgetMasterModel.create(
//         {
//           tbm_fy_id: formData.tbm_fy_id,
//           tbm_unit_id: formData.tbm_unit_id,
//           tbm_proposed_total_amount: formData.tbm_proposed_total_amount,
//           tbm_state_id: formData.tbm_state_id,
//           tbm_district_id: formData.tbm_district_id,
//           tbm_village_type_id: formData.tbm_village_type_id,
//           tbm_created_by: created_by,
//         },
//         { transaction },
//       );

//       masterId = master.tbm_id;
//     }

//     // =========================
//     // INSERT BUDGET DETAILS
//     // =========================

//     if (Array.isArray(formData.tbm_budget_list)) {
//       for (const item of formData.tbm_budget_list) {
//         await BudgetsModel.create(
//           {
//             tbad_budget_master_id: masterId,
//             tbad_sch_vii_id: item.tbad_sch_vii_id,
//             tbad_sub_theme: item.tbad_sub_theme,
//             tbad_project_identified: item.tbad_project_identified,
//             tbad_description: item.tbad_description,
//             tbad_amount: item.tbad_amount,
//             tbad_created_by: created_by,
//           },
//           { transaction },
//         );
//       }
//     }

//     await transaction.commit();

//     return res.status(200).json({
//       status: true,
//       message: isUpdate
//         ? "Budget updated successfully"
//         : "Budget created successfully",
//       data: { tbm_id: masterId },
//     });
//   } catch (error) {
//     await transaction.rollback();

//     console.error(error);

//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// Old
// module.exports.create_budgeting_fun = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const formData = req.body;
//     const created_by = formData.payload?.id || 0;

//     const isUpdate = !!formData.tbm_id;

//     let masterId;

//     // =========================
//     // UPDATE MASTER
//     // =========================

//     if (isUpdate) {
//       const master = await BudgetMasterModel.findByPk(formData.tbm_id);

//       if (!master) {
//         await transaction.rollback();
//         return res.status(404).json({
//           status: false,
//           message: "Budget master not found",
//         });
//       }

//       await master.update(
//         {
//           tbm_fy_id: formData.tbm_fy_id,
//           tbm_unit_id: formData.tbm_unit_id,
//           tbm_proposed_total_amount: formData.tbm_proposed_total_amount,
//           tbm_state_id: formData.tbm_state_id,
//           tbm_district_id: formData.tbm_district_id,
//           tbm_block_id: formData.tbm_block_id?.join(","),
//           tbm_gram_panchayat_id: formData.tbm_gram_panchayat_id?.join(","),
//           tbm_revenue_village_id: formData.tbm_revenue_village_id?.join(","),
//           tbm_village_id: formData.tbm_village_id?.join(","),
//           tbm_updated_by: created_by,
//           tbm_updated_at: new Date(),
//         },
//         { transaction },
//       );

//       masterId = formData.tbm_id;

//       // Delete old budget rows
//       await BudgetsModel.destroy({
//         where: { tbad_budget_master_id: masterId },
//         transaction,
//       });
//     }

//     // =========================
//     // CREATE MASTER
//     // =========================
//     else {
//       const master = await BudgetMasterModel.create(
//         {
//           tbm_fy_id: formData.tbm_fy_id,
//           tbm_unit_id: formData.tbm_unit_id,
//           tbm_proposed_total_amount: formData.tbm_proposed_total_amount,
//           tbm_state_id: formData.tbm_state_id,
//           tbm_district_id: formData.tbm_district_id,
//           tbm_block_id: formData.tbm_block_id?.join(","),
//           tbm_gram_panchayat_id: formData.tbm_gram_panchayat_id?.join(","),
//           tbm_revenue_village_id: formData.tbm_revenue_village_id?.join(","),
//           tbm_village_id: formData.tbm_village_id?.join(","),
//           tbm_created_by: created_by,
//         },
//         { transaction },
//       );

//       masterId = master.tbm_id;
//     }

//     // =========================
//     // CHECK DUPLICATE IN REQUEST
//     // =========================

//     const duplicateCheck = new Set();

//     for (const item of formData.tbm_budget_list) {
//       const key = `${formData.tbm_fy_id}_${formData.tbm_unit_id}_${item.tbad_sch_vii_id}_${item.tbad_sub_theme}`;

//       if (duplicateCheck.has(key)) {
//         await transaction.rollback();

//         return res.status(400).json({
//           status: false,
//           message: "Duplicate entry found in request",
//         });
//       }

//       duplicateCheck.add(key);
//     }

//     // =========================
//     // CHECK DUPLICATE FROM DATABASE
//     // =========================

//     const masters = await BudgetMasterModel.findAll({
//       attributes: ["tbm_id"],
//       where: {
//         tbm_fy_id: formData.tbm_fy_id,
//         tbm_unit_id: formData.tbm_unit_id,
//         ...(isUpdate && { tbm_id: { [Op.ne]: formData.tbm_id } }),
//       },
//       transaction,
//     });

//     const masterIds = masters.map((m) => m.tbm_id);

//     // for (const item of formData.tbm_budget_list) {

//     //   const existing = await BudgetsModel.findOne({
//     //     where: {
//     //       tbad_budget_master_id: masterIds,
//     //       tbad_sch_vii_id: item.tbad_sch_vii_id,
//     //       tbad_sub_theme: item.tbad_sub_theme
//     //     },
//     //     transaction
//     //   });

//     //   if (existing) {

//     //     await transaction.rollback();

//     //     return res.status(400).json({
//     //       status: false,
//     //       message: "Entry already exists for this Financial Year + Unit + Thematic Area + Sub-theme"
//     //     });

//     //   }

//     // }

//     for (let index = 0; index < formData.tbm_budget_list.length; index++) {
//       const item = formData.tbm_budget_list[index];

//       const existing = await BudgetsModel.findOne({
//         where: {
//           tbad_budget_master_id: masterIds,
//           tbad_sch_vii_id: item.tbad_sch_vii_id,
//           tbad_sub_theme: item.tbad_sub_theme,
//         },
//         transaction,
//       });

//       if (existing) {
//         await transaction.rollback();

//         return res.status(400).json({
//           status: false,
//           errors: {
//             [`tbm_budget_list[${index}].tbad_sch_vii_id`]:
//               "Duplicate thematic area for this Financial Year + Unit",
//             [`tbm_budget_list[${index}].tbad_sub_theme`]:
//               "Duplicate sub-theme for this Financial Year + Unit",
//           },
//         });
//       }
//     }

//     // =========================
//     // INSERT BUDGET DETAILS
//     // =========================

//     for (const item of formData.tbm_budget_list) {
//       await BudgetsModel.create(
//         {
//           tbad_budget_master_id: masterId,
//           tbad_sch_vii_id: item.tbad_sch_vii_id,
//           tbad_sub_theme: item.tbad_sub_theme,
//           tbad_project_identified: item.tbad_project_identified,
//           tbad_description: item.tbad_description,
//           tbad_amount: item.tbad_amount,
//           tbad_created_by: created_by,
//         },
//         { transaction },
//       );
//     }

//     await transaction.commit();

//     return res.status(200).json({
//       status: true,
//       message: isUpdate
//         ? "Budget updated successfully"
//         : "Budget created successfully",
//       data: { tbm_id: masterId },
//     });
//   } catch (error) {
//     await transaction.rollback();

//     console.error(error);

//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// module.exports.create_budgeting_fun = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const formData = req.body;
//     const created_by = formData.payload?.id ?? 0;
//     const isUpdate = !!formData.tbm_id;

//     let masterId;

//     if (!formData.tbm_budget_list || !formData.tbm_budget_list.length) {
//       await transaction.rollback();
//       return res.status(400).json({
//         status: false,
//         message: "Budget list cannot be empty",
//       });
//     }

//     // UPDATE MASTER
//     if (isUpdate) {
//       const master = await BudgetMasterModel.findByPk(formData.tbm_id);

//       if (!master) {
//         await transaction.rollback();
//         return res.status(404).json({
//           status: false,
//           message: "Budget master not found",
//         });
//       }

//       await master.update(
//         {
//           tbm_type: 'budgeting',
//           tbm_fy_id: formData.tbm_fy_id,
//           tbm_unit_id: formData.tbm_unit_id,
//           tbm_proposed_total_amount: formData.tbm_proposed_total_amount,
//           tbm_state_id: formData.tbm_state_id,
//           tbm_district_id: formData.tbm_district_id,
//           tbm_block_id: formData.tbm_block_id?.join(","),
//           tbm_gram_panchayat_id: formData.tbm_gram_panchayat_id?.join(","),
//           tbm_revenue_village_id: formData.tbm_revenue_village_id?.join(","),
//           tbm_village_id: formData.tbm_village_id?.join(","),
//           tbm_updated_by: created_by,
//           tbm_updated_at: new Date(),
//         },
//         { transaction },
//       );

//       masterId = formData.tbm_id;

//       await BudgetsModel.destroy({
//         where: { tbad_budget_master_id: masterId },
//         transaction,
//       });
//     } else {
//       // CREATE MASTER
//       const master = await BudgetMasterModel.create(
//         {
//           tbm_type: 'budgeting',
//           tbm_fy_id: formData.tbm_fy_id,
//           tbm_unit_id: formData.tbm_unit_id,
//           tbm_proposed_total_amount: formData.tbm_proposed_total_amount,
//           tbm_state_id: formData.tbm_state_id,
//           tbm_district_id: formData.tbm_district_id,
//           tbm_block_id: formData.tbm_block_id?.join(","),
//           tbm_gram_panchayat_id: formData.tbm_gram_panchayat_id?.join(","),
//           tbm_revenue_village_id: formData.tbm_revenue_village_id?.join(","),
//           tbm_village_id: formData.tbm_village_id?.join(","),
//           tbm_created_by: created_by,
//           tbm_updated_by: created_by,

//         },
//         { transaction },
//       );

//       masterId = master.tbm_id;
//     }

//     // DUPLICATE CHECK IN REQUEST
//     const duplicateCheck = new Set();

//     for (let index = 0; index < formData.tbm_budget_list.length; index++) {
//       const item = formData.tbm_budget_list[index];

//       // const key = `${formData.tbm_fy_id}_${formData.tbm_unit_id}_${item.tbad_theme_id}_${item.tbad_sch_vii_id}_${item.tbad_sub_theme}`;
//       const key = `${formData.tbm_fy_id}_${formData.tbm_unit_id}_${item.tbad_sch_vii_id}_${item.tbad_sub_theme}`;

//       if (duplicateCheck.has(key)) {
//         await transaction.rollback();

//         return res.status(400).json({
//           status: false,
//           errors: {
//             [`tbm_budget_list[${index}].tbad_theme_id`]:
//               "Duplicate theme in request",
//             [`tbm_budget_list[${index}].tbad_sch_vii_id`]:
//               "Duplicate thematic area in request",
//             [`tbm_budget_list[${index}].tbad_sub_theme`]:
//               "Duplicate sub-theme in request",
//           },
//         });
//       }

//       duplicateCheck.add(key);
//     }

//     // FETCH OTHER MASTER IDS
//     const masters = await BudgetMasterModel.findAll({
//       attributes: ["tbm_id"],
//       where: {
//         tbm_fy_id: formData.tbm_fy_id,
//         tbm_unit_id: formData.tbm_unit_id,
//         ...(isUpdate && { tbm_id: { [Op.ne]: formData.tbm_id } }),
//       },
//       transaction,
//     });

//     const masterIds = masters.map((m) => m.tbm_id);

//     // DUPLICATE CHECK IN DATABASE
//     if (masterIds.length) {
//       const existingBudgets = await BudgetsModel.findAll({
//         where: {
//           tbad_budget_master_id: { [Op.in]: masterIds },
//         },
//         attributes: ["tbad_theme_id", "tbad_sch_vii_id", "tbad_sub_theme"],
//         transaction,
//       });

//       const existingSet = new Set(
//         existingBudgets.map(
//           (b) => `${b.tbad_theme_id}_${b.tbad_sch_vii_id}_${b.tbad_sub_theme}`,
//         ),
//       );

//       for (let index = 0; index < formData.tbm_budget_list.length; index++) {
//         const item = formData.tbm_budget_list[index];

//         const key = `${item.tbad_theme_id}_${item.tbad_sch_vii_id}_${item.tbad_sub_theme}`;

//         if (existingSet.has(key)) {
//           await transaction.rollback();

//           return res.status(400).json({
//             status: false,
//             errors: {
//               [`tbm_budget_list[${index}].tbad_theme_id`]:
//                 "Duplicate theme for this Financial Year + Unit",
//               [`tbm_budget_list[${index}].tbad_sch_vii_id`]:
//                 "Duplicate thematic area for this Financial Year + Unit",
//               [`tbm_budget_list[${index}].tbad_sub_theme`]:
//                 "Duplicate sub-theme for this Financial Year + Unit",
//             },
//           });
//         }
//       }
//     }

//     // INSERT BUDGET DETAILS
//     const budgetRows = formData.tbm_budget_list.map((item) => ({
//       tbad_budget_master_id: masterId,
//       tbad_theme_id: item.tbad_theme_id,
//       tbad_sch_vii_id: item.tbad_sch_vii_id,
//       tbad_sub_theme: item.tbad_sub_theme,
//       tbad_project_identified: item.tbad_project_identified,
//       tbad_description: item.tbad_description,
//       tbad_amount: item.tbad_amount,
//       tbad_created_by: created_by,
//     }));

//     await BudgetsModel.bulkCreate(budgetRows, { transaction });

//     await transaction.commit();

//     return res.status(200).json({
//       status: true,
//       message: isUpdate
//         ? "Budget updated successfully"
//         : "Budget created successfully",
//       data: { tbm_id: masterId },
//     });
//   } catch (error) {
//     await transaction.rollback();

//     console.error(error);

//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };



module.exports.create_budgeting_fun = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const formData = req.body;
    const created_by = formData.payload?.id ?? 0;
    const isUpdate = !!formData.tbm_id;

    let masterId;

    if (!formData.tbm_budget_list || !formData.tbm_budget_list.length) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        message: "Budget list cannot be empty",
      });
    }

    // =========================
    // UPDATE MASTER
    // =========================
    if (isUpdate) {
      const master = await BudgetMasterModel.findByPk(formData.tbm_id);

      if (!master) {
        await transaction.rollback();
        return res.status(404).json({
          status: false,
          message: "Budget master not found",
        });
      }

      await master.update(
        {
          tbm_type: "budgeting",
          tbm_fy_id: formData.tbm_fy_id,
          tbm_unit_id: formData.tbm_unit_id,
          tbm_proposed_total_amount: formData.tbm_proposed_total_amount,
          tbm_state_id: formData.tbm_state_id,
          tbm_district_id: formData.tbm_district_id,
          tbm_block_id: formData.tbm_block_id?.join(","),
          tbm_gram_panchayat_id: formData.tbm_gram_panchayat_id?.join(","),
          tbm_revenue_village_id: formData.tbm_revenue_village_id?.join(","),
          tbm_village_id: formData.tbm_village_id?.join(","),
          tbm_updated_by: created_by,
          tbm_updated_at: new Date(),
        },
        { transaction }
      );

      masterId = formData.tbm_id;

      await BudgetsModel.destroy({
        where: { tbad_budget_master_id: masterId },
        transaction,
      });
    } else {
      // =========================
      // CREATE MASTER
      // =========================
      const master = await BudgetMasterModel.create(
        {
          tbm_type: "budgeting",
          tbm_fy_id: formData.tbm_fy_id,
          tbm_unit_id: formData.tbm_unit_id,
          tbm_proposed_total_amount: formData.tbm_proposed_total_amount,
          tbm_state_id: formData.tbm_state_id,
          tbm_district_id: formData.tbm_district_id,
          tbm_block_id: formData.tbm_block_id?.join(","),
          tbm_gram_panchayat_id: formData.tbm_gram_panchayat_id?.join(","),
          tbm_revenue_village_id: formData.tbm_revenue_village_id?.join(","),
          tbm_village_id: formData.tbm_village_id?.join(","),
          tbm_created_by: created_by,
          tbm_updated_by: created_by,
        },
        { transaction }
      );

      masterId = master.tbm_id;
    }

    // =========================
    // DUPLICATE CHECK IN REQUEST
    // =========================
    const duplicateCheck = new Set();

    for (let index = 0; index < formData.tbm_budget_list.length; index++) {
      const item = formData.tbm_budget_list[index];

      const key = `${formData.tbm_fy_id}_${formData.tbm_unit_id}_${item.tbad_sch_vii_id}_${item.tbad_sub_theme}`;

      if (duplicateCheck.has(key)) {
        await transaction.rollback();

        return res.status(400).json({
          status: false,
          errors: {
            [`tbm_budget_list[${index}].tbad_sch_vii_id`]:
              "Duplicate thematic area in request",
            [`tbm_budget_list[${index}].tbad_sub_theme`]:
              "Duplicate sub-theme in request",
          },
        });
      }

      duplicateCheck.add(key);
    }

    // =========================
    // FETCH OTHER MASTER IDS
    // =========================
    const masters = await BudgetMasterModel.findAll({
      attributes: ["tbm_id"],
      where: {
        tbm_fy_id: formData.tbm_fy_id,
        tbm_unit_id: formData.tbm_unit_id,
        ...(isUpdate && { tbm_id: { [Op.ne]: formData.tbm_id } }),
      },
      transaction,
    });

    const masterIds = masters.map((m) => m.tbm_id);

    // =========================
    // DUPLICATE CHECK IN DATABASE
    // =========================
    if (masterIds.length) {
      const existingBudgets = await BudgetsModel.findAll({
        where: {
          tbad_budget_master_id: { [Op.in]: masterIds },
        },
        attributes: ["tbad_sch_vii_id", "tbad_sub_theme"],
        transaction,
      });

      const existingSet = new Set(
        existingBudgets.map(
          (b) => `${b.tbad_sch_vii_id}_${b.tbad_sub_theme}`
        )
      );

      for (let index = 0; index < formData.tbm_budget_list.length; index++) {
        const item = formData.tbm_budget_list[index];

        const key = `${item.tbad_sch_vii_id}_${item.tbad_sub_theme}`;

        if (existingSet.has(key)) {
          await transaction.rollback();

          return res.status(400).json({
            status: false,
            errors: {
              [`tbm_budget_list[${index}].tbad_sch_vii_id`]:
                "Duplicate thematic area for this Financial Year + Unit",
              [`tbm_budget_list[${index}].tbad_sub_theme`]:
                "Duplicate sub-theme for this Financial Year + Unit",
            },
          });
        }
      }
    }

    // =========================
    // INSERT BUDGET DETAILS
    // =========================
    const budgetRows = formData.tbm_budget_list.map((item) => ({
      tbad_budget_master_id: masterId,
      tbad_sch_vii_id: item.tbad_sch_vii_id,
      tbad_sub_theme: item.tbad_sub_theme,
      tbad_project_identified: item.tbad_project_identified,
      tbad_description: item.tbad_description,
      tbad_amount: item.tbad_amount,
      tbad_created_by: created_by,
    }));

    await BudgetsModel.bulkCreate(budgetRows, { transaction });

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: isUpdate
        ? "Budget updated successfully"
        : "Budget created successfully",
      data: { tbm_id: masterId },
    });
  } catch (error) {
    await transaction.rollback();

    console.error(error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports.create_ammendment_budgeting_fun = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const formData = req.body;
    const created_by = formData.payload.id;
    let masterId;

    // ➕ Create new master
    const master = await BudgetAmmendmentMasterModel.create(
      {
        tbam_budget_master_id: formData.tbam_budget_master_id,
        tbam_domain_id: formData.tbam_domain_id,
        tbam_plant_id: formData.tbam_plant_id,
        tbam_bu_id: formData.tbam_bu_id,
        tbam_sbu_id: formData.tbam_sbu_id,
        tbam_state_id: formData.tbam_state_id,
        tbam_district_id: formData.tbam_district_id,
        tbam_block_id: formData.tbam_block_id,
        tbam_nature_of_project: formData.tbam_nature_of_project,
        tbam_schedule_vii_id: formData.tbam_schedule_vii_id,
        tbam_sub_schedule_vii_id: formData.tbam_sub_schedule_vii_id,
        tbam_sdg_id: formData.tbam_sdg_id,
        tbam_national_indicator_framework:
          formData.tbam_national_indicator_framework,
        tbam_thematic_area: formData.tbam_thematic_area,
        tbam_created_by: created_by,
      },
      { transaction },
    );

    masterId = master.tbam_id;
    // ✅ Commit
    await transaction.commit();

    return res.status(200).json({
      message: "Budget Ammendement data created successfully.",
      data: { tbam_id: masterId },
      status: true,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Budget Ammendement Create/Update Error:", err);

    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// module.exports.budgeting_list_fun = async (req, res, next) => {
//   try {
//     let { status, page = 1, limit = 10 } = req.query;

//     page = parseInt(page);
//     limit = parseInt(limit);
//     const offset = (page - 1) * limit;

//     // ✅ Main SQL query
//     let sql = `
//       SELECT
//         master.*,
//         budget_list.tbm_budget_list,
//         t_financial_year.tfy_year_label,

//         users.name,
//         approvers.*
//       FROM t_budget_master AS master
//       LEFT JOIN (
//           SELECT
//               tbad_budget_master_id,
//               json_agg(t_budgets.*) as tbm_budget_list
//           FROM t_budgets
//           GROUP BY tbad_budget_master_id
//       ) budget_list
//           ON budget_list.tbad_budget_master_id = master.tbm_id
//       LEFT JOIN t_financial_year
//           ON t_financial_year.tfy_id = master.tbm_fy_id
//       LEFT JOIN users
//           ON users.id = master.tbm_created_by
//       LEFT JOIN LATERAL (
//     SELECT ap.tapp_approval_order,
//            json_agg(row_to_json(u)) AS approvers
//     FROM t_approval_path ap
//     CROSS JOIN LATERAL unnest(string_to_array(ap.tapp_role_id, ',')) AS unnested(role_id)
//     JOIN users u
//         ON u.role_id = unnested.role_id::varchar
//     WHERE ap.tapp_tap_slug = 'budgeting'
//     GROUP BY ap.tapp_approval_order
// ) approvers
// ON approvers.tapp_approval_order = master.tbm_approval_order

//       WHERE 1=1
//     `;

//     // ✅ Optional filter
//     if (status) {
//       sql += ` AND master.tbm_status = :status `;
//     }

//     // ✅ Order + Pagination
//     sql += ` ORDER BY master.tbm_id DESC LIMIT :limit OFFSET :offset `;

//     // ✅ Count query
//     let countSql = `
//       SELECT COUNT(*) AS total
//       FROM t_budget_master
//       WHERE 1=1
//     `;
//     if (status) {
//       countSql += ` AND tbm_status = :status `;
//     }

//     // ✅ Execute queries safely
//     const data = await sequelize.query(sql, {
//       replacements: { status, limit, offset },
//       type: QueryTypes.SELECT,
//     });

//     const countResult = await sequelize.query(countSql, {
//       replacements: { status },
//       type: QueryTypes.SELECT,
//     });

//     const total = parseInt(countResult[0]?.total || 0);

//     return res.status(200).json({
//       message: "Budgets fetched successfully.",
//       budgets: data,
//       total,
//       status: true,
//     });
//   } catch (err) {
//     console.error("Budget List Error:", err);
//     return next(
//       CustomErrorHandler.internalServerError({
//         message: err.message,
//         stack: err.stack,
//       }),
//     );
//   }
// };

// module.exports.budgeting_details_fun = async (req, res, next) => {
//   try {
//     const { budgeting_id } = req.body;

//     let user_id= req.body.payload.id;

//     var sql = `
// SELECT
//     master.*,
//     master.tbm_budget_list AS tbm_budget_list_data,
//     budget_list.tbm_budget_list,
//     budget_ammendment_list.tbm_budget_ammendment_list,
//     t_financial_year.tfy_year_label,
//     t_state.tsl_state_name,
//     t_district.tdl_district_name,
//     t_block.tbl_block_name,
//     users.name
// FROM t_budget_master AS master

// LEFT JOIN (
//     SELECT
//         t_budgets.tbad_budget_master_id,
//         json_agg(
//             json_build_object(
//                 'tbad_id', t_budgets.tbad_id,
//                 'tbad_activity_id', t_budgets.tbad_activity_id,
//                 'tbad_focus_area_id', t_budgets.tbad_focus_area_id,
//                 'tbad_sch_vii_id', t_budgets.tbad_sch_vii_id,
//                 'tbad_sub_activity_id', t_budgets.tbad_sub_activity_id,
//                 'tbad_sdg_id', t_budgets.tbad_sdg_id,
//                 'tbad_target_beneficiary', t_budgets.tbad_target_beneficiary,
//                 'tbad_amount', t_budgets.tbad_amount,
//                 'tbad_remarks', t_budgets.tbad_remarks,
//                 'tbad_status', t_budgets.tbad_status,
//                 'tactm_activity_name', t_activity_master.tactm_activity_name,
//                 'tfam_focus_area_name', t_sub_schedule_master.tsubshcm_sub_schedule_name,
//                 'tschm_schedule_name', t_schedule_seven_master.tschm_schedule_name,
//                 'tsactm_sub_activity_name', t_sub_activity_master.tsactm_sub_activity_name,
//                 'tsdg_name', t_sdg_master.tsdg_name
//             )
//         ) AS tbm_budget_list
//     FROM t_budgets

//     LEFT JOIN t_schedule_seven_master
//         ON t_schedule_seven_master.tschm_schedule_id = t_budgets.tbad_sch_vii_id

//     LEFT JOIN t_sub_schedule_master
//         ON t_sub_schedule_master.tsubshcm_sub_schedule_id = t_budgets.tbad_focus_area_id

//     LEFT JOIN t_activity_master
//         ON t_activity_master.tactm_activity_id = t_budgets.tbad_activity_id

//     LEFT JOIN t_sub_activity_master
//         ON t_sub_activity_master.tsactm_sub_activity_id = t_budgets.tbad_sub_activity_id

//     LEFT JOIN t_sdg_master
//         ON t_sdg_master.tsdg_id = t_budgets.tbad_sdg_id

//     GROUP BY t_budgets.tbad_budget_master_id
// ) budget_list
//     ON budget_list.tbad_budget_master_id = master.tbm_id

// LEFT JOIN (
//     SELECT
//         t_budget_ammendment_master.tbam_budget_master_id,
//         json_agg(
//             json_build_object(
//                 'tbam_id', t_budget_ammendment_master.tbam_id,
//                 'tbam_domain_id', t_budget_ammendment_master.tbam_domain_id,
//                 'tbam_plant_id', t_budget_ammendment_master.tbam_plant_id,
//                 'tbam_bu_id', t_budget_ammendment_master.tbam_bu_id,
//                 'tbam_sbu_id', t_budget_ammendment_master.tbam_sbu_id,
//                 'tbam_state_id', t_budget_ammendment_master.tbam_state_id,
//                 'tbam_district_id', t_budget_ammendment_master.tbam_district_id,
//                 'tbam_block_id', t_budget_ammendment_master.tbam_block_id,
//                 'tbam_nature_of_project', t_budget_ammendment_master.tbam_nature_of_project,
//                 'tbam_schedule_vii_id', t_budget_ammendment_master.tbam_schedule_vii_id,
//                 'tbam_sub_schedule_vii_id', t_budget_ammendment_master.tbam_sub_schedule_vii_id,
//                 'tbam_sdg_id', t_budget_ammendment_master.tbam_sdg_id,
//                 'tbam_national_indicator_framework', t_budget_ammendment_master.tbam_national_indicator_framework,
//                 'tbam_thematic_area', t_budget_ammendment_master.tbam_thematic_area,
//                 'tfam_focus_area_name', t_focus_area_master.tfam_focus_area_name,
//                 'tschm_schedule_name', t_schedule_seven_master.tschm_schedule_name,
//                 'tthm_theme_name', t_theme_master.tthm_theme_name,
//                 'tsdg_name', t_sdg_master.tsdg_name,
//                 'tnif_indicator', t_national_indicator_master.tnif_indicator,
//                 'tsl_state_name', t_state.tsl_state_name,
//                 'tdl_district_name', t_district.tdl_district_name,
//                 'tbl_block_name', t_block.tbl_block_name
//             )
//         ) AS tbm_budget_ammendment_list
//     FROM t_budget_ammendment_master

//     LEFT JOIN t_schedule_seven_master
//         ON t_schedule_seven_master.tschm_schedule_id = t_budget_ammendment_master.tbam_schedule_vii_id

//     LEFT JOIN t_focus_area_master
//         ON t_focus_area_master.tfam_focus_area_id = t_budget_ammendment_master.tbam_sub_schedule_vii_id

//     LEFT JOIN t_sdg_master
//         ON t_sdg_master.tsdg_id = t_budget_ammendment_master.tbam_sdg_id

//     LEFT JOIN t_theme_master
//         ON t_theme_master.tthm_theme_id = t_budget_ammendment_master.tbam_thematic_area

//     LEFT JOIN t_national_indicator_master
//         ON t_national_indicator_master.tnif_id = t_budget_ammendment_master.tbam_national_indicator_framework

//     LEFT JOIN t_state
//         ON t_state.tsl_state_id = t_budget_ammendment_master.tbam_state_id

//     LEFT JOIN t_district
//         ON t_district.tdl_district_id = t_budget_ammendment_master.tbam_district_id

//     LEFT JOIN t_block
//         ON t_block.tbl_block_id = t_budget_ammendment_master.tbam_block_id

//     GROUP BY t_budget_ammendment_master.tbam_budget_master_id
// ) budget_ammendment_list
//     ON budget_ammendment_list.tbam_budget_master_id = master.tbm_id

// LEFT JOIN t_financial_year
//     ON t_financial_year.tfy_id = master.tbm_fy_id

// LEFT JOIN t_state
//     ON t_state.tsl_state_id = master.tbm_state_id

// LEFT JOIN t_district
//     ON t_district.tdl_district_id = master.tbm_district_id

// LEFT JOIN t_block
//     ON t_block.tbl_block_id = master.tbm_block_id

// LEFT JOIN users
//     ON users.id = master.tbm_created_by
// `;

//     sql += ` WHERE master.tbm_id = '${budgeting_id}' `;
//     var data = await sequelize.query(sql, {
//       type: QueryTypes.SELECT,
//     });
//     console.log("data", data);
//         const fy_id = data[0]?.tbm_fy_id;
//         console.log(fy_id);
//         const approvalTotalResult = await sequelize.query(
//       `
//       SELECT COALESCE(SUM(tbm_total_budget_amount), 0) AS total_approved
//       FROM t_approval_process_track
//       LEFT JOIN t_budget_master
//         ON apt_item_id = tbm_id
//       WHERE apt_type = 'budgeting'
//         AND apt_accept_status = 'approved'
//         AND apt_user_id = :user_id
//         AND tbm_fy_id = :fy_id
//       `,
//       {
//         replacements: {

//           user_id,
//           fy_id,
//         },
//         type: QueryTypes.SELECT,
//       }
//     );

//     if (data.length > 0) {
//       return res.status(200).json({
//         message: "Budget detail fetched successfully.",
//         data: data[0],
//         totalApprovedAmount: approvalTotalResult[0]?.total_approved || 0,
//         status: true,
//       });
//     } else {
//       return res.status(200).json({
//         message: "Budget detail not found.",
//         status: false,
//         data: [],
//       });
//     }
//   } catch (err) {
//     console.error("Budget Delete Error:", err);
//     return next(
//       CustomErrorHandler.internalServerError({
//         message: err.message,
//         stack: err.stack,
//       }),
//     );
//   }
// };

module.exports.budgeting_list_fun = async (req, res, next) => {
  try {
    let { status, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let sql = `

SELECT 
    master.*,

    fy.tfy_year_label,
    t_unit.tun_name,
    t_state.tsl_state_name,
    t_district.tdl_district_name,
    t_block.tbl_block_name,
    gp.tgrm_grampanchayat_name,
    rv.trevvlg_revenue_village_name,
    village.tvl_village_name,
    tov.ttovill_type_of_village,

    budget_list.tbm_budget_list,

    users.name as created_by_name

FROM t_budget_master master

LEFT JOIN t_financial_year fy
    ON fy.tfy_id = master.tbm_fy_id

LEFT JOIN t_unit
    ON t_unit.tun_id = master.tbm_unit_id

LEFT JOIN t_state
    ON t_state.tsl_state_id = master.tbm_state_id

LEFT JOIN t_district
    ON t_district.tdl_district_id = master.tbm_district_id

LEFT JOIN t_block
    ON t_block.tbl_block_id = master.tbm_block_id

LEFT JOIN t_grampanchayat gp
    ON gp.tgrm_grampanchayat_id = master.tbm_gram_panchayat_id

LEFT JOIN t_revenue_village rv
    ON rv.trevvlg_revenue_village_id = master.tbm_revenue_village_id

LEFT JOIN t_villages village
    ON village.tvl_village_id = master.tbm_village_id

LEFT JOIN t_type_of_village tov
    ON tov.ttovill_type_village_id = master.tbm_village_type_id

LEFT JOIN users
    ON users.id = master.tbm_created_by


LEFT JOIN (

    SELECT 
        b.tbad_budget_master_id,

        json_agg(

            json_build_object(

                'tbad_id', b.tbad_id,
                'tbad_theme_id', b.tbad_theme_id,
                'tbad_sch_vii_id', b.tbad_sch_vii_id,
                'tbad_sub_theme', b.tbad_sub_theme,
                'tbad_project_identified', b.tbad_project_identified,
                'tbad_description', b.tbad_description,
                'tbad_amount', b.tbad_amount,

                'theme_name', th.tthm_theme_name,
                'schedule_name', sch.tschm_schedule_name,
                'sub_schedule_name', sub.tsubshcm_sub_schedule_name

            )

            ORDER BY b.tbad_id

        ) AS tbm_budget_list

    FROM t_budgets b

    LEFT JOIN t_theme_master th
        ON th.tthm_theme_id = b.tbad_theme_id

    LEFT JOIN t_schedule_seven_master sch
        ON sch.tschm_schedule_id = b.tbad_sch_vii_id

    LEFT JOIN t_sub_schedule_master sub
        ON sub.tsubshcm_sub_schedule_id = b.tbad_sub_theme

    GROUP BY b.tbad_budget_master_id

) budget_list

ON budget_list.tbad_budget_master_id = master.tbm_id

WHERE 1=1
`;

    if (status) {
      sql += ` AND master.tbm_status = :status `;
    }

    sql += ` ORDER BY master.tbm_created_at DESC LIMIT :limit OFFSET :offset `;

    let countSql = `
      SELECT COUNT(*) AS total
      FROM t_budget_master
      WHERE 1=1
    `;

    if (status) {
      countSql += ` AND tbm_status = :status `;
    }

    const data = await sequelize.query(sql, {
      replacements: { status, limit, offset },
      type: QueryTypes.SELECT,
    });

    const countResult = await sequelize.query(countSql, {
      replacements: { status },
      type: QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total || 0);

    return res.status(200).json({
      message: "Budgets fetched successfully.",
      budgets: data,
      total,
      status: true,
    });
  } catch (err) {
    console.error("Budget List Error:", err);

    return next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      }),
    );
  }
};

// old
// module.exports.budgeting_list_fun = async (req, res, next) => {
//   try {
//     let { status, page = 1, limit = 10 } = req.query;

//     page = parseInt(page);
//     limit = parseInt(limit);
//     const offset = (page - 1) * limit;

//     let sql = `

// SELECT
//     master.*,
//     fy.tfy_year_label,
//     t_unit.tun_name,
//     t_state.tsl_state_name,
//     t_district.tdl_district_name,
//     t_block.tbl_block_name,
//     gp.tgrm_grampanchayat_name,
//     rv.trevvlg_revenue_village_name,
//     village.tvl_village_name,
//     tov.ttovill_type_of_village,

//     budget_list.tbm_budget_list,

//     users.name as created_by_name

// FROM t_budget_master master

//     LEFT JOIN t_financial_year fy
//     ON fy.tfy_id = master.tbm_fy_id

// LEFT JOIN t_unit
//     ON t_unit.tun_id = master.tbm_unit_id

// LEFT JOIN t_state
//     ON t_state.tsl_state_id = master.tbm_state_id

// LEFT JOIN t_district
//     ON t_district.tdl_district_id = master.tbm_district_id

// LEFT JOIN t_block
//     ON t_block.tbl_block_id = master.tbm_block_id

// LEFT JOIN t_grampanchayat gp
//     ON gp.tgrm_grampanchayat_id = master.tbm_gram_panchayat_id

// LEFT JOIN t_revenue_village rv
//     ON rv.trevvlg_revenue_village_id = master.tbm_revenue_village_id

// LEFT JOIN t_villages village
//     ON village.tvl_village_id = master.tbm_village_id

// LEFT JOIN t_type_of_village tov
//     ON tov.ttovill_type_village_id = master.tbm_village_type_id

// LEFT JOIN users
//     ON users.id = master.tbm_created_by

// LEFT JOIN (
//     SELECT
//         tbad_budget_master_id,

//         json_agg(
//             json_build_object(
//                 'tbad_id', tbad_id,
//                 'tbad_sch_vii_id', tbad_sch_vii_id,
//                 'tbad_sub_theme', tbad_sub_theme,
//                 'tbad_project_identified', tbad_project_identified,
//                 'tbad_description', tbad_description,
//                 'tbad_amount', tbad_amount
//             )
//         ) AS tbm_budget_list

//     FROM t_budgets
//     GROUP BY tbad_budget_master_id

// ) budget_list

// ON budget_list.tbad_budget_master_id = master.tbm_id

// WHERE 1=1
// `;

//     // status filter
//     if (status) {
//       sql += ` AND master.tbm_status = :status `;
//     }

//     // pagination
//     sql += ` ORDER BY master.tbm_created_at DESC LIMIT :limit OFFSET :offset `;

//     let countSql = `
//       SELECT COUNT(*) AS total
//       FROM t_budget_master
//       WHERE 1=1
//     `;

//     if (status) {
//       countSql += ` AND tbm_status = :status `;
//     }

//     const data = await sequelize.query(sql, {
//       replacements: { status, limit, offset },
//       type: QueryTypes.SELECT,
//     });

//     const countResult = await sequelize.query(countSql, {
//       replacements: { status },
//       type: QueryTypes.SELECT,
//     });

//     const total = parseInt(countResult[0]?.total || 0);

//     return res.status(200).json({
//       message: "Budgets fetched successfully.",
//       budgets: data,
//       total,
//       status: true,
//     });
//   } catch (err) {
//     console.error("Budget List Error:", err);

//     return next(
//       CustomErrorHandler.internalServerError({
//         message: err.message,
//         stack: err.stack,
//       }),
//     );
//   }
// };

module.exports.budgeting_details_fun = async (req, res, next) => {
  try {
    const { budgeting_id } = req.body;

    const sql = `

SELECT 
    master.*,

    fy.tfy_year_label,
    t_unit.tun_name,
    t_state.tsl_state_name,
    t_district.tdl_district_name,
    t_block.tbl_block_name,
    gp.tgrm_grampanchayat_name,
    rv.trevvlg_revenue_village_name,
    village.tvl_village_name,
    tov.ttovill_type_of_village,

    budget_list.tbm_budget_list,

    users.name as created_by_name

FROM t_budget_master master

LEFT JOIN t_financial_year fy
    ON fy.tfy_id = master.tbm_fy_id

LEFT JOIN t_unit 
    ON t_unit.tun_id = master.tbm_unit_id

LEFT JOIN t_state 
    ON t_state.tsl_state_id = master.tbm_state_id

LEFT JOIN t_district 
    ON t_district.tdl_district_id = master.tbm_district_id

LEFT JOIN t_block 
    ON t_block.tbl_block_id = master.tbm_block_id

LEFT JOIN t_grampanchayat gp
    ON gp.tgrm_grampanchayat_id = master.tbm_gram_panchayat_id

LEFT JOIN t_revenue_village rv
    ON rv.trevvlg_revenue_village_id = master.tbm_revenue_village_id

LEFT JOIN t_villages village
    ON village.tvl_village_id = master.tbm_village_id

LEFT JOIN t_type_of_village tov
    ON tov.ttovill_type_village_id = master.tbm_village_type_id

LEFT JOIN users
    ON users.id = master.tbm_created_by


LEFT JOIN (

    SELECT 
        b.tbad_budget_master_id,

        json_agg(

            json_build_object(

                'tbad_id', b.tbad_id,
                'tbad_theme_id', b.tbad_theme_id,
                'tthm_theme_name', th.tthm_theme_name,

                'tbad_sch_vii_id', b.tbad_sch_vii_id,
                'tschm_schedule_name', ssm.tschm_schedule_name,

                'tbad_sub_theme', b.tbad_sub_theme,
                'tsubshcm_sub_schedule_name', sub.tsubshcm_sub_schedule_name,

                'tbad_project_identified', b.tbad_project_identified,
                'tbad_description', b.tbad_description,
                'tbad_amount', b.tbad_amount

            )

            ORDER BY b.tbad_id

        ) AS tbm_budget_list

    FROM t_budgets b

    LEFT JOIN t_theme_master th
        ON th.tthm_theme_id = b.tbad_theme_id

    LEFT JOIN t_schedule_seven_master ssm
        ON ssm.tschm_schedule_id = b.tbad_sch_vii_id

    LEFT JOIN t_sub_schedule_master sub
        ON sub.tsubshcm_sub_schedule_id = b.tbad_sub_theme

    GROUP BY b.tbad_budget_master_id

) budget_list

ON budget_list.tbad_budget_master_id = master.tbm_id

WHERE master.tbm_id = :budgeting_id

`;

    const data = await sequelize.query(sql, {
      replacements: { budgeting_id },
      type: QueryTypes.SELECT,
    });

    if (!data.length) {
      return res.status(200).json({
        status: false,
        message: "Budget not found",
        data: [],
      });
    }

    return res.status(200).json({
      status: true,
      message: "Budget details fetched successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Budget Details Error:", err);

    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
// old
// module.exports.budgeting_details_fun = async (req, res, next) => {
//   try {
//     const { budgeting_id } = req.body;

//     let user_id = req.body.payload.id;

//     let sql = `

// SELECT
//     master.*,
//     fy.tfy_year_label,
//     t_unit.tun_name,
//     t_state.tsl_state_name,
//     t_district.tdl_district_name,
//     t_block.tbl_block_name,
//     gp.tgrm_grampanchayat_name,
//     rv.trevvlg_revenue_village_name,
//     village.tvl_village_name,
//     tov.ttovill_type_of_village,

//     budget_list.tbm_budget_list,

//     users.name as created_by_name

// FROM t_budget_master master

// LEFT JOIN t_financial_year fy
//     ON fy.tfy_id = master.tbm_fy_id

// LEFT JOIN t_unit
//     ON t_unit.tun_id = master.tbm_unit_id

// LEFT JOIN t_state
//     ON t_state.tsl_state_id = master.tbm_state_id

// LEFT JOIN t_district
//     ON t_district.tdl_district_id = master.tbm_district_id

// LEFT JOIN t_block
//     ON t_block.tbl_block_id = master.tbm_block_id

// LEFT JOIN t_grampanchayat gp
//     ON gp.tgrm_grampanchayat_id = master.tbm_gram_panchayat_id

// LEFT JOIN t_revenue_village rv
//     ON rv.trevvlg_revenue_village_id = master.tbm_revenue_village_id

// LEFT JOIN t_villages village
//     ON village.tvl_village_id = master.tbm_village_id

// LEFT JOIN t_type_of_village tov
//     ON tov.ttovill_type_village_id = master.tbm_village_type_id

// LEFT JOIN users
//     ON users.id = master.tbm_created_by

// LEFT JOIN (
//     SELECT
//         b.tbad_budget_master_id,

//         json_agg(
//             json_build_object(
//                 'tbad_id', b.tbad_id,
//                 'tbad_sch_vii_id', b.tbad_sch_vii_id,
//                 'tschm_schedule_name', ssm.tschm_schedule_name,
//                 'tbad_sub_theme', b.tbad_sub_theme,
//                 'tsubshcm_sub_schedule_name', sub.tsubshcm_sub_schedule_name,
//                 'tbad_project_identified', b.tbad_project_identified,
//                 'tbad_description', b.tbad_description,
//                 'tbad_amount', b.tbad_amount
//             )
//         ) AS tbm_budget_list

//     FROM t_budgets b

//     LEFT JOIN t_schedule_seven_master ssm
//         ON ssm.tschm_schedule_id = b.tbad_sch_vii_id

//     LEFT JOIN t_sub_schedule_master sub
//         ON sub.tsubshcm_sub_schedule_id = b.tbad_sub_theme

//     GROUP BY b.tbad_budget_master_id

// ) budget_list
// ON budget_list.tbad_budget_master_id = master.tbm_id
// WHERE master.tbm_id = :budgeting_id
// `;

//     const data = await sequelize.query(sql, {
//       replacements: { budgeting_id },
//       type: QueryTypes.SELECT,
//     });

//     if (data.length === 0) {
//       return res.status(200).json({
//         status: false,
//         message: "Budget not found",
//         data: [],
//       });
//     }

//     return res.status(200).json({
//       status: true,
//       message: "Budget details fetched successfully",
//       data: data[0],
//     });
//   } catch (err) {
//     console.error("Budget Details Error:", err);

//     return res.status(500).json({
//       status: false,
//       message: err.message,
//     });
//   }
// };

module.exports.budgeting_details_by_budget_id_fun = async (req, res, next) => {
  try {
    const { budget_id } = req.body;

    let sql = `

SELECT 
    master.*,
    fy.tfy_year_label,
    t_unit.tun_name,
    t_state.tsl_state_name,
    t_district.tdl_district_name,
    t_block.tbl_block_name,
    gp.tgrm_grampanchayat_name,
    rv.trevvlg_revenue_village_name,
    village.tvl_village_name,
    tov.ttovill_type_of_village,

    b.tbad_id,
    b.tbad_theme_id,
    th.tthm_theme_id,
    th.tthm_theme_name,
    b.tbad_sch_vii_id,
    ssm.tschm_schedule_name,
    b.tbad_sub_theme,
    sub.tsubshcm_sub_schedule_name,
    b.tbad_project_identified,
    b.tbad_description,
    b.tbad_amount,

    users.name as created_by_name

FROM t_budget_master master

INNER JOIN t_budgets b
    ON b.tbad_budget_master_id = master.tbm_id

    LEFT JOIN t_theme_master th
    ON th.tthm_theme_id = b.tbad_theme_id

LEFT JOIN t_schedule_seven_master ssm
    ON ssm.tschm_schedule_id = b.tbad_sch_vii_id

LEFT JOIN t_sub_schedule_master sub
    ON sub.tsubshcm_sub_schedule_id = b.tbad_sub_theme

LEFT JOIN t_financial_year fy
    ON fy.tfy_id = master.tbm_fy_id

LEFT JOIN t_unit 
    ON t_unit.tun_id = master.tbm_unit_id

LEFT JOIN t_state 
    ON t_state.tsl_state_id = master.tbm_state_id

LEFT JOIN t_district 
    ON t_district.tdl_district_id = master.tbm_district_id

LEFT JOIN t_block 
    ON t_block.tbl_block_id = master.tbm_block_id

LEFT JOIN t_grampanchayat gp
    ON gp.tgrm_grampanchayat_id = master.tbm_gram_panchayat_id

LEFT JOIN t_revenue_village rv
    ON rv.trevvlg_revenue_village_id = master.tbm_revenue_village_id

LEFT JOIN t_villages village
    ON village.tvl_village_id = master.tbm_village_id

LEFT JOIN t_type_of_village tov
    ON tov.ttovill_type_village_id = master.tbm_village_type_id

LEFT JOIN users
    ON users.id = master.tbm_created_by

WHERE b.tbad_id = :budget_id
`;

    const data = await sequelize.query(sql, {
      replacements: { budget_id },
      type: QueryTypes.SELECT,
    });

    if (!data.length) {
      return res.status(404).json({
        status: false,
        message: "Budget not found",
      });
    }

    const budget = data[0];

    const unit_id = budget.tbm_unit_id;

    /* ---------------- UNIT LOCATION LOGIC ---------------- */

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

    let unit_locations = {
      blocks: [],
      grampanchayats: [],
      revenue_villages: [],
      villages: [],
    };

    if (records.length) {
      const block_ids = [
        ...new Set(records.map((r) => r.tunsd_block_id).filter(Boolean)),
      ];
      const gp_ids = [
        ...new Set(
          records.map((r) => r.tunsd_grampanchayat_id).filter(Boolean),
        ),
      ];
      const rv_ids = [
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
          where: { trevvlg_revenue_village_id: rv_ids },
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

      unit_locations = {
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
      };
    }

    return res.status(200).json({
      status: true,
      message: "Budget details fetched successfully",
      data: {
        budget_details: budget,
        unit_locations,
      },
    });
  } catch (err) {
    console.error("Budget Details Error:", err);

    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

module.exports.delete_budgeting_row_fun = async (req, res, next) => {
  try {
    const { tbad_id } = req.body;

    await BudgetsModel.destroy({
      where: { tbad_id },
    });

    return res.status(200).json({
      message: "Budget detail deleted successfully.",
      status: true,
    });
  } catch (err) {
    console.error("Budget Delete Error:", err);
    return next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      }),
    );
  }
};

// module.exports.send_budgeting_for_approval_fun = async (req, res, next) => {
//   try {
//     const { tbm_id } = req.body;

//     await BudgetMasterModel.update(
//       {
//         tbm_status: "send_for_approval",
//         tbm_approval_order: 1, // Assuming first approval order
//         tbm_approval_type: "budgeting", // or "parallel" based on your logic
//         tbm_updated_by: req.body.payload.id,
//       },
//       {
//         where: { tbm_id },
//       }
//     );
//     let approval_order = 1;
//     let ItemId = tbm_id;
//     let creatorUserId = req.body.payload.id;
//     let roleId = req.body.payload.role_id;

//     // Notify system about status change
//     await notificationStatusChange("budgeting", tbm_id);

//     // Notification and approval tracking
//     const ApprovalPathListData = await ApprovalPathList(
//       "budgeting",
//       approval_order
//     );

//     await Promise.all(
//       ApprovalPathListData.map(async (data) => {
//         // Split comma-separated role ids: "2,3,4" → ["2","3","4"]
//         const roleIds = data.tapp_role_id.split(",").map((r) => r.trim());

//         let approvalUsers = [];
//         for (const roleId of roleIds) {
//           const users = await getUserByRoleId(roleId);
//           approvalUsers = approvalUsers.concat(users);
//         }

//         if (approvalUsers.length > 0) {
//           const tenDigitNumber = generateTenDigitNumber();

//           const notifications = approvalUsers.map((user_data) => ({
//             tnot_module: "budgeting",
//             tnot_type: "budgeting",
//             tnot_item_id: ItemId,
//             tnot_receiver_id: user_data.id,
//             tnot_text: "Approval for budgeting",
//             tnot_url: `budgeting/budgeting_details/${ItemId}?rand=${tenDigitNumber}`,
//             tnot_sender_id: creatorUserId,
//           }));

//           // Insert all at once
//           await NotificationModel.bulkCreate(notifications);
//         }
//       })
//     );

//     // Insert approval tracking if not already done

//     await ApprovalProcessTrackModel.create({
//       apt_type: "budgeting",
//       apt_item_id: ItemId,
//       apt_user_id: creatorUserId,
//       apt_user_role: roleId,
//       apt_recipient_id: creatorUserId,
//       apt_remarks: "sending for approval",
//       apt_accept_step: "initial",
//       apt_accept_status: "approval",
//       apt_created_at: new Date(),
//       apt_updated_at: new Date(),
//       apt_created_by: creatorUserId,
//       apt_updated_by: creatorUserId,
//     });

//     return res.status(200).json({
//       message: "Budget sent for approval successfully.",
//       status: true,
//     });
//   } catch (err) {
//     console.error("Budget Delete Error:", err);
//     return next(
//       CustomErrorHandler.internalServerError({
//         message: err.message,
//         stack: err.stack,
//       })
//     );
//   }
// };

module.exports.send_budgeting_for_approval_fun = async (req, res, next) => {
  try {
    const {
      item_id,
      remarks,
      user_id,
      payload: { id: createdById, user_type, role_id: initiator_role_id },
    } = req.body;

    if (
      !item_id ||
      !user_id ||
      !createdById ||
      !user_type ||
      !initiator_role_id
    ) {
      return res.status(400).json({
        status: 0,
        message: "Missing required fields.",
      });
    }

    const moduleType = "budgeting";

    // Get approval path
    const ApprovalPathListData = await ApprovalDetails(
      moduleType,
      initiator_role_id,
    );
    // console.log(ApprovalPathListData);return

    // Change notification status
    await notificationStatusChange(moduleType, item_id);

    if (!ApprovalPathListData || !ApprovalPathListData.length) {
      return res.status(404).json({
        status: 0,
        message: "No approval path found.",
      });
    }

    const approvalPath = ApprovalPathListData[0];
    const approval_path_id = approvalPath.tac_id;
    const firstStep = approvalPath.tac_approval_json?.[0];

    if (!firstStep) {
      return res.status(400).json({
        status: 0,
        message: "Approval steps not defined in the path.",
      });
    }

    const { role_id, forward: forward_option } = firstStep;

    // Update notification model
    await NotificationModel.create({
      tnot_type: moduleType,
      tnot_item_id: item_id,
      tnot_receiver_id: user_id,
      tnot_text: "Approval For Budgeting",
      tnot_url: `budgeting/budgeting_details/${item_id}`,
      tnot_sender_id: createdById,
      tnot_table_type: "budget_master",
    });

    // Update existing proposal with notification type
    const existingBudget = await BudgetMasterModel.findOne({
      where: { tbm_id: item_id },
    });
    if (existingBudget) {
      existingBudget.tbm_not_type = moduleType;
      await existingBudget.save();
    }

    // Track approval
    await ApprovalProcessTrackModel.create({
      apt_type: moduleType,
      apt_item_id: item_id,
      apt_user_id: createdById,
      apt_user_role: initiator_role_id,
      apt_recipient_id: createdById,
      apt_remarks: remarks,
      apt_accept_step: "initial",
      apt_accept_status: "initial",
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: createdById,
      apt_updated_by: createdById,
    });

    // Update proposal with approval flow info
    await BudgetMasterModel.update(
      {
        tbm_approval_id: approval_path_id,
        tbm_user_id: user_id,
        tbm_user_role_id: role_id,
        tbm_status: "pending",
        tbm_approver_index: 1,
      },
      { where: { tbm_id: item_id } },
    );

    return res.status(200).json({
      status: 1,
      message: "Notification submitted successfully",
      data: [],
    });
  } catch (error) {
    return next(CustomErrorHandler.databaseError(error.message));
  }
};

module.exports.getPendingUser = async (req, res, next) => {
  const {
    type,
    moduleName,
    tableName,
    IdcolumnName,
    IdcolumnValue,
    IndexcolumnName,
    StatuscolumnName,
    usercolumnName,
    rolecolumnName,

    approvalIdColumnName,
  } = req.body;

  // Required fields check
  const requiredFields = {
    moduleName,
    IdcolumnName,
    IdcolumnValue,
    tableName,
    IndexcolumnName,
    StatuscolumnName,
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(200).json({
        data: [],
        status: 0,
        message: `${key} is required.`,
      });
    }
  }

  try {
    // Main SQL to fetch user and role info
    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        ${StatuscolumnName} AS status,
        r.trl_role_name AS role_name,
       
        ${IndexcolumnName} AS current_sequence,
        ${approvalIdColumnName} AS approval_id
      FROM ${tableName}
     LEFT JOIN users u 
  ON CAST(${usercolumnName} AS BIGINT) = u.id
      LEFT JOIN t_roles r ON ${rolecolumnName} = r.trl_role_id
     
      WHERE ${IdcolumnName} = :idValue
      LIMIT 1;
    `;

    const data = await sequelize.query(sql, {
      replacements: { idValue: IdcolumnValue },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!data || data.length === 0) {
      return res.status(200).json({
        data: [],
        status: 0,
        message: "No matching record found.",
      });
    }

    const current_sequence = data[0]["current_sequence"];
    const approval_id = data[0]["approval_id"];

    // Approval SQL
    const approval_sql = `
      SELECT
        master ->> 'role_id' AS role_id
      FROM
        t_approval_channel,
        jsonb_array_elements(tac_approval_json) WITH ORDINALITY AS master(master, ord)
      WHERE
        tac_id = :approvalId
      ORDER BY
        ord DESC
      LIMIT 1;


    `;

    const approval_data = await sequelize.query(approval_sql, {
      replacements: { sequence: current_sequence, approvalId: approval_id },
      type: sequelize.QueryTypes.SELECT,
    });

    const send_data = {
      role_id: approval_data.length > 0 ? approval_data[0].role_id : null,
      details: data[0],
    };

    return res.json({
      status: 1,
      message: "Pending user details",
      data: send_data,
    });
  } catch (err) {
    console.error("Error in getPendingUser:", err);
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

// only budget amount return
// module.exports.getBudgetAmountByLocationTheme = async (req, res, next) => {
//   try {
//     const {
//       fy_id,
//       unit_id,
//       state_id,
//       district_id,
//       block_ids,
//       gram_panchayat_ids,
//       revenue_village_ids,
//       village_ids,

//       // ✅ NEW FIELDS
//       theme_id,
//       schedule_id,
//       sub_schedule_id,
//     } = req.body;

//     console.log("req.body--------",req.body);

//     // =========================
//     // 1️⃣ FIND BUDGET MASTER
//     // =========================
//     const whereCondition = {
//       tbm_fl_archive: "N",
//     };

//     if (fy_id) whereCondition.tbm_fy_id = fy_id;
//     if (unit_id) whereCondition.tbm_unit_id = unit_id;
//     if (state_id) whereCondition.tbm_state_id = state_id;
//     if (district_id) whereCondition.tbm_district_id = district_id;

//     const applyMultiFilter = (field, values) => {
//       if (!values?.length) return;

//       return {
//         [Op.or]: values.map((id) => ({
//           [field]: {
//             [Op.like]: `%${id}%`,
//           },
//         })),
//       };
//     };

//     const andConditions = [];

//     if (block_ids?.length) {
//       andConditions.push(applyMultiFilter("tbm_block_id", block_ids));
//     }

//     if (gram_panchayat_ids?.length) {
//       andConditions.push(
//         applyMultiFilter("tbm_gram_panchayat_id", gram_panchayat_ids)
//       );
//     }

//     if (revenue_village_ids?.length) {
//       andConditions.push(
//         applyMultiFilter("tbm_revenue_village_id", revenue_village_ids)
//       );
//     }

//     if (village_ids?.length) {
//       andConditions.push(
//         applyMultiFilter("tbm_village_id", village_ids)
//       );
//     }

//     if (andConditions.length) {
//       whereCondition[Op.and] = andConditions;
//     }

//     const budgetMasters = await BudgetMasterModel.findAll({
//       where: whereCondition,
//       attributes: ["tbm_id"],
//     });

//     if (!budgetMasters.length) {
//       return res.status(200).json({
//         status: true,
//         total_amount: 0,
//       });
//     }

//     const masterIds = budgetMasters.map((b) => b.tbm_id);

//     // =========================
//     // 2️⃣ FILTER FROM t_budgets
//     // =========================
//     const budgetWhere = {
//       tbad_budget_master_id: {
//         [Op.in]: masterIds,
//       },
//     };

//     if (theme_id) budgetWhere.tbad_theme_id = theme_id;
//     if (schedule_id) budgetWhere.tbad_sch_vii_id = schedule_id;
//     if (sub_schedule_id) budgetWhere.tbad_sub_theme = sub_schedule_id;

//     const budgets = await BudgetsModel.findAll({
//       where: budgetWhere,
//       attributes: ["tbad_amount"],
//     });

//     console.log("MATCHED BUDGET ROWS 👉", budgets.length);

//     const totalAmount = budgets.reduce(
//       (sum, item) => sum + (item.tbad_amount || 0),
//       0
//     );

//     console.log("FINAL AMOUNT 👉", totalAmount);

//     return res.status(200).json({
//       status: true,
//       total_amount: totalAmount,
//     });

//   } catch (err) {
//     next(err);
//   }
// };

// budget and project amount return



//  code commeted starting because the 3 level depedency dropdown now converted as two level depedency drop down
module.exports.getBudgetAmountByLocationTheme = async (req, res, next) => {
  try {
    const {
      fy_id,
      unit_id,
      state_id,
      district_id,
      block_ids,
      gram_panchayat_ids,
      revenue_village_ids,
      village_ids,
      // theme_id,
      schedule_id,
      sub_schedule_id,
    } = req.body;

    console.log("req.body--------", sub_schedule_id);

    /* =======================================================
       1️⃣ GET PROJECT AMOUNT (IF EXISTS)
    ======================================================= */

    let projectAmount = 0;

    const projectWhere = {
      tproj_fl_archive: "N",
    };

    if (fy_id) projectWhere.tproj_fy_id = fy_id;
    if (unit_id) projectWhere.tproj_unit_id = unit_id;
    if (state_id) projectWhere.tproj_state_id = state_id;
    if (district_id) projectWhere.tproj_district_id = district_id;

    // if (theme_id) projectWhere.theme_id = theme_id;
   if (schedule_id) projectWhere.tproj_schedule_id = schedule_id;
    if (sub_schedule_id)
  projectWhere.tproj_sub_schedule_id = sub_schedule_id;


    console.log("PROJECT WHERE (stringified) 👉", JSON.stringify(projectWhere, null, 2));


    const arrayMatch = (column, values) => {
      if (!values?.length) return null;

      return sequelize.literal(
        `"${column}" && ARRAY[${values.map((v) => `'${v}'`).join(",")}]::text[]`,
      );
    };

    const andConditionsProject = [];

    const blockCond = arrayMatch("tproj_block_id", block_ids);
    if (blockCond) andConditionsProject.push(blockCond);

    const gpCond = arrayMatch("tproj_gram_panchayat_id", gram_panchayat_ids);
    if (gpCond) andConditionsProject.push(gpCond);

    const rvCond = arrayMatch("tproj_revenue_village_id", revenue_village_ids);
    if (rvCond) andConditionsProject.push(rvCond);

    const villageCond = arrayMatch("tproj_village_id", village_ids);
    if (villageCond) andConditionsProject.push(villageCond);

    if (andConditionsProject.length) {
      projectWhere[Op.and] = andConditionsProject;
    }

    const existingProject = await ProjectModel.findOne({
      where: projectWhere,
      attributes: ["tproj_budget_amount"],
    });

    if (existingProject) {
      projectAmount = existingProject.tproj_budget_amount || 0;
    }

    const projects = await ProjectModel.findAll({
      where: projectWhere,
      attributes: ["tproj_budget_amount"],
    });

    projectAmount = projects.reduce(
      (sum, p) => sum + (p.tproj_budget_amount || 0),
      0,
    );

    /* =======================================================
       2️⃣ CALCULATE BUDGET AMOUNT
    ======================================================= */

    let budgetAmount = 0;

    const whereCondition = {
      tbm_fl_archive: "N",
    };

    if (fy_id) whereCondition.tbm_fy_id = fy_id;
    if (unit_id) whereCondition.tbm_unit_id = unit_id;
    if (state_id) whereCondition.tbm_state_id = state_id;
    if (district_id) whereCondition.tbm_district_id = district_id;

    const applyMultiFilter = (field, values) => {
      if (!values?.length) return;

      return {
        [Op.or]: values.map((id) => ({
          [field]: {
            [Op.like]: `%${id}%`,
          },
        })),
      };
    };

    const andConditions = [];

    if (block_ids?.length) {
      andConditions.push(applyMultiFilter("tbm_block_id", block_ids));
    }

    if (gram_panchayat_ids?.length) {
      andConditions.push(
        applyMultiFilter("tbm_gram_panchayat_id", gram_panchayat_ids),
      );
    }

    if (revenue_village_ids?.length) {
      andConditions.push(
        applyMultiFilter("tbm_revenue_village_id", revenue_village_ids),
      );
    }

    if (village_ids?.length) {
      andConditions.push(applyMultiFilter("tbm_village_id", village_ids));
    }

    if (andConditions.length) {
      whereCondition[Op.and] = andConditions;
    }

    const budgetMasters = await BudgetMasterModel.findAll({
      where: whereCondition,
      attributes: ["tbm_id"],
    });

    if (budgetMasters.length) {
      const masterIds = budgetMasters.map((b) => b.tbm_id);

      const budgetWhere = {
        tbad_budget_master_id: {
          [Op.in]: masterIds,
        },
      };

      // if (theme_id) budgetWhere.tbad_theme_id = theme_id;
      if (schedule_id) budgetWhere.tbad_sch_vii_id = schedule_id;
     if (sub_schedule_id) budgetWhere.tbad_sub_theme = sub_schedule_id;

      const budgets = await BudgetsModel.findAll({
        where: budgetWhere,
        attributes: ["tbad_amount"],
      });

      console.log("BUDGETS DATA 👉", budgets);
      budgetAmount = budgets.reduce(
        (sum, item) => sum + (item.tbad_amount || 0),
        0,
      );
    }

    /* =======================================================
       3️⃣ FINAL RESPONSE
    ======================================================= */

    return res.status(200).json({
      status: true,
      project_amount: projectAmount,
      budget_amount: budgetAmount,
      //  budget_amount: 1000,
      remaining_amount: budgetAmount - projectAmount,
    });
  } catch (err) {
    console.error("Budget API Error:", err);
    next(err);
  }
};
//  code commeted ending because the 3 level depedency dropdown now converted as two level depedency drop down

// fixed code for amount come and fields which are not include
// module.exports.getBudgetAmountByLocationTheme = async (req, res, next) => {
//   try {
//     const {
//       fy_id,
//       unit_id,
//       state_id,
//       district_id,
//       block_ids,
//       gram_panchayat_ids,
//       revenue_village_ids,
//       village_ids,
//       theme_id,
//       schedule_id,
//       sub_schedule_id,
//     } = req.body;

//     console.log("req.body----------- ", req.body);

//     // ✅ 1️⃣ STRICT location match (ALL must match)
//     const locationData = await UnitStateDistrictModel.findAll({
//   where: {
//     tunsd_unit_id: unit_id,
//     tunsd_state_id: state_id,
//     tunsd_district_id: district_id,

//     ...(block_ids?.length && {
//       tunsd_block_id: { [Op.in]: block_ids },
//     }),
//     ...(gram_panchayat_ids?.length && {
//       tunsd_grampanchayat_id: { [Op.in]: gram_panchayat_ids },
//     }),

//     [Op.or]: [
//       ...(revenue_village_ids?.length
//         ? [{ tunsd_revenue_village_id: { [Op.in]: revenue_village_ids } }]
//         : []),
//       ...(village_ids?.length
//         ? [{ tunsd_village_id: { [Op.in]: village_ids } }]
//         : []),
//     ],
//   },
//   attributes: [
//     "tunsd_block_id",
//     "tunsd_grampanchayat_id",
//     "tunsd_revenue_village_id",
//     "tunsd_village_id",
//   ],
// });

//     // ❌ If ANY mismatch → return 0
//     if (!locationData.length) {
//       return res.json({ success: true, total_amount: 0 });
//     }

//     // 2️⃣ Extract IDs
//     const blocks = locationData.map((i) => i.tunsd_block_id);
//     const gps = locationData.map((i) => i.tunsd_grampanchayat_id);
//     const revVillages = locationData.map((i) => i.tunsd_revenue_village_id);
//     const villages = locationData.map((i) => i.tunsd_village_id);

//     // ✅ 3️⃣ STRICT budget master match
//     const budgetMasters = await BudgetMasterModel.findAll({
//       where: {
//         tbm_fy_id: fy_id,
//         tbm_unit_id: unit_id,
//         tbm_state_id: state_id,
//         tbm_district_id: district_id,

//         // 🔥 CHANGE HERE (IMPORTANT)
//         [Op.or]: [
//           ...(blocks.length ? [{ tbm_block_id: { [Op.in]: blocks } }] : []),
//           ...(gps.length ? [{ tbm_gram_panchayat_id: { [Op.in]: gps } }] : []),
//           ...(revVillages.length
//             ? [{ tbm_revenue_village_id: { [Op.in]: revVillages } }]
//             : []),
//           ...(villages.length
//             ? [{ tbm_village_id: { [Op.in]: villages } }]
//             : []),
//         ],
//       },
//     });

//     if (!budgetMasters.length) {
//       return res.json({ success: true, total_amount: 0 });
//     }

//     const tbmIds = budgetMasters.map((i) => i.tbm_id);

//     // ✅ 4️⃣ Final SUM (STRICT)
//     const totalAmount = await BudgetsModel.sum("tbad_amount", {
//       where: {
//         tbad_budget_master_id: { [Op.in]: tbmIds },

//         ...(theme_id && { tbad_theme_id: theme_id }),
//         ...(schedule_id && { tbad_sch_vii_id: schedule_id }),
//         ...(sub_schedule_id && { tbad_sub_theme: sub_schedule_id }),
//       },
//     });

//     return res.json({
//       success: true,
//       total_amount: totalAmount || 0,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// module.exports.getBudgetAmountByLocationTheme = async (req, res, next) => {
//   try {
//     const {
//       fy_id,
//       unit_id,
//       state_id,
//       district_id,
//       block_ids,
//       gram_panchayat_ids,
//       revenue_village_ids,
//       village_ids,
//       theme_id,
//       schedule_id,
//       sub_schedule_id,
//     } = req.body;

//     console.log("req.body--------", req.body);

//     // =========================
//     // 1️⃣ BASE FILTER
//     // =========================
//     const whereCondition = {
//       tbm_fl_archive: "N",
//     };

//     if (fy_id) whereCondition.tbm_fy_id = fy_id;
//     if (unit_id) whereCondition.tbm_unit_id = unit_id;
//     if (state_id) whereCondition.tbm_state_id = state_id;
//     if (district_id) whereCondition.tbm_district_id = district_id;

//     // =========================
//     // 2️⃣ FETCH ALL POSSIBLE RECORDS
//     // =========================
//     const budgetMasters = await BudgetMasterModel.findAll({
//       where: whereCondition,
//       attributes: [
//         "tbm_id",
//         "tbm_block_id",
//         "tbm_gram_panchayat_id",
//         "tbm_revenue_village_id",
//         "tbm_village_id",
//       ],
//     });

//     // =========================
//     // 3️⃣ CORRECT MATCH LOGIC ✅
//     // =========================
//     const filteredMasters = budgetMasters.filter((item) => {

//       const blockMatch =
//         !block_ids?.length ||
//         item.tbm_block_id?.split(",").some(id => block_ids.includes(id));

//       const gpMatch =
//         !gram_panchayat_ids?.length ||
//         item.tbm_gram_panchayat_id?.split(",").some(id => gram_panchayat_ids.includes(id));

//       const rvMatch =
//         !revenue_village_ids?.length ||
//         item.tbm_revenue_village_id?.split(",").some(id => revenue_village_ids.includes(id));

//       const villageMatch =
//         !village_ids?.length ||
//         item.tbm_village_id?.split(",").some(id => village_ids.includes(id));

//       // ✅ ALL levels must match together
//       return blockMatch && gpMatch && rvMatch && villageMatch;
//     });

//     // =========================
//     // 4️⃣ IF NO MATCH → RETURN 0
//     // =========================
//     if (!filteredMasters.length) {
//       return res.status(200).json({
//         status: true,
//         total_amount: 0,
//       });
//     }

//     const masterIds = filteredMasters.map((b) => b.tbm_id);

//     // =========================
//     // 5️⃣ FILTER BUDGET TABLE
//     // =========================
//     const budgetWhere = {
//       tbad_budget_master_id: {
//         [Op.in]: masterIds,
//       },
//     };

//     if (theme_id) budgetWhere.tbad_theme_id = theme_id;
//     if (schedule_id) budgetWhere.tbad_sch_vii_id = schedule_id;
//     if (sub_schedule_id) budgetWhere.tbad_sub_theme = sub_schedule_id;

//     const budgets = await BudgetsModel.findAll({
//       where: budgetWhere,
//       attributes: ["tbad_amount"],
//     });

//     console.log("MATCHED BUDGET ROWS 👉", budgets.length);

//     const totalAmount = budgets.reduce(
//       (sum, item) => sum + (item.tbad_amount || 0),
//       0
//     );

//     console.log("FINAL AMOUNT 👉", totalAmount);

//     return res.status(200).json({
//       status: true,
//       total_amount: totalAmount,
//     });

//   } catch (err) {
//     next(err);
//   }
// };




// start of new budget amount fetching code as per two level dropdown 
// module.exports.getBudgetAmountByLocationTheme = async (req, res, next) => {
//   try {
//     const {
//       fy_id,
//       unit_id,
//       state_id,
//       district_id,
//       block_ids,
//       gram_panchayat_ids,
//       revenue_village_ids,
//       village_ids,
//       schedule_id,       // ✅ latest payload key (no theme_id)
//       sub_schedule_id,   // ✅ latest payload key
//     } = req.body;

//     console.log("req.body--------", req.body);

//     /* =======================================================
//        1️⃣ PROJECT AMOUNT
//     ======================================================= */

//     let projectAmount = 0;

//     const projectWhere = {
//       tproj_fl_archive: "N",
//     };

//     if (fy_id) projectWhere.tproj_fy_id = fy_id;
//     if (unit_id) projectWhere.tproj_unit_id = unit_id;
//     if (state_id) projectWhere.tproj_state_id = state_id;
//     if (district_id) projectWhere.tproj_district_id = district_id;
//     if (schedule_id) projectWhere.tproj_schedule_id = schedule_id;         // ✅ no theme
//     if (sub_schedule_id) projectWhere.tproj_sub_schedule_id = sub_schedule_id; // ✅ no theme

//     // 🔹 ARRAY MATCH FUNCTION
//     const arrayMatch = (column, values) => {
//       if (!values?.length) return null;
//       return sequelize.literal(
//         `"${column}" && ARRAY[${values.map((v) => `'${v}'`).join(",")}]::text[]`
//       );
//     };

//     const andConditionsProject = [];

//     const blockCond = arrayMatch("tproj_block_id", block_ids);
//     if (blockCond) andConditionsProject.push(blockCond);

//     const gpCond = arrayMatch("tproj_gram_panchayat_id", gram_panchayat_ids);
//     if (gpCond) andConditionsProject.push(gpCond);

//     const rvCond = arrayMatch("tproj_revenue_village_id", revenue_village_ids);
//     if (rvCond) andConditionsProject.push(rvCond);

//     const villageCond = arrayMatch("tproj_village_id", village_ids);
//     if (villageCond) andConditionsProject.push(villageCond);

//     if (andConditionsProject.length) {
//       projectWhere[Op.and] = andConditionsProject;
//     }

//     const projects = await ProjectModel.findAll({
//       where: projectWhere,
//       attributes: ["tproj_budget_amount"],
//     });

//     projectAmount = projects.reduce(
//       (sum, p) => sum + (p.tproj_budget_amount || 0),
//       0
//     );

//     /* =======================================================
//        2️⃣ BUDGET AMOUNT
//     ======================================================= */

//     let budgetAmount = 0;

//     const whereCondition = {
//     };

//     if (fy_id) whereCondition.tbm_fy_id = fy_id;
//     if (unit_id) whereCondition.tbm_unit_id = unit_id;
//     if (state_id) whereCondition.tbm_state_id = state_id;
//     if (district_id) whereCondition.tbm_district_id = district_id;

//     // 🔹 MULTI FILTER (LIKE BASED)
//     const applyMultiFilter = (field, values) => {
//       if (!values?.length) return;
//       return {
//         [Op.or]: values.map((id) => ({
//           [field]: {
//             [Op.like]: `%${id}%`,
//           },
//         })),
//       };
//     };

//     const andConditions = [];

//     if (block_ids?.length) {
//       andConditions.push(applyMultiFilter("tbm_block_id", block_ids));
//     }

//     if (gram_panchayat_ids?.length) {
//       andConditions.push(applyMultiFilter("tbm_gram_panchayat_id", gram_panchayat_ids));
//     }

//     if (revenue_village_ids?.length) {
//       andConditions.push(applyMultiFilter("tbm_revenue_village_id", revenue_village_ids));
//     }

//     if (village_ids?.length) {
//       andConditions.push(applyMultiFilter("tbm_village_id", village_ids));
//     }

//     if (andConditions.length) {
//       whereCondition[Op.and] = andConditions;
//     }

//     const budgetMasters = await BudgetMasterModel.findAll({
//       where: whereCondition,
//       attributes: ["tbm_id"],
//     });

//     if (budgetMasters.length) {
//       const masterIds = budgetMasters.map((b) => b.tbm_id);

//       const budgetWhere = {
//         tbad_budget_master_id: {
//           [Op.in]: masterIds,
//         },
//       };

//       if (schedule_id) budgetWhere.tbad_sch_vii_id = schedule_id;         // ✅ no theme
//       if (sub_schedule_id) budgetWhere.tbad_sub_theme = sub_schedule_id;  // ✅ no theme

//       const budgets = await BudgetsModel.findAll({
//         where: budgetWhere,
//         attributes: ["tbad_amount"],
//       });

//       budgetAmount = budgets.reduce(
//         (sum, item) => sum + (item.tbad_amount || 0),
//         0
//       );
//     }

//     /* =======================================================
//        3️⃣ RESPONSE
//     ======================================================= */

//     return res.status(200).json({
//       status: true,
//       project_amount: projectAmount,
//       budget_amount: budgetAmount,
//       remaining_amount: budgetAmount - projectAmount,
//     });

//   } catch (err) {
//     console.error("Budget API Error:", err);
//     next(err);
//   }
// };

// end of new budget amount fetching code as per two level dropdown 
