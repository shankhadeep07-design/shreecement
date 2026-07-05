var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const DocumentModel = require("../../../models/documents/documents.model");

const ProjectPurchaseOrderModel = require("../../../models/projects/projects_purchase_order.model");
const ProposalModel = require("../../../models/proposal/proposal.model");
const ProjectsModel = require("../../../models/projects/projects.model");
const ProjectMouModel = require("../../../models/projects/projects_mou.model");
const { isEmpty } = require("lodash");
const ProjectDeviationModel = require("../../../models/projects/projects_deviation.model");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");

module.exports.createProjectDeviation = async (req, res, next) => {
  let transaction = await sequelize.transaction();

  try {
    let uploadedFilePaths = [];

    const isUpdate = !isEmpty(req.body.tpdev_id);
    let id = isUpdate ? req.body.tpdev_id : null;

    const formData = req.body;
    const files = req.files || [];
    const creater_by = req?.user?.[0]?.id || 0;

    // ---------------- Map Fields ----------------
    const requestData = {
      tpdev_project_id: Array.isArray(formData.tproj_id)
        ? formData.tproj_id[0]
        : formData.tproj_id || null,

      tpdev_deviation_type: formData.tpdev_deviation_type || null,

      tpdev_no_of_days: formData.tpdev_no_of_days
        ? parseInt(formData.tpdev_no_of_days, 10)
        : null,

      tpdev_amount: formData.tpdev_amount
        ? parseFloat(formData.tpdev_amount)
        : null,

      tpdev_brief_fact: formData.tpdev_brief_fact || null,

      tpdev_reason_for_deviation: formData.tpdev_reason_for_deviation || null,

      tpdev_program_change: formData.tpdev_program_change || null,

      tpdev_status: formData.tpdev_status || null,
    };

    let newDeviation;

    // ---------------- CREATE / UPDATE ----------------
    if (id) {
      // ✅ UPDATE
      requestData.tpdev_updated_by = creater_by;

      await ProjectDeviationModel.update(requestData, {
        where: { tpdev_id: id },
        transaction,
      });

      newDeviation = await ProjectDeviationModel.findOne({
        where: { tpdev_id: id },
        transaction,
      });
    } else {
      // ✅ CREATE
      requestData.tpdev_created_by = creater_by;
      requestData.tpdev_updated_by = creater_by;

      newDeviation = await ProjectDeviationModel.create(requestData, {
        transaction,
      });

      id = newDeviation.tpdev_id;
    }

    // ---------------- FILE UPLOAD ----------------
    if (files.length > 0) {
      const groupedFiles = files.reduce((acc, file) => {
        (acc[file.fieldname] ||= []).push(file);
        return acc;
      }, {});

      // ✅ Deviation Documents (multiple files)
      if (groupedFiles.document_upload) {
        const { metadata, filePaths } = await saveAndPrepareDocumentMetadata(
          groupedFiles.document_upload,
          id,
          "uploads/project/deviation",
          creater_by,
          transaction,
        );

        // uploadedFilePaths.push(...filePaths);
        // if (metadata.length) {
        //   await DocumentModel.bulkCreate(metadata, { transaction });
        // }
        for (const doc of metadata) {
          doc.doc_title = "Closure Document";
          doc.doc_purpose = "deviation_docs";
          doc.final_doc_id = id;
          doc.created_by = creater_by;
          doc.updated_by = creater_by;

          await DocumentModel.create(doc, { transaction });
        }
      }
    }

    await transaction.commit();

    return res.status(201).json({
      message: isUpdate
        ? "Deviation updated successfully"
        : "Deviation created successfully",
      data: newDeviation,
      uploadedFiles: uploadedFilePaths,
      success: true,
    });
  } catch (err) {
    console.error(err);
    if (transaction) await transaction.rollback();

    next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      }),
    );
  }
};

module.exports.projectDeviationDetails = async (req, res, next) => {
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
       1️⃣ FETCH DEVIATION RECORDS
    ============================ */
    const deviationSql = `
      SELECT 
        tpdev.*
      FROM public.t_projects_deviation tpdev
      WHERE tpdev.tpdev_project_id = :tproj_id
        AND tpdev.tpdev_fl_archive = 'N'
        AND tpdev.tpdev_deleted_at IS NULL
      ORDER BY tpdev.tpdev_created_at DESC
    `;

    const deviationData = await sequelize.query(deviationSql, {
      replacements: { tproj_id },
      type: QueryTypes.SELECT,
    });

    if (!deviationData.length) {
      return res.status(200).json({
        success: true,
        message: "No deviation records found",
        data: [],
      });
    }

    /* ============================
       2️⃣ EXTRACT DEVIATION IDS
    ============================ */
    const deviationIds = deviationData.map((row) => row.tpdev_id);

    /* ============================
       3️⃣ FETCH DOCUMENTS
    ============================ */
    const documentSql = `
      SELECT 
        td.final_doc_id AS tpdev_id,
        json_agg(
          jsonb_build_object(
            'tdoc_id',    td.tdoc_id,
            'title',      td.doc_title,
            'file_name',  td.doc_name,
            'full_url',   :file_url || td.doc_path,
            'uid',        td.tdoc_id,
            'name',       td.doc_name,
            'status',     'done',
            'url',        :file_url || td.doc_path
          )
        ) AS documents
      FROM t_documents td
      WHERE td.doc_purpose = 'deviation_docs'
        AND td.deleted_at IS NULL  
        AND td.final_doc_id IN (:deviation_ids)
      GROUP BY td.final_doc_id
    `;

    const documentData = await sequelize.query(documentSql, {
      replacements: {
        file_url,
        deviation_ids: deviationIds,
      },
      type: QueryTypes.SELECT,
    });

    /* ============================
       4️⃣ MERGE DEVIATION + DOCUMENTS
    ============================ */
    const result = deviationData.map((deviation) => {
      const docMatch = documentData.find(
        (doc) => doc.tpdev_id === deviation.tpdev_id,
      );

      return {
        ...deviation,
        documents: docMatch?.documents || [],
      };
    });

    /* ============================
       RESPONSE
    ============================ */
    return res.status(200).json({
      success: true,
      message: "Deviation details fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error fetching deviation details:", err);
    next(err);
  }
};
