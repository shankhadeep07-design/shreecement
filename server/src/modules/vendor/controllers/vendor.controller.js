var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");

const VendorModel = require("../../../models/vendor/vendor.model");

const DocumentModel = require("../../../models/documents/documents.model");
const {
  saveAndPrepareDocumentMetadata,
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const { isEmpty } = require("../../../helpers/common.helper");
const User = require("../../../models/users/user.model");

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
      })
    );
  }
};

module.exports.fetch_vendor_datatable = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;

    var sql = `
          SELECT 
    t_vendor.*, 
      creator.name AS tvendor_created_by_name,
    COALESCE(docs.documents, '[]'::json) AS documents

FROM t_vendor
LEFT JOIN LATERAL (
    SELECT json_agg(
        to_jsonb(td) ||
        jsonb_build_object(
            'full_url', '${file_url}' || td.doc_path
        )
    ) AS documents
    FROM t_documents td
    WHERE td.final_doc_id = t_vendor.tvendor_id
) docs ON true

LEFT JOIN users AS creator ON creator.id = t_vendor.tvendor_created_by`;

    // var where = ` t_block.tbl_is_active = 'true' `;

    var records = await Datatables.build(req, sql);

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

module.exports.createVendor = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const formData = req.body;
    const files = req.files || [];
    const creater_by = req?.user[0]?.id;
    let uploadedFilePaths = [];
    console.log("formData--------------- ", formData);
    console.log("files--------------- ", files);
    console.log("creater_by--------------- ", creater_by);
    // return;
    // Build requestData from formData
    const requestData = {
      ...(formData.tvendor_prospect_name && { tvendor_prospect_name: formData.tvendor_prospect_name }),
      ...(formData.tvendor_preferred_location && {
        tvendor_preferred_location: formData.tvendor_preferred_location,
      }),
      ...(formData.tvendor_additional_location && {
        tvendor_additional_location: formData.tvendor_additional_location,
      }),
      ...(formData.tvendor_state_id && {
        tvendor_state_id: formData.tvendor_state_id,
      }),
      ...(formData.tvendor_district_id && {
        tvendor_district_id: formData.tvendor_district_id,
      }),
      ...(formData.tvendor_block_id && {
        tvendor_block_id: formData.tvendor_block_id,
      }),
      ...(formData.tvendor_pin_code && {
        tvendor_pin_code: formData.tvendor_pin_code,
      }),
      ...(formData.tvendor_gst && {
        tvendor_gst: formData.tvendor_gst,
      }),
      ...(formData.tvendor_description_goods && {
        tvendor_description_goods: formData.tvendor_description_goods,
      }),
      ...(formData.tvendor_hsn_codes && {
        tvendor_hsn_codes: formData.tvendor_hsn_codes,
      }),
      ...(formData.tvendor_pan && {
        tvendor_pan:
          formData.tvendor_pan,
      }),
      ...(formData.tvendor_adhar && {
        tvendor_adhar: formData.tvendor_adhar,
      }),
      ...(formData.tvendor_msme && {
        tvendor_msme:
          formData.tvendor_msme,
      }),
      ...(formData.tvendor_statues && {
        tvendor_statues: formData.tvendor_statues,
      }),
      ...(formData.tvendor_msme_udyam && {
        tvendor_msme_udyam: formData.tvendor_msme_udyam,
      }),
      ...(formData.tvendor_cin && {
        tvendor_cin: formData.tvendor_cin,
      }),
      tvendor_office_phone1: formData.tvendor_office_phone1 || null,

      ...(formData.tvendor_office_phone2 && {
        tvendor_office_phone2: formData.tvendor_office_phone2,
      }),
      ...(formData.tvendor_work_phone1 && {
        tvendor_work_phone1: formData.tvendor_work_phone1,
      }),
      ...(formData.tvendor_work_phone2 && {
        tvendor_work_phone2: formData.tvendor_work_phone2,
      }),
      ...(formData.tvendor_office_fax1 && {
        tvendor_office_fax1:
          formData.tvendor_office_fax1,
      }),
      ...(formData.tvendor_office_fax2 && {
        tvendor_office_fax2: formData.tvendor_office_fax2,
      }),
      ...(formData.tvendor_work_fax_1 && {
        tvendor_work_fax_1: formData.tvendor_work_fax_1,
      }),
      ...(formData.tvendor_work_fax_2 && {
        tvendor_work_fax_2: formData.tvendor_work_fax_2,
      }),
      ...(formData.tvendor_email_1 && {
        tvendor_email_1: formData.tvendor_email_1,
      }),
      ...(formData.tvendor_email_2 && {
        tvendor_email_2: formData.tvendor_email_2,
      }),
      ...(formData.tvendor_contact_person_name && {
        tvendor_contact_person_name: formData.tvendor_contact_person_name,
      }),
      ...(formData.tvendor_contact_person_no && {
        tvendor_contact_person_no: formData.tvendor_contact_person_no,
      }),
      ...(formData.tvendor_relative_working && {
        tvendor_relative_working: formData.tvendor_relative_working,
      }),

         ...(formData.tvendor_relative_name && {
        tvendor_relative_name: formData.tvendor_relative_name,
      }),
      ...(formData.tvendor_relative_designation && {
        tvendor_relative_designation: formData.tvendor_relative_designation,
      }),
      ...(formData.tvendor_relative_location && {
        tvendor_relative_location: formData.tvendor_relative_location,
      }),
      ...(formData.tvendor_relative_mobile && {
        tvendor_relative_mobile: formData.tvendor_relative_mobile,
      }),
      ...(formData.tvendor_bank_name && {
        tvendor_bank_name: formData.tvendor_bank_name,
      }),
      ...(formData.tvendor_bank_branch && {
        tvendor_bank_branch: formData.tvendor_bank_branch,
      }),
      ...(formData.tvendor_bank_account_no && {
        tvendor_bank_account_no: formData.tvendor_bank_account_no,
      }),
      ...(formData.tvendor_bank_ifsc_code && {
        tvendor_bank_ifsc_code: formData.tvendor_bank_ifsc_code,
      }),
      ...(formData.tvendor_declaration && {
        tvendor_declaration: formData.tvendor_declaration,
      }),
      ...(formData.tvendor_bank_address && { tvendor_bank_address: formData.tvendor_bank_address }),
      ...(formData.tvendor_notes && {
        tvendor_notes: formData.tvendor_notes,
      }),
     
       tvendor_created_by: creater_by,
       tvendor_updated_by: creater_by,
    };

    // ✅ Save NGO
    let newVendor;
    if (formData. tvendor_id) {
      await VendorModel.update(requestData, {
        where: {  tvendor_id: formData. tvendor_id },
        transaction,
      });
      newVendor = await VendorModel.findOne({
        where: { tvendor_id: formData.tvendor_id },
        transaction,
      });
    } else {
      newVendor = await VendorModel.create(requestData, { transaction });
    }

    // ✅ Handle file uploads
    if (files?.length > 0) {
      const grouped = files.reduce((acc, file) => {
        (acc[file.fieldname] ||= []).push(file);
        return acc;
      }, {});

      // console.log("grouped", grouped);

      for (const [key, fileGroup] of Object.entries(grouped)) {
        if (key == "tvendor_vendor_regn_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } else if (key == "tvendor_pan_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } else if (key == "tvendor_aadhar_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } else if (key == "tvendor_msme_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } else if (key == "tvendor_cancelled_cheque_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } else if (key == "tvendor_cin_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } else if (key == "tvendor_tax_residence_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } else if (key == "tvendor_no_pe_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } else if (key == "tvendor_form_10_f_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } else if (key == "tvendor_address_proof_doc") {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newVendor?.tvendor_id,
              "uploads/vendor",
              creater_by,
              transaction
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        } 
      }
    }

    await transaction.commit();
    res.status(200).json({ success: true, data: newVendor });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in createVendor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.vendorDetails = async (req, res, next) => {
  try {
    const tvendor_id = req?.params?.id;
    const userId = req?.user?.[0]?.id;
    const file_url = process.env.SERVER_FILE_URL || "";

    if (!tvendor_id) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

  const sql = `
  SELECT
    v.*,

    /* ===== STATE / DISTRICT ===== */
    st.tsl_state_name,
    d.tdl_district_name,
    b.tbl_block_name,

    /* ===== DOCUMENTS ===== */
    (
      SELECT json_agg(
        to_jsonb(doc) ||
        jsonb_build_object('full_url', '${file_url}' || doc.doc_path)
      )
      FROM t_documents doc
      WHERE doc.final_doc_id = v.tvendor_id
    ) AS documents

  FROM t_vendor v
  LEFT JOIN t_state st ON st.tsl_state_id = v.tvendor_state_id
  LEFT JOIN t_district d ON d.tdl_district_id = v.tvendor_district_id
  LEFT JOIN t_block b ON b.tbl_block_id = v.tvendor_block_id
  WHERE v.tvendor_id = '${tvendor_id}'
  LIMIT 1;
`;

    const [event] = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "Vendor details fetched successfully",
      data: event || null,
    });
  } catch (err) {
    return next(
      CustomErrorHandler.internalServerError(
        err.message || "Failed to fetch event details"
      )
    );
  }
};


module.exports.vendorDetailsFunction = async (req, res, next) => {
  try {
    let file_url = process.env.SERVER_FILE_URL;
    const tvendor_id = req.body.tvendor_id;

    if (!tvendor_id) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

  const sql = `
SELECT 
    t_vendor.*, 
    creator.name AS tvendor_created_by_name,
    COALESCE(docs.documents, '[]'::json) AS documents

FROM t_vendor

LEFT JOIN LATERAL (
    SELECT json_agg(
        to_jsonb(td) ||
        jsonb_build_object(
            'full_url', '${file_url}' || td.doc_path
        )
    ) AS documents
    FROM t_documents td
    WHERE td.final_doc_id = t_vendor.tvendor_id
) docs ON true

LEFT JOIN users AS creator 
    ON creator.id = t_vendor.tvendor_created_by

WHERE t_vendor.tvendor_id = '${tvendor_id}'`;
;
    const vendorData = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "Vendor details fetched successfully",
      data: vendorData ? vendorData[0] : {},
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
