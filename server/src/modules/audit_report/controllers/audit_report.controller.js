const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const exceljs = require("exceljs");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");

module.exports.loginLogoutReport = async (req, res, next) => {
  try {
    const { start_date, end_date, page, limit } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let whereClause = `WHERE 1=1`;
    const replacements = {};

    if (start_date && end_date) {
      whereClause += ` AND t_login_logout_logs.created_at BETWEEN :start_date AND :end_date`;
      replacements.start_date = start_date + " 00:00:00";
      replacements.end_date = end_date + " 23:59:59";
    } else if (start_date) {
      whereClause += ` AND t_login_logout_logs.created_at >= :start_date`;
      replacements.start_date = start_date + " 00:00:00";
    } else if (end_date) {
      whereClause += ` AND t_login_logout_logs.created_at <= :end_date`;
      replacements.end_date = end_date + " 23:59:59";
    }

    // ✅ Count
    const countSql = `
      SELECT COUNT(*) AS total
      FROM t_login_logout_logs
      LEFT JOIN users ON users.id = t_login_logout_logs.user_id
      ${whereClause}
    `;
    const countResult = await sequelize.query(countSql, {
      replacements,
      type: QueryTypes.SELECT,
    });
    const total = parseInt(countResult[0]?.total || 0);

    // ✅ Data
    const dataSql = `
      SELECT
        t_login_logout_logs.id         AS list_id,
        users.name                     AS user_name,
        t_login_logout_logs.log_type   AS log_type,
        t_login_logout_logs.ip_address AS ip,
        t_login_logout_logs.user_agent AS user_agent,
        t_login_logout_logs.status     AS status,
        t_login_logout_logs.created_at AS time
      FROM t_login_logout_logs
      LEFT JOIN users ON users.id = t_login_logout_logs.user_id
      ${whereClause}
      ORDER BY t_login_logout_logs.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    const data = await sequelize.query(dataSql, {
      replacements: { ...replacements, limit: limitNum, offset },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      data,
      total,
      page: pageNum,
      limit: limitNum,
      last_page: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("❌ loginLogoutReport error:", error.message);
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

module.exports.loginLogoutReportExcel = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = `WHERE 1=1`;
    const replacements = {};

    if (start_date && end_date) {
      whereClause += ` AND t_login_logout_logs.created_at BETWEEN :start_date AND :end_date`;
      replacements.start_date = start_date + " 00:00:00";
      replacements.end_date = end_date + " 23:59:59";
    } else if (start_date) {
      whereClause += ` AND t_login_logout_logs.created_at >= :start_date`;
      replacements.start_date = start_date + " 00:00:00";
    } else if (end_date) {
      whereClause += ` AND t_login_logout_logs.created_at <= :end_date`;
      replacements.end_date = end_date + " 23:59:59";
    }

    const sql = `
      SELECT
        t_login_logout_logs.id         AS list_id,
        users.name                     AS user_name,
        t_login_logout_logs.log_type   AS log_type,
        t_login_logout_logs.ip_address AS ip,
        t_login_logout_logs.user_agent AS user_agent,
        t_login_logout_logs.status     AS status,
        t_login_logout_logs.created_at AS time
      FROM t_login_logout_logs
      LEFT JOIN users ON users.id = t_login_logout_logs.user_id
      ${whereClause}
      ORDER BY t_login_logout_logs.created_at DESC
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("Login Logout Report");

    sheet.columns = [
      { header: "User Name", key: "user_name", width: 25 },
      { header: "Log Type", key: "log_type", width: 15 },
      { header: "IP Address", key: "ip", width: 20 },
      { header: "Time", key: "time", width: 25 },

      { header: "Status", key: "status", width: 15 },
    ];

    data.forEach((item) => sheet.addRow(item));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=LoginLogoutReport.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ loginLogoutReportExcel error:", error.message);
    next(CustomErrorHandler.internalServerError(error.message));
  }
};
