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
const bcrypt = require("bcrypt");
const ExcelJS = require("exceljs");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const { isEmpty } = require("../../../helpers/common.helper");
const User = require("../../../models/users/user.model");
const RolesModel = require("../../../models/role/roles.model");

module.exports.fetch_ngo_lists = async (req, res, next) => {
  try {
    var sql = `
          SELECT 
            t_ngo.*, 
            users.name AS tngo_user_name,
            users.email AS tngo_user_email

        FROM t_ngo
        LEFT JOIN users ON users.id = t_ngo.tngo_user_id`;

    // var where = ` t_block.tbl_is_active = 'true' `;

    var records = await Datatables.build(req, sql);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      }),
    );
  }
};

module.exports.fetch_ngo_datatable = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;

    var sql = `
          SELECT 
    t_ngo.*, 
    t_category.tcat_category_type,
    t_theme_master.tthm_theme_name,
    users.name AS tngo_user_name,
    users.email AS tngo_user_email,
     users.phone AS tngo_user_contact_no,
    users.education_id AS tngo_user_education_id,
    users.status AS tngo_user_status,
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

LEFT JOIN t_category ON t_category.tcat_id = t_ngo.tngo_category
LEFT JOIN t_theme_master ON t_theme_master.tthm_theme_id = t_ngo.tngo_area_of_expertise
LEFT JOIN users ON users.id = t_ngo.tngo_user_id
LEFT JOIN users AS creator ON creator.id = t_ngo.tngo_created_by`;

    // var where = ` t_block.tbl_is_active = 'true' `;

    var records = await Datatables.build(req, sql);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      }),
    );
  }
};

module.exports.getNgoUserIdFunction = async (req, res, next) => {
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
};

// module.exports.createNgo = async (req, res, next) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const formData = req.body;
//     const files = req.files || [];
//     const creater_by = req?.user[0]?.id;
//     let uploadedFilePaths = [];
//     console.log("formData--------------- ", formData);
//     console.log("files--------------- ", files);
//     console.log("creater_by--------------- ", creater_by);
//     return;
//     // Build requestData from formData
//     const requestData = {
//       ...(formData.tngo_name && { tngo_name: formData.tngo_name }),
//       ...(formData.tngo_csr_one_res_org && {
//         tngo_csr_one_res_org: formData.tngo_csr_one_res_org,
//       }),
//       ...(formData.tngo_res_certificate_org && {
//         tngo_res_certificate_org: formData.tngo_res_certificate_org,
//       }),
//       ...(formData.tngo_register_id && {
//         tngo_register_id: formData.tngo_register_id,
//       }),
//       ...(formData.tngo_pan_card_org && {
//         tngo_pan_card_org: formData.tngo_pan_card_org,
//       }),
//       ...(formData.tngo_amount_received && {
//         tngo_amount_received: formData.tngo_amount_received,
//       }),
//       ...(formData.tngo_amount_spent && {
//         tngo_amount_spent: formData.tngo_amount_spent,
//       }),
//       ...(formData.tngo_twelve_aa_certificate && {
//         tngo_twelve_aa_certificate: formData.tngo_twelve_aa_certificate,
//       }),
//       ...(formData.tngo_eighty_g_certificate_org && {
//         tngo_eighty_g_certificate_org: formData.tngo_eighty_g_certificate_org,
//       }),
//       ...(formData.tngo_by_law_org_doc && {
//         tngo_by_law_org_doc: formData.tngo_by_law_org_doc,
//       }),
//       ...(formData.tngo_list_of_exist_gov_body_members && {
//         tngo_list_of_exist_gov_body_members:
//           formData.tngo_list_of_exist_gov_body_members,
//       }),
//       ...(formData.tngo_details_of_office_bearers && {
//         tngo_details_of_office_bearers: formData.tngo_details_of_office_bearers,
//       }),
//       ...(formData.tngo_audit_report_org_with_income_tax_return && {
//         tngo_audit_report_org_with_income_tax_return:
//           formData.tngo_audit_report_org_with_income_tax_return,
//       }),
//       ...(formData.tngo_bank_account_no && {
//         tngo_bank_account_no: formData.tngo_bank_account_no,
//       }),
//       ...(formData.tngo_bank_account_name && {
//         tngo_bank_account_name: formData.tngo_bank_account_name,
//       }),
//       ...(formData.tngo_bank_name && {
//         tngo_bank_name: formData.tngo_bank_name,
//       }),
//       ...(formData.tngo_bank_ifsc_code && {
//         tngo_bank_ifsc_code: formData.tngo_bank_ifsc_code,
//       }),
//       ...(formData.tngo_bank_address_of_the_bank && {
//         tngo_bank_address_of_the_bank: formData.tngo_bank_address_of_the_bank,
//       }),
//       ...(formData.tngo_fcra_reg_certificate && {
//         tngo_fcra_reg_certificate: formData.tngo_fcra_reg_certificate,
//       }),
//       ...(formData.tngo_niti_aayog_darpan_reg && {
//         tngo_niti_aayog_darpan_reg: formData.tngo_niti_aayog_darpan_reg,
//       }),
//       ...(formData.tngo_complete_address_reg_doc_org && {
//         tngo_complete_address_reg_doc_org:
//           formData.tngo_complete_address_reg_doc_org,
//       }),
//       ...(formData.tngo_contact_name && {
//         tngo_contact_name: formData.tngo_contact_name,
//       }),
//       ...(formData.tngo_contact_phone_no && {
//         tngo_contact_phone_no: formData.tngo_contact_phone_no,
//       }),
//       ...(formData.tngo_contact_email && {
//         tngo_contact_email: formData.tngo_contact_email,
//       }),
//       ...(formData.tngo_contact_office_address && {
//         tngo_contact_office_address: formData.tngo_contact_office_address,
//       }),
//       ...(formData.tngo_key_person_name && {
//         tngo_key_person_name: formData.tngo_key_person_name,
//       }),
//       ...(formData.tngo_key_person_phone_no && {
//         tngo_key_person_phone_no: formData.tngo_key_person_phone_no,
//       }),
//       ...(formData.tngo_key_person_email && {
//         tngo_key_person_email: formData.tngo_key_person_email,
//       }),
//       ...(formData.tngo_key_person_office_address && {
//         tngo_key_person_office_address: formData.tngo_key_person_office_address,
//       }),
//       ...(formData.tngo_key_person_name && {
//         tngo_key_person_name: formData.tngo_key_person_name,
//       }),
//       ...(formData.tngo_key_person_phone_no && {
//         tngo_key_person_phone_no: formData.tngo_key_person_phone_no,
//       }),
//       ...(formData.tngo_key_person_email && {
//         tngo_key_person_email: formData.tngo_key_person_email,
//       }),
//       ...(formData.tngo_key_person_office_address && {
//         tngo_key_person_office_address: formData.tngo_key_person_office_address,
//       }),
//       ...(formData.tngo_name_of_entity && {
//         tngo_name_of_entity: formData.tngo_name_of_entity,
//       }),
//       ...(formData.tngo_status_of_entity_id && {
//         tngo_status_of_entity_id: formData.tngo_status_of_entity_id,
//       }),
//       ...(formData.tngo_registered_off_address && {
//         tngo_registered_off_address: formData.tngo_registered_off_address,
//       }),
//       ...(formData.tngo_corporate_off_address && {
//         tngo_corporate_off_address: formData.tngo_corporate_off_address,
//       }),
//       ...(formData.tngo_branches && { tngo_branches: formData.tngo_branches }),
//       ...(formData.tngo_name_of_group && {
//         tngo_name_of_group: formData.tngo_name_of_group,
//       }),
//       ...(formData.tngo_pan && { tngo_pan: formData.tngo_pan }),
//       ...(formData.tngo_gst && { tngo_gst: formData.tngo_gst }),
//       ...(formData.tngo_website && { tngo_website: formData.tngo_website }),
//       tngo_created_by: creater_by,
//       tngo_updated_by: creater_by,
//     };

//     // ✅ Save NGO
//     let newNgo;
//     if (formData.tngo_id) {
//       await NgoModel.update(requestData, {
//         where: { tngo_id: formData.tngo_id },
//         transaction,
//       });
//       newNgo = await NgoModel.findOne({
//         where: { tngo_id: formData.tngo_id },
//         transaction,
//       });
//     } else {
//       newNgo = await NgoModel.create(requestData, { transaction });
//     }

//     // ✅ Handle file uploads
//     if (files?.length > 0) {
//       const grouped = files.reduce((acc, file) => {
//         (acc[file.fieldname] ||= []).push(file);
//         return acc;
//       }, {});

//       // console.log("grouped", grouped);

//       for (const [key, fileGroup] of Object.entries(grouped)) {
//         if (key == "tngo_csr_one_res_org_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_res_certificate_org_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_pan_card_org_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_twelve_aa_certificate_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_eighty_g_certificate_org_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_memorandum_association_org_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_list_of_exist_gov_body_members_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_by_law_org_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_fcra_reg_certificate_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_niti_aayog_darpan_reg_doc") {
//           const { metadata, filePaths } =
//             await saveUpdateAndPrepareDocumentMetadata(
//               fileGroup,
//               newNgo?.tngo_id,
//               "uploads/ngo",
//               creater_by,
//               transaction
//             );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         } else if (key == "tngo_audit_report_org_with_income_tax_return_doc") {
//           const { metadata, filePaths } = await saveAndPrepareDocumentMetadata(
//             fileGroup,
//             newNgo?.tngo_id,
//             "uploads/ngo",
//             creater_by,
//             transaction
//           );
//           uploadedFilePaths.push(...filePaths);
//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         }

//       }
//     }

//     await transaction.commit();
//     res.status(200).json({ success: true, data: newNgo });
//   } catch (error) {
//     if (transaction) await transaction.rollback();
//     console.error("Error in createNgo:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

module.exports.createNgo = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const formData = req.body;
    const files = req.files || [];
    const creater_by = req?.user?.[0]?.id || null;

 

    let uploadedFilePaths = [];

    /* ------------------------------------------------ */
    /* GET NGO ROLE                                     */
    /* ------------------------------------------------ */

    const ngoRole = await RolesModel.findOne({
      where: { trl_role_slug: "ngo" },
      transaction,
    });

    if (!ngoRole) {
      throw new Error("NGO role not found");
    }

    /* ------------------------------------------------ */
    /* BUILD NGO DATA                                   */
    /* ------------------------------------------------ */

    const requestData = {
      ...(formData.tngo_name && { tngo_name: formData.tngo_name }),
      ...(formData.tngo_area_of_expertise && {
        tngo_area_of_expertise: formData.tngo_area_of_expertise,
      }),
      ...(formData.tngo_category && { tngo_category: formData.tngo_category }),
      ...(formData.tngo_contact_no && {
        tngo_contact_no: formData.tngo_contact_no,
      }),
      ...(formData.tngo_email_id && { tngo_email_id: formData.tngo_email_id }),
      ...(formData.tngo_website && { tngo_website: formData.tngo_website }),
      ...(formData.tngo_ngo_darpan_no && {
        tngo_ngo_darpan_no: formData.tngo_ngo_darpan_no,
      }),
      ...(formData.tngo_reg_address_of_org && {
        tngo_reg_address_of_org: formData.tngo_reg_address_of_org,
      }),
      ...(formData.tngo_present_address_of_org && {
        tngo_present_address_of_org: formData.tngo_present_address_of_org,
      }),
      ...(formData.tngo_state_id && { tngo_state_id: formData.tngo_state_id }),
      ...(formData.tngo_csr_reg_no && {
        tngo_csr_reg_no: formData.tngo_csr_reg_no,
      }),
      ...(formData.tngo_pan_no && { tngo_pan_no: formData.tngo_pan_no }),
      ...(formData.tngo_bank_account_no && {
        tngo_bank_account_no: formData.tngo_bank_account_no,
      }),
      ...(formData.tngo_bank_account_name && {
        tngo_bank_account_name: formData.tngo_bank_account_name,
      }),
      ...(formData.tngo_bank_name && {
        tngo_bank_name: formData.tngo_bank_name,
      }),
      ...(formData.tngo_bank_ifsc_code && {
        tngo_bank_ifsc_code: formData.tngo_bank_ifsc_code,
      }),
      ...(formData.tngo_address_of_the_bank && {
        tngo_address_of_the_bank: formData.tngo_address_of_the_bank,
      }),
      ...(formData.tngo_remarks && { tngo_remarks: formData.tngo_remarks }),
      ...(formData.tngo_niti_aayog_darpan_por_reg && {
        tngo_niti_aayog_darpan_por_reg: formData.tngo_niti_aayog_darpan_por_reg,
      }),

      tngo_created_by: creater_by,
      tngo_updated_by: creater_by,
    };

    /* ------------------------------------------------ */
    /* CREATE OR UPDATE NGO                             */
    /* ------------------------------------------------ */

    let newNgo;

    if (formData.tngo_id) {
      await NgoModel.update(requestData, {
        where: { tngo_id: formData.tngo_id },
        transaction,
      });

      newNgo = await NgoModel.findOne({
        where: { tngo_id: formData.tngo_id },
        transaction,
      });
    } else {
      newNgo = await NgoModel.create(requestData, { transaction });
    }

    /* ------------------------------------------------ */
    /* CREATE / UPDATE USER                             */
    /* ------------------------------------------------ */

    let user;
    let userId = formData.tngo_user_id || newNgo?.tngo_user_id;

    if (userId) {
      await User.update(
        {
          name: formData.tngo_user_name,
          phone: formData.tngo_user_contact_no,
          email: formData.tngo_user_email_id,
          ngo_id: newNgo.tngo_id,
          role_id: ngoRole.trl_role_id,
          status: formData.tngo_user_status,
          education_id: formData.tngo_user_education_id,
          updated_by: creater_by,
        },
        {
          where: { id: userId   },
          transaction,
        },
      );

      user = await User.findOne({
        where: { id: userId  },
        transaction,
      });
    } else {
      const hashedPassword = await bcrypt.hash("123456", 10);
      user = await User.create(
        {
          name: formData.tngo_user_name,
          phone: formData.tngo_user_contact_no,
          email: formData.tngo_user_email_id,
          password: hashedPassword,
          ngo_id: newNgo.tngo_id,
          role_id: ngoRole.trl_role_id,
          status: formData.tngo_user_status,
          education_id: formData.tngo_user_education_id,
          created_by: creater_by,
          updated_by: creater_by,
        },
        { transaction },
      );
    }

    /* ------------------------------------------------ */
    /* UPDATE NGO WITH USER ID                          */
    /* ------------------------------------------------ */

    await NgoModel.update(
      {
        tngo_user_id: user.id,
      },
      {
        where: { tngo_id: newNgo.tngo_id },
        transaction,
      },
    );

    /* ------------------------------------------------ */
    /* FILE UPLOAD                                      */
    /* ------------------------------------------------ */

    if (files?.length > 0) {
      const grouped = files.reduce((acc, file) => {
        (acc[file.fieldname] ||= []).push(file);
        return acc;
      }, {});

      for (const [key, fileGroup] of Object.entries(grouped)) {
        let result;

        if (key == "tngo_csr_one_res_org_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_res_certificate_org_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_pan_card_org_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_details_of_office_bearers_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_twelve_aa_certificate_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_eighty_g_certificate_org_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_memorandum_association_org_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_list_of_exist_gov_body_members_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_by_law_org_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_fcra_reg_certificate_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_niti_aayog_darpan_reg_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        } else if (key == "tngo_audit_report_org_with_income_tax_return_doc") {
          result = await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            newNgo?.tngo_id,
            "uploads/ngo",
            creater_by,
            transaction,
          );
        }

        if (result) {
          const { metadata, filePaths } = result;

          uploadedFilePaths.push(...filePaths);

          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        }
      }
    }

    /* ------------------------------------------------ */
    /* COMMIT                                           */
    /* ------------------------------------------------ */

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: formData.tngo_id
        ? "NGO Updated Successfully"
        : "NGO Created Successfully",
      ngo: newNgo,
      user,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Create NGO Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.ngoDetailsFunction = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;
    const ngoId = req.body.ngo_id;

    if (!ngoId) {
      return res.status(400).json({ message: "NGO ID is required" });
    }

    const sql = `
 SELECT 
    t_ngo.*, 
    t_state.tsl_state_name,
    t_category.tcat_category_type,
    t_theme_master.tthm_theme_name,
    users.name AS tngo_user_name,
    users.email AS tngo_user_email,
    users.phone AS tngo_user_contact_no,
    users.education_id AS tngo_user_education_id,
    users.status AS tngo_user_status,
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

LEFT JOIN t_state ON t_state.tsl_state_id = t_ngo.tngo_state_id
 LEFT JOIN t_category ON t_category.tcat_id = t_ngo.tngo_category
LEFT JOIN t_theme_master ON t_theme_master.tthm_theme_id = t_ngo.tngo_area_of_expertise
LEFT JOIN users ON users.id = t_ngo.tngo_user_id
LEFT JOIN users AS creator ON creator.id = t_ngo.tngo_created_by

WHERE t_ngo.tngo_id = '${ngoId}'`;
    const ngoData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "NGO details fetched successfully",
      data: ngoData ? ngoData[0] : {},
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.ngoExcelDownload = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;

    const sql = `
      SELECT 
        t_ngo.tngo_id,
        t_ngo.tngo_name,
        t_state.tsl_state_name,
        t_category.tcat_category_type,
        t_theme_master.tthm_theme_name,
        t_ngo.tngo_status,
        users.name AS contact_person,
        users.email AS email,
        users.phone AS phone
      FROM t_ngo
      LEFT JOIN t_state 
        ON t_state.tsl_state_id = t_ngo.tngo_state_id
      LEFT JOIN t_category 
        ON t_category.tcat_id = t_ngo.tngo_category
      LEFT JOIN t_theme_master 
        ON t_theme_master.tthm_theme_id = t_ngo.tngo_area_of_expertise
      LEFT JOIN users 
        ON users.id = t_ngo.tngo_user_id
      ORDER BY t_ngo.tngo_name ASC
    `;

    const ngoData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("NGO List");

    worksheet.columns = [
      // { header: "NGO ID", key: "tngo_id", width: 15 },
      { header: "NGO Name", key: "tngo_name", width: 30 },
      { header: "State", key: "tsl_state_name", width: 20 },
      { header: "Category", key: "tcat_category_type", width: 25 },
      { header: "Area of Expertise", key: "tthm_theme_name", width: 30 },
      { header: "Contact Person", key: "contact_person", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Status", key: "tngo_status", width: 15 },
    ];

    ngoData.forEach((row) => {
      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=NGO_List.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
