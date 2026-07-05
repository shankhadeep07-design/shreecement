var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const ProjectPaymentsModel = require("../../../models/projects/projects_payments.model");
const {
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const DocumentModel = require("../../../models/documents/documents.model");
const ProjectsModel = require("../../../models/projects/projects.model");
const { Op } = require("sequelize");
const FinancialYearModel = require("../../../models/masters/financial_year.model");
const ProjectMonitoringModel = require("../../../models/projects/projects_monitoring.model");
const ProjectKpiTargetModel = require("../../../models/projects/project_kpi_target.model");
const ProjectModel = require("../../../models/projects/projects.model");
const ProjectKpiModel = require("../../../models/projects/project_kpi.model");
const {
  ApprovalDetails,
  notificationStatusChange,
} = require("../../../helpers/web.helper");
const NotificationModel = require("../../../models/notification/notifications.model");
const ApprovalProcessTrackModel = require("../../../models/approval/ApprovalProcessTrackModel");

module.exports.projects_list_datatable = async (req, res, next) => {
  try {
    //     var sql = `
    // SELECT
    //       fy.tfy_year_label,
    //         un.tun_name AS unit_name,

    //         st.tsl_state_name AS state_name,
    //         dist.tdl_district_name AS district_name,
    //           ngo.tngo_name AS ngo_name,
    //         theme.tthm_theme_name AS theme_name,
    //     p.*,

    //     -- Created By User
    //     u.name AS created_by_name

    // FROM t_projects p

    // LEFT JOIN t_financial_year fy
    //       ON fy.tfy_id = p.tproj_fy_id

    //     LEFT JOIN t_unit un
    //       ON un.tun_id = p.tproj_unit_id

    //     LEFT JOIN t_state st
    //       ON st.tsl_state_id = p.tproj_state_id

    //     LEFT JOIN t_district dist
    //       ON dist.tdl_district_id = p.tproj_district_id

    //     LEFT JOIN t_theme_master theme
    //       ON theme.tthm_theme_id = p.theme_id
    //   LEFT JOIN t_ngo ngo
    //       ON ngo.tngo_id = p.tproj_implement_partner_id

    // LEFT JOIN users u
    //     ON u.id = p.tproj_created_by

    // `;



    var sql = `
      SELECT
        p.tproj_id,
        p.tproj_project_title,
        p.tproj_created_at,
        p.tproj_approved_type,
        t_state.tsl_state_name,
        t_district.tdl_district_name,
        t_ngo.tngo_name,
        t_theme_master.tthm_theme_name

      FROM t_projects p
      LEFT JOIN t_state ON t_state.tsl_state_id = p.tproj_state_id
      LEFT JOIN t_district ON t_district.tdl_district_id = p.tproj_district_id
      LEFT JOIN t_theme_master ON t_theme_master.tthm_theme_id = p.tproj_theme_id
      LEFT JOIN t_ngo ON t_ngo.tngo_id = p.tproj_implement_partner_id

    `;

    var records = await Datatables.build(req, sql);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

// module.exports.project_details_fun = async (req, res, next) => {
//   const { tproj_id } = req.body;

//   try {
//     const sql = `
//       SELECT
//           p.*,

//           -- Financial Year
//           fy.tfy_year_label,

//           -- Theme (Sub Master List)
//           sml.tsml_sub_master_list_name AS theme_name,

//           -- SDG
//           sdg.tsdg_name AS sdg_name,

//           -- Schedule Seven (Sub Schedule)
//           ssch.tsubshcm_sub_schedule_name AS schedule_seven_name,

//           -- State / District / Block
//           st.tsl_state_name AS state_name,
//           dist.tdl_district_name AS district_name,
//           blk.tbl_block_name AS block_name,

//           -- Location
//           loc.tloc_location_name,

//           -- Created By
//           u.name AS created_by_name

//       FROM t_projects p

//       -- Financial Year
//       LEFT JOIN t_financial_year fy
//           ON fy.tfy_id = p.tproj_financial_year_id

//       -- Theme
//       LEFT JOIN t_sub_master_list sml
//           ON sml.tsml_id = p.tproj_theme_id
//           AND sml.tsml_deleted_at IS NULL
//           AND sml.tsml_is_active = true

//       -- SDG
//       LEFT JOIN t_sdg_master sdg
//           ON sdg.tsdg_id = p.tproj_sdg_id

//       -- Schedule Seven
//       LEFT JOIN t_sub_schedule_master ssch
//           ON ssch.tsubshcm_sub_schedule_id = p.tproj_schedule_seven_id

//       -- State
//       LEFT JOIN t_state st
//           ON st.tsl_state_id = p.tproj_state_id

//       -- District
//       LEFT JOIN t_district dist
//           ON dist.tdl_district_id = p.tproj_district_id

//       -- Block
//       LEFT JOIN t_block blk
//           ON blk.tbl_block_id = p.tproj_block_id

//       -- Location
//       LEFT JOIN t_location loc
//           ON loc.tloc_location_id = p.tproj_location_id

//       -- Created By User
//       LEFT JOIN users u
//           ON u.id = p.tproj_created_by

//       WHERE p.tproj_id = :tproj_id
//       LIMIT 1
//     `;

//     const [project] = await sequelize.query(sql, {
//       replacements: { tproj_id },
//       type: sequelize.QueryTypes.SELECT,
//     });

//     if (!project) {
//       return res.json({
//         status: false,
//         message: "Project not found",
//         data: null,
//       });
//     }

//     return res.json({
//       status: true,
//       message: "Project details fetched successfully.",
//       data: {
//     ...project,
//     remaining_balance: 20, // ✅ static key added
//   },
//     });
//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };

// module.exports.project_details_fun = async (req, res, next) => {
//   const { tproj_id } = req.body;

//   try {
//     const sql = `
//       SELECT
//           p.*,

//           -- Financial Year
//           fy.tfy_year_label,

//           -- Theme
//           sml.tsml_sub_master_list_name AS theme_name,

//           -- SDG
//           sdg.tsdg_name AS sdg_name,

//           -- Schedule Seven
//           ssch.tsubshcm_sub_schedule_name AS schedule_seven_name,

//           -- State / District / Block
//           st.tsl_state_name AS state_name,
//           dist.tdl_district_name AS district_name,
//           blk.tbl_block_name AS block_name,

//           -- Location
//           loc.tloc_location_name,

//           -- Created By
//           u.name AS created_by_name,

//           -- ✅ Dynamic Remaining Balance (latest)
//           COALESCE(bal.tbad_remaining_budget, 0) AS remaining_balance

//       FROM t_projects p

//       -- Financial Year
//       LEFT JOIN t_financial_year fy
//           ON fy.tfy_id = p.tproj_financial_year_id

//       -- Theme
//       LEFT JOIN t_sub_master_list sml
//           ON sml.tsml_id = p.tproj_theme_id
//           AND sml.tsml_deleted_at IS NULL
//           AND sml.tsml_is_active = true

//       -- SDG
//       LEFT JOIN t_sdg_master sdg
//           ON sdg.tsdg_id = p.tproj_sdg_id

//       -- Schedule Seven
//       LEFT JOIN t_sub_schedule_master ssch
//           ON ssch.tsubshcm_sub_schedule_id = p.tproj_schedule_seven_id

//       -- State
//       LEFT JOIN t_state st
//           ON st.tsl_state_id = p.tproj_state_id

//       -- District
//       LEFT JOIN t_district dist
//           ON dist.tdl_district_id = p.tproj_district_id

//       -- Block
//       LEFT JOIN t_block blk
//           ON blk.tbl_block_id = p.tproj_block_id

//       -- Location
//       LEFT JOIN t_location loc
//           ON loc.tloc_location_id = p.tproj_location_id

//       -- Created By
//       LEFT JOIN users u
//           ON u.id = p.tproj_created_by

//       -- ✅ Latest remaining budget per project
//       LEFT JOIN LATERAL (
//           SELECT
//               tbad_remaining_budget
//           FROM t_budget_allo_deallocation
//           WHERE tbad_project_id = p.tproj_id
//             AND tbad_fl_archive = 'N'
//           ORDER BY tbad_created_at DESC
//           LIMIT 1
//       ) bal ON true

//       WHERE p.tproj_id = :tproj_id
//       LIMIT 1
//     `;

//     const [project] = await sequelize.query(sql, {
//       replacements: { tproj_id },
//       type: sequelize.QueryTypes.SELECT,
//     });

//     if (!project) {
//       return res.json({
//         status: false,
//         message: "Project not found",
//         data: null,
//       });
//     }

//     return res.json({
//       status: true,
//       message: "Project details fetched successfully.",
//       data: project, // ✅ remaining_balance already included
//     });

//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };

// module.exports.project_details_fun = async (req, res, next) => {
//   const { tproj_id } = req.body;

//   try {

//     const sql = `
//   SELECT
//       p.*,
//       fy.tfy_year_label,

//       -- ✅ Theme (from new table)
//       theme.tsubshcm_sub_schedule_name AS theme_name,

//       sdg.tsdg_name AS sdg_name,

//       -- ✅ Schedule Seven (unchanged)
//       ssch.tsubshcm_sub_schedule_name AS schedule_seven_name,

//       st.tsl_state_name AS state_name,
//       dist.tdl_district_name AS district_name,
//       blk.tbl_block_name AS block_name,
//       loc.tloc_location_name,
//       u.name AS created_by_name,

//       -- ✅ Dynamic Remaining Balance
//       COALESCE(bal.tbad_remaining_budget, p.tproj_allocate_budget_amount) AS remaining_balance

//   FROM t_projects p

//   LEFT JOIN t_financial_year fy
//       ON fy.tfy_id = p.tproj_financial_year_id

//   -- ✅ Theme JOIN (NEW)
//   LEFT JOIN t_sub_schedule_master theme
//       ON theme.tsubshcm_sub_schedule_id = p.tproj_theme_id

//   LEFT JOIN t_sdg_master sdg
//       ON sdg.tsdg_id = p.tproj_sdg_id

//   -- ✅ Schedule Seven JOIN
//   LEFT JOIN t_sub_schedule_master ssch
//       ON ssch.tsubshcm_sub_schedule_id = p.tproj_schedule_seven_id

//   LEFT JOIN t_state st
//       ON st.tsl_state_id = p.tproj_state_id

//   LEFT JOIN t_district dist
//       ON dist.tdl_district_id = p.tproj_district_id

//   LEFT JOIN t_block blk
//       ON blk.tbl_block_id = p.tproj_block_id

//   LEFT JOIN t_location loc
//       ON loc.tloc_location_id = p.tproj_location_id

//   LEFT JOIN users u
//       ON u.id = p.tproj_created_by

//   -- ✅ Latest remaining budget per project
//   LEFT JOIN LATERAL (
//       SELECT tbad_remaining_budget
//       FROM t_budget_allo_deallocation
//       WHERE tbad_project_id = p.tproj_id
//         AND tbad_fl_archive = 'N'
//       ORDER BY tbad_created_at DESC
//       LIMIT 1
//   ) bal ON true

//   WHERE p.tproj_id = :tproj_id
//   LIMIT 1
// `;

//     const [project] = await sequelize.query(sql, {
//       replacements: { tproj_id },
//       type: sequelize.QueryTypes.SELECT,
//     });

//     if (!project) {
//       return res.json({
//         status: false,
//         message: "Project not found",
//         data: null,
//       });
//     }

//     return res.json({
//       status: true,
//       message: "Project details fetched successfully.",
//       data: project,
//     });

//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };

// old
// module.exports.project_details_fun = async (req, res, next) => {
//   const { tproj_id } = req.body;

//   try {
//     const sql = `
//   SELECT
//       p.*,
//       fy.tfy_year_label,

//       -- ✅ Theme (FINAL FIXED)
//       theme.tthm_theme_name AS theme_name,

//       sdg.tsdg_name AS sdg_name,

//       -- ✅ Schedule Seven (unchanged)
//       ssch.tsubshcm_sub_schedule_name AS schedule_seven_name,

//       st.tsl_state_name AS state_name,
//       dist.tdl_district_name AS district_name,
//       blk.tbl_block_name AS block_name,
//       loc.tloc_location_name,
//       u.name AS created_by_name,

//       -- ✅ Dynamic Remaining Balance
//       COALESCE(bal.tbad_remaining_budget, p.tproj_allocate_budget_amount) AS remaining_balance

//   FROM t_projects p

//   LEFT JOIN t_financial_year fy
//       ON fy.tfy_id = p.tproj_financial_year_id

//   -- ✅ Theme JOIN (CORRECT COLUMN USED)
//   LEFT JOIN t_theme_master theme
//       ON theme.tthm_theme_id = p.tproj_theme_id

//   LEFT JOIN t_sdg_master sdg
//       ON sdg.tsdg_id = p.tproj_sdg_id

//   -- ✅ Schedule Seven JOIN
//   LEFT JOIN t_sub_schedule_master ssch
//       ON ssch.tsubshcm_sub_schedule_id = p.tproj_schedule_seven_id

//   LEFT JOIN t_state st
//       ON st.tsl_state_id = p.tproj_state_id

//   LEFT JOIN t_district dist
//       ON dist.tdl_district_id = p.tproj_district_id

//   LEFT JOIN t_block blk
//       ON blk.tbl_block_id = p.tproj_block_id

//   LEFT JOIN t_location loc
//       ON loc.tloc_location_id = p.tproj_location_id

//   LEFT JOIN users u
//       ON u.id = p.tproj_created_by

//   -- ✅ Latest remaining budget per project
//   LEFT JOIN LATERAL (
//       SELECT tbad_remaining_budget
//       FROM t_budget_allo_deallocation
//       WHERE tbad_project_id = p.tproj_id
//         AND tbad_fl_archive = 'N'
//       ORDER BY tbad_created_at DESC
//       LIMIT 1
//   ) bal ON true

//   WHERE p.tproj_id = :tproj_id
//   LIMIT 1
// `;

//     const [project] = await sequelize.query(sql, {
//       replacements: { tproj_id },
//       type: sequelize.QueryTypes.SELECT,
//     });

//     if (!project) {
//       return res.json({
//         status: false,
//         message: "Project not found",
//         data: null,
//       });
//     }

//     return res.json({
//       status: true,
//       message: "Project details fetched successfully.",
//       data: project,
//     });

//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };

module.exports.project_details_fun = async (req, res, next) => {
  const { tproj_id } = req.body;

  try {
    // const sql = `
    // SELECT
    //     p.*,

    //     fy.tfy_year_label,
    //     u.tun_name AS unit_name,

    //     st.tsl_state_name AS state_name,
    //     dist.tdl_district_name AS district_name,

    //     theme.tthm_theme_name AS theme_name,
    //     sch.tschm_schedule_name AS schedule_name,
    //     subsch.tsubshcm_sub_schedule_name AS sub_schedule_name,

    //     ngo.tngo_name AS ngo_name,

    //     usr.name AS created_by_name,

    //     /* ---------------- BLOCK (ARRAY) ---------------- */
    //     (
    //       SELECT json_agg(json_build_object('id', b.tbl_block_id, 'name', b.tbl_block_name))
    //       FROM t_block b
    //       WHERE b.tbl_block_id = ANY(p.tproj_block_id)
    //     ) AS blocks,

    //     /* ---------------- GP ---------------- */
    //     (
    //       SELECT json_agg(json_build_object('id', g.tgrm_grampanchayat_id, 'name', g.tgrm_grampanchayat_name))
    //       FROM t_grampanchayat g
    //       WHERE g.tgrm_grampanchayat_id = ANY(p.tproj_gram_panchayat_id)
    //     ) AS gram_panchayats,

    //     /* ---------------- REVENUE VILLAGE ---------------- */
    //     (
    //       SELECT json_agg(json_build_object('id', rv.trevvlg_revenue_village_id, 'name', rv.trevvlg_revenue_village_name))
    //       FROM t_revenue_village rv
    //       WHERE rv.trevvlg_revenue_village_id = ANY(p.tproj_revenue_village_id)
    //     ) AS revenue_villages,

    //     /* ---------------- VILLAGES ---------------- */
    //     (
    //       SELECT json_agg(json_build_object('id', v.tvl_village_id, 'name', v.tvl_village_name))
    //       FROM t_villages v
    //       WHERE v.tvl_village_id = ANY(p.tproj_village_id)
    //     ) AS villages,

    //     /* ---------------- KPI ---------------- */
    //     (
    //       SELECT json_agg(json_build_object(
    //           'kpi_id', k.tkpi_id,
    //           'kpi_name', k.tkpi_desc
    //       ))
    //       FROM t_project_kpi pk
    //       JOIN t_kpi_master k ON k.tkpi_id = pk.tprojkpi_kpi_id
    //       WHERE pk.tprojkpi_project_id = p.tproj_id
    //         AND pk.tprojkpi_is_active = true
    //     ) AS kpis,

    //     /* ---------------- SDG JSON WITH NAME ---------------- */
    //     (
    //       SELECT json_agg(json_build_object(
    //           'sdg_id', sdg_item->>'sdg_id',
    //           'weightage', sdg_item->>'sdg_weightage_value',
    //           'sdg_name', sm.tsdg_name
    //       ))
    //       FROM json_array_elements(p.tproj_sdg_id) sdg_item
    //       LEFT JOIN t_sdg_master sm
    //         ON sm.tsdg_id = sdg_item->>'sdg_id'
    //     ) AS sdg_details

    // FROM t_projects p

    // LEFT JOIN t_financial_year fy
    //   ON fy.tfy_id = p.tproj_fy_id

    // LEFT JOIN t_unit u
    //   ON u.tun_id = p.tproj_unit_id

    // LEFT JOIN t_state st
    //   ON st.tsl_state_id = p.tproj_state_id

    // LEFT JOIN t_district dist
    //   ON dist.tdl_district_id = p.tproj_district_id

    // LEFT JOIN t_theme_master theme
    //   ON theme.tthm_theme_id = p.theme_id

    // LEFT JOIN t_schedule_seven_master sch
    //   ON sch.tschm_schedule_id = p.schedule_id

    // LEFT JOIN t_sub_schedule_master subsch
    //   ON subsch.tsubshcm_sub_schedule_id = p.sub_schedule_id

    // LEFT JOIN t_ngo ngo
    //   ON ngo.tngo_id = p.tproj_implement_partner_id

    // LEFT JOIN users usr
    //   ON usr.id = p.tproj_created_by
    // WHERE p.tproj_id = :tproj_id
    // LIMIT 1
    // `;

    const sql = `
     SELECT 
        p.*,
        fy.tfy_year_label,
        u.tun_name AS unit_name,
        st.tsl_state_name AS state_name,
        dist.tdl_district_name AS district_name,
        theme.tthm_theme_name AS theme_name,
        sch.tschm_schedule_name AS schedule_name,
        subsch.tsubshcm_sub_schedule_name AS sub_schedule_name,
        ngo.tngo_name AS ngo_name,

        /* ---------------- LOCATION ARRAYS ---------------- */
        (
            SELECT json_agg(b.tbl_block_name)
            FROM t_block b
            WHERE b.tbl_block_id = ANY(p.tproj_block_id)
        ) AS block_names,

        (
            SELECT json_agg(g.tgrm_grampanchayat_name)
            FROM t_grampanchayat g
            WHERE g.tgrm_grampanchayat_id = ANY(p.tproj_gram_panchayat_id)
        ) AS gp_names,

        (
            SELECT json_agg(rv.trevvlg_revenue_village_name)
            FROM t_revenue_village rv
            WHERE rv.trevvlg_revenue_village_id = ANY(p.tproj_revenue_village_id)
        ) AS rv_names,

        (
            SELECT json_agg(v.tvl_village_name)
            FROM t_villages v
            WHERE v.tvl_village_id = ANY(p.tproj_village_id)
        ) AS village_names,

        /* ---------------- KPI ARRAY ---------------- */
        (
            SELECT json_agg(k.tkpi_desc)
            FROM t_project_kpi pk
            JOIN t_kpi_master k ON k.tkpi_id = pk.tprojkpi_kpi_id
            WHERE pk.tprojkpi_project_id = p.tproj_id
                AND pk.tprojkpi_is_active = true
        ) AS kpi_names,

        (
            SELECT json_agg(k.tkpi_id)
            FROM t_project_kpi pk
            JOIN t_kpi_master k ON k.tkpi_id = pk.tprojkpi_kpi_id
            WHERE pk.tprojkpi_project_id = p.tproj_id
                AND pk.tprojkpi_is_active = true
        ) AS kpis,

        /* ---------------- SDG ARRAY ---------------- */
        (
          SELECT json_agg(json_build_object(
              'sdg_id', sdg_item->>'sdg_id',
              'sdg_weightage_value', sdg_item->>'sdg_weightage_value',
              'sdg_name', sm.tsdg_name
          ))
          FROM json_array_elements(p.tproj_sdg_id) sdg_item
          LEFT JOIN t_sdg_master sm
            ON sm.tsdg_id = sdg_item->>'sdg_id'
        ) AS tproj_sdg_details,

        /* ---------------- LATEST CLOSURE STATUS ---------------- */
        (
            SELECT tpclsr_status 
            FROM t_project_closures 
            WHERE tpclsr_project_id = p.tproj_id 
            ORDER BY tpclsr_created_at DESC 
            LIMIT 1
        ) AS latest_closure_status

    FROM t_projects p
    LEFT JOIN t_financial_year fy ON fy.tfy_id = p.tproj_fy_id
    LEFT JOIN t_unit u ON u.tun_id = p.tproj_unit_id
    LEFT JOIN t_state st ON st.tsl_state_id = p.tproj_state_id
    LEFT JOIN t_district dist ON dist.tdl_district_id = p.tproj_district_id
    LEFT JOIN t_theme_master theme ON theme.tthm_theme_id = p.tproj_theme_id
    LEFT JOIN t_schedule_seven_master sch ON sch.tschm_schedule_id = p.tproj_schedule_id
    LEFT JOIN t_sub_schedule_master subsch ON subsch.tsubshcm_sub_schedule_id = p.tproj_sub_schedule_id
    LEFT JOIN t_ngo ngo ON ngo.tngo_id = p.tproj_implement_partner_id
    WHERE p.tproj_id = :tproj_id
`;

    const [project] = await sequelize.query(sql, {
      replacements: { tproj_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!project) {
      return res.json({
        status: false,
        message: "Project not found",
        data: null,
      });
    }

    return res.json({
      status: true,
      message: "Project details fetched successfully",
      data: project,
    });
  } catch (err) {
    console.error(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
module.exports.project_target_beneficiaries = async (req, res, next) => {
  const { tproj_id } = req.body;

  try {
    if (!tproj_id) {
      return res.json({
        status: false,
        message: "Project ID is required",
        data: null,
      });
    }

    const result = await ProjectMonitoringModel.findOne({
      attributes: [
        [
          sequelize.literal(`
            COALESCE(SUM(
              COALESCE(tpmon_male_beneficiaries, 0) +
              COALESCE(tpmon_female_beneficiaries, 0) +
              COALESCE(tpmon_boys_beneficiaries, 0) +
              COALESCE(tpmon_girls_beneficiaries, 0) +
              COALESCE(tpmon_mix_beneficiaries, 0)
            ), 0)
          `),
          "target_beneficiaries",
        ],
      ],
      where: {
        tpmon_project_id: tproj_id,
        tpmon_fl_archive: "N",
      },
      raw: true,
    });

    return res.json({
      status: true,
      message: "Target beneficiaries calculated successfully",
      data: {
        tproj_id,
        target_beneficiaries: Number(result?.target_beneficiaries || 0),
      },
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.milestone_paymenst_list_fun = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;

    var sql = `
          SELECT 
                t_project_payments.*, 
                users.name,
                COALESCE(docs.documents, '[]'::json) AS documents

            FROM t_project_payments
            LEFT JOIN LATERAL (
                SELECT json_agg(
                    to_jsonb(td) ||
                    jsonb_build_object(
                        'full_url', '${file_url}' || td.doc_path
                    )
                ) AS documents
                FROM t_documents td
                WHERE td.final_doc_id = t_project_payments.tppay_id
            ) docs ON true
            LEFT JOIN users ON users.id = t_project_payments.tppay_created_by
            ORDER BY t_project_payments.tppay_id DESC
            `;

    const ngoData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "NGO User Id fetched successfully",
      data: ngoData,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.milestone_paymenst_delete_fun = async (req, res, next) => {
  try {
    const { id } = req.params;

    var sql = `
            DELETE FROM t_project_payments WHERE tppay_id = '${id}'
                `;

    const ngoData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "Project milestone deleted successfully",
      data: ngoData,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.milestone_paymenst_status_update_fun = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;

    var sql = `
            UPDATE t_project_payments SET tppay_status = 'published' WHERE tppay_id = '${id}'
                `;

    const ngoData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "Project milestone published successfully",
      data: ngoData,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.milestone_paymenst_add_fun = async (req, res, next) => {
  try {
    const formData = req.body;
    const id = formData.tppay_id || null;
    const files = req.files || [];
    const creater_by = req?.user[0]?.id; // assuming userid is creator
    const transaction = null; // replace if using sequelize transaction
    let uploadedFilePaths = [];

    // console.log("Milestone Payment Data:", files);return

    const paymentData = {
      tppay_milestone_name: formData.tppay_milestone_name,
      tppay_payment_date: formData.tppay_payment_date,
      tppay_milestone_description: formData.tppay_milestone_description,
      tppay_milestone_amount: formData.tppay_milestone_amount,
      tppay_proposal_id: formData.tppay_proposal_id,
      tppay_project_id: formData.tppay_project_id,
      tppay_payment_type: formData.tppay_payment_type,
      tppay_created_by: creater_by,
      tppay_updated_by: creater_by,
    };

    let milestoneId = id;

    if (!id) {
      // ✅ Create new milestone
      const created = await ProjectPaymentsModel.create(paymentData);
      milestoneId = created.tppay_id;

      // ✅ Handle file uploads
      if (files.length > 0) {
        const grouped = files.reduce((acc, file) => {
          (acc[file.fieldname] ||= []).push(file);
          return acc;
        }, {});

        for (const [key, fileGroup] of Object.entries(grouped)) {
          if (key === "tppay_file") {
            const { metadata, filePaths } =
              await saveUpdateAndPrepareDocumentMetadata(
                fileGroup,
                milestoneId,
                "uploads/project",
                creater_by,
                transaction,
              );
            uploadedFilePaths.push(...filePaths);
            if (metadata.length) {
              await DocumentModel.bulkCreate(metadata, { transaction });
            }
          }
        }
      }

      return res.json({
        status: 1,
        message: "Milestone created successfully",
        created_id: milestoneId,
        uploaded_files: uploadedFilePaths,
      });
    } else {
      // ✅ Update milestone
      await ProjectPaymentsModel.update(paymentData, {
        where: { tppay_id: id },
      });

      // ✅ Handle file uploads
      if (files.length > 0) {
        const grouped = files.reduce((acc, file) => {
          (acc[file.fieldname] ||= []).push(file);
          return acc;
        }, {});

        for (const [key, fileGroup] of Object.entries(grouped)) {
          if (key === "tppay_file") {
            const { metadata, filePaths } =
              await saveUpdateAndPrepareDocumentMetadata(
                fileGroup,
                milestoneId,
                "uploads/project",
                creater_by,
                transaction,
              );
            uploadedFilePaths.push(...filePaths);
            if (metadata.length) {
              await DocumentModel.bulkCreate(metadata, { transaction });
            }
          }
        }
      }

      return res.json({
        status: 1,
        message: "Milestone updated successfully",
        updated_id: id,
        uploaded_files: uploadedFilePaths,
      });
    }
  } catch (err) {
    console.error("Milestone Payment Error:", err);
    next(CustomErrorHandler.databaseError(err));
  }
};

module.exports.getAllProjectList = async (req, res, next) => {
  try {
    // Fetch states
    const projects = await ProjectsModel.findAll({
      order: [["tproj_id", "ASC"]],
    });

    const response = projects.map((projects) => ({
      value: projects?.tproj_id,
      label: projects?.tproj_proposal_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Project fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.create_project_fun = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const formData = req.body;
    const created_by = formData.payload?.id || 0;

    // ======================
    // CREATE PROJECT
    // ======================

    const project = await ProjectModel.create(
      {
        tproj_budgets_id: formData.tproj_budgets_id,
        tproj_budget_master_id: formData.tproj_budget_master_id,

        // STORE SDG JSON
        tproj_sdg_id: formData.sdg_details,

        tproj_project_title: formData.tproj_project_title,
        tproj_project_desc: formData.tproj_project_desc,
        tproj_project_start_date: formData.tproj_project_start_date,
        tproj_project_end_date: formData.tproj_project_end_date,
        tproj_project_started_necessarily:
          formData.tproj_project_started_necessarily,
        tproj_approved_type: formData.tproj_approved_type,
        tproj_budget_amount: formData.tproj_budget_amount,
        tproj_baseline_info: formData.tproj_baseline_info,
        tproj_implement_partner_id: formData.tproj_implement_partner_id,
        tproj_monitoring_method: formData.tproj_monitoring_method,
        tproj_target_beneficiary_group: formData.tproj_target_beneficiary_group,
        tproj_remarks: formData.tproj_remarks,
        tproj_created_by: created_by,
      },
      { transaction },
    );

    const projectId = project.tproj_id;

    // ======================
    // INSERT KPI
    // ======================

    if (formData.kpi_ids && formData.kpi_ids.length > 0) {
      for (const kpiId of formData.kpi_ids) {
        await ProjectKpiModel.create(
          {
            tprojkpi_project_id: projectId,
            tprojkpi_kpi_id: kpiId,
            tprojkpi_created_by: created_by,
          },
          { transaction },
        );
      }
    }

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: "Project created successfully",
      data: project,
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

module.exports.createOrUpdateProject = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const formData = req.body;
    const created_by = req?.user?.[0]?.id || "SYSTEM";

    /* --------------------------------------------- */
    /* PREPARE PROJECT DATA                          */
    /* --------------------------------------------- */

    const projectPayload = {
      ...(formData.tproj_fy_id && { tproj_fy_id: formData.tproj_fy_id }),
      ...(formData.tproj_unit_id && { tproj_unit_id: formData.tproj_unit_id }),
      ...(formData.tproj_state_id && {
        tproj_state_id: formData.tproj_state_id,
      }),
      ...(formData.tproj_district_id && {
        tproj_district_id: formData.tproj_district_id,
      }),

      ...(formData.tproj_block_id && {
        tproj_block_id: formData.tproj_block_id,
      }),
      ...(formData.tproj_gram_panchayat_id && {
        tproj_gram_panchayat_id: formData.tproj_gram_panchayat_id,
      }),
      ...(formData.tproj_revenue_village_id && {
        tproj_revenue_village_id: formData.tproj_revenue_village_id,
      }),
      ...(formData.tproj_village_id && {
        tproj_village_id: formData.tproj_village_id,
      }),

      ...(formData.tproj_theme_id && { tproj_theme_id: formData.tproj_theme_id }),
      ...(formData.tproj_schedule_id && { tproj_schedule_id: formData.tproj_schedule_id }),
      ...(formData.tproj_sub_schedule_id && {
        tproj_sub_schedule_id: formData.tproj_sub_schedule_id,
      }),

      ...(formData.tproj_sdg_json && { tproj_sdg_id: formData.tproj_sdg_json }),

      ...(formData.tproj_project_title && {
        tproj_project_title: formData.tproj_project_title,
      }),
      ...(formData.tproj_project_desc && {
        tproj_project_desc: formData.tproj_project_desc,
      }),

      ...(formData.tproj_project_start_date && {
        tproj_project_start_date: formData.tproj_project_start_date,
      }),
      ...(formData.tproj_project_end_date && {
        tproj_project_end_date: formData.tproj_project_end_date,
      }),

      ...(formData.tproj_budget_amount && {
        tproj_budget_amount: formData.tproj_budget_amount,
      }),

      ...(formData.tproj_project_started_necessarily !== undefined && {
        tproj_project_started_necessarily:
          formData.tproj_project_started_necessarily,
      }),

      ...(formData.tproj_baseline_info && {
        tproj_baseline_info: formData.tproj_baseline_info,
      }),
      ...(formData.tproj_monitoring_method && {
        tproj_monitoring_method: formData.tproj_monitoring_method,
      }),
      ...(formData.tproj_target_beneficiary_group && {
        tproj_target_beneficiary_group: formData.tproj_target_beneficiary_group,
      }),

      ...(formData.tproj_implement_partner_id && {
        tproj_implement_partner_id: formData.tproj_implement_partner_id,
      }),

      ...(formData.tproj_remarks && { tproj_remarks: formData.tproj_remarks }),
      ...(formData.tproj_approved_type && {
        tproj_approved_type: formData.tproj_approved_type,
      }),

      tproj_created_by: created_by,
      tproj_updated_by: created_by,
      tproj_status: formData.tproj_id ? undefined : "draft",
    };

    /* --------------------------------------------- */
    /* CREATE OR UPDATE PROJECT                      */
    /* --------------------------------------------- */

    let project;

    if (formData.tproj_id) {
      // UPDATE
      await ProjectModel.update(projectPayload, {
        where: { tproj_id: formData.tproj_id },
        transaction,
      });

      project = await ProjectModel.findOne({
        where: { tproj_id: formData.tproj_id },
        transaction,
      });

      /* --------------------------------------------- */
      /* DELETE OLD KPI                               */
      /* --------------------------------------------- */
      await ProjectKpiModel.destroy({
        where: { tprojkpi_project_id: formData.tproj_id },
        transaction,
      });
    } else {
      // CREATE
      project = await ProjectModel.create(projectPayload, { transaction });
    }

    /* --------------------------------------------- */
    /* INSERT KPI LIST                               */
    /* --------------------------------------------- */

    if (formData.kpi_ids && formData.kpi_ids.length > 0) {
      const kpiPayload = formData.kpi_ids.map((kpiId) => ({
        tprojkpi_kpi_id: kpiId,
        tprojkpi_project_id: project.tproj_id,
        tprojkpi_created_by: created_by,
        tprojkpi_updated_by: created_by,
      }));

      await ProjectKpiModel.bulkCreate(kpiPayload, { transaction });
    }

    /* --------------------------------------------- */
    /* COMMIT                                        */
    /* --------------------------------------------- */

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: formData.tproj_id
        ? "Project Updated Successfully"
        : "Project Created Successfully",
      data: project,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Project Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.submit_project_fun = async (req, res, next) => {
  try {
    const {
      item_id,
      remarks,
      user_id,
      payload: { id: createdById, user_type, role_id: initiator_role_id },
    } = req.body;

    if (
      !item_id ||
      !createdById ||
      !user_type ||
      !initiator_role_id
    ) {
      return res.status(400).json({
        status: 0,
        message: "Missing required fields.",
      });
    }

    const moduleType = "project";

    // Get approval path
    const ApprovalPathListData = await ApprovalDetails(
      moduleType,
      initiator_role_id,
    );

    // Change notification status
    await notificationStatusChange(moduleType, item_id);

    if (!ApprovalPathListData || !ApprovalPathListData.length) {
      return res.status(404).json({
        status: 0,
        message: "No approval path found for this role.",
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

    const { role_id } = firstStep;

    // Update notification model
    if (user_id) {
        await NotificationModel.create({
            tnot_type: moduleType,
            tnot_item_id: item_id,
            tnot_receiver_id: user_id,
            tnot_text: "Approval For Project",
            tnot_url: `project/view-list/${item_id}`,
            tnot_sender_id: createdById,
            tnot_table_type: "t_projects",
        });
    }

    // Update existing project with notification type
    const existingProject = await ProjectModel.findOne({
      where: { tproj_id: item_id },
    });
    if (existingProject) {
      existingProject.tproj_not_type = moduleType;
      await existingProject.save();
    }

    // Track approval
    await ApprovalProcessTrackModel.create({
      apt_type: moduleType,
      apt_item_id: item_id,
      apt_user_id: createdById,
      apt_user_role: initiator_role_id,
      apt_recipient_id: createdById,
      apt_remarks: remarks || "Project submitted for approval",
      apt_accept_step: "initial",
      apt_accept_status: "initial",
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: createdById,
      apt_updated_by: createdById,
    });

    // Update Project with approval flow info
    await ProjectModel.update(
      {
        tproj_approval_id: approval_path_id,
        tproj_user_id: user_id || null,
        tproj_user_role_id: role_id,
        tproj_status: "pending",
        tproj_approver_index: 1,
      },
      { where: { tproj_id: item_id } },
    );

    return res.status(200).json({
      status: 1,
      message: "Project submitted successfully for approval",
      data: [],
    });
  } catch (error) {
    console.error("Submit Project Error:", error);
    return next(CustomErrorHandler.databaseError(error.message));
  }
};
