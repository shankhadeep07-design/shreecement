var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const DocumentModel = require("../../../models/documents/documents.model");

const ProjectPurchaseOrderModel = require("../../../models/projects/projects_purchase_order.model");
const ProposalModel = require("../../../models/proposal/proposal.model");
const ProjectsModel = require("../../../models/projects/projects.model");
const ProjectMouModel = require("../../../models/projects/projects_mou.model");
const ProjectPaymentTermsModel = require("../../../models/projects/projects_payment_terms.model");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");

const { Op } = require("sequelize");

module.exports.createProjectPaymentTerms = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const formData = req.body;
    const userId = req?.user?.[0]?.id || 0;

    const { tppayt_id, tproj_id, tppayt_short_name, tppayt_description } =
      formData;

    /* ================= VALIDATION ================= */
    if (!tproj_id) throw new Error("Project ID is required");

    if (!tppayt_short_name || !tppayt_short_name.trim()) {
      throw new Error("Short name is required");
    }

    const cleanName = tppayt_short_name.trim();

    /* =====================================================
       UPDATE
    ====================================================== */
    if (tppayt_id) {
      const existing = await ProjectPaymentTermsModel.findOne({
        where: { tppayt_id },
        transaction,
      });

      if (!existing) {
        throw new Error("Payment term not found");
      }

      // 🔴 DUPLICATE CHECK (same project, ignore current id)
      const duplicate = await ProjectPaymentTermsModel.findOne({
        where: {
          tppayt_project_id: tproj_id,
          tppayt_short_name: {
            [Op.iLike]: cleanName,
          },
          tppayt_id: {
            [Op.ne]: tppayt_id,
          },
          tppayt_deleted_at: null,
        },
        transaction,
      });

      if (duplicate) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: "Payment term short name already exists for this project",
        });
      }

      await ProjectPaymentTermsModel.update(
        {
          tppayt_project_id: tproj_id,
          tppayt_short_name: cleanName,
          tppayt_description,
          tppayt_updated_by: userId,
          tppayt_updated_at: new Date(),
        },
        {
          where: { tppayt_id },
          transaction,
        },
      );

      await transaction.commit();

      return res.json({
        success: true,
        message: "Payment term updated successfully",
      });
    }

    /* =====================================================
       CREATE
    ====================================================== */

    // 🔴 DUPLICATE CHECK (same project)
    const duplicate = await ProjectPaymentTermsModel.findOne({
      where: {
        tppayt_project_id: tproj_id,
        tppayt_short_name: {
          [Op.iLike]: cleanName,
        },
        tppayt_deleted_at: null,
      },
      transaction,
    });

    if (duplicate) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Payment term short name already exists for this project",
      });
    }

    const newRecord = await ProjectPaymentTermsModel.create(
      {
        tppayt_project_id: tproj_id, // ✅ mapping
        tppayt_short_name: cleanName,
        tppayt_description,
        tppayt_created_by: userId,
        tppayt_updated_by: userId,
      },
      { transaction },
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Payment term created successfully",
      data: newRecord,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Payment Term Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.projectPaymentTermsDetails = async (req, res, next) => {
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
