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


module.exports.createRegNgo = async (req, res) => {
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
          register_from: "ngo_out_registration",
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
          register_from: "ngo_out_registration",
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


