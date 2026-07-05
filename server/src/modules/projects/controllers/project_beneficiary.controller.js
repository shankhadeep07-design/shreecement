const { isEmpty } = require("../../../helpers/common.helper");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes, Op } = require("sequelize");
const BeneficiaryMasterModel = require("../../../models/projects/projects_beneficiary_master.model");
const ProjectBeneficiaryModel = require("../../../models/projects/projects_beneficiary.model");
const Datatables = require("../../../service/DatatableService");

// module.exports.createProjectBeneficiary = async (req, res, next) => {
//   let transaction;
//   transaction = await sequelize.transaction();

//   try {
//     const formData = req.body;
//     const userId = req?.user?.[0]?.id || 0;

//     // console.log("req.body (beneficiary)=------------- ", formData);
//     // return;
//     let tbenId = formData.tben_id || null;

//     // ✅ Prepare beneficiary data
//     const beneficiaryData = {
//       tben_name: formData.tben_name ?? "",
//       tben_phone: formData.tben_phone ?? "",
//       tben_gender: formData.tben_gender ?? "",
//       tben_age: formData.tben_age ?? "",
//       tben_unique_no: formData.tben_unique_no ?? "",
//       tben_state_id: formData.tben_state_id ?? "",
//       tben_district_id: formData.tben_district_id ?? "",
//       tben_block_id: formData.tben_block_id ?? "",
//       tben_village_id: formData.tben_village_id ?? "",
//       tben_dob: formData.tben_dob ?? "",
//       tben_unique_key: formData.tben_unique_key ?? "",
//       tben_cumulative: formData.tben_cumulative ?? "",
//       tben_description: formData.tben_description ?? "",
//       tben_type: formData.tben_type ?? "",
//       tben_created_by: userId,
//       tben_updated_by: userId,
//     };

//     let newBeneficiary;

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
//       // ✅ Create case
//       newBeneficiary = await BeneficiaryMasterModel.create(beneficiaryData, {
//         transaction,
//       });
//       tbenId = newBeneficiary.tben_id;
//     }

//     // ✅ Link beneficiary to project
//     if (formData.tpben_project_id) {
//       const projectBeneficiaryData = {
//         tpben_project_id: formData.tpben_project_id,
//         tpben_beneficiary_id: tbenId,
//         tpben_created_by: userId,
//         tpben_updated_by: userId,
//       };

//       await ProjectBeneficiaryModel.create(projectBeneficiaryData, {
//         transaction,
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

// module.exports.createProjectBeneficiary = async (req, res, next) => {
//   let transaction;
//   transaction = await sequelize.transaction();

//   try {
//     const formData = req.body;
//     const userId = req?.user?.[0]?.id || 0;

//     let tbenId = formData.tben_id || null;

//     // ✅ sanitize helper
//     const toStringOrEmpty = (val) =>
//       val !== undefined && val !== null ? String(val) : "";
//     const toIntOrNull = (val) =>
//       val !== undefined && val !== null && val !== ""
//         ? parseInt(val, 10)
//         : null;
//     const toDateOrNull = (val) =>
//       val && val !== "Invalid date" ? new Date(val) : null;

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
//       tben_dob: toDateOrNull(formData.tben_dob),
//       tben_unique_key: toStringOrEmpty(formData.tben_unique_key),
//       tben_cumulative: toIntOrNull(formData.tben_cumulative),
//       tben_description: toStringOrEmpty(formData.tben_description),
//       tben_type: toStringOrEmpty(formData.tben_type),
//       tben_updated_by: userId,
//       ...(tbenId ? {} : { tben_created_by: userId }),
//     };

//     let newBeneficiary;

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
//       // ✅ Create case
//       newBeneficiary = await BeneficiaryMasterModel.create(beneficiaryData, {
//         transaction,
//       });
//       tbenId = newBeneficiary.tben_id;
//     }

//     // ✅ Link beneficiary to project
//     if (formData.tpben_project_id) {
//       const projectBeneficiaryData = {
//         tpben_project_id: formData.tpben_project_id,
//         tpben_beneficiary_id: tbenId,
//         tpben_created_by: userId,
//         tpben_updated_by: userId,
//       };

//       await ProjectBeneficiaryModel.create(projectBeneficiaryData, {
//         transaction,
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

// module.exports.createProjectBeneficiary = async (req, res, next) => {
//   let transaction;
//   transaction = await sequelize.transaction();

//   try {
//     const formData = req.body;
//     const userId = req?.user?.[0]?.id || 0;

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

//     // ✅ Always include all fields, sanitize properly
//     const beneficiaryData = {
//       tpben_beneficiary_id: toStringOrEmpty(formData.tpben_beneficiary_id),
//       tben_name: toStringOrEmpty(formData.tben_name),
//       tben_phone: toStringOrEmpty(formData.tben_phone),
//       tben_gender: toStringOrEmpty(formData.tben_gender),
//       tben_age: toIntOrNull(formData.tben_age),
//       tben_unique_no: toStringOrEmpty(formData.tben_unique_no),
//       tben_state_id: toStringOrEmpty(formData.tben_state_id),
//       tben_district_id: toStringOrEmpty(formData.tben_district_id),
//       tben_block_id: toStringOrEmpty(formData.tben_block_id),
//       tben_village_id: toStringOrEmpty(formData.tben_village_id),
//       tben_dob: toDateOrNull(formData.tben_dob),
//       tben_unique_key: toStringOrEmpty(formData.tben_unique_key),
//       tben_cumulative: toIntOrNull(formData.tben_cumulative),
//       tben_description: toStringOrEmpty(formData.tben_description),
//       tben_type: toStringOrEmpty(formData.tben_type),
//       tben_updated_by: userId,
//       ...(tbenId ? {} : { tben_created_by: userId }),
//     };

//     let newBeneficiary;

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
//       // ✅ Generate tben_unique_no and tben_unique_key for new beneficiary
//       let nextUniqueNo = 1;

//       // Find max tben_unique_no for current FY
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

//     // ✅ Link beneficiary to project (Create or Update)
//     if (formData.tpben_project_id) {
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
//         // ✅ Update case
//         await existingLink.update(projectBeneficiaryData, { transaction });
//       } else {
//         // ✅ Create case
//         await ProjectBeneficiaryModel.create(
//           {
//             ...projectBeneficiaryData,
//             tpben_created_by: userId,
//           },
//           { transaction }
//         );
//       }
//     }

//     await transaction.commit();

//     return res.status(201).json({
//       message: tbenId
//         ? "Beneficiary created/updated successfully"
//         : "Beneficiary created successfully",
//       data: newBeneficiary,
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


module.exports.createProjectBeneficiary = async (req, res, next) => {
  let transaction;
  transaction = await sequelize.transaction();

  try {
    const formData = req.body;
    const userId = req?.user?.[0]?.id || 0;

    let tbenId = formData.tben_id || null;

    // ✅ sanitize helpers
    const toStringOrEmpty = (val) =>
      val !== undefined && val !== null ? String(val) : "";
    const toIntOrNull = (val) =>
      val !== undefined && val !== null && val !== ""
        ? parseInt(val, 10)
        : null;
    const toDateOrNull = (val) =>
      val && val !== "Invalid date" ? new Date(val) : null;

    let newBeneficiary;

    // --------------------------
    // CASE 1: EXISTING BENEFICIARY
    // --------------------------
    if (formData.tben_type === "existing_beneficiary") {
      if (!formData.tpben_beneficiary_id || !formData.tpben_project_id) {
        throw new Error("Existing Beneficiary and Project ID are required");
      }

      const projectBeneficiaryData = {
        tpben_project_id: formData.tpben_project_id,
        tpben_beneficiary_id: formData.tpben_beneficiary_id,
        tpben_updated_by: userId,
      };

      const existingLink = await ProjectBeneficiaryModel.findOne({
        where: {
          tpben_project_id: formData.tpben_project_id,
          tpben_beneficiary_id: formData.tpben_beneficiary_id,
        },
        transaction,
      });

      if (existingLink) {
        await existingLink.update(projectBeneficiaryData, { transaction });
      } else {
        await ProjectBeneficiaryModel.create(
          { ...projectBeneficiaryData, tpben_created_by: userId },
          { transaction }
        );
      }

      await transaction.commit();
      return res.status(201).json({
        message: "Existing beneficiary linked to project successfully",
        status: true,
      });
    }

    // --------------------------
    // CASE 2 & 3: NEW BENEFICIARY / GROUP
    // --------------------------

    // ✅ Always include all fields, sanitize properly
    const beneficiaryData = {
      tben_name: toStringOrEmpty(formData.tben_name),
      tben_phone: toStringOrEmpty(formData.tben_phone),
      tben_gender: toStringOrEmpty(formData.tben_gender),
      tben_age: toIntOrNull(formData.tben_age),
      tben_unique_no: toStringOrEmpty(formData.tben_unique_no),
      tben_state_id: toStringOrEmpty(formData.tben_state_id),
      tben_district_id: toStringOrEmpty(formData.tben_district_id),
      tben_block_id: toStringOrEmpty(formData.tben_block_id),
      tben_village_id: toStringOrEmpty(formData.tben_village_id),
      tben_dob: toDateOrNull(formData.tben_dob),
      tben_unique_key: toStringOrEmpty(formData.tben_unique_key),
      tben_cumulative: toIntOrNull(formData.tben_cumulative),
      tben_description: toStringOrEmpty(formData.tben_description),
      tben_type: toStringOrEmpty(formData.tben_type),
      tben_updated_by: userId,
      ...(tbenId ? {} : { tben_created_by: userId }),
    };

    if (tbenId) {
      // ✅ Update case
      await BeneficiaryMasterModel.update(beneficiaryData, {
        where: { tben_id: tbenId },
        transaction,
      });
      newBeneficiary = await BeneficiaryMasterModel.findOne({
        where: { tben_id: tbenId },
        transaction,
      });
    } else {
      // ✅ Generate tben_unique_no and tben_unique_key for new/group beneficiary
      let nextUniqueNo = 1;

      const lastBeneficiary = await BeneficiaryMasterModel.findOne({
        where: {
          tben_unique_no: { [Op.ne]: null }, // not null
        },
        order: [["tben_unique_no", "DESC"]],
        transaction,
      });

      if (lastBeneficiary && lastBeneficiary.tben_unique_no) {
        nextUniqueNo = parseInt(lastBeneficiary.tben_unique_no, 10) + 1;
      }

      const uniqueKey = `coromandel/${nextUniqueNo}/${formData.tpben_fy_id}`;

      beneficiaryData.tben_unique_no = String(nextUniqueNo);
      beneficiaryData.tben_unique_key = uniqueKey;

      // ✅ Create case
      newBeneficiary = await BeneficiaryMasterModel.create(beneficiaryData, {
        transaction,
      });
      tbenId = newBeneficiary.tben_id;
    }

    // ✅ Link beneficiary to project (for new or group)
    if (formData.tpben_project_id) {
      const projectBeneficiaryData = {
        tpben_project_id: formData.tpben_project_id,
        tpben_beneficiary_id: tbenId,
        tpben_updated_by: userId,
      };

      const existingLink = await ProjectBeneficiaryModel.findOne({
        where: {
          tpben_project_id: formData.tpben_project_id,
          tpben_beneficiary_id: tbenId,
        },
        transaction,
      });

      if (existingLink) {
        await existingLink.update(projectBeneficiaryData, { transaction });
      } else {
        await ProjectBeneficiaryModel.create(
          { ...projectBeneficiaryData, tpben_created_by: userId },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return res.status(201).json({
      message: tbenId
        ? "Beneficiary created/updated successfully"
        : "Beneficiary created successfully",
      data: newBeneficiary,
      status: true,
    });
  } catch (err) {
    console.error(err);
    if (transaction) await transaction.rollback();
    next(
      CustomErrorHandler.internalServerError({
        message: err.message,
        stack: err.stack,
      })
    );
  }
};


module.exports.projects_beneficiary_datatable = async (req, res, next) => {
  try {
    const tproj_id = req.params.tproj_id;
    console.log("tproj_id--------- ",tproj_id);
    
    var sql = `
          select  t_beneficiary_master.*,
          t_project_beneficiary.*,
          t_state.tsl_state_name,
          t_district.tdl_district_name,
          t_block.tbl_block_name,
          t_location.tloc_location_name,
          t_sub_master_list.tsml_sub_master_list_name AS gender_name
          
          from t_project_beneficiary
          LEFT JOIN t_beneficiary_master ON t_beneficiary_master.tben_id = t_project_beneficiary.tpben_beneficiary_id
          LEFT JOIN t_state ON t_state.tsl_state_id = t_beneficiary_master.tben_state_id
          LEFT JOIN t_district ON t_district.tdl_district_id = t_beneficiary_master.tben_district_id
          LEFT JOIN t_block ON t_block.tbl_block_id = t_beneficiary_master.tben_block_id
          LEFT JOIN t_location ON t_location.tloc_location_id = t_beneficiary_master.tben_village_id
          LEFT JOIN t_sub_master_list ON t_sub_master_list.tsml_id = t_beneficiary_master.tben_gender
          `;

   let where = ` t_project_beneficiary.tpben_project_id = '${tproj_id}' `;


    var records = await Datatables.build(req, sql,where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.projects_beneficiary_all_lists = async (req, res, next) => {
  try {


    const sql = `
       select  t_beneficiary_master.*,
          t_project_beneficiary.*,
          t_state.tsl_state_name,
          t_district.tdl_district_name,
          t_block.tbl_block_name,
          t_location.tloc_location_name,
          t_sub_master_list.tsml_sub_master_list_name AS gender_name
          
          from t_beneficiary_master
          LEFT JOIN t_project_beneficiary ON t_project_beneficiary.tpben_id = t_beneficiary_master.tben_id
          LEFT JOIN t_state ON t_state.tsl_state_id = t_beneficiary_master.tben_state_id
          LEFT JOIN t_district ON t_district.tdl_district_id = t_beneficiary_master.tben_district_id
          LEFT JOIN t_block ON t_block.tbl_block_id = t_beneficiary_master.tben_block_id
          LEFT JOIN t_location ON t_location.tloc_location_id = t_beneficiary_master.tben_village_id
          LEFT JOIN t_sub_master_list ON t_sub_master_list.tsml_id = t_beneficiary_master.tben_gender
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

module.exports.project_beneficiary_details_fun = async (req, res, next) => {
  try {
    const { beneficiary_id } = req.params;

    const projectBeneficiary = await ProjectBeneficiaryModel.findOne({
      where: {
        beneficiary_id,
      },
    });
    return res.status(200).json({
      status: true,
      message: "Project Beneficiary fetched successfully",
      data: projectBeneficiary,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
