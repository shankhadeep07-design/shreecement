const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const exceljs = require("exceljs");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");

/**
 * Fetches paginated budget audit logs
 */
module.exports.documentReport = async (req, res, next) => {
  try {
    const { start_date, end_date, table, page, limit } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    let whereClause = `WHERE 1=1`;
    const replacements = {};

    if (table) {
      whereClause += ` AND a.table_name = :table`;
      replacements.table = table;
    }

    if (start_date && end_date) {
      whereClause += ` AND DATE(a.action_tstamp_clk) BETWEEN :start_date AND :end_date`;
      replacements.start_date = start_date;
      replacements.end_date = end_date;
    } else if (start_date) {
      whereClause += ` AND DATE(a.action_tstamp_clk) >= :start_date`;
      replacements.start_date = start_date;
    } else if (end_date) {
      whereClause += ` AND DATE(a.action_tstamp_clk) <= :end_date`;
      replacements.end_date = end_date;
    }

    // ✅ COUNT QUERY
    const countSql = `
      SELECT COUNT(*) AS total
      FROM audit.document_logged_actions a
      LEFT JOIN public.users u ON CAST(u.id AS text) = a.session_user_name
      ${whereClause}
    `;

    const countResult = await sequelize.query(countSql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0]?.total || 0);

    // ✅ DATA QUERY
    const dataSql = `
      SELECT
        a.event_id          AS event_id,
        a.table_name        AS table_name,
        a.action            AS action,
        CASE a.action
          WHEN 'I' THEN 'Insert'
          WHEN 'U' THEN 'Update'
          WHEN 'D' THEN 'Delete'
          WHEN 'T' THEN 'Truncate'
          ELSE ''
        END                 AS action_text,
        a.row_data::text    AS row_data,
        a.changed_fields::text AS changed_fields,
        a.session_user_name AS session_user_name,
        u.name              AS username,
        a.client_addr       AS client_addr,
        a.action_tstamp_clk AS action_tstamp_clk
      FROM audit.document_logged_actions a
      LEFT JOIN public.users u ON CAST(u.id AS text) = a.session_user_name
      ${whereClause}
      ORDER BY a.action_tstamp_clk DESC
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
    console.error("❌ documentReport error:", error.message);
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

module.exports.documentReportExcel = async (req, res, next) => {
  try {
    const { start_date, end_date, table } = req.query;

    let whereClause = `WHERE 1=1`;
    const replacements = {};

    if (table) {
      whereClause += ` AND a.table_name = :table`;
      replacements.table = table;
    }

    if (start_date && end_date) {
      whereClause += ` AND DATE(a.action_tstamp_clk) BETWEEN :start_date AND :end_date`;
      replacements.start_date = start_date;
      replacements.end_date = end_date;
    } else if (start_date) {
      whereClause += ` AND DATE(a.action_tstamp_clk) >= :start_date`;
      replacements.start_date = start_date;
    } else if (end_date) {
      whereClause += ` AND DATE(a.action_tstamp_clk) <= :end_date`;
      replacements.end_date = end_date;
    }

    const sql = `
      SELECT
        a.table_name        AS table_name,
        CASE a.action
          WHEN 'I' THEN 'Insert'
          WHEN 'U' THEN 'Update'
          WHEN 'D' THEN 'Delete'
          WHEN 'T' THEN 'Truncate'
          ELSE ''
        END                 AS action_text,
        u.name              AS username,
        a.client_addr       AS client_addr,
        a.action_tstamp_clk AS action_tstamp_clk
      FROM audit.document_logged_actions a
      LEFT JOIN public.users u ON CAST(u.id AS text) = a.session_user_name
      ${whereClause}
      ORDER BY a.action_tstamp_clk DESC
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("Document Audit Report");

    sheet.columns = [
      { header: "Table",     key: "table_name",        width: 35 },
      { header: "Action",    key: "action_text",        width: 15 },
      // { header: "User",      key: "username",           width: 25 },
      { header: "Client IP", key: "client_addr",        width: 20 },
      { header: "Time",      key: "action_tstamp_clk",  width: 30 },
    ];

    data.forEach((item) => sheet.addRow(item));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=DocumentAuditReport.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ documentReportExcel error:", error.message);
    next(CustomErrorHandler.internalServerError(error.message));
  }
};