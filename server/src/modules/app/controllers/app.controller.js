const crypto = require("crypto");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../../models/users/user.model');
const JwtService = require('../services/jwt.service');
const { getModuleNameRoleWise, getRoleDetails } = require('../../../helpers/web.helper');
const { sequelize } = require('../../../config/db');
const CustomErrorHandler = require('../../../service/CustomErrorHandler');
const AuthAuditLog = require('../../../models/audit/authAuditLog');
const { Worker } = require("worker_threads");
const path = require("path");
const { cryptPassword } = require("../../../helpers/common.helper");

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  // try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ status: 0, message: 'Invalid credentials', data: [] });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ status: 0, message: 'Invalid credentials', data: [] });

    // User role details
    let role_details = await getRoleDetails(user.role_id);
    if (!role_details || role_details.length === 0) {
      return res.status(401).json({ status: 0, message: 'Role not found', data: [] });
    }


    // Check if the user's role is not 'employee_volunteer'
    if (role_details[0].trl_role_slug !== 'employee_volunteer') {
      return res.status(401).json({ status: 0, message: 'Unauthorized access', data: [] });
    }


    var payLoad = {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      phone: user.phone,
      user_type: user.user_type,
      status: user.status,
      ngo_id : user.ngo_id,
      vertical_id : user.vertical_id,
      created_by : user.created_by
    };

    const result = await getModuleNameRoleWise(req.body.email);
    const access_token = await JwtService.sign(payLoad);
    let res_data = {
      userData: {
        email : user.email,
        name: user.name,
        phone: user.phone,
        user_type: user.user_type,
        status: user.status,
        id: user.id,
      },
      moduleAccess: result,
    };

    res_data.accessToken = access_token;

    
    // 🔹 Insert into login audit
    await AuthAuditLog.create({
      user_id: user.id,
      username: user.name,
      operation: "LOGIN",
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    // await updateLoginAttempts(user.dataValues.email, true);
    return res.status(200).json({
      status: 1,
      message: "User login successful.",
      data: res_data,
    });
  // } catch (err) {
  //   res.status(500).json({ error: 'Login failed' });
  // }
};
module.exports.appLogOut = async (req, res, next) => {
  try {

    // 🔹 Get token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ status: 0, message: "Token missing" });
    }

    // 🔹 Get user ID
    const userId = req.auth?.id;
    if (!userId) {
      return res.status(400).json({ status: 0, message: "User ID missing" });
    }

    // 🔹 Clear API token
    await User.update(
      { api_token: null },
      { where: { id: userId } }
    );

    // 🔹 Log logout activity
    await AuthAuditLog.create({
      user_id: userId,
      username: req.auth?.name,
      operation: "LOGOUT",
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    // 🔹 Send response
    return res.status(200).json({
      status: 1,
      message: "User logged out successfully.",
    });
  } catch (error) {
    return next(CustomErrorHandler.internalServerError(error.message));
  }
};

module.exports.forgot_password = async (req, res, next) => {
  // try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      where: { email },
      raw: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await User.update(
      { otp, expires_at: expiresAt },
      { where: { id: user.id } }
    );

    // 🧵 Worker
    const worker = new Worker(
      path.resolve(__dirname, "../../../workers/forgotPasswordWorker.js")
    );

    worker.postMessage({
      email: user.email,
      name: user.name,
      otp,
      expiryMinutes: 10,
    });

    worker.on("message", (msg) => {
      if (!msg.success) {
        console.error("OTP mail failed:", msg.error);
      }
      worker.terminate();
    });

    worker.on("error", (err) => {
      console.error("Worker error:", err);
    });

    return res.status(200).json({
      message: "OTP sent to registered email",
    });

  // } catch (err) {
  //   return next(CustomErrorHandler.internalServerError(err.message));
  // }
};

function getISTNow() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
}


module.exports.verify_otp_with_change_password_fun = async (req, res, next) => {
  try {
    const { email, otp, password, confirm_password } = req.body;

    // 1️⃣ Basic validation
    if (!email || !otp || !password || !confirm_password) {
      return res.status(400).json({
        status: false,
        message: "Email, OTP, password and confirm password are required",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        status: false,
        message: "Password and confirm password do not match",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({
      where: { email },
      raw: true,
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // 3️⃣ OTP validation
    if (user.otp !== otp) {
      return res.status(400).json({
        status: false,
        message: "Invalid OTP",
      });
    }

    // 4️⃣ Expiry check (10 min)
    if (getISTNow() > new Date(user.expires_at)) {
      return res.status(400).json({
        status: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // 5️⃣ Encrypt password using existing helper
    const hashedPassword = await new Promise((resolve, reject) => {
      cryptPassword(password, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });

    // 6️⃣ Update password & clear OTP
    await User.update(
      {
        password: hashedPassword,
        otp: null,
        expires_at: null,
      },
      { where: { id: user.id } }
    );

    return res.status(200).json({
      status: true,
      message: "Password reset successfully",
    });

  } catch (err) {
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.fetchDashboardApi = async (req, res, next) => {
  try {
    const userId = req?.auth?.id;

    /* =====================================================
     1️⃣ ACTIVITY COUNTS & GROWTH
    ===================================================== */
    const activityQuery = `
      WITH ActivityStats AS (
        SELECT
          COUNT(DISTINCT ea.tea_event_id) FILTER (WHERE ea.tea_created_at::date = CURRENT_DATE) as today_count,
          COUNT(DISTINCT ea.tea_event_id) FILTER (WHERE ea.tea_created_at::date = CURRENT_DATE - 1) as yesterday_count,
          COUNT(DISTINCT ea.tea_event_id) FILTER (WHERE date_trunc('week', ea.tea_created_at) = date_trunc('week', CURRENT_DATE)) as weekly_count,
          COUNT(DISTINCT ea.tea_event_id) FILTER (WHERE date_trunc('week', ea.tea_created_at) = date_trunc('week', CURRENT_DATE - INTERVAL '1 week')) as last_weekly_count,
          COUNT(DISTINCT ea.tea_event_id) FILTER (WHERE date_trunc('month', ea.tea_created_at) = date_trunc('month', CURRENT_DATE)) as monthly_count,
          COUNT(DISTINCT ea.tea_event_id) FILTER (WHERE date_trunc('month', ea.tea_created_at) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')) as last_monthly_count,
          COUNT(DISTINCT ea.tea_event_id) as total_activities
        FROM t_event_assign ea
        JOIN t_event e ON ea.tea_event_id = e.tevent_id
        WHERE ea.tea_user_id = :userId
          AND e.tevent_is_active = true
          AND ea.tea_deleted_at IS NULL
      )
      SELECT * FROM ActivityStats;
    `;

    /* =====================================================
     2️⃣ WEEKLY ACTIVITY (DAY-WISE)
    ===================================================== */
    const weeklyActivityQuery = `
      SELECT
        TO_CHAR(days.day, 'Dy') as day,
        COUNT(DISTINCT ea.tea_event_id) as count
      FROM (
        SELECT (date_trunc('week', CURRENT_DATE) + generate_series(0, 6) * INTERVAL '1 day')::date AS day
      ) days
      LEFT JOIN t_event_assign ea ON ea.tea_created_at::date = days.day AND ea.tea_user_id = :userId
      GROUP BY days.day, days.day
      ORDER BY days.day;
    `;

    /* =====================================================
     3️⃣ THEME BREAKDOWN
    ===================================================== */
    const themeBreakdownQuery = `
      SELECT
        tm.tthm_theme_name as label,
        COUNT(DISTINCT p.tproj_id) as count
      FROM t_projects p
      JOIN t_theme_master tm ON tm.tthm_theme_id = p.tproj_theme_id
      INNER JOIN t_user_state_district usd ON usd.tus_state_id = p.tproj_state_id AND usd.tus_district_id = p.tproj_district_id
      WHERE usd.tus_user_id = :userId 
        AND p.tproj_fl_archive = 'N'
      GROUP BY tm.tthm_theme_name;
    `;

    /* =====================================================
     4️⃣ MONTHLY GOALS (ACHIEVEMENTS)
    ===================================================== */
    const goalsQuery = `
      SELECT
        (SELECT COUNT(DISTINCT ea.tea_event_id) FROM t_event_assign ea JOIN t_event e ON ea.tea_event_id = e.tevent_id WHERE ea.tea_user_id = :userId AND date_trunc('month', ea.tea_created_at) = date_trunc('month', CURRENT_DATE)) as activities_achieved,
        (SELECT COUNT(DISTINCT tea_user_id) FROM t_event_assign WHERE date_trunc('month', tea_created_at) = date_trunc('month', CURRENT_DATE)) as volunteers_achieved,
        (SELECT COUNT(DISTINCT tproj_id) FROM t_projects WHERE date_trunc('month', tproj_created_at) = date_trunc('month', CURRENT_DATE)) as projects_achieved,
        (SELECT COUNT(*) FROM t_documents WHERE final_doc_id IS NOT NULL AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)) as reports_achieved
    `;


    /* =====================================================
     🚀 EXECUTE QUERIES
    ===================================================== */
    const [activityStats] = await sequelize.query(activityQuery, { replacements: { userId }, type: sequelize.QueryTypes.SELECT });
    const weeklyData = await sequelize.query(weeklyActivityQuery, { replacements: { userId }, type: sequelize.QueryTypes.SELECT });
    const themeData = await sequelize.query(themeBreakdownQuery, { replacements: { userId }, type: sequelize.QueryTypes.SELECT });
    const [goalsData] = await sequelize.query(goalsQuery, { replacements: { userId }, type: sequelize.QueryTypes.SELECT });

    // Helper to calculate growth percentage
    const calculateGrowth = (current, previous) => {
      if (!previous || previous == 0) return current > 0 ? "+100%" : "+0%";
      const growth = ((current - previous) / previous) * 100;
      return (growth >= 0 ? "+" : "") + growth.toFixed(0) + "%";
    };

    // Calculate theme percentages
    const totalThemeProjects = themeData.reduce((sum, item) => sum + parseInt(item.count), 0);
    const themeBreakdown = themeData.map(item => ({
      label: item.label,
      count: parseInt(item.count),
      percentage: totalThemeProjects > 0 ? parseFloat((item.count / totalThemeProjects).toFixed(2)) : 0
    }));

    // Construct final response
    const dashboardData = {
      today_count: parseInt(activityStats.today_count) || 0,
      weekly_count: parseInt(activityStats.weekly_count) || 0,
      monthly_count: parseInt(activityStats.monthly_count) || 0,
      total_activities: parseInt(activityStats.total_activities) || 0,
      today_growth: calculateGrowth(activityStats.today_count, activityStats.yesterday_count),
      weekly_growth: calculateGrowth(activityStats.weekly_count, activityStats.last_weekly_count),
      monthly_growth: calculateGrowth(activityStats.monthly_count, activityStats.last_monthly_count),
      weekly_activity: weeklyData.map(d => ({
        day: d.day,
        count: parseInt(d.count),
        value: activityStats.weekly_count > 0 ? parseFloat((d.count / activityStats.weekly_count).toFixed(2)) : 0
      })),
      theme_breakdown: themeBreakdown,
      // monthly_goals: [
      //   { label: "Activities", target: 200, achieved: parseInt(goalsData.activities_achieved) || 0, progress: goalsData.activities_achieved > 0 ? parseFloat((goalsData.activities_achieved / 200).toFixed(2)) : 0 },
      //   { label: "Volunteers", target: 300, achieved: parseInt(goalsData.volunteers_achieved) || 0, progress: goalsData.volunteers_achieved > 0 ? parseFloat((goalsData.volunteers_achieved / 300).toFixed(2)) : 0 },
      //   { label: "Projects", target: 10, achieved: parseInt(goalsData.projects_achieved) || 0, progress: goalsData.projects_achieved > 0 ? parseFloat((goalsData.projects_achieved / 10).toFixed(2)) : 0 },
      //   { label: "Reports", target: 50, achieved: parseInt(goalsData.reports_achieved) || 0, progress: goalsData.reports_achieved > 0 ? parseFloat((goalsData.reports_achieved / 50).toFixed(2)) : 0 }
      // ]
    };

    res.json({
      status: 1,
      message: 'Dashboard data fetched successfully',
      data: dashboardData
    });

  } catch (error) {
    next(CustomErrorHandler.internalServerError(error.message));
  }
};





// module.exports.fetchDashboardDetails = async (req, res, next) => {
//   try {
//     const userId = req?.auth?.id;

//     // 1ï¸âƒ£ Financial Year-wise Event Counts
//     const fyQuery = `
//       SELECT 
//         CASE 
//           WHEN EXTRACT(MONTH FROM e.tevnt_start_date_event) >= 4 
//           THEN EXTRACT(YEAR FROM e.tevnt_start_date_event)::int || '-' || (EXTRACT(YEAR FROM e.tevnt_start_date_event)::int + 1)
//           ELSE (EXTRACT(YEAR FROM e.tevnt_start_date_event)::int - 1) || '-' || EXTRACT(YEAR FROM e.tevnt_start_date_event)::int
//         END AS financial_year,
//         COUNT(DISTINCT ea.tea_event_id) AS total_events
//       FROM t_event_assign ea
//       JOIN t_event e ON ea.tea_event_id = e.tevnt_id
//       WHERE ea.tea_created_by = :userId
//         AND e.tevnt_is_active = true
//         AND ea.tea_deleted_at IS NULL
//       GROUP BY financial_year
//       ORDER BY financial_year;
//     `;

//     // 2ï¸âƒ£ Current Month-wise Event Counts
//     const monthQuery = `
//       SELECT 
//         TO_CHAR(tea_created_at, 'Month') AS month,
//         COUNT(DISTINCT ea.tea_event_id) AS total_events
//       FROM t_event_assign ea
//       JOIN t_event e ON ea.tea_event_id = e.tevnt_id
//       WHERE ea.tea_created_by = :userId
//         AND e.tevnt_is_active = true
//         AND ea.tea_deleted_at IS NULL
//         AND DATE_TRUNC('month', ea.tea_created_at) = DATE_TRUNC('month', CURRENT_DATE)
//       GROUP BY month
//       ORDER BY TO_DATE(month, 'Month');
//     `;

//     // 3ï¸âƒ£ Today-wise Event Counts
//     const todayQuery = `
//       SELECT 
//         COUNT(DISTINCT ea.tea_event_id) AS total_events
//       FROM t_event_assign ea
//       JOIN t_event e ON ea.tea_event_id = e.tevnt_id
//       WHERE ea.tea_created_by = :userId
//         AND e.tevnt_is_active = true
//         AND ea.tea_deleted_at IS NULL
//         AND ea.tea_created_at::date = CURRENT_DATE;
//     `;

//     // Execute queries
//     const [fyCounts, monthCounts, todayCount] = await Promise.all([
//       sequelize.query(fyQuery, { type: sequelize.QueryTypes.SELECT, replacements: { userId } }),
//       sequelize.query(monthQuery, { type: sequelize.QueryTypes.SELECT, replacements: { userId } }),
//       sequelize.query(todayQuery, { type: sequelize.QueryTypes.SELECT, replacements: { userId } }),
//     ]);

//     res.json({
//       status: 1,
//       data: {
//         financial_year_counts: fyCounts,
//         current_month_counts: monthCounts,
//         today_count: todayCount[0].total_events
//       },
//       message: 'Dashboard data fetched successfully'
//     });

//   } catch (error) {
//     next(CustomErrorHandler.internalServerError(error.message));
//   }
// };

module.exports.fetchMastersList = async (req, res, next) => {
  try {

    const user_id = req?.auth?.id;
    const ngo_id = req?.auth?.ngo_id;

    // Master queries
    const queries = {
      states: `SELECT tsl_state_id, tsl_state_name FROM t_state`,
      districts: `SELECT tdl_district_id, tdl_state_id, tdl_district_name FROM t_district`,
      blocks: `SELECT tbl_block_id, tbl_state_id, tbl_district_id, tbl_block_name FROM t_block WHERE tbl_deleted_at IS NULL`,
      villages: `SELECT tvl_village_id, tvl_tsl_state_id, tvl_tdl_district_id, tvl_tbl_block_id, tvl_village_name FROM t_villages`,
      financial_years: `SELECT tfy_id, tfy_year_label,tfy_year, tfy_year_no, tfy_current_year, tfy_start_date, tfy_end_date FROM t_financial_year`,
      
    };

    // Execute all queries
    const results = {};
    for (let key in queries) {
      results[key] = await sequelize.query(queries[key], {
        type: sequelize.QueryTypes.SELECT
      });
    }

    res.json({ status: true, data: [results], message: 'Project list' });

  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


// module.exports.fetchMastersList = async (req, res, next) => {
//   try {
//     const userId = req?.auth?.id;

//     if (!userId) {
//       return res.status(401).json({
//         status: 0,
//         message: "Unauthorized user"
//       });
//     }

//     /* =====================================
//      1️⃣ Get User Assigned Locations
//     ===================================== */
//     const assignedQuery = `
//       SELECT DISTINCT
//         tus_state_id,
//         tus_district_id,
//         tus_block_id,
//         tus_village_id
//       FROM t_user_state_district
//       WHERE tus_user_id = :userId
//         AND tus_deleted_at IS NULL
//         AND tus_fl_archive = 'N'
//     `;

//     const assignedRows = await sequelize.query(assignedQuery, {
//       replacements: { userId },
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!assignedRows.length) {
//       return res.json({
//         status: 1,
//         data: {
//           states: [],
//           districts: [],
//           blocks: [],
//           villages: []
//         },
//         message: "No locations assigned to user"
//       });
//     }

//     /* =====================================
//      2️⃣ Extract Unique IDs
//     ===================================== */
//     const stateIds = [...new Set(assignedRows.map(r => r.tus_state_id).filter(Boolean))];
//     const districtIds = [...new Set(assignedRows.map(r => r.tus_district_id).filter(Boolean))];
//     const blockIds = [...new Set(assignedRows.map(r => r.tus_block_id).filter(Boolean))];
//     const villageIds = [...new Set(assignedRows.map(r => r.tus_village_id).filter(Boolean))];

//     /* =====================================
//      3️⃣ Master Queries (User Scoped)
//     ===================================== */
//     const statesQuery = stateIds.length
//       ? `SELECT tsl_state_id, tsl_state_name
//          FROM t_state
//          WHERE tsl_state_id IN (:stateIds)`
//       : null;

//     const districtsQuery = districtIds.length
//       ? `SELECT tdl_district_id, tdl_state_id, tdl_district_name
//          FROM t_district
//          WHERE tdl_district_id IN (:districtIds)`
//       : null;

//     const blocksQuery = blockIds.length
//       ? `SELECT tbl_block_id, tbl_state_id, tbl_district_id, tbl_block_name
//          FROM t_block
//          WHERE tbl_block_id IN (:blockIds)
//            AND tbl_deleted_at IS NULL`
//       : null;

//     const villagesQuery = villageIds.length
//       ? `SELECT tvl_village_id, tvl_tsl_state_id, tvl_tdl_district_id,
//                 tvl_tbl_block_id, tvl_village_name
//          FROM t_villages
//          WHERE tvl_village_id IN (:villageIds)`
//       : null;

//     /* =====================================
//      4️⃣ Execute Queries
//     ===================================== */
//     const [states, districts, blocks, villages] = await Promise.all([
//       statesQuery
//         ? sequelize.query(statesQuery, {
//             replacements: { stateIds },
//             type: sequelize.QueryTypes.SELECT
//           })
//         : [],
//       districtsQuery
//         ? sequelize.query(districtsQuery, {
//             replacements: { districtIds },
//             type: sequelize.QueryTypes.SELECT
//           })
//         : [],
//       blocksQuery
//         ? sequelize.query(blocksQuery, {
//             replacements: { blockIds },
//             type: sequelize.QueryTypes.SELECT
//           })
//         : [],
//       villagesQuery
//         ? sequelize.query(villagesQuery, {
//             replacements: { villageIds },
//             type: sequelize.QueryTypes.SELECT
//           })
//         : []
//     ]);

//     /* =====================================
//      5️⃣ Final Response
//     ===================================== */
//     res.json({
//       status: 1,
//       message: "User assigned master list fetched successfully",
//       data: {
//         states,
//         districts,
//         blocks,
//         villages
//       }
//     });

//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };


