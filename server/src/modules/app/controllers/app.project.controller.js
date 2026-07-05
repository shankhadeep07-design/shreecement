const ProjectsModel = require('../../../models/projects/projects.model');
const UserStateDistrictModel = require('../../../models/users/user_state_district.model');

const { sequelize } = require('../../../config/db');
const { Op, QueryTypes } = require('sequelize');
const ProjectBeneficiaryModel = require('../../../models/projects/projects_beneficiary.model');
const CustomErrorHandler = require('../../../service/CustomErrorHandler');
const BeneficiaryMasterModel = require('../../../models/projects/projects_beneficiary_master.model');
const DocumentModel = require('../../../models/documents/documents.model');
const { saveUpdateAndPrepareDocumentMetadata } = require('../../../helpers/document.helper');
const { add_lat_long } = require('../../../helpers/common.helper');
const ProjectKpiTargetModel = require('../../../models/projects/project_kpi_target.model');

module.exports.project_lists_fun = async (req, res, next) => {
  try {
    const user_id = req?.auth?.id;

    if (!user_id) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    /* ===============================
       1. GET USER STATE & DISTRICT
    =============================== */
    const userRegions = await sequelize.query(
      `
      SELECT
        tus_state_id,
        tus_district_id
      FROM t_user_state_district
      WHERE tus_user_id = :user_id
      `,
      {
        replacements: { user_id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!userRegions.length) {
      return res.status(200).json({
        status: true,
        message: 'No projects found for this user',
        data: []
      });
    }

    const stateIds = [...new Set(userRegions.map(r => r.tus_state_id))];
    const districtIds = [...new Set(userRegions.map(r => r.tus_district_id))];

    // console.log('State IDs:', stateIds);
    // console.log('District IDs:', districtIds);return

    /* ===============================
       2. RAW PROJECT + MASTER JOIN
    =============================== */
    const projects = await sequelize.query(
      `
      SELECT
        p.tproj_id,
        p.tproj_proposal_id,
        p.tproj_proposal_name,
        p.tproj_allocate_budget_amount,
        p.tproj_created_at,

        /* ---- FINANCIAL YEAR ---- */
        fy.tfy_id,
        fy.tfy_year_label,

        /* ---- STATE ---- */
        s.tsl_state_id,
        s.tsl_state_name,

        /* ---- DISTRICT ---- */
        d.tdl_district_id,
        d.tdl_district_name,

        /* ---- BLOCK ---- */
        b.tbl_block_id,
        b.tbl_block_name,

        /* ---- LOCATION ---- */
        l.tloc_location_id,
        l.tloc_location_name,

        /* ---- THEME ---- */
        th.tthm_theme_id,
        th.tthm_theme_name,
        /* ---- LAT LONG ---- */
        ll.tll_lat,
        ll.tll_long

      FROM t_projects p

      LEFT JOIN t_lat_long ll
        ON ll.tll_item_id = p.tproj_id AND ll.tll_purpose = 'project_location_assigned'

      LEFT JOIN t_financial_year fy
        ON fy.tfy_id = p.tproj_financial_year_id

      LEFT JOIN t_state s
        ON s.tsl_state_id = p.tproj_state_id

      LEFT JOIN t_district d
        ON d.tdl_district_id = p.tproj_district_id

      LEFT JOIN t_block b
        ON b.tbl_block_id = p.tproj_block_id

      LEFT JOIN t_location l
        ON l.tloc_location_id = p.tproj_location_id

      LEFT JOIN t_theme_master th
        ON th.tthm_theme_id = p.tproj_theme_id

      WHERE
        p.tproj_fl_archive = 'N'
        
        AND p.tproj_state_id IN (:stateIds)
        AND p.tproj_district_id IN (:districtIds)

      ORDER BY p.tproj_created_at DESC
      `,
      {
        replacements: {
          stateIds,
          districtIds
        },
        type: sequelize.QueryTypes.SELECT
      }
    );

    return res.status(200).json({
      status: true,
      message: 'Project list fetched successfully',
      data: projects
    });

  } catch (err) {
    next(err);
  }
};

module.exports.project_kpi_targets_fun = async (req, res, next) => {
  try {

    const user_id = req?.auth?.id;

    if (!user_id) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    /* ===============================
       1️⃣ GET USER STATE & DISTRICT
    =============================== */

    const userRegions = await sequelize.query(
      `
      SELECT
        tus_state_id,
        tus_district_id
      FROM t_user_state_district
      WHERE tus_user_id = :user_id
      `,
      {
        replacements: { user_id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!userRegions.length) {
      return res.status(200).json({
        status: true,
        message: "No KPI targets found",
        data: []
      });
    }

    const stateIds = [...new Set(userRegions.map(r => r.tus_state_id))];
    const districtIds = [...new Set(userRegions.map(r => r.tus_district_id))];

    /* ===============================
       2️⃣ FETCH KPI TARGETS
    =============================== */

    const kpiTargets = await sequelize.query(
      `
      SELECT
        kt.tpkt_id,
        kt.tpkt_project_id,
        kt.tpkt_kpi_id,
        kt.tpkt_target,

        /* PROJECT INFO */
        p.tproj_id,
        p.tproj_proposal_name,

        /* KPI INFO */
        k.tkpi_id,
        k.tkpi_title

      FROM t_project_kpi_target kt

      LEFT JOIN t_projects p
        ON p.tproj_id = kt.tpkt_project_id

      LEFT JOIN t_kpi_master k
        ON k.tkpi_id = kt.tpkt_kpi_id

      WHERE
        p.tproj_fl_archive = 'N'
        AND p.tproj_state_id IN (:stateIds)
        AND p.tproj_district_id IN (:districtIds)
        AND kt.tpkt_deleted_at IS NULL

      ORDER BY p.tproj_created_at DESC
      `,
      {
        replacements: {
          stateIds,
          districtIds
        },
        type: sequelize.QueryTypes.SELECT
      }
    );

    return res.status(200).json({
      status: true,
      message: "Project KPI targets fetched successfully",
      data: kpiTargets
    });

  } catch (err) {
    next(err);
  }
};

module.exports.beneficiary_lists_fun = async (req, res, next) => {
  try {

      let file_url = process.env.SERVER_FILE_URL;

    const sql = `
       select  t_beneficiary_master.*,
          t_project_beneficiary.*,
          t_kpi_master.tkpi_title,
          t_state.tsl_state_name,
          t_district.tdl_district_name,
          t_block.tbl_block_name,
          t_location.tloc_location_name,
          COALESCE(docs.documents, '[]'::json) AS documents
          
          from t_beneficiary_master
          LEFT JOIN t_project_beneficiary ON t_project_beneficiary.tpben_beneficiary_id = t_beneficiary_master.tben_id
          LEFT JOIN t_kpi_master ON t_kpi_master.tkpi_id = t_project_beneficiary.tpben_kpi_id
          LEFT JOIN t_state ON t_state.tsl_state_id = t_beneficiary_master.tben_state_id
          LEFT JOIN t_district ON t_district.tdl_district_id = t_beneficiary_master.tben_district_id
          LEFT JOIN t_block ON t_block.tbl_block_id = t_beneficiary_master.tben_block_id
          LEFT JOIN t_location ON t_location.tloc_location_id = t_beneficiary_master.tben_village_id
          LEFT JOIN LATERAL (
          SELECT json_agg(
              to_jsonb(td) ||
              jsonb_build_object(
                  'full_url', '${file_url}' || td.doc_path
              )
          ) AS documents
          FROM t_documents td
          WHERE td.final_doc_id = t_beneficiary_master.tben_id
        ) docs ON true
    `;

    const result = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
   

    return res.status(200).json({
      status: true,
      message: "Beneficiary fetched successfully",
      data: result.length ? result: [],
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

// module.exports.create_beneficiary_fun = async (req, res, next) => {
//   let transaction;
//   let uploadedFilePaths = [];
//   transaction = await sequelize.transaction();

//   // try {
//     const formData = req.body;
//     const files = req?.files;

//     const userId = req?.auth?.id || 0;

//     let tbenId = formData.tben_id || null;

//     // ✅ sanitize helpers
//     const toStringOrEmpty = (val) =>
//       val !== undefined && val !== null ? String(val) : "";
//     const toIntOrNull = (val) =>
//       val !== undefined && val !== null && val !== ""
//         ? parseInt(val, 10)
//         : null;
//     const toDateOrNull = (val) =>
//       val && val !== "Invalid date" ? new Date(val) : null;

//     let newBeneficiary;

//     // --------------------------
//     // CASE 1: EXISTING BENEFICIARY
//     // --------------------------
//     if (formData.tben_type === "existing_beneficiary") {
//       if (!formData.tpben_beneficiary_id || !formData.tpben_project_id) {
//         throw new Error("Existing Beneficiary and Project ID are required");
//       }

//       const projectBeneficiaryData = {
//         tpben_project_id: formData.tpben_project_id,
//         tpben_beneficiary_id: formData.tpben_beneficiary_id,
//         tpben_updated_by: userId,
//       };

//       const existingLink = await ProjectBeneficiaryModel.findOne({
//         where: {
//           tpben_project_id: formData.tpben_project_id,
//           tpben_beneficiary_id: formData.tpben_beneficiary_id,
//         },
//         transaction,
//       });

//       if (existingLink) {
//         await existingLink.update(projectBeneficiaryData, { transaction });
//       } else {
//         await ProjectBeneficiaryModel.create(
//           { ...projectBeneficiaryData, tpben_created_by: userId },
//           { transaction }
//         );
//       }

//       await transaction.commit();
//       return res.status(201).json({
//         message: "Existing beneficiary linked to project successfully",
//         status: true,
//       });
//     }

//     // --------------------------
//     // CASE 2 & 3: NEW BENEFICIARY / GROUP
//     // --------------------------

//     // ✅ Always include all fields, sanitize properly
//     const beneficiaryData = {
//       tben_name: toStringOrEmpty(formData.tben_name),
//       tben_phone: toStringOrEmpty(formData.tben_phone),
//       tben_gender: toStringOrEmpty(formData.tben_gender),
//       tben_age: toIntOrNull(formData.tben_age),
//       tben_unique_no: toStringOrEmpty(formData.tben_unique_no),
//       tben_state_id: toStringOrEmpty(formData.tben_state_id),
//       tben_district_id: toStringOrEmpty(formData.tben_district_id),
//       tben_block_id: toStringOrEmpty(formData.tben_block_id),
//       tben_village_id: toStringOrEmpty(formData.tben_village_id),
//       tben_unique_key : toStringOrEmpty(formData.tben_unique_key),
//       tben_dob: toDateOrNull(formData.tben_dob),
//       tben_description: toStringOrEmpty(formData.tben_description),
//       tben_type: toStringOrEmpty(formData.tben_type),
//       tben_updated_by: userId,
//       ...(tbenId ? {} : { tben_created_by: userId }),
//     };

//     if (tbenId) {
//       // ✅ Update case
//       await BeneficiaryMasterModel.update(beneficiaryData, {
//         where: { tben_id: tbenId },
//         transaction,
//       });
//       newBeneficiary = await BeneficiaryMasterModel.findOne({
//         where: { tben_id: tbenId },
//         transaction,
//       });
//     } else {
//       // ✅ Generate tben_unique_no and tben_unique_key for new/group beneficiary
//       let nextUniqueNo = 1;

//       const lastBeneficiary = await BeneficiaryMasterModel.findOne({
//         where: {
//           tben_unique_no: { [Op.ne]: null }, // not null
//         },
//         order: [["tben_unique_no", "DESC"]],
//         transaction,
//       });

//       if (lastBeneficiary && lastBeneficiary.tben_unique_no) {
//         nextUniqueNo = parseInt(lastBeneficiary.tben_unique_no, 10) + 1;
//       }

//       const uniqueKey = `coromandel/${nextUniqueNo}/${formData.tpben_fy_id}`;

//       beneficiaryData.tben_unique_no = String(nextUniqueNo);
//       beneficiaryData.tben_unique_key = uniqueKey;

//       // ✅ Create case
//       newBeneficiary = await BeneficiaryMasterModel.create(beneficiaryData, {
//         transaction,
//       });
//       tbenId = newBeneficiary.tben_id;
//     }


//     // ✅ Handle file uploads
//     if (files?.length > 0) {
//       const grouped = files.reduce((acc, file) => {
//         (acc[file.fieldname] ||= []).push(file);
//         return acc;
//       }, {});

//       for (const [key, fileGroup] of Object.entries(grouped)) {

//         if (key == "tben_images") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               tbenId,
//               "uploads/project/beneficiary",
//               userId,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         }

//         if (key == "tben_videos") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               tbenId,
//               "uploads/project/beneficiary",
//               userId,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         }

//       }
//     }

//     // ✅ Link beneficiary to project (for new or group)
//     if (formData.tpben_project_id && tbenId) {
//       const projectBeneficiaryData = {
//         tpben_project_id: formData.tpben_project_id,
//         tpben_beneficiary_id: tbenId,
//         tpben_updated_by: userId,
//       };

//       const existingLink = await ProjectBeneficiaryModel.findOne({
//         where: {
//           tpben_project_id: formData.tpben_project_id,
//           tpben_beneficiary_id: tbenId,
//         },
//         transaction,
//       });

//       if (existingLink) {
//         await existingLink.update(projectBeneficiaryData, { transaction });
//       } else {
//         await ProjectBeneficiaryModel.create(
//           { ...projectBeneficiaryData, tpben_created_by: userId },
//           { transaction }
//         );
//       }
//     }else{
//       await ProjectBeneficiaryModel.destroy({
//         where: {
//           tpben_project_id: formData.tpben_project_id,
//           tpben_beneficiary_id: tbenId,
//         },
//         transaction,
//       });

//       return res.status(201).json({
//         message: "Beneficiary not linked to any project",
//         data: [],
//         status: false,
//       });
//     }

//     await transaction.commit();

//     return res.status(201).json({
//       message: tbenId
//         ? "Beneficiary created/updated successfully"
//         : "Beneficiary created successfully",
//       data: newBeneficiary,
//       status: true,
//     });
//   // } catch (err) {
//   //   console.error(err);
//   //   if (transaction) await transaction.rollback();
//   //   next(
//   //     CustomErrorHandler.internalServerError({
//   //       message: err.message,
//   //       stack: err.stack,
//   //     })
//   //   );
//   // }
// };




module.exports.create_beneficiary_fun = async (req, res, next) => {
  let transaction;
  let uploadedFilePaths = [];

  try {
    transaction = await sequelize.transaction();

    const formData = req.body;
    const files = req?.files;
    const userId = req?.auth?.id || 0;
    let tbenId = formData.tben_id || null;

    // helpers
    const toStringOrEmpty = (val) =>
      val !== undefined && val !== null ? String(val) : "";

    const toIntOrNull = (val) =>
      val !== undefined && val !== null && val !== ""
        ? parseInt(val, 10)
        : null;

    const toDateOrNull = (val) =>
      val && val !== "Invalid date" ? new Date(val) : null;

    let newBeneficiary;

    /* ======================================================
       CASE 1: EXISTING BENEFICIARY LINK ONLY
    ====================================================== */

    if (formData.tben_type === "existing_beneficiary") {

      if (!formData.tpben_beneficiary_id || !formData.tpben_project_id) {
        throw new Error("Existing Beneficiary and Project ID are required");
      }

      await ProjectBeneficiaryModel.findOrCreate({
        where: {
          tpben_project_id: formData.tpben_project_id,
          tpben_kpi_id: formData.tpben_kpi_id,
          tpben_beneficiary_id: formData.tpben_beneficiary_id,
        },
        defaults: {
          tpben_created_by: userId,
          tpben_updated_by: userId,
        },
        transaction,
      });

      await transaction.commit();

      return res.status(201).json({
        message: "Existing beneficiary linked successfully",
        status: true,
      });
    }

    /* ======================================================
       CASE 2 & 3: NEW / GROUP BENEFICIARY
    ====================================================== */

    const beneficiaryData = {
      tben_name: toStringOrEmpty(formData.tben_name),
      tben_phone: toStringOrEmpty(formData.tben_phone),
      tben_gender: toStringOrEmpty(formData.tben_gender),
      tben_age: toIntOrNull(formData.tben_age),
      tben_state_id: toStringOrEmpty(formData.tben_state_id),
      tben_district_id: toStringOrEmpty(formData.tben_district_id),
      tben_block_id: toStringOrEmpty(formData.tben_block_id),
      tben_village_id: toStringOrEmpty(formData.tben_village_id),
      tben_dob: toDateOrNull(formData.tben_dob),
      tben_description: toStringOrEmpty(formData.tben_description),
      tben_type: toStringOrEmpty(formData.tben_type),
      tben_updated_by: userId,
      ...(tbenId ? {} : { tben_created_by: userId }),
    };

    if (tbenId) {

      const [affected] = await BeneficiaryMasterModel.update(
        beneficiaryData,
        {
          where: { tben_id: tbenId },
          transaction,
        }
      );

      if (!affected) {
        throw new Error("Beneficiary update failed");
      }

      newBeneficiary = await BeneficiaryMasterModel.findOne({
        where: { tben_id: tbenId },
        transaction,
      });

    } else {

      // generate unique no safely
      const last = await BeneficiaryMasterModel.findOne({
        where: { tben_unique_no: { [Op.ne]: null } },
        order: [["tben_unique_no", "DESC"]],
        transaction,
      });

      const nextUniqueNo = last
        ? parseInt(last.tben_unique_no) + 1
        : 1;

      beneficiaryData.tben_unique_no = String(nextUniqueNo);
      beneficiaryData.tben_unique_key =
        `coromandel/${nextUniqueNo}/${formData.tpben_fy_id}`;

      newBeneficiary = await BeneficiaryMasterModel.create(
        beneficiaryData,
        { transaction }
      );

      tbenId = newBeneficiary.tben_id;
    }


      // ✅ Handle file uploads
      if (files?.length > 0) {
        const grouped = files.reduce((acc, file) => {
          (acc[file.fieldname] ||= []).push(file);
          return acc;
        }, {});

        for (const [key, fileGroup] of Object.entries(grouped)) {

          if (key == "tben_images") {
            const { metadata, filePaths } =
              await saveUpdateAndPrepareDocumentMetadata(
                fileGroup,
                tbenId,
                "uploads/project/beneficiary",
                userId,
                transaction
              );
            uploadedFilePaths.push(...filePaths);
            if (metadata.length) {
              await DocumentModel.bulkCreate(metadata, { transaction });
            }
          }

          if (key == "tben_videos") {
            const { metadata, filePaths } =
              await saveUpdateAndPrepareDocumentMetadata(
                fileGroup,
                tbenId,
                "uploads/project/beneficiary",
                userId,
                transaction
              );
            uploadedFilePaths.push(...filePaths);
            if (metadata.length) {
              await DocumentModel.bulkCreate(metadata, { transaction });
            }
          }

        }
      }


    /* ======================================================
       LINK PROJECT (ONLY AFTER SUCCESS)
    ====================================================== */

    if (formData.tpben_project_id) {

      await ProjectBeneficiaryModel.findOrCreate({
        where: {
          tpben_project_id: formData.tpben_project_id,
          tpben_kpi_id: formData.tpben_kpi_id,
          tpben_beneficiary_id: tbenId,
        },
        defaults: {
          tpben_created_by: userId,
          tpben_updated_by: userId,
        },
        transaction,
      });

    }

    await transaction.commit();

    return res.status(201).json({
      message: "Beneficiary created/updated successfully",
      data: newBeneficiary,
      status: true,
    });

  } catch (err) {

    if (transaction) await transaction.rollback();

    console.error(err);

    return res.status(500).json({
      message: err.message,
      status: false,
    });
  }
};

module.exports.project_location_assign_fun = async (req, res, next) => {
  let transaction;

  try {

    transaction = await sequelize.transaction();

    const { project_id, lat, long } = req.body;
    const userId = req?.auth?.id || 0;

    /* ============================
       1️⃣ Validation
    ============================ */

    if (!project_id || !lat || !long) {
      throw new Error("project_id, lat and long are required");
    }

    /* ============================
       2️⃣ Check Project Exists
    ============================ */

    const project = await ProjectsModel.findOne({
      where: { tproj_id: project_id },
      transaction
    });

    if (!project) {
      throw new Error("Project not found");
    }

    /* ============================
       3️⃣ Check Existing Location
    ============================ */

    const projectLocation = await sequelize.query(
      `
      SELECT *
      FROM t_lat_long
      WHERE tll_item_id = :project_id
      AND tll_purpose = 'project_location_assigned'
      LIMIT 1
      `,
      {
        replacements: { project_id },
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    /* ============================
       4️⃣ Update Existing Location
    ============================ */

    if (projectLocation.length > 0) {

      await sequelize.query(
        `
        UPDATE t_lat_long
        SET
          wkb_geometry = ST_GeomFromText('POINT(:long :lat)', 4326),
          tll_lat = :lat,
          tll_long = :long,
          tll_updated_by = :userId,
          tll_updated_at = NOW()
        WHERE tll_item_id = :project_id
        AND tll_purpose = 'project_location_assigned'
        `,
        {
          replacements: {
            project_id,
            lat,
            long,
            userId
          },
          type: sequelize.QueryTypes.UPDATE,
          transaction
        }
      );

    } else {

      /* ============================
         5️⃣ Insert New Location
      ============================ */

      await add_lat_long(
        project_id,
        "t_projects",
        lat,
        long,
        userId,
        "project_location_assigned",
        transaction
      );

    }

    await transaction.commit();

    return res.status(200).json({
      message: "Project location submitted successfully",
      status: true,
      data: []
    });

  } catch (err) {

    if (transaction) await transaction.rollback();

    console.error(err);

    return res.status(500).json({
      message: err.message,
      status: false
    });
  }
};
