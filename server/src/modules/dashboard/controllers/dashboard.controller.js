const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");

exports.getTotalCounts = async (req, res, next) => {
  try {
    const { fy_id } = req.body;

    if (!fy_id) {
      return res.status(400).json({ status: 0, message: "Financial Year (fy_id) is required" });
    }

    // 1. Get Financial Year Dates
    const [fyDetails] = await sequelize.query(
      `SELECT tfy_start_date, tfy_end_date FROM t_financial_year WHERE tfy_id = :fy_id`,
      { replacements: { fy_id }, type: QueryTypes.SELECT }
    );

    if (!fyDetails) {
      return res.status(404).json({ status: 0, message: "Financial Year not found" });
    }

    const { tfy_start_date, tfy_end_date } = fyDetails;

    // 2. Aggregate counts and budgets
    // 2. Aggregate counts and budgets with breakdowns
    const queries = {
      budget: {
        total: `SELECT SUM(tbad_amount) as total FROM t_budgets WHERE tbad_fy_id = :fy_id AND tbad_fl_archive = 'N'`,
        breakdown: `SELECT 
                      INITCAP(REPLACE(tbad_budget_type, '_', ' ')) as label, 
                      SUM(tbad_amount) as value 
                    FROM t_budgets 
                    WHERE tbad_fy_id = :fy_id AND tbad_fl_archive = 'N' 
                    GROUP BY tbad_budget_type`
      },
      proposals: {
        total: `SELECT COUNT(*) as count FROM t_proposal WHERE tpros_financial_year_id = :fy_id AND tpros_fl_archive = 'N'`,
        breakdown: `SELECT 
                      CASE 
                        WHEN tpros_status = 'draft' THEN 'Draft'
                        WHEN tpros_status = 'pending' THEN 'Pending Approval'
                        WHEN tpros_status = 'approved' THEN 'Approved'
                        WHEN tpros_status = 'rejected' THEN 'Rejected'
                        ELSE INITCAP(tpros_status)
                      END as label, 
                      COUNT(*) as value 
                    FROM t_proposal 
                    WHERE tpros_financial_year_id = :fy_id AND tpros_fl_archive = 'N' 
                    GROUP BY tpros_status`
      },
      projects: {
        total: `SELECT COUNT(*) as count FROM t_projects WHERE tproj_fy_id = :fy_id AND tproj_fl_archive = 'N'`,
        breakdown: `SELECT 
                      INITCAP(tproj_status) as label, 
                      COUNT(*) as value 
                    FROM t_projects 
                    WHERE tproj_fy_id = :fy_id AND tproj_fl_archive = 'N' 
                    GROUP BY tproj_status`
      },
      ngos: {
        total: `SELECT COUNT(*) as count FROM t_ngo WHERE tngo_fl_archive = 'N'`,
        breakdown: `SELECT 
                      INITCAP(tngo_status) as label, 
                      COUNT(*) as value 
                    FROM t_ngo 
                    WHERE tngo_fl_archive = 'N' 
                    GROUP BY tngo_status`
      },
      volunteers: {
        total: `SELECT COUNT(u.id) as count FROM users u JOIN t_roles r ON u.role_id = r.trl_role_id WHERE u.user_type = 'employee_volunteer' AND u.status = 'active'`,
        breakdown: `SELECT 
                      CASE WHEN u.status = 'active' THEN 'Active' ELSE 'Inactive' END as label, 
                      COUNT(*) as value 
                    FROM users u 
                    JOIN t_roles r ON u.role_id = r.trl_role_id 
                    WHERE u.user_type = 'employee_volunteer' 
                    GROUP BY u.status`
      },
      vendors: {
        total: `SELECT COUNT(*) as count FROM t_vendor `,
        breakdown: `SELECT 
                      INITCAP(tvendor_status) as label, 
                      COUNT(*) as value 
                    FROM t_vendor 
                     
                    GROUP BY tvendor_status`
      },
      events: {
        total: `SELECT COUNT(*) as count FROM t_event WHERE tevent_start_date BETWEEN :start AND :end AND tevent_is_active = true`,
        // Returning combined breakdown with category for frontend distinguishing
        breakdown: `
          (SELECT 'By Type' as category, 
                  CASE 
                    WHEN tevent_type = 'cil' OR tevent_type is null THEN 'CIL'
                    WHEN tevent_type = 'social_development' THEN 'Social Development'
                    ELSE INITCAP(REPLACE(tevent_type, '_', ' '))
                  END as label, 
                  COUNT(*) as value 
           FROM t_event 
           WHERE tevent_start_date BETWEEN :start AND :end AND tevent_is_active = true 
           GROUP BY tevent_type)
          UNION ALL
          (SELECT 'By Status' as category, 
                  INITCAP(tevent_status) as label, 
                  COUNT(*) as value 
           FROM t_event 
           WHERE tevent_start_date BETWEEN :start AND :end AND tevent_is_active = true 
           GROUP BY tevent_status)
        `
      },
      budget_amendments: {
        total: `SELECT SUM(tbm_proposed_total_amount) as total_amount FROM t_budget_master WHERE tbm_type = 'budget_amendment' AND tbm_fy_id = :fy_id AND tbm_fl_archive = 'N'`,
        breakdown: `SELECT 
                      CASE 
                        WHEN tbm_status = 'draft' THEN 'Drafts'
                        WHEN tbm_status = 'pending' THEN 'Pending Approval'
                        WHEN tbm_status = 'approved' THEN 'Approved'
                        WHEN tbm_status = 'reject' THEN 'Rejected'
                        ELSE INITCAP(tbm_status)
                      END as label, 
                      SUM(tbm_proposed_total_amount) as value 
                    FROM t_budget_master 
                    WHERE tbm_type = 'budget_amendment' AND tbm_fy_id = :fy_id AND tbm_fl_archive = 'N' 
                    GROUP BY tbm_status`
      },
      gallery: {
        total: `SELECT COUNT(*) as count FROM t_gallery WHERE tgl_deleted_at IS NULL`,
        breakdown: `SELECT 
                      INITCAP(COALESCE(tgl_status, 'Active')) as label, 
                      COUNT(*) as value 
                    FROM t_gallery 
                    WHERE tgl_deleted_at IS NULL 
                    GROUP BY tgl_status`
      },
      case_studies: {
        total: `SELECT COUNT(*) as count FROM t_case_study WHERE tcs_deleted_at IS NULL`,
        breakdown: `SELECT 
                      CASE WHEN tcs_is_active = true THEN 'Active' ELSE 'Inactive' END as label, 
                      COUNT(*) as value 
                    FROM t_case_study 
                    WHERE tcs_deleted_at IS NULL 
                    GROUP BY tcs_is_active`
      }
    };

    const results = {};
    for (const key in queries) {
      const [totalData] = await sequelize.query(queries[key].total, {
        replacements: { fy_id, start: tfy_start_date, end: tfy_end_date },
        type: QueryTypes.SELECT
      });
      
      const breakdownData = await sequelize.query(queries[key].breakdown, {
        replacements: { fy_id, start: tfy_start_date, end: tfy_end_date },
        type: QueryTypes.SELECT
      });

        results[key] = {
          total: key === 'budget' || key === 'budget_amendments'
            ? (totalData.total || totalData.total_amount || 0)
            : (totalData.total || totalData.count || 0),
          breakdown: breakdownData || []
        };
    }

    res.json({
      status: 1,
      message: "Total counts with breakdowns fetched successfully",
      data: results
    });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

exports.getBudgetChartData = async (req, res, next) => {
  try {
    const { fy_id } = req.body;
    
    // For simplicity, grouping by domain or theme as per common dashboard needs
    const query = `
      SELECT 
        COALESCE(SUM(tbad_amount), 0) as budget,
        COALESCE(SUM(tbad_amount), 0) as expense,
        tbad_budget_type as category
      FROM t_budgets 
      WHERE tbad_fy_id = :fy_id AND tbad_fl_archive = 'N'
      GROUP BY tbad_budget_type
    `;

    const data = await sequelize.query(query, {
      replacements: { fy_id },
      type: QueryTypes.SELECT
    });

    res.json({
      status: 1,
      message: "Budget chart data fetched successfully",
      data: data
    });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

exports.getProposalChartData = async (req, res, next) => {
  try {
    const { fy_id } = req.body;

    const query = `
      SELECT 
        tpros_status as name,
        COUNT(*) as y
      FROM t_proposal 
      WHERE tpros_financial_year_id = :fy_id AND tpros_fl_archive = 'N'
      GROUP BY tpros_status
    `;

    const data = await sequelize.query(query, {
      replacements: { fy_id },
      type: QueryTypes.SELECT
    });

    res.json({
      status: 1,
      message: "Proposal chart data fetched successfully",
      data: data
    });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

exports.getRecentProjects = async (req, res, next) => {
  try {
    const { fy_id } = req.body;

    const query = `
      SELECT 
        p.tproj_id as key,
        p.tproj_status as status,
        p.tproj_budget_amount as budget
      FROM t_projects p
      WHERE p.tproj_fy_id = :fy_id AND p.tproj_fl_archive = 'N'
      ORDER BY p.tproj_created_at DESC
      LIMIT 10
    `;

    const data = await sequelize.query(query, {
      replacements: { fy_id },
      type: QueryTypes.SELECT
    });

    res.json({
      status: 1,
      message: "Recent projects fetched successfully",
      data: data
    });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

exports.getMonthWiseData = async (req, res, next) => {
  try {
    const { fy_id } = req.body;

    const query = `
      WITH months AS (
        SELECT generate_series(
          (SELECT tfy_start_date FROM t_financial_year WHERE tfy_id = :fy_id),
          (SELECT tfy_end_date FROM t_financial_year WHERE tfy_id = :fy_id),
          '1 month'::interval
        ) AS month_date
      )
      SELECT 
        TO_CHAR(m.month_date, 'Mon') as month_label,
        EXTRACT(MONTH FROM m.month_date) as month_num,
        (SELECT COUNT(*) FROM t_projects p WHERE EXTRACT(MONTH FROM p.tproj_created_at) = EXTRACT(MONTH FROM m.month_date) AND EXTRACT(YEAR FROM p.tproj_created_at) = EXTRACT(YEAR FROM m.month_date) AND p.tproj_fy_id = :fy_id AND p.tproj_fl_archive = 'N') as project_count,
        (SELECT COUNT(*) FROM t_proposal pr WHERE EXTRACT(MONTH FROM pr.tpros_created_at) = EXTRACT(MONTH FROM m.month_date) AND EXTRACT(YEAR FROM pr.tpros_created_at) = EXTRACT(YEAR FROM m.month_date) AND pr.tpros_financial_year_id = :fy_id AND pr.tpros_fl_archive = 'N') as proposal_count
      FROM months m
      ORDER BY m.month_date
    `;

    const data = await sequelize.query(query, {
      replacements: { fy_id },
      type: QueryTypes.SELECT
    });

    res.json({
      status: 1,
      message: "Month-wise data fetched successfully",
      data: data
    });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

exports.getFactoryProposalData = async (req, res, next) => {
  try {
    const { fy_id } = req.body;

    const query = `
      SELECT 
        f.tfact_factory_name as name,
        COUNT(p.tpros_id) as y
      FROM t_factory_master f
      LEFT JOIN t_proposal p ON f.tfact_factory_id = p.tpros_factory_id AND p.tpros_financial_year_id = :fy_id AND p.tpros_fl_archive = 'N'
      WHERE f.tfact_is_active = true
      GROUP BY f.tfact_factory_name
      HAVING COUNT(p.tpros_id) > 0
      ORDER BY y DESC
    `;

    const data = await sequelize.query(query, {
      replacements: { fy_id },
      type: QueryTypes.SELECT
    });

    res.json({
      status: 1,
      message: "Factory-wise proposal data fetched successfully",
      data: data
    });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

exports.getHistoricalData = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        fy.tfy_year_label as year,
        (SELECT COUNT(*) FROM t_projects p WHERE p.tproj_fy_id = fy.tfy_id AND p.tproj_fl_archive = 'N') as project_count,
        (SELECT COALESCE(SUM(b.tbad_amount), 0) FROM t_budgets b WHERE b.tbad_fy_id = fy.tfy_id AND b.tbad_fl_archive = 'N') as total_budget
      FROM t_financial_year fy
      ORDER BY fy.tfy_year_no ASC
    `;

    const data = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    res.json({
      status: 1,
      message: "Historical data fetched successfully",
      data: data
    });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

exports.getEventAnalytics = async (req, res, next) => {
  try {
    const { fy_id } = req.body;

    const query = `
      WITH months AS (
        SELECT generate_series(
          (SELECT tfy_start_date FROM t_financial_year WHERE tfy_id = :fy_id),
          (SELECT tfy_end_date FROM t_financial_year WHERE tfy_id = :fy_id),
          '1 month'::interval
        ) AS month_date
      )
      SELECT 
        TO_CHAR(m.month_date, 'Mon') as month_label,
        (SELECT COUNT(*) 
         FROM t_event e 
         WHERE (e.tevent_type = 'cil' OR e.tevent_type is null)
           AND EXTRACT(MONTH FROM e.tevent_start_date) = EXTRACT(MONTH FROM m.month_date) 
           AND EXTRACT(YEAR FROM e.tevent_start_date) = EXTRACT(YEAR FROM m.month_date)
           AND e.tevent_is_active = true) as cil_count,
        (SELECT COUNT(*) 
         FROM t_event e 
         WHERE e.tevent_type = 'social_development' 
           AND EXTRACT(MONTH FROM e.tevent_start_date) = EXTRACT(MONTH FROM m.month_date) 
           AND EXTRACT(YEAR FROM e.tevent_start_date) = EXTRACT(YEAR FROM m.month_date)
           AND e.tevent_is_active = true) as social_count
      FROM months m
      ORDER BY m.month_date
    `;

    const data = await sequelize.query(query, {
      replacements: { fy_id },
      type: QueryTypes.SELECT
    });

    res.json({
      status: 1,
      message: "Event analytics fetched successfully",
      data: data
    });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

exports.getGalleryChartData = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        COALESCE(tgl_status, 'Active') as name,
        COUNT(*) as y
      FROM t_gallery 
      WHERE tgl_deleted_at IS NULL
      GROUP BY tgl_status
    `;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    res.json({ status: 1, message: "Gallery chart data fetched", data });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

exports.getCaseStudyChartData = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        CASE WHEN tcs_is_active = true THEN 'Active' ELSE 'Inactive' END as name,
        COUNT(*) as y
      FROM t_case_study 
      WHERE tcs_deleted_at IS NULL
      GROUP BY tcs_is_active
    `;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    res.json({ status: 1, message: "Case study chart data fetched", data });
  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};
