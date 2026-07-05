var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const NgoFactorysModel = require("../../../models/ngo/ngo_factorys.model");
const NgoModel = require("../../../models/ngo/ngo.model");
const NgoBeneficiaryModel = require("../../../models/ngo/ngo_beneficiary.model");
const NgoLocationModel = require("../../../models/ngo/ngo.location.model");
const DocumentModel = require("../../../models/documents/documents.model");
const { saveAndPrepareDocumentMetadata, saveUpdateAndPrepareDocumentMetadata } = require("../../../helpers/document.helper");
const { isEmpty } = require("../../../helpers/common.helper");
const User = require("../../../models/users/user.model");



module.exports.fetch_ngo_profile_datatable = async (req, res, next) => {
    try {
           const creater_by = req.user[0]?.id;
          //  console.log("creater_by-------------- ",creater_by);
           
        let file_url = process.env.SERVER_FILE_URL;

//         var sql = `
//           SELECT 
//     t_ngo.*, 
//     users.name AS tngo_user_name,
//     users.email AS tngo_user_email,
//     creator.name AS tngo_created_by_name,
//     tfact_factory_name,
//     COALESCE(docs.documents, '[]'::json) AS documents,
//      t_sub_master_list.tsml_sub_master_list_name,
//       -- Location: factorys
//     (
//         SELECT jsonb_agg(DISTINCT jsonb_build_object(
//             'tfact_factory_id', TRIM(BOTH FROM loc.tnfac_factory_id),
//             'vertical_name', s.tfact_factory_name
//         ))
//         FROM public.t_ngo_factorys loc
//         JOIN public.t_factory_master s 
//             ON s.tfact_factory_id = loc.tnfac_factory_id
//         WHERE loc.tnfac_ngo_id = t_ngo.tngo_id
//     ) AS factorys
// FROM t_ngo
// LEFT JOIN LATERAL (
//     SELECT json_agg(
//         to_jsonb(td) ||
//         jsonb_build_object(
//             'full_url', '${file_url}' || td.doc_path
//         )
//     ) AS documents
//     FROM t_documents td
//     WHERE td.final_doc_id = t_ngo.tngo_id
// ) docs ON true
// LEFT JOIN users ON users.id = t_ngo.tngo_user_id
// LEFT JOIN users AS creator ON creator.id = t_ngo.tngo_created_by
// LEFT JOIN t_factory_master  ON t_factory_master.tfact_factory_id = t_ngo.tngo_factorys
//  LEFT JOIN t_sub_master_list ON t_sub_master_list.tsml_id = t_ngo.tngo_category
//  `;

 var sql = `
          SELECT 
    t_ngo.*, 
    users.name AS tngo_user_name,
    users.email AS tngo_user_email,
    creator.name AS tngo_created_by_name,
    COALESCE(docs.documents, '[]'::json) AS documents

FROM t_ngo
LEFT JOIN LATERAL (
    SELECT json_agg(
        to_jsonb(td) ||
        jsonb_build_object(
            'full_url', '${file_url}' || td.doc_path
        )
    ) AS documents
    FROM t_documents td
    WHERE td.final_doc_id = t_ngo.tngo_id
) docs ON true
LEFT JOIN users ON users.id = t_ngo.tngo_user_id
LEFT JOIN users AS creator ON creator.id = t_ngo.tngo_created_by
 `;

        var where = ` t_ngo.tngo_created_by = ${creater_by} `;

        var records = await Datatables.build(req, sql,where);

        res.json(records);
    } catch (err) {
        console.log(err);
        next(
            CustomErrorHandler.internalServerError({
                message: err.message,
                stack: err.stack,
            })
        );
    }
};

module.exports.getNgoProfileUserIdFunction = async (req, res, next) => {
  try {
   

    const sql = `
    SELECT
        ng.tngo_id,
        ng.tngo_name,
        ng.tngo_status,
        ng.tngo_user_id
    FROM public.t_ngo ng
`;

        const ngoData = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
        });
       

    return res.status(200).json({
      status: true,
      message: "NGO User Id fetched successfully",
      data: ngoData,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
}

module.exports.createNgoProfile = async (req, res, next) => {
    let transaction;
    transaction = await sequelize.transaction();
    
  try {
    
    let uploadedFilePaths = [];
    let id = !isEmpty(req.body.tngo_id) ? req.body.tngo_id : null;
    const formData = req.body;
    const files = req?.files;
    const creater_by = req?.user[0]?.id;

    console.log("formData--------------- ",formData);
    console.log("files--------------- ",files);
    console.log("creater_by--------------- ",creater_by);
    // return;
    

    // ✅ Parse state_district_blocks from JSON string to array
    let state_district_blocks = [];
    try {
      state_district_blocks = JSON.parse(formData.state_district_blocks || '[]');
    } catch (e) {
      return res.status(400).json({ message: "Invalid state_district_blocks format." });
    }

    // ✅ Parse state_district_blocks from JSON string to array
    const all_factorys = formData.tngo_factorys
    ? formData.tngo_factorys.split(',').map(s => s.trim())
    : [];
    const target_beneficiaries = formData.tngo_target_beneficiaries
    ? formData.tngo_target_beneficiaries.split(',').map(s => s.trim())
    : [];



    // ✅ Prepare requestData for NgoModel
    const requestData = {
    //   ...(formData.tngo_company_id && { tngo_company_id: formData.tngo_company_id }),
      ...(formData.tngo_name && { tngo_name: formData.tngo_name }),
      
      ...(formData.tngo_objective && { tngo_objective: formData.tngo_objective }),
      ...(formData.tngo_factorys && { tngo_factorys: formData.tngo_factorys }),
      ...(formData.tngo_csr_reg_no && { tngo_csr_reg_no: formData.tngo_csr_reg_no }),
      ...(formData.tngo_category && { tngo_category: formData.tngo_category }),
      ...(formData.tngo_email && { tngo_email: formData.tngo_email }),
      ...(formData.tngo_contact_no && { tngo_contact_no: formData.tngo_contact_no }),
      ...(formData.tngo_contact_person && { tngo_contact_person: formData.tngo_contact_person }),
      ...(formData.tngo_contact_person_no && { tngo_contact_person_no: formData.tngo_contact_person_no }),
      ...(formData.tngo_registered_address && { tngo_registered_address: formData.tngo_registered_address }),
      ...(formData.tngo_present_address && { tngo_present_address: formData.tngo_present_address }),
      ...(formData.tngo_website && { tngo_website: formData.tngo_website }),
      ...(formData.tngo_pan_no && { tngo_pan_no: formData.tngo_pan_no }),
      ...(formData.tngo_gst_number && { tngo_gst_number: formData.tngo_gst_number }),
      ...(formData.tngo_tan_number && { tngo_tan_number: formData.tngo_tan_number }),
      ...(formData.tngo_target_beneficiaries && { tngo_target_beneficiaries: formData.tngo_target_beneficiaries }),
      ...(formData.tngo_twelve_a_registration_number && { tngo_twelve_a_registration_number: formData.tngo_twelve_a_registration_number }),
      ...(formData.tngo_ngo_registration_date && { tngo_ngo_registration_date: formData.tngo_ngo_registration_date }),
      ...(formData.tngo_fcra_license_is_guaranteed && { tngo_fcra_license_is_guaranteed: formData.tngo_fcra_license_is_guaranteed }),

      // Disclosures
      ...(formData.tngo_litigation_against_org && { tngo_litigation_against_org: formData.tngo_litigation_against_org }),
      ...(formData.tngo_blacklisted && { tngo_blacklisted: formData.tngo_blacklisted }),
      ...(formData.tngo_associated_political_party && { tngo_associated_political_party: formData.tngo_associated_political_party }),
      ...(formData.tngo_anyone_convicted && { tngo_anyone_convicted: formData.tngo_anyone_convicted }),
      ...(formData.tngo_political_founders && { tngo_political_founders: formData.tngo_political_founders }),
      ...(formData.tngo_certified_guidestar && { tngo_certified_guidestar: formData.tngo_certified_guidestar }),
      ...(formData.tngo_certified_credibility_alliance && { tngo_certified_credibility_alliance: formData.tngo_certified_credibility_alliance }),
      ...(formData.tngo_has_ca && { tngo_has_ca: formData.tngo_has_ca }),
      ...(formData.tngo_has_auditor && { tngo_has_auditor: formData.tngo_has_auditor }),
      ...(formData.tngo_budget_vs_actual && { tngo_budget_vs_actual: formData.tngo_budget_vs_actual }),
      ...(formData.tngo_challenged_twelve_a && { tngo_challenged_twelve_a: formData.tngo_challenged_twelve_a }),
      ...(formData.tngo_registered_darpan && { tngo_registered_darpan: formData.tngo_registered_darpan }),
      ...(formData.tngo_file_return_charity && { tngo_file_return_charity: formData.tngo_file_return_charity }),
      ...(formData.tngo_has_finance_team && { tngo_has_finance_team: formData.tngo_has_finance_team }),
    //   ...(formData.tngo_user_id && { tngo_user_id: formData.tngo_user_id }),
      ...(formData.tngo_status && { tngo_status: formData.tngo_status }),
                // Always track who did it 👇
            tngo_created_by: creater_by,   // <--- add this (for create)
            tngo_updated_by: creater_by    // <--- also track update

    };



    let newNgo;

    

    if (Object.keys(requestData).length > 0) {
      if (id) {
         requestData.tngo_updated_by = creater_by;
        await NgoModel.update(requestData, { where: { tngo_id: id } });
        newNgo = await NgoModel.findOne({ where: { tngo_id: id } });

        // ✅ Delete old NGO location mappings
        await NgoLocationModel.destroy({
            where: { tnl_ngo_id: id },
            transaction
        });

        // ✅ Delete old NGO location mappings
        await NgoFactorysModel.destroy({
            where: { tnfac_ngo_id: id },
            transaction
        });
        await NgoBeneficiaryModel.destroy({
            where: { tnben_tngo_id: id },
            transaction
        });

      } else {
        // requestData.tngo_id = `tngo${Date.now()}`;
        requestData.tngo_created_by = creater_by;
        requestData.tngo_updated_by = creater_by;
        newNgo = await NgoModel.create(requestData);
        id = newNgo.tngo_id;
      }

    //   User.update(
    //     { ngo_id: id },
    //     {
    //       where: { id: requestData.tngo_user_id },
    //       transaction,
    //     }
    //   );
        


      // ✅ Insert NGO state/district location mapping
      for (const data_of_st of all_factorys) {
        await NgoFactorysModel.create({
          tnfac_ngo_id: id,
          tnfac_factory_id: data_of_st,
          tnfac_created_by: creater_by,
          tnfac_updated_by: creater_by,
        }, { transaction });

      }
      // ✅ Insert NGO target beneficiary mapping
      for (const data_of_st of target_beneficiaries) {
        await NgoBeneficiaryModel.create({
          tnben_tngo_id: id,
          tnben_ngo_beneficiary_id: data_of_st,
          tnben_created_by: creater_by,
          tnben_updated_by: creater_by,
        }, { transaction });
      }


      // ✅ Insert NGO state/district location mapping
      for (const data_of_st of state_district_blocks) {
        await NgoLocationModel.create({
          tnl_ngo_id: id,
          tnl_state_id: data_of_st.state_id,
          tnl_district_id: data_of_st.district_id,
          tnl_created_by: creater_by,
          tnl_updated_by: creater_by,
        }, { transaction });
      }

      // ✅ Handle file uploads
      if (files?.length > 0) {
        const grouped = files.reduce((acc, file) => {
          (acc[file.fieldname] ||= []).push(file);
          return acc;
        }, {});

        console.log("grouped", grouped);

        for (const [key, fileGroup] of Object.entries(grouped)) {

          if (key == "tngo_logo") {
            const { metadata, filePaths } = await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              id,
              "uploads/ngo",
              creater_by,
              transaction
            );
            uploadedFilePaths.push(...filePaths);
            if (metadata.length) {
              await DocumentModel.bulkCreate(metadata, { transaction });
            }
            
          }
          else if (key == "tngo_csr_certificate") {
            const { metadata, filePaths } = await saveAndPrepareDocumentMetadata(
              fileGroup,
              id,
              "uploads/ngo",
              creater_by,
              transaction
            );
            uploadedFilePaths.push(...filePaths);
            if (metadata.length) {
              await DocumentModel.bulkCreate(metadata, { transaction });
            }
          }

          // const { metadata, filePaths } = await saveUpdateAndPrepareDocumentMetadata(
          //   fileGroup,
          //   id,
          //   "uploads/ngo",
          //   creater_by,
          //   transaction
          // );

          // uploadedFilePaths.push(...filePaths);

          // if (metadata.length) {
          //   await DocumentModel.bulkCreate(metadata, { transaction });
          // }
        }
      }

      await transaction.commit();

      return res.status(201).json({
        message: id ? "NGO updated successfully" : "NGO created successfully",
        data: [],
        status: true,
      });
    } else {
      next(CustomErrorHandler.validationError("Request body required."));
    }
  } catch (err) {
    console.error(err);
    if (transaction) await transaction.rollback();

    next(CustomErrorHandler.internalServerError({
      message: err.message,
      stack: err.stack,
    }));
  }
};

module.exports.ngoProfileDetailsFunction = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;
    const ngoId = req.body.ngo_id;

    if (!ngoId) {
      return res.status(400).json({ message: "NGO ID is required" });
    }

//     const sql = `
//     SELECT
//         ng.tngo_id,
//         ng.tngo_name,
//         ng.tngo_objective,
//         ng.tngo_csr_reg_no,
//         ng.tngo_category,
//         ng.tngo_contact_no,
//         ng.tngo_contact_person,
//         ng.tngo_contact_person_no,
//         ng.tngo_email,
//         ng.tngo_registered_address,
//         ng.tngo_present_address,
//         ng.tngo_website,
//         ng.tngo_pan_no,
//         ng.tngo_gst_number,
//         ng.tngo_tan_number,
//         ng.tngo_target_beneficiaries,
//         ng.tngo_twelve_a_registration_number,
//         ng.tngo_ngo_registration_date,
//         ng.tngo_fcra_license_is_guaranteed,


//         -- Disclosure fields
//         ng.tngo_litigation_against_org,
//         ng.tngo_blacklisted,
//         ng.tngo_associated_political_party,
//         ng.tngo_anyone_convicted,
//         ng.tngo_political_founders,
//         ng.tngo_certified_guidestar,
//         ng.tngo_certified_credibility_alliance,
//         ng.tngo_has_ca,
//         ng.tngo_has_auditor,
//         ng.tngo_budget_vs_actual,
//         ng.tngo_challenged_twelve_a,
//         ng.tngo_registered_darpan,
//         ng.tngo_file_return_charity,
//         ng.tngo_has_finance_team,

//         -- Audit fields
//         ng.tngo_status,
//         ng.tngo_user_id,
//         ng.tngo_created_by,
//         ng.tngo_created_at,
//         ng.tngo_updated_by,
//         ng.tngo_updated_at,
//         ng.tngo_deleted_at,
//         ng.tngo_fl_archive,
//         tfact_factory_name,
//         t_sub_master_list.tsml_sub_master_list_name,
//         COALESCE(beneficiaries.target_beneficiaries, '[]'::json) AS target_beneficiaries,
//         users.name AS user_name,
//         -- Location: factorys
//     (
//     SELECT jsonb_agg(DISTINCT jsonb_build_object(
//         'tfact_factory_id', TRIM(BOTH FROM loc.tnfac_factory_id),
//         'vertical_name', s.tfact_factory_name
//     ))
//     FROM public.t_ngo_factorys loc
//     JOIN public.t_factory_master s 
//         ON s.tfact_factory_id = loc.tnfac_factory_id
//     WHERE loc.tnfac_ngo_id = ng.tngo_id   -- ✅ use alias ng
// ) AS factorys,


        

//         -- Location: States
//         (
//             SELECT jsonb_agg(DISTINCT jsonb_build_object(
//                 'state_id', TRIM(BOTH FROM loc.tnl_state_id),
//                 'state_name', s.tsl_state_name
//             ))
//             FROM public.t_ngo_location loc
//             JOIN public.t_state s ON s.tsl_state_id = loc.tnl_state_id
//             WHERE loc.tnl_ngo_id = ng.tngo_id
//         ) AS states,

//         -- Location: Districts
//         (
//             SELECT jsonb_agg(DISTINCT jsonb_build_object(
//                 'district_id', TRIM(BOTH FROM loc.tnl_district_id),
//                 'district_name', d.tdl_district_name,
//                 'stateId', d.tdl_state_id
//             ))
//             FROM public.t_ngo_location loc
//             JOIN public.t_district d ON d.tdl_district_id = loc.tnl_district_id
//             WHERE loc.tnl_ngo_id = ng.tngo_id
//         ) AS districts,

//         -- Documents
//         COALESCE(docs.documents, '[]'::json) AS documents

//     FROM public.t_ngo ng

//     LEFT JOIN t_sub_master_list ON t_sub_master_list.tsml_id = ng.tngo_category
//     LEFT JOIN users ON users.id = ng.tngo_user_id
// LEFT JOIN t_factory_master  ON t_factory_master.tfact_factory_id = ng.tngo_factorys
//     LEFT JOIN LATERAL (
//     SELECT json_agg(
//         to_jsonb(td) ||
//         jsonb_build_object(
//             'full_url', '${file_url}' || td.doc_path
//         )
//     ) AS documents
//     FROM t_documents td
//     WHERE td.final_doc_id = ng.tngo_id
// ) docs ON true


//       LEFT JOIN LATERAL (
//     SELECT json_agg(json_build_object(
//         'tnben_ngo_beneficiary_id', nb.tnben_ngo_beneficiary_id,
//         'tnben_tngo_id', nb.tnben_tngo_id,
//         'tsml_sub_master_list_name', sm.tsml_sub_master_list_name
//     )) AS target_beneficiaries
//     FROM t_ngo_beneficiary nb
//     LEFT JOIN t_sub_master_list sm
//       ON sm.tsml_id = nb.tnben_ngo_beneficiary_id
//     WHERE nb.tnben_tngo_id = ng.tngo_id
// ) beneficiaries ON true



//     WHERE ng.tngo_id = '${ngoId}';
// `;


const sql = `
SELECT
    ng.tngo_id,
    ng.tngo_name,
    ng.tngo_factorys,
    ng.tngo_objective,
    ng.tngo_csr_reg_no,
    ng.tngo_category,
    ng.tngo_contact_no,
    ng.tngo_contact_person,
    ng.tngo_contact_person_no,
    ng.tngo_email,
    ng.tngo_registered_address,
    ng.tngo_present_address,
    ng.tngo_website,
    ng.tngo_pan_no,
    ng.tngo_gst_number,
    ng.tngo_tan_number,
    ng.tngo_target_beneficiaries,
    ng.tngo_twelve_a_registration_number,
    ng.tngo_ngo_registration_date,
    ng.tngo_fcra_license_is_guaranteed,

    -- Disclosure fields
    ng.tngo_litigation_against_org,
    ng.tngo_blacklisted,
    ng.tngo_associated_political_party,
    ng.tngo_anyone_convicted,
    ng.tngo_political_founders,
    ng.tngo_certified_guidestar,
    ng.tngo_certified_credibility_alliance,
    ng.tngo_has_ca,
    ng.tngo_has_auditor,
    ng.tngo_budget_vs_actual,
    ng.tngo_challenged_twelve_a,
    ng.tngo_registered_darpan,
    ng.tngo_file_return_charity,
    ng.tngo_has_finance_team,

    -- Audit fields
    ng.tngo_status,
    ng.tngo_user_id,
    ng.tngo_created_by,
    ng.tngo_created_at,
    ng.tngo_updated_by,
    ng.tngo_updated_at,
    ng.tngo_deleted_at,
    ng.tngo_fl_archive,

    t_sub_master_list.tsml_sub_master_list_name,
    COALESCE(beneficiaries.target_beneficiaries, '[]'::json) AS target_beneficiaries,
    users.name AS user_name,

    -- ✅ Factory list
    (
        SELECT jsonb_agg(DISTINCT jsonb_build_object(
            'tfact_factory_id', TRIM(BOTH FROM loc.tnfac_factory_id),
            'vertical_name', s.tfact_factory_name
        ))
        FROM public.t_ngo_factorys loc
        JOIN public.t_factory_master s 
            ON s.tfact_factory_id = loc.tnfac_factory_id
        WHERE loc.tnfac_ngo_id = ng.tngo_id
    ) AS factorys,

    -- ✅ States
    (
        SELECT jsonb_agg(DISTINCT jsonb_build_object(
            'state_id', TRIM(BOTH FROM loc.tnl_state_id),
            'state_name', s.tsl_state_name
        ))
        FROM public.t_ngo_location loc
        JOIN public.t_state s ON s.tsl_state_id = loc.tnl_state_id
        WHERE loc.tnl_ngo_id = ng.tngo_id
    ) AS states,

    -- ✅ Districts
    (
        SELECT jsonb_agg(DISTINCT jsonb_build_object(
            'district_id', TRIM(BOTH FROM loc.tnl_district_id),
            'district_name', d.tdl_district_name,
            'stateId', d.tdl_state_id
        ))
        FROM public.t_ngo_location loc
        JOIN public.t_district d ON d.tdl_district_id = loc.tnl_district_id
        WHERE loc.tnl_ngo_id = ng.tngo_id
    ) AS districts,

    -- ✅ Documents
    COALESCE(docs.documents, '[]'::json) AS documents

FROM public.t_ngo ng
LEFT JOIN t_sub_master_list ON t_sub_master_list.tsml_id = ng.tngo_category
LEFT JOIN users ON users.id = ng.tngo_user_id
LEFT JOIN LATERAL (
    SELECT json_agg(
        to_jsonb(td) ||
        jsonb_build_object(
            'full_url', '${file_url}' || td.doc_path
        )
    ) AS documents
    FROM t_documents td
    WHERE td.final_doc_id = ng.tngo_id
) docs ON true
LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object(
        'tnben_ngo_beneficiary_id', nb.tnben_ngo_beneficiary_id,
        'tnben_tngo_id', nb.tnben_tngo_id,
        'tsml_sub_master_list_name', sm.tsml_sub_master_list_name
    )) AS target_beneficiaries
    FROM t_ngo_beneficiary nb
    LEFT JOIN t_sub_master_list sm
      ON sm.tsml_id = nb.tnben_ngo_beneficiary_id
    WHERE nb.tnben_tngo_id = ng.tngo_id
) beneficiaries ON true
WHERE ng.tngo_id = '${ngoId}';

`;
        const ngoData = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
        });


    return res.status(200).json({
      status: true,
      message: "NGO details fetched successfully",
      data: ngoData?ngoData[0]:{},
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
}


