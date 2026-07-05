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

const ProjectCollateralModel = require("../../../models/projects/projects_collateral.model");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");

const { Op } = require("sequelize");

``;

/* ================= CREATE / UPDATE ================= */
module.exports.createProjectCollateral = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const isUpdate = !!req.body.tpcol_id;
    let id = isUpdate ? req.body.tpcol_id : null;

    const formData = req.body;
    const files = req.files || [];
    const created_by = req?.user?.[0]?.id || 0;

    /* ================= VALIDATION ================= */
    if (!formData.tpcol_project_id) throw new Error("Project ID is required");
    if (!formData.tpcol_title || !formData.tpcol_title.trim())
      throw new Error("Title is required");
    if (!formData.tpcol_date) throw new Error("Date is required");

    /* ================= MAP FIELDS ================= */
    const requestData = {
      tpcol_project_id: formData.tpcol_project_id || null,
      tpcol_title: formData.tpcol_title.trim(),
      tpcol_date: formData.tpcol_date || null,
      tpcol_status: formData.tpcol_status || null,
    };

    let collateralRecord;

    /* ================= CREATE / UPDATE ================= */
    if (isUpdate) {
      const existing = await ProjectCollateralModel.findOne({
        where: { tpcol_id: id },
        transaction,
      });

      if (!existing) throw new Error("Collateral record not found");

      requestData.tpcol_updated_by = created_by;
      requestData.tpcol_updated_at = new Date();

      await ProjectCollateralModel.update(requestData, {
        where: { tpcol_id: id },
        transaction,
      });

      collateralRecord = await ProjectCollateralModel.findOne({
        where: { tpcol_id: id },
        transaction,
      });
    } else {
      requestData.tpcol_created_by = created_by;
      requestData.tpcol_updated_by = created_by;

      collateralRecord = await ProjectCollateralModel.create(requestData, {
        transaction,
      });

      id = collateralRecord.tpcol_id;
    }

    /* ================= HANDLE FILE UPLOADS ================= */
    if (files.length > 0) {
      const { metadata } = await saveAndPrepareDocumentMetadata(
        files,
        id,
        "uploads/project/collateral",
        created_by,
        transaction,
      );

      for (const doc of metadata) {
        doc.doc_title = "Collateral Document";
        doc.doc_purpose = "collateral";
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
        ? "Collateral updated successfully"
        : "Collateral created successfully",
      data: collateralRecord,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("Collateral Error:", err);

    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

/* ================= DATATABLE ================= */
module.exports.projects_collateral_datatable = async (req, res, next) => {
  try {
    const file_url = process.env.SERVER_FILE_URL || "";
    const { project_id } = req.body;

    /* ================= BASE SQL ================= */
    let sql = `
      SELECT
        tpcol.*,
        COALESCE(docs.documents, '[]'::json) AS documents
      FROM t_project_collateral tpcol

      /* ===== DOCUMENT JOIN ===== */
      LEFT JOIN LATERAL (
        SELECT json_agg(
          jsonb_build_object(
            'tdoc_id',   td.tdoc_id,
            'name',      td.doc_name,
            'file_name', td.doc_name,
            'url',       '${file_url}' || td.doc_path,
            'full_url',  '${file_url}' || td.doc_path,
            'status',    'done'
          )
        ) AS documents
        FROM t_documents td
        WHERE td.final_doc_id = tpcol.tpcol_id    -- ✅ links doc to this specific collateral
          AND td.doc_purpose  = 'collateral'       -- ✅ filters only collateral docs
           AND td.deleted_at IS NULL
      ) docs ON true
    `;

    /* ================= WHERE ================= */
    let where = `tpcol.tpcol_deleted_at IS NULL`;

    if (project_id) {
      where += ` AND tpcol.tpcol_project_id = '${project_id}'`;
    }

    /* ================= DATATABLE ================= */
    const records = await Datatables.build(req, sql, where);

    return res.json(records);
  } catch (err) {
    console.error("Collateral Datatable Error:", err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
