var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const ProjectMonitoringModel = require("../../../models/projects/projects_monitoring.model");
const DocumentModel = require("../../../models/documents/documents.model");
const { isEmpty } = require("../../../helpers/common.helper");
const { saveAndPrepareDocumentMetadata } = require("../../../helpers/document.helper");


module.exports.projects_monitoring_datatable = async (req, res, next) => {
  try {
    const file_url = process.env.SERVER_FILE_URL || "";
    const { project_id } = req.body;

    console.log('-------------------------------' + project_id);

    /* ================= BASE SQL ================= */
    let sql = `
      SELECT  
        tpm.*,
        COALESCE(docs.documents, '[]'::json) AS documents
      FROM t_project_monitoring tpm

      /* ===== DOCUMENT JOIN ===== */
      LEFT JOIN LATERAL (
        SELECT json_agg(
          jsonb_build_object(
            'tdoc_id', td.tdoc_id,
            'name', td.doc_name,
            'file_name', td.doc_name,
            'url', '${file_url}' || td.doc_path,
            'full_url', '${file_url}' || td.doc_path,
            'status', 'done'
          )
        ) AS documents
        FROM t_documents td
        WHERE td.final_doc_id = tpm.tpmon_id
          AND td.doc_purpose = 'tpmon_docs'   
           AND td.deleted_at IS NULL  
      ) docs ON true
    `;

    /* ================= WHERE ================= */
    let where = `1=1`;

    if (project_id) {
      where += ` AND tpm.tpmon_project_id = '${project_id}'`; // ✅ alias used
    }

    /* ================= DATATABLE ================= */
    const records = await Datatables.build(req, sql, where);

    return res.json(records);

  } catch (err) {
    console.error("Monitoring Datatable Error:", err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


const parseDoubleOrNull = (val) => {
  if (val === undefined || val === null || val === "") return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};





// module.exports.projects_monitoring_create_update = async (req, res, next) => {
//   let transaction = await sequelize.transaction();

//   try {
//     let uploadedFilePaths = [];
//     // let id = !isEmpty(req.body.tpmon_id) ? req.body.tpmon_id : null;
//     const isUpdate = !isEmpty(req.body.tpmon_id);
// let id = isUpdate ? req.body.tpmon_id : null;

//     const formData = req.body;
//     const files = req.files || [];
//     const creater_by = req?.user?.[0]?.id || 0;

//     // ---------------- Map fields ----------------
//     const requestData = {

//       tpmon_project_id: Array.isArray(formData.tpmon_project_id)
//         ? formData.tpmon_project_id[0]
//         : formData.tpmon_project_id || null,

//       tpmon_title: formData.tpmon_title || null,
//       tpmon_project_completion_status:
//         formData.tpmon_project_completion_status || null,

//       tpmon_status_of_the_project:
//         formData.tpmon_status_of_the_project || null,

//       // Beneficiaries
//       tpmon_male_beneficiaries: formData.tpmon_male_beneficiaries
//         ? parseInt(formData.tpmon_male_beneficiaries, 10)
//         : 0,
//       tpmon_female_beneficiaries: formData.tpmon_female_beneficiaries
//         ? parseInt(formData.tpmon_female_beneficiaries, 10)
//         : 0,
//       tpmon_boys_beneficiaries: formData.tpmon_boys_beneficiaries
//         ? parseInt(formData.tpmon_boys_beneficiaries, 10)
//         : 0,
//       tpmon_girls_beneficiaries: formData.tpmon_girls_beneficiaries
//         ? parseInt(formData.tpmon_girls_beneficiaries, 10)
//         : 0,
//       tpmon_mix_beneficiaries: formData.tpmon_mix_beneficiaries
//         ? parseInt(formData.tpmon_mix_beneficiaries, 10)
//         : 0,

//       // Dates
//       tpmon_start_date: formData.tpmon_start_date || null,
//       tpmon_end_date: formData.tpmon_end_date || null,
//       tpmon_actual_start_date: formData.tpmon_actual_start_date || null,
//       tpmon_actual_end_date: formData.tpmon_actual_end_date || null,

//       // Other
//       tpmon_process_owner_partner_name:
//         formData.tpmon_process_owner_partner_name || null,
//       tpmon_delay_reasons: formData.tpmon_delay_reasons || null,
//       tpmon_percentage_of_progress:
//         formData.tpmon_percentage_of_progress !== undefined
//           ? parseFloat(formData.tpmon_percentage_of_progress)
//           : 0,
//       tpmon_remarks: formData.tpmon_remarks || null,
//       tpmon_status: formData.tpmon_status || null,

//       // Location
//       tpmon_latitude:
//         formData.tpmon_latitude !== undefined
//           ? parseFloat(formData.tpmon_latitude)
//           : null,
//       tpmon_longitude:
//         formData.tpmon_longitude !== undefined
//           ? parseFloat(formData.tpmon_longitude)
//           : null,
//     };

//     let newProjectMonitoring;

//     // ---------------- CREATE / UPDATE ----------------
//     if (id) {
//       requestData.tpmon_updated_by = creater_by;

//       await ProjectMonitoringModel.update(requestData, {
//         where: { tpmon_id: id },
//         transaction,
//       });

//       newProjectMonitoring = await ProjectMonitoringModel.findOne({
//         where: { tpmon_id: id },
//         transaction,
//       });
//     } else {
//       requestData.tpmon_created_by = creater_by;
//       requestData.tpmon_updated_by = creater_by;

//       newProjectMonitoring = await ProjectMonitoringModel.create(requestData, {
//         transaction,
//       });

//       id = newProjectMonitoring.tpmon_id;

//       const milestone_id = `milestone${id}`;
//       await ProjectMonitoringModel.update(
//         { tpmon_milestone_id: milestone_id },
//         { where: { tpmon_id: id }, transaction }
//       );

//       newProjectMonitoring.tpmon_milestone_id = milestone_id;
//     }

//     // ---------------- FILE UPLOAD ----------------
//     if (files.length > 0) {
//       const groupedFiles = files.reduce((acc, file) => {
//         (acc[file.fieldname] ||= []).push(file);
//         return acc;
//       }, {});

//       // -------- Monthly Reports --------
//       if (groupedFiles.tpmon_docs) {
//         const { metadata, filePaths } =
//           await saveAndPrepareDocumentMetadata(
//             groupedFiles.tpmon_docs,
//             id,
//             "uploads/project/monitoring/report",
//             creater_by,
//             transaction
//           );

//         uploadedFilePaths.push(...filePaths);

//         if (metadata.length) {
//           await DocumentModel.bulkCreate(metadata, { transaction });
//         }
//       }

      
//     }

//     await transaction.commit();

//     return res.status(201).json({
//       message: isUpdate
//         ? "Monitoring updated successfully"
//         : "Monitoring created successfully",
//       data: newProjectMonitoring,
//       uploadedFiles: uploadedFilePaths,
//       status: true,
//     });
//   } catch (err) {
//     console.error(err);
//     if (transaction) await transaction.rollback();

//     next(
//       CustomErrorHandler.internalServerError({
//         message: err.message,
//         stack: err.stack,
//       })
//     );
//   }
// };

module.exports.projects_monitoring_create_update = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const isUpdate = !!req.body.tpmon_id;
    let id = isUpdate ? req.body.tpmon_id : null;

    const formData = req.body;
const files = req.files || [];
    const created_by = req?.user?.[0]?.id || 0;

    /* ================= MAP FIELDS ================= */
    const requestData = {
      tpmon_project_id: formData.tpmon_project_id || null,

      tpmon_date: formData.tpmon_date || null,
      tpmon_subject: formData.tpmon_subject || null,

      tpmon_start_time: formData.tpmon_start_time || null,
      tpmon_end_time: formData.tpmon_end_time || null,

      tpmon_members: formData.tpmon_members || null,

      tpmon_discussion_points: formData.tpmon_discussion_points || null,
      tpmon_action_points: formData.tpmon_action_points || null,

      tpmon_latitude:
        formData.tpmon_latitude !== undefined
          ? parseFloat(formData.tpmon_latitude)
          : null,

      tpmon_longitude:
        formData.tpmon_longitude !== undefined
          ? parseFloat(formData.tpmon_longitude)
          : null,

      tpmon_status: formData.tpmon_status || null,
    };

    let monitoringRecord;

    /* ================= CREATE / UPDATE ================= */
    if (isUpdate) {
      requestData.tpmon_updated_by = created_by;

      await ProjectMonitoringModel.update(requestData, {
        where: { tpmon_id: id },
        transaction,
      });

      monitoringRecord = await ProjectMonitoringModel.findOne({
        where: { tpmon_id: id },
        transaction,
      });
    } else {
      requestData.tpmon_created_by = created_by;
      requestData.tpmon_updated_by = created_by;

      monitoringRecord = await ProjectMonitoringModel.create(requestData, {
        transaction,
      });

      id = monitoringRecord.tpmon_id;
    }

    /* ================= FILE UPLOAD (SINGLE) ================= */
    // if (file) {
    //   const existingDoc = await DocumentModel.findOne({
    //     where: {
    //       final_doc_id: id,
    //       doc_purpose: "tpmon_docs",
    //     },
    //     transaction,
    //   });

    //   // -------- UPDATE DOCUMENT --------
    //   if (existingDoc) {
    //     const { filePaths } = await saveAndPrepareDocumentMetadata(
    //       [file],
    //       id,
    //       "uploads/project/monitoring",
    //       created_by,
    //       transaction
    //     );

    //     await existingDoc.update(
    //       {
    //         doc_name: file.originalname,
    //         doc_path: filePaths?.[0] || existingDoc.doc_path,
    //         updated_by: created_by,
    //       },
    //       { transaction }
    //     );
    //   }

    //   // -------- CREATE DOCUMENT --------
    //   else {
    //     const { metadata } = await saveAndPrepareDocumentMetadata(
    //       [file],
    //       id,
    //       "uploads/project/monitoring",
    //       created_by,
    //       transaction
    //     );

    //     const doc = metadata[0];
    //     doc.doc_title = "Monitoring Document";
    //     doc.doc_purpose = "tpmon_docs";
    //     doc.final_doc_id = id;
    //     doc.created_by = created_by;
    //     doc.updated_by = created_by;

    //     await DocumentModel.create(doc, { transaction });
    //   }
    // }

    if (files.length > 0) {
  const { metadata } = await saveAndPrepareDocumentMetadata(
    files,
    id,
    "uploads/project/monitoring",
    created_by,
    transaction
  );

  for (const doc of metadata) {
    doc.doc_title = "Monitoring Document";
    doc.doc_purpose = "tpmon_docs";
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
        ? "Monitoring updated successfully"
        : "Monitoring created successfully",
      data: monitoringRecord,
    });

  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("Monitoring Error:", err);

    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

module.exports.projectMonitoringDetailsFunction = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;
    const tpmon_id = req.body.tpmon_id;

    if (!tpmon_id) {
      return res.status(400).json({ message: "Monitoring ID is required" });
    }


    const sql = `
         select  t_project_monitoring.*,
        COALESCE(docs.documents, '[]'::json) AS documents

          from t_project_monitoring  

          LEFT JOIN LATERAL (
    SELECT json_agg(
        to_jsonb(td) ||
        jsonb_build_object(
            'full_url', '${file_url}' || td.doc_path
        )
    ) AS documents
    FROM t_documents td
    WHERE td.final_doc_id = t_project_monitoring.tpmon_id
) docs ON true

WHERE t_project_monitoring.tpmon_id = '${tpmon_id}';

`;
    const monData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });


    return res.status(200).json({
      status: true,
      message: "Monitoring details fetched successfully",
      data: monData ? monData[0] : {},
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
}