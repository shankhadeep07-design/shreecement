var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const DocumentModel = require("../../../models/documents/documents.model");
const ProjectPaymentModel = require("../../../models/projects/projects_payment.model");

const ProjectPurchaseOrderModel = require("../../../models/projects/projects_purchase_order.model");
const ProposalModel = require("../../../models/proposal/proposal.model");
const ProjectsModel = require("../../../models/projects/projects.model");
const ProjectMouModel = require("../../../models/projects/projects_mou.model");

const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");



// module.exports.createProjectPayment = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const formData = req.body;
//     const file = req.files?.[0]; // ✅ SINGLE FILE
//     const creator_by = req?.user?.[0]?.id || 0;

//     const {
//       tbad_id,
//       tproj_id,
//       payment_type,
//       invoice_base_value,
//       invoice_gst_applicable,
//       invoice_gst_amount,
//       invoice_tds_applicable,
//     } = formData;

//     if (!tproj_id) throw new Error("Project ID is required");
//     if (!payment_type) throw new Error("Payment type is required");

//     const usedBudget = Number(invoice_base_value || 0);
//     if (usedBudget <= 0) throw new Error("Invoice base value must be greater than 0");

//     /* ================= FETCH PROJECT ================= */
//     const project = await ProjectsModel.findOne({
//       where: { tproj_id },
//       attributes: ["tproj_proposal_id", "tproj_allocate_budget_amount"],
//       transaction,
//     });

//     if (!project) throw new Error("Project not found");

//     const totalBudget = Number(project.tproj_allocate_budget_amount || 0);
//     const remainingBudget = totalBudget - usedBudget;
//     if (remainingBudget < 0) throw new Error("Invoice exceeds project budget");

//     let paymentId = tbad_id;

//     /* ================= UPDATE ================= */
//     if (tbad_id) {
//       await sequelize.query(
//         `
//         UPDATE t_budget_allo_deallocation
//         SET
//           tbad_used_budget      = :used,
//           tbad_remaining_budget = :remaining,
//           tbad_payment_type     = :payment_type,
//           tbad_gst_applicable   = :gst_applicable,
//           tbad_gst_amount       = :gst_amount,
//           tbad_tds_applicable   = :tds_applicable,
//           tbad_updated_by       = :updated_by,
//           tbad_updated_at       = NOW()
//         WHERE tbad_id = :tbad_id
//         `,
//         {
//           replacements: {
//             tbad_id,
//             used: usedBudget,
//             remaining: remainingBudget,
//             payment_type,
//             gst_applicable: invoice_gst_applicable,
//             gst_amount: invoice_gst_amount || 0,
//             tds_applicable: invoice_tds_applicable,
//             updated_by: creator_by,
//           },
//           transaction,
//         }
//       );
//     }

//     /* ================= CREATE ================= */
//     if (!tbad_id) {
//       const [result] = await sequelize.query(
//         `
//         INSERT INTO t_budget_allo_deallocation (
//           tbad_project_id,
//           tbad_proposal_id,
//           tbad_total_budget,
//           tbad_used_budget,
//           tbad_remaining_budget,
//           tbad_transfer_type,
//           tbad_payment_type,
//           tbad_gst_applicable,
//           tbad_gst_amount,
//           tbad_tds_applicable,
//           tbad_created_by,
//           tbad_updated_by
//         )
//         VALUES (
//           :project_id,
//           :proposal_id,
//           :total,
//           :used,
//           :remaining,
//           'purchase_payment',
//           :payment_type,
//           :gst_applicable,
//           :gst_amount,
//           :tds_applicable,
//           :created_by,
//           :updated_by
//         )
//         RETURNING tbad_id
//         `,
//         {
//           replacements: {
//             project_id: tproj_id,
//             proposal_id: project.tproj_proposal_id,
//             total: totalBudget,
//             used: usedBudget,
//             remaining: remainingBudget,
//             payment_type,
//             gst_applicable: invoice_gst_applicable,
//             gst_amount: invoice_gst_amount || 0,
//             tds_applicable: invoice_tds_applicable,
//             created_by: creator_by,
//             updated_by: creator_by,
//           },
//           transaction,
//         }
//       );

//       paymentId = result[0]?.tbad_id;
//     }

//     /* ================= DOCUMENT (SINGLE FILE) ================= */
//     if (file) {
//       const { metadata } = await saveUpdateAndPrepareDocumentMetadata(
//         [file],
//         tproj_id,
//         "uploads/project/payment", // ✅ REQUIRED PATH
//         creator_by,
//         transaction
//       );

//       metadata[0].doc_title = "Invoice Document";
//       metadata[0].created_by = creator_by;
//       metadata[0].updated_by = creator_by;
//       metadata[0].tbad_id = paymentId;

//       await DocumentModel.create(metadata[0], { transaction });
//     }

//     await transaction.commit();

//     return res.status(200).json({
//       success: true,
//       message: tbad_id
//         ? "Payment updated successfully"
//         : "Payment created successfully",
//       tbad_id: paymentId,
//     });

//   } catch (error) {
//     await transaction.rollback();
//     console.error("Payment Error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

module.exports.createProjectPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const formData = req.body;
    const file = req.files?.[0]; // ✅ SINGLE FILE
    const creator_by = req?.user?.[0]?.id || 0;

    const {
      tbad_id,
      tproj_id,
      payment_type,
      invoice_base_value,
      invoice_gst_applicable,
      invoice_gst_amount,
      invoice_tds_applicable,
    } = formData;

    /* ================= BASIC VALIDATION ================= */
    if (!tproj_id) throw new Error("Project ID is required");
    if (!payment_type) throw new Error("Payment type is required");

    const inputBaseValue = Number(invoice_base_value || 0);
    if (inputBaseValue <= 0) {
      throw new Error("Invoice base value must be greater than 0");
    }

    /* ================= FETCH PROJECT ================= */
    const project = await ProjectsModel.findOne({
      where: { tproj_id },
      attributes: ["tproj_proposal_id", "tproj_allocate_budget_amount"],
      transaction,
    });

    if (!project) throw new Error("Project not found");

    const totalBudget = Number(project.tproj_allocate_budget_amount || 0);

    /* ================= FETCH TOTAL USED BUDGET ================= */
    const [usedBudgetResult] = await sequelize.query(
      `
      SELECT COALESCE(SUM(tbad_used_budget), 0) AS total_used_budget
      FROM public.t_budget_allo_deallocation
      WHERE tbad_project_id = :tproj_id
        AND tbad_fl_archive = 'N'
      `,
      {
        replacements: { tproj_id },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    const totalUsedBudget = Number(usedBudgetResult.total_used_budget || 0);

    /* ================= CORRECT REMAINING CALCULATION ================= */
    const remainingBudget =
      totalBudget - (totalUsedBudget + inputBaseValue);

    if (remainingBudget < 0) {
      throw new Error("Invoice base value cannot exceed remaining amount");
    }

    let paymentId = tbad_id;

    /* ================= UPDATE PAYMENT ================= */
    if (tbad_id) {
      await sequelize.query(
        `
        UPDATE t_budget_allo_deallocation
        SET
          tbad_used_budget      = :used,
          tbad_remaining_budget = :remaining,
          tbad_payment_type     = :payment_type,
          tbad_gst_applicable   = :gst_applicable,
          tbad_gst_amount       = :gst_amount,
          tbad_tds_applicable   = :tds_applicable,
          tbad_updated_by       = :updated_by,
          tbad_updated_at       = NOW()
        WHERE tbad_id = :tbad_id
        `,
        {
          replacements: {
            tbad_id,
            used: inputBaseValue,
            remaining: remainingBudget,
            payment_type,
            gst_applicable: invoice_gst_applicable,
            gst_amount: invoice_gst_amount || 0,
            tds_applicable: invoice_tds_applicable,
            updated_by: creator_by,
          },
          transaction,
        }
      );
    }

    /* ================= CREATE PAYMENT ================= */
    if (!tbad_id) {
      const [result] = await sequelize.query(
        `
        INSERT INTO t_budget_allo_deallocation (
          tbad_project_id,
          tbad_proposal_id,
          tbad_total_budget,
          tbad_used_budget,
          tbad_remaining_budget,
          tbad_transfer_type,
          tbad_payment_type,
          tbad_gst_applicable,
          tbad_gst_amount,
          tbad_tds_applicable,
          tbad_created_by,
          tbad_updated_by
        )
        VALUES (
          :project_id,
          :proposal_id,
          :total,
          :used,
          :remaining,
          'purchase_payment',
          :payment_type,
          :gst_applicable,
          :gst_amount,
          :tds_applicable,
          :created_by,
          :updated_by
        )
        RETURNING tbad_id
        `,
        {
          replacements: {
            project_id: tproj_id,
            proposal_id: project.tproj_proposal_id,
            total: totalBudget,
            used: inputBaseValue,
            remaining: remainingBudget,
            payment_type,
            gst_applicable: invoice_gst_applicable,
            gst_amount: invoice_gst_amount || 0,
            tds_applicable: invoice_tds_applicable,
            created_by: creator_by,
            updated_by: creator_by,
          },
          transaction,
        }
      );

      paymentId = result[0]?.tbad_id;
    }

    /* ================= DOCUMENT HANDLING ================= */
    if (file) {
      const existingDoc = await DocumentModel.findOne({
        where: {
          final_doc_id: paymentId,
          doc_purpose: "purchase_payment",
        },
        transaction,
      });

      /* ===== UPDATE DOCUMENT ===== */
      if (existingDoc) {
        const { filePaths } =
          await saveUpdateAndPrepareDocumentMetadata(
            [file],
            paymentId,
            "uploads/project/payment",
            creator_by,
            transaction
          );

        await existingDoc.update(
          {
            doc_name: file.originalname,
            doc_path: filePaths?.[0] || existingDoc.doc_path,
            updated_by: creator_by,
          },
          { transaction }
        );
      }

      /* ===== CREATE DOCUMENT ===== */
      else {
        const { metadata } =
          await saveUpdateAndPrepareDocumentMetadata(
            [file],
            paymentId,
            "uploads/project/payment",
            creator_by,
            transaction
          );

        const doc = metadata[0];
        doc.doc_title = "Invoice Document";
        doc.doc_purpose = "purchase_payment";
        doc.final_doc_id = paymentId;
        doc.created_by = creator_by;
        doc.updated_by = creator_by;

        await DocumentModel.create(doc, { transaction });
      }
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: tbad_id
        ? "Payment updated successfully"
        : "Payment created successfully",
      tbad_id: paymentId,
    });

  } catch (error) {
    if (transaction) await transaction.rollback();

    console.error("Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// module.exports.projectPaymentDetails = async (req, res, next) => {
//   try {
//     const file_url = process.env.SERVER_FILE_URL || "";
//     const { tproj_id, tbad_transfer_type } = req.body;

//     if (!tproj_id) {
//       return res.status(400).json({ message: "Project ID is required" });
//     }

//     if (!tbad_transfer_type) {
//       return res.status(400).json({ message: "Transfer type is required" });
//     }

//     /* ============================
//        FETCH PAYMENTS
//     ============================ */
//     const paymentSql = `
//       SELECT *
//       FROM public.t_budget_allo_deallocation
//       WHERE tbad_project_id = :tproj_id
//         AND tbad_transfer_type = :tbad_transfer_type
//       ORDER BY tbad_created_at DESC
//     `;

//     const paymentData = await sequelize.query(paymentSql, {
//       replacements: { tproj_id, tbad_transfer_type },
//       type: QueryTypes.SELECT,
//     });

//     if (!paymentData.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No payment records found",
//         data: [],
//       });
//     }

//     /* ============================
//        FETCH DOCUMENTS (✅ FIXED)
//     ============================ */
//     const documentSql = `
//       SELECT 
//         td.final_doc_id AS tbad_id,
//         json_agg(
//           jsonb_build_object(
//             'title', td.doc_title,
//             'file_name', td.doc_name,
//             'full_url', :file_url || td.doc_path
//           )
//         ) AS documents
//       FROM t_documents td
//       WHERE td.doc_purpose = 'invoice_file'
//         AND td.final_doc_id IN (
//           SELECT tbad_id
//           FROM public.t_budget_allo_deallocation
//           WHERE tbad_project_id = :tproj_id
//             AND tbad_transfer_type = :tbad_transfer_type
//         )
//       GROUP BY td.final_doc_id
//     `;

//     const documents = await sequelize.query(documentSql, {
//       replacements: { file_url, tproj_id, tbad_transfer_type },
//       type: QueryTypes.SELECT,
//     });

//     /* ============================
//        MERGE PAYMENT + DOCUMENT
//     ============================ */
//     const result = paymentData.map((row) => {
//       const docMatch = documents.find(
//         (doc) => doc.tbad_id === row.tbad_id
//       );

//       return {
//         ...row,
//         documents: docMatch?.documents || [],
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Payment details fetched successfully",
//       data: result,
//     });
//   } catch (err) {
//     console.error("Error fetching payment details:", err);
//     next(err);
//   }
// };


module.exports.projectPaymentDetails = async (req, res, next) => {
  try {
    const file_url = process.env.SERVER_FILE_URL || "";
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
       1️⃣ FETCH PAYMENT RECORDS (using model)
    ============================ */
    const paymentData = await ProjectPaymentModel.findAll({
      where: {
        tpay_project_id: tproj_id,
        tpay_fl_archive: "N",
        tpay_deleted_at: null,
      },
      attributes: [
        "tpay_id",
        "tpay_project_id",
        "tpay_payment_terms",
        "tpay_amount",
        "tpay_fund_received_till_date",
        "tpay_fund_spent_till_date",
        "tpay_spent_percentage",
        "tpay_remarks",
        "tpay_status",
        "tpay_created_by",
        "tpay_updated_by",
        "tpay_created_at",
        "tpay_updated_at",
      ],
      order: [["tpay_created_at", "DESC"]],
      raw: true, // returns plain objects instead of Sequelize instances
    });

    if (!paymentData.length) {
      return res.status(200).json({
        success: true,
        message: "No payment records found",
        data: [],
      });
    }

    /* ============================
       2️⃣ EXTRACT PAYMENT IDS
    ============================ */
    const paymentIds = paymentData.map((row) => row.tpay_id);

    /* ============================
       3️⃣ FETCH DOCUMENTS
    ============================ */
    const documentSql = `
      SELECT 
        td.final_doc_id AS tpay_id,
        json_agg(
          jsonb_build_object(
            'tdoc_id',   td.tdoc_id,
            'title',     td.doc_title,
            'file_name', td.doc_name,
            'full_url',  :file_url || td.doc_path,
            'uid',       td.tdoc_id,
            'name',      td.doc_name,
            'status',    'done',
            'url',       :file_url || td.doc_path
          )
        ) AS documents
      FROM t_documents td
      WHERE td.doc_purpose = 'project_payment'
        AND td.final_doc_id IN (:payment_ids)
      GROUP BY td.final_doc_id
    `;

    const documentData = await sequelize.query(documentSql, {
      replacements: {
        file_url,
        payment_ids: paymentIds,
      },
      type: QueryTypes.SELECT,
    });

    /* ============================
       4️⃣ MERGE PAYMENT + DOCUMENTS
    ============================ */
    const result = paymentData.map((payment) => {
      const docMatch = documentData.find(
        (doc) => doc.tpay_id === payment.tpay_id
      );
      return {
        ...payment,
        documents: docMatch?.documents || [],
      };
    });

    /* ============================
       RESPONSE
    ============================ */
    return res.status(200).json({
      success: true,
      message: "Payment details fetched successfully",
      data: result,
    });

  } catch (err) {
    console.error("Error fetching payment details:", err);
    next(err);
  }
};


