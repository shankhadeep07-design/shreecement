var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const DocumentModel = require("../../../models/documents/documents.model");

const ProjectPurchaseOrderModel = require("../../../models/projects/projects_purchase_order.model");
const ProposalModel = require("../../../models/proposal/proposal.model");
const ProjectsModel = require("../../../models/projects/projects.model");
const ProjectMouModel = require("../../../models/projects/projects_mou.model");

const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");

// module.exports.createProjectMouUpload = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const formData = req.body;
//     const files = req.files || [];
//     const creator_by = req?.user?.[0]?.id || "SYSTEM";

//     let uploadedFilePaths = [];
//     let allMetadata = [];

//     // Ensure array consistency
//     const titles = Array.isArray(formData?.tdoc_mou_docs_title)
//       ? formData.tdoc_mou_docs_title
//       : [formData?.tdoc_mou_docs_title];

//     const ids = Array.isArray(formData?.tdoc_id)
//       ? formData.tdoc_id
//       : formData?.tdoc_id
//       ? [formData?.tdoc_id]
//       : [];

//     // ✅ Loop through each title/file
//     for (let i = 0; i < titles.length; i++) {
//       const title = titles[i] || "";
//       const file = files[i]; // single file for this title
//       const tdocId = ids[i]; // might be undefined for new uploads

//       if (tdocId) {
//         // 🔄 UPDATE EXISTING RECORD
//         const existingDoc = await DocumentModel.findOne({
//           where: { tdoc_id: tdocId },
//           transaction,
//         });

//         if (!existingDoc) {
//           throw new Error(`Document with id ${tdocId} not found`);
//         }

//         let updatePayload = {
//           doc_title: title,
//           updated_by: creator_by,
//         };

//         // If new file is uploaded → save it and replace old file path
//         if (file) {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               [file],
//               formData?.tdoc_tproj_id,
//               "uploads/project/project_mou",
//               creator_by,
//               transaction
//             );

//           updatePayload = { ...updatePayload, ...metadata[0] };
//           uploadedFilePaths.push(...filePaths);
//         }

//         await existingDoc.update(updatePayload, { transaction });
//       } else {
//         // ➕ CREATE NEW RECORD
//         if (file) {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               [file],
//               formData?.tdoc_tproj_id,
//               "uploads/project/project_mou",
//               creator_by,
//               transaction
//             );

//           metadata.forEach((m) => {
//             m.doc_title = title;
//             m.created_by = creator_by;
//             m.updated_by = creator_by;
//           });

//           uploadedFilePaths.push(...filePaths);
//           allMetadata.push(...metadata);
//         }
//       }
//     }

//     // Bulk insert new documents
//     if (allMetadata.length) {
//       await DocumentModel.bulkCreate(allMetadata, { transaction });
//     }

//     await transaction.commit();
//     res.status(200).json({
//       success: true,
//       message: "MOU Upload saved successfully",
//       uploadedFilePaths,
//     });
//   } catch (error) {
//     if (transaction) await transaction.rollback();
//     console.error("Error in createProjectPoUpload:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

/* ================= CREATE / UPDATE ================= */
module.exports.createProjectMouUpload = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const isUpdate = !!req.body.tpmou_id;
    let id = isUpdate ? req.body.tpmou_id : null;

    const formData = req.body;
    const files = req.files || [];
    const created_by = req?.user?.[0]?.id || 0;

    /* ================= VALIDATION ================= */
    if (!formData.tpmou_proposal_id) throw new Error("Project ID is required");
    if (!formData.tpmou_title || !formData.tpmou_title.trim())
      throw new Error("Title is required");
    if (!formData.tpmou_valid_from) throw new Error("Valid From is required");
    if (!formData.tpmou_valid_to) throw new Error("Valid To is required");
    if (!formData.tpmou_mou_type) throw new Error("MOU Type is required");

    /* ================= MAP FIELDS ================= */
    const requestData = {
      tpmou_proposal_id: formData.tpmou_proposal_id || null,
      tpmou_title: formData.tpmou_title.trim(),
      tpmou_valid_from: formData.tpmou_valid_from || null,
      tpmou_valid_to: formData.tpmou_valid_to || null,
      tpmou_mou_type: formData.tpmou_mou_type || null,
      tpmou_remarks: formData.tpmou_remarks || null,
    };

    let mouRecord;

    /* ================= CREATE / UPDATE ================= */
    if (isUpdate) {
      const existing = await ProjectMouModel.findOne({
        where: { tpmou_id: id },
        transaction,
      });

      if (!existing) throw new Error("MOU record not found");

      requestData.tpmou_updated_by = created_by;
      requestData.tpmou_updated_at = new Date();

      await ProjectMouModel.update(requestData, {
        where: { tpmou_id: id },
        transaction,
      });

      mouRecord = await ProjectMouModel.findOne({
        where: { tpmou_id: id },
        transaction,
      });
    } else {
      requestData.tpmou_created_by = created_by;
      requestData.tpmou_updated_by = created_by;

      mouRecord = await ProjectMouModel.create(requestData, {
        transaction,
      });

      id = mouRecord.tpmou_id;
    }

    /* ================= HANDLE FILE UPLOADS ================= */
    if (files.length > 0) {
      const { metadata } = await saveAndPrepareDocumentMetadata(
        files,
        id,
        "uploads/project/mou",
        created_by,
        transaction,
      );

      for (const doc of metadata) {
        doc.doc_title = "MOU Document";
        doc.doc_purpose = "mou_docs";
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
        ? "MOU updated successfully"
        : "MOU created successfully",
      data: mouRecord,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("MOU Error:", err);

    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

/* ================= DETAILS / DATATABLE ================= */
module.exports.projectMouUploadDetails = async (req, res, next) => {
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
        tpmou.*,
        COALESCE(docs.documents, '[]'::json) AS documents
      FROM t_project_mous tpmou

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
        WHERE td.final_doc_id = tpmou.tpmou_id   -- ✅ links doc to this specific MOU
          AND td.doc_purpose  = 'mou_docs'     -- ✅ filters only MOU docs
                     AND td.deleted_at IS NULL  

      ) docs ON true

      WHERE tpmou.tpmou_proposal_id = :project_id -- ✅ filter by project
      ORDER BY tpmou.tpmou_created_at DESC
    `;

    const mouData = await sequelize.query(sql, {
      replacements: { project_id },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "MOU details fetched successfully",
      data: mouData || [],
    });
  } catch (err) {
    console.error("MOU Details Error:", err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
