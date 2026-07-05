var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const DocumentModel = require("../../../models/documents/documents.model");
const Datatables = require("../../../service/DatatableService");
const ProjectPurchaseOrderModel = require("../../../models/projects/projects_purchase_order.model");
const ProposalModel = require("../../../models/proposal/proposal.model");
const ProjectsModel = require("../../../models/projects/projects.model");
const ProjectMouModel = require("../../../models/projects/projects_mou.model");
const ProjectFinancialReportModel = require("../../../models/projects/projects_financial_report.model");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");

const { Op } = require("sequelize");

module.exports.createProjectFinancialReport = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const isUpdate = !!req.body.tpfr_id;
    let id = isUpdate ? req.body.tpfr_id : null;

    const formData = req.body;
    const files = req.files || [];
    const created_by = req?.user?.[0]?.id || 0;

    /* ================= VALIDATION ================= */
    if (!formData.tpfr_project_id) throw new Error("Project ID is required");
    if (!formData.tpfr_title || !formData.tpfr_title.trim())
      throw new Error("Title is required");
    if (!formData.tpfr_date) throw new Error("Date is required");
    if (!formData.tpfr_details || !formData.tpfr_details.trim())
      throw new Error("Details are required");

    /* ================= MAP FIELDS ================= */
    const requestData = {
      tpfr_project_id: formData.tpfr_project_id || null,
      tpfr_title:      formData.tpfr_title.trim(),
      tpfr_date:       formData.tpfr_date || null,
      tpfr_details:    formData.tpfr_details.trim(),
      tpfr_status:     formData.tpfr_status || null,
    };

    let financialReportRecord;

    /* ================= CREATE / UPDATE ================= */
    if (isUpdate) {
      const existing = await ProjectFinancialReportModel.findOne({
        where: { tpfr_id: id },
        transaction,
      });

      if (!existing) throw new Error("Financial report not found");

      requestData.tpfr_updated_by = created_by;
      requestData.tpfr_updated_at = new Date();

      await ProjectFinancialReportModel.update(requestData, {
        where: { tpfr_id: id },
        transaction,
      });

      financialReportRecord = await ProjectFinancialReportModel.findOne({
        where: { tpfr_id: id },
        transaction,
      });

    } else {
      requestData.tpfr_created_by = created_by;
      requestData.tpfr_updated_by = created_by;

      financialReportRecord = await ProjectFinancialReportModel.create(
        requestData,
        { transaction },
      );

      id = financialReportRecord.tpfr_id;
    }

    /* ================= HANDLE FILE UPLOADS ================= */
    if (files.length > 0) {
      const { metadata } = await saveAndPrepareDocumentMetadata(
        files,
        id,
        "uploads/project/financial-report",
        created_by,
        transaction,
      );

      for (const doc of metadata) {
        doc.doc_title    = "Financial Report Document";
        doc.doc_purpose  = "financial_report";
        doc.final_doc_id = id;
        doc.created_by   = created_by;
        doc.updated_by   = created_by;

        await DocumentModel.create(doc, { transaction });
      }
    }

    /* ================= COMMIT ================= */
    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: isUpdate
        ? "Financial report updated successfully"
        : "Financial report created successfully",
      data: financialReportRecord,
    });

  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("Financial Report Error:", err);

    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

module.exports.projects_financial_report_datatable = async (req, res, next) => {
  try {
    const file_url = process.env.SERVER_FILE_URL || "";
    const { project_id } = req.body;

    /* ================= BASE SQL ================= */
    let sql = `
      SELECT  
        tpfr.*,
        COALESCE(docs.documents, '[]'::json) AS documents
      FROM t_project_financial_report tpfr

      /* ===== DOCUMENT JOIN ===== */
      LEFT JOIN LATERAL (
        SELECT json_agg(
          jsonb_build_object(
            'tdoc_id',    td.tdoc_id,
            'name',       td.doc_name,
            'file_name',  td.doc_name,
            'url',        '${file_url}' || td.doc_path,
            'full_url',   '${file_url}' || td.doc_path,
            'status',     'done'
          )
        ) AS documents
        FROM t_documents td
        WHERE td.final_doc_id = tpfr.tpfr_id        -- ✅ links doc to this specific financial report
          AND td.doc_purpose  = 'financial_report'   -- ✅ filters only financial report docs
           AND td.deleted_at IS NULL
      ) docs ON true
    `;

    /* ================= WHERE ================= */
    let where = `tpfr.tpfr_deleted_at IS NULL`;    

    if (project_id) {
      where += ` AND tpfr.tpfr_project_id = '${project_id}'`; 
    }

    /* ================= DATATABLE ================= */
    const records = await Datatables.build(req, sql, where);

    return res.json(records);

  } catch (err) {
    console.error("Financial Report Datatable Error:", err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.projectFinancialReportDetails = async (req, res, next) => {
  try {
    const { tproj_id } = req.body;

    /* ============================
       VALIDATION
    ============================ */
    if (!tproj_id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    /* ============================
       FETCH PAYMENT TERMS
    ============================ */
    const sql = `
      SELECT 
        tppayt_id,
        tppayt_project_id,
        tppayt_short_name,
        tppayt_description,
        tppayt_status,
        tppayt_created_at,
        tppayt_updated_at
      FROM public.t_project_payment_terms
      WHERE tppayt_project_id = :tproj_id
        AND tppayt_deleted_at IS NULL
      ORDER BY tppayt_created_at DESC
    `;

    const data = await sequelize.query(sql, {
      replacements: { tproj_id },
      type: QueryTypes.SELECT,
    });

    /* ============================
       RESPONSE
    ============================ */
    return res.status(200).json({
      success: true,
      message: data.length
        ? "Payment terms fetched successfully"
        : "No payment terms found",
      data: data || [],
    });
  } catch (err) {
    console.error("Error fetching payment terms:", err);
    next(err);
  }
};
