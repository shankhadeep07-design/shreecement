var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const DocumentModel = require("../../../models/documents/documents.model");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const ProjectPurchaseOrderModel = require("../../../models/projects/projects_purchase_order.model");
const ProposalModel = require("../../../models/proposal/proposal.model");
const ProjectsModel = require("../../../models/projects/projects.model");

module.exports.createOrUpdateProjectPoUpload = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const formData = req.body;
    const files = req.files || [];
    const creator_by = req?.user?.[0]?.id || 0;

    // Check if PO already exists (edit)
    let purchaseOrder;
    let tppo_id = formData?.tppo_id; // Pass this from frontend when editing

    if (tppo_id) {
      // 🔹 UPDATE existing PO
      purchaseOrder = await ProjectPurchaseOrderModel.findOne({
        where: { tppo_id },
        transaction,
      });

      if (!purchaseOrder) {
        throw new Error(`Purchase Order with id ${tppo_id} not found`);
      }

      await purchaseOrder.update(
        {
          tppo_pr_number: formData?.pr_number || null,
          tppo_pr_creation_date: formData?.pr_date
            ? new Date(formData.pr_date)
            : null,
          tppo_work_flow_number: formData?.workflow_number || null,
          tppo_work_flow_creation_date: formData?.workflow_date
            ? new Date(formData.workflow_date)
            : null,
          tppo_project_value: formData?.project_value
            ? Number(formData.project_value)
            : null,
          tppo_purchase_order_status: formData?.purchase_order || null,
          tppo_updated_by: creator_by,
        },
        { transaction },
      );
    } else {
      // 🔹 CREATE new PO
      const project = await ProjectsModel.findOne({
        where: { tproj_id: formData?.tdoc_tproj_id },
        attributes: ["tproj_proposal_id"],
        transaction,
      });
      const tppo_proposal_id = project?.tproj_proposal_id || null;

      purchaseOrder = await ProjectPurchaseOrderModel.create(
        {
          tppo_proposal_id,
          tppo_project_id: formData?.tdoc_tproj_id || null,
          tppo_pr_number: formData?.pr_number || null,
          tppo_pr_creation_date: formData?.pr_date
            ? new Date(formData.pr_date)
            : null,
          tppo_work_flow_number: formData?.workflow_number || null,
          tppo_work_flow_creation_date: formData?.workflow_date
            ? new Date(formData.workflow_date)
            : null,
          tppo_project_value: formData?.project_value
            ? Number(formData.project_value)
            : null,
          tppo_purchase_order_status: formData?.purchase_order || null,
          tppo_created_by: creator_by,
          tppo_updated_by: creator_by,
        },
        { transaction },
      );

      tppo_id = purchaseOrder.tppo_id;
    }

    // ===============================
    // 📄 DOCUMENT LOGIC
    // ===============================
    const titles = Array.isArray(formData?.tdoc_po_docs_title)
      ? formData.tdoc_po_docs_title
      : [formData?.tdoc_po_docs_title];

    const ids = Array.isArray(formData?.tdoc_id)
      ? formData.tdoc_id
      : formData?.tdoc_id
        ? [formData?.tdoc_id]
        : [];

    let uploadedFilePaths = [];
    let allMetadata = [];

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i] || "";
      const file = files[i];
      const tdocId = ids[i];

      if (tdocId) {
        // 🔹 UPDATE existing document
        const existingDoc = await DocumentModel.findOne({
          where: { tdoc_id: tdocId },
          transaction,
        });

        if (!existingDoc)
          throw new Error(`Document with id ${tdocId} not found`);

        let updatePayload = { doc_title: title, updated_by: creator_by };

        if (file) {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              [file],
              formData?.tdoc_tproj_id,
              "uploads/project/project_po",
              creator_by,
              transaction,
            );
          updatePayload = { ...updatePayload, ...metadata[0] };
          uploadedFilePaths.push(...filePaths);
        }

        await existingDoc.update(updatePayload, { transaction });
      } else {
        // 🔹 CREATE new document
        if (file) {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              [file],
              formData?.tdoc_tproj_id,
              "uploads/project/project_po",
              creator_by,
              transaction,
            );

          metadata.forEach((m) => {
            m.doc_title = title;
            m.created_by = creator_by;
            m.updated_by = creator_by;
            m.tppo_id = tppo_id; // Link document to PO
          });

          uploadedFilePaths.push(...filePaths);
          allMetadata.push(...metadata);
        }
      }
    }

    if (allMetadata.length) {
      await DocumentModel.bulkCreate(allMetadata, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: tppo_id ? "PO updated successfully" : "PO created successfully",
      tppo_id,
      uploadedFilePaths,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in createOrUpdateProjectPoUpload:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= CREATE / UPDATE ================= */
module.exports.createProjectPoUpload = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const isUpdate = !!req.body.tppo_id;
    let id = isUpdate ? req.body.tppo_id : null;

    const formData = req.body;
    const files = req.files || [];
    const created_by = req?.user?.[0]?.id || 0;

    /* ================= VALIDATION ================= */
    if (!formData.tppo_proposal_id) throw new Error("Project ID is required");
    if (!formData.tppo_title || !formData.tppo_title.trim())
      throw new Error("Title is required");
    if (!formData.tppo_valid_from) throw new Error("Valid From is required");
    if (!formData.tppo_valid_to) throw new Error("Valid To is required");

    /* ================= MAP FIELDS ================= */
    const requestData = {
      tppo_proposal_id: formData.tppo_proposal_id || null,
      tppo_title: formData.tppo_title.trim(),
      tppo_valid_from: formData.tppo_valid_from || null,
      tppo_valid_to: formData.tppo_valid_to || null,
      tppo_remarks: formData.tppo_remarks || null,
      tppo_status: formData.tppo_status || null,
    };

    let purchaseOrderRecord;

    /* ================= CREATE / UPDATE ================= */
    if (isUpdate) {
      const existing = await ProjectPurchaseOrderModel.findOne({
        where: { tppo_id: id },
        transaction,
      });

      if (!existing) throw new Error("Purchase Order not found");

      requestData.tppo_updated_by = created_by;
      requestData.tppo_updated_at = new Date();

      await ProjectPurchaseOrderModel.update(requestData, {
        where: { tppo_id: id },
        transaction,
      });

      purchaseOrderRecord = await ProjectPurchaseOrderModel.findOne({
        where: { tppo_id: id },
        transaction,
      });
    } else {
      requestData.tppo_created_by = created_by;
      requestData.tppo_updated_by = created_by;

      purchaseOrderRecord = await ProjectPurchaseOrderModel.create(
        requestData,
        { transaction },
      );

      id = purchaseOrderRecord.tppo_id;
    }

    /* ================= HANDLE FILE UPLOADS ================= */
    if (files.length > 0) {
      const { metadata } = await saveAndPrepareDocumentMetadata(
        files,
        id,
        "uploads/project/purchase-order",
        created_by,
        transaction,
      );

      for (const doc of metadata) {
        doc.doc_title = "Purchase Order Document";
        doc.doc_purpose = "po_docs";
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
        ? "Purchase Order updated successfully"
        : "Purchase Order created successfully",
      data: purchaseOrderRecord,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("Purchase Order Error:", err);

    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

/* ================= DETAILS ================= */
module.exports.projectPoUploadDetails = async (req, res, next) => {
  try {
    const file_url = process.env.SERVER_FILE_URL || "";
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        status: false,
        message: "Project ID is required",
      });
    }

    /* ================= BASE SQL ================= */
    const sql = `
      SELECT
        tppo.*,
        COALESCE(docs.documents, '[]'::json) AS documents
      FROM t_project_purchase_orders tppo

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
        WHERE td.final_doc_id = tppo.tppo_id   -- ✅ links doc to this specific PO
          AND td.doc_purpose  = 'po_docs'    -- ✅ filters only PO docs
                     AND td.deleted_at IS NULL  

      ) docs ON true

      WHERE tppo.tppo_deleted_at  IS NULL       -- ✅ soft delete filter
        AND tppo.tppo_proposal_id = :project_id -- ✅ filter by project
      ORDER BY tppo.tppo_created_at DESC
    `;

    const poData = await sequelize.query(sql, {
      replacements: { project_id },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "Purchase Order details fetched successfully",
      data: poData || [],
    });
  } catch (err) {
    console.error("Purchase Order Details Error:", err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
