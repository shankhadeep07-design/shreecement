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

const ProjectAnnualReportModel = require("../../../models/projects/projects_annual_report.model");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");

const { Op } = require("sequelize");
module.exports.createProjectAnnualReport = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const isUpdate = !!req.body.tpar_id;
    let id = isUpdate ? req.body.tpar_id : null;

    const formData = req.body;
    const files = req.files || [];
    const created_by = req?.user?.[0]?.id || 0;

    /* ================= VALIDATION ================= */
    if (!formData.tpar_project_id) throw new Error("Project ID is required");
    if (!formData.tpar_report_type || !formData.tpar_report_type.trim())
      throw new Error("Report type is required");
    if (!formData.tpar_date) throw new Error("Date is required");

    /* ================= MAP FIELDS ================= */
    const requestData = {
      tpar_project_id: formData.tpar_project_id || null,
      tpar_report_type: formData.tpar_report_type.trim(),
      tpar_date: formData.tpar_date || null,
      tpar_status: formData.tpar_status || null,
    };

    let annualReportRecord;

    /* ================= CREATE / UPDATE ================= */
    if (isUpdate) {
      const existing = await ProjectAnnualReportModel.findOne({
        where: { tpar_id: id },
        transaction,
      });

      if (!existing) throw new Error("Annual report not found");

      requestData.tpar_updated_by = created_by;
      requestData.tpar_updated_at = new Date();

      await ProjectAnnualReportModel.update(requestData, {
        where: { tpar_id: id },
        transaction,
      });

      annualReportRecord = await ProjectAnnualReportModel.findOne({
        where: { tpar_id: id },
        transaction,
      });
    } else {
      requestData.tpar_created_by = created_by;
      requestData.tpar_updated_by = created_by;

      annualReportRecord = await ProjectAnnualReportModel.create(requestData, {
        transaction,
      });

      id = annualReportRecord.tpar_id;
    }

    /* ================= HANDLE FILE UPLOADS ================= */
    if (files.length > 0) {
      const { metadata } = await saveAndPrepareDocumentMetadata(
        files,
        id,
        "uploads/project/annual-report",
        created_by,
        transaction,
      );

      for (const doc of metadata) {
        doc.doc_title = "Annual Report Document";
        doc.doc_purpose = "annual_report";
        doc.final_doc_id = id;
        doc.created_by = created_by;
        doc.updated_by = created_by;

        await DocumentModel.create(doc, { transaction });
      }
    }

    /* ================= COMMIT ================= */
    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: isUpdate
        ? "Annual report updated successfully"
        : "Annual report created successfully",
      data: annualReportRecord,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("Annual Report Error:", err);

    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

/* ================= DATATABLE ================= */
module.exports.projects_annual_report_datatable = async (req, res, next) => {
  try {
    const file_url = process.env.SERVER_FILE_URL || "";
    const { project_id } = req.body;

    /* ================= BASE SQL ================= */
    let sql = `
      SELECT  
        tpar.*,
        COALESCE(docs.documents, '[]'::json) AS documents
      FROM t_project_annual_report tpar

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
        WHERE td.final_doc_id = tpar.tpar_id       -- ✅ links doc to this specific annual report
          AND td.doc_purpose  = 'annual_report'    -- ✅ filters only annual report docs
           AND td.deleted_at IS NULL
      ) docs ON true
    `;

    /* ================= WHERE ================= */
    let where = `tpar.tpar_deleted_at IS NULL`;

    if (project_id) {
      where += ` AND tpar.tpar_project_id = '${project_id}'`;
    }

    /* ================= DATATABLE ================= */
    const records = await Datatables.build(req, sql, where);

    return res.json(records);
  } catch (err) {
    console.error("Annual Report Datatable Error:", err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
