var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const DocumentModel = require("../../../models/documents/documents.model");
const {
  saveAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const ProjectImpactVillageDataModel = require("../../../models/projects/projects_impact_village_data.model");
const ProjectImpactAssessmentModel = require("../../../models/projects/projects_impact_assessment.model");
const { isEmpty } = require("../../../helpers/common.helper");

module.exports.projects_impact_assessment_datatable = async (
  req,
  res,
  next
) => {
  try {
    const file_url = process.env.SERVER_FILE_URL;
    const { project_id } = req.body;

    console.log('==================', project_id);

    const sql = `
      SELECT 
        ia.tpia_id,
        ia.tpia_project_id,

        ia.tpia_actual_beneficiary,
        ia.tpia_before_after_comparison,
        ia.tpia_is_80g_applicable,
        ia.tpia_csr1_form_number,

        ia.tpia_fl_archive,
        ia.tpia_created_by,
        ia.tpia_updated_by,
        ia.tpia_created_at,
        ia.tpia_updated_at,

        COALESCE(docs.documents, '[]'::json) AS documents

      FROM t_project_impact_assessment ia

      LEFT JOIN LATERAL (
        SELECT json_agg(
          to_jsonb(td) ||
          jsonb_build_object(
            'full_url', '${file_url}' || td.doc_path
          )
        ) AS documents
        FROM t_documents td
        WHERE td.final_doc_id = ia.tpia_id
      ) docs ON true
    `;

    // ✅ WHERE CONDITION STRING (IMPORTANT)
    let where = `1=1`;

    if (project_id) {
      where += ` AND ia.tpia_project_id = '${project_id}'`;
    }

    const records = await Datatables.build(req, sql, where);
    res.json(records);

  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.projects_impact_assessment_create_update = async (
  req,
  res,
  next
) => {
  let transaction;
  transaction = await sequelize.transaction();

  try {
    let uploadedFilePaths = [];
    let id = req.body.tpia_id || null;

    
    

    const formData = req.body;
    const files = req.files;
    const created_by = req?.user?.[0]?.id;

   
    /* ============================
        MAP FRONTEND → DB COLUMNS
    ============================ */
    const requestData = {


      ...(formData.tpia_project_id && {
        tpia_project_id: formData.tpia_project_id,
      }),


      ...(formData.actual_beneficiary && {
        tpia_actual_beneficiary: formData.actual_beneficiary,
      }),

      ...(formData.before_after_comparison && {
        tpia_before_after_comparison:
          formData.before_after_comparison,
      }),

      ...(formData.is_80g_applicable && {
        tpia_is_80g_applicable:
          formData.is_80g_applicable,
      }),

      ...(formData.csr1_form_number && {
        tpia_csr1_form_number:
          formData.csr1_form_number,
      }),

      tpia_updated_by: created_by,
    };

    let impactAssessment;

    /* ============================
        CREATE / UPDATE
    ============================ */
    if (id) {
      await ProjectImpactAssessmentModel.update(
        requestData,
        { where: { tpia_id: id }, transaction }
      );

      impactAssessment =
        await ProjectImpactAssessmentModel.findOne({
          where: { tpia_id: id },
        });
    } else {
      requestData.tpia_created_by = created_by;

      impactAssessment =
        await ProjectImpactAssessmentModel.create(
          requestData,
          { transaction }
        );

      id = impactAssessment.tpia_id;
    }

    /* ============================
        FILE UPLOAD HANDLING
    ============================ */
    if (files?.length) {
      const groupedFiles = files.reduce((acc, file) => {
        (acc[file.fieldname] ||= []).push(file);
        return acc;
      }, {});

      for (const [field, fileGroup] of Object.entries(
        groupedFiles
      )) {
        if (
          field === "tpia_80g_certificate" ||
          field === "tpia_csr1_documents"
        ) {
          const { metadata, filePaths } =
            await saveAndPrepareDocumentMetadata(
              fileGroup,
              id,
              "uploads/project/impact_assessment",
              created_by,
              transaction
            );

          uploadedFilePaths.push(...filePaths);

          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, {
              transaction,
            });
          }
        }
      }
    }

    await transaction.commit();

    return res.status(201).json({
      status: true,
      message: req.body.tpia_id
        ? "Project impact assessment updated successfully"
        : "Project impact assessment created successfully",
      data: [],
    });
  } catch (err) {
    console.error(err);

    if (transaction) await transaction.rollback();

    return next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      })
    );
  }
};


// module.exports.projectImpactAssessmentDetailsFunction = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     let file_url = process.env.SERVER_FILE_URL;
//     const tpia_id = req.body.tpia_id;

//     if (!tpia_id) {
//       return res.status(400).json({ message: "Closure ID is required" });
//     }

//     const sql = `
//           SELECT 
//         ia.*,
//         t_state.tsl_state_name,
//         t_district.tdl_district_name,
//         t_block.tbl_block_name,
//         t_location.tloc_location_name,
//         t_schedule_seven_master.tschm_schedule_name,

//         -- aggregate villages in a subquery
//         COALESCE(villages.village_data, '[]'::json) AS village_data,

//         -- aggregate documents in a lateral subquery
//         COALESCE(docs.documents, '[]'::json) AS documents

//       FROM t_project_impact_assessment ia
//       LEFT JOIN t_state ON t_state.tsl_state_id = ia.tpia_state_id
//       LEFT JOIN t_district ON t_district.tdl_district_id = ia.tpia_district_id
//       LEFT JOIN t_block ON t_block.tbl_block_id = ia.tpia_block_id
//       LEFT JOIN t_location ON t_location.tloc_location_id = ia.tpia_location_id
//       LEFT JOIN t_schedule_seven_master ON t_schedule_seven_master.tschm_schedule_id = ia.tpia_schedule_seven_id
//       -- Village data aggregated per impact assessment
//       LEFT JOIN LATERAL (
//           SELECT json_agg(
//               json_build_object(
//                   'tpiavd_id', v.tpiavd_id,
//                   'tpiavd_no_of_village', v.tpiavd_no_of_village,
//                   'tpiavd_no_of_male', v.tpiavd_no_of_male,
//                   'tpiavd_no_of_female', v.tpiavd_no_of_female,
//                   'tpiavd_remarks', v.tpiavd_remarks
//               )
//           ) AS village_data
//           FROM t_project_impact_village_data v
//           WHERE v.tpiavd_project_impact_id = ia.tpia_id
//       ) villages ON true

//       -- Documents aggregated per impact assessment
//       LEFT JOIN LATERAL (
//           SELECT json_agg(
//               to_jsonb(td) ||
//               jsonb_build_object(
//                   'full_url', '${file_url}' || td.doc_path
//               )
//           ) AS documents
//           FROM t_documents td
//           WHERE td.final_doc_id = ia.tpia_id
//       ) docs ON true
//     WHERE ia.tpia_id = '${tpia_id}'
//     `;
//     const ImpactAssessmentData = await sequelize.query(sql, {
//       type: QueryTypes.SELECT,
//     });

//     return res.status(200).json({
//       status: true,
//       message: "Project Impact Assessment details fetched successfully",
//       data: ImpactAssessmentData ? ImpactAssessmentData[0] : {},
//     });
//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err.message));
//   }
// };


module.exports.projectImpactAssessmentDetailsFunction = async (
  req,
  res,
  next
) => {
  try {
    const file_url = process.env.SERVER_FILE_URL;
    const tpia_id = req.body.tpia_id;

    if (!tpia_id) {
      return res.status(400).json({ message: "Impact Assessment ID is required" });
    }

    const sql = `
      SELECT 
        ia.tpia_id,
        ia.tpia_project_id,
        ia.tpia_actual_beneficiary,
        ia.tpia_before_after_comparison,
        ia.tpia_is_80g_applicable,
        ia.tpia_csr1_form_number,

        -- village data
        COALESCE(villages.village_data, '[]'::json) AS village_data,

        -- documents
        COALESCE(docs.documents, '[]'::json) AS documents

      FROM t_project_impact_assessment ia

      -- villages
      LEFT JOIN LATERAL (
          SELECT json_agg(
              json_build_object(
                  'tpiavd_id', v.tpiavd_id,
                  'tpiavd_no_of_village', v.tpiavd_no_of_village,
                  'tpiavd_no_of_male', v.tpiavd_no_of_male,
                  'tpiavd_no_of_female', v.tpiavd_no_of_female,
                  'tpiavd_remarks', v.tpiavd_remarks
              )
          ) AS village_data
          FROM t_project_impact_village_data v
          WHERE v.tpiavd_project_impact_id = ia.tpia_id
      ) villages ON true

      -- documents
      LEFT JOIN LATERAL (
          SELECT json_agg(
              to_jsonb(td) ||
              jsonb_build_object(
                  'full_url', '${file_url}' || td.doc_path
              )
          ) AS documents
          FROM t_documents td
          WHERE td.final_doc_id = ia.tpia_id
      ) docs ON true

      WHERE ia.tpia_id = '${tpia_id}'
    `;

    const ImpactAssessmentData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "Project Impact Assessment details fetched successfully",
      data: ImpactAssessmentData?.[0] || {},
    });

  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
