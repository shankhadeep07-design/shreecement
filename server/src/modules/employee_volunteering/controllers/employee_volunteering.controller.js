var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const SdgMasterModel = require("../../../models/priority_alignment/sdg.model");
const { Op } = require("sequelize");
const { saveUpdateAndPrepareDocumentMetadata } = require("../../../helpers/document.helper");
const DocumentModel = require("../../../models/documents/documents.model");
const EmpVolunteeringModel = require("../../../models/emo_volunteering/emp_volunteering.model");
const fs = require("fs/promises");
const { isEmpty, convertToSlug, cryptPassword } = require("../../../helpers/common.helper");
const RolesModel = require("../../../models/role/roles.model");
const User = require("../../../models/users/user.model");
const UserStateDistrictModel = require("../../../models/users/user_state_district.model");
module.exports.evDatatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_emp_volunteering`;

    var where = `t_emp_volunteering.tevol_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.employee_volunteer_listDatatable = async (req, res, next) => {
  try {
    var sql = `select users.*, t_roles.trl_role_name,user_woner.name as woner_name  from users 
    left join t_roles on t_roles.trl_role_id = users.role_id 
    left join users as user_woner on user_woner.id = users.created_by
    `;
    let where = `t_roles.trl_role_slug = 'employee_volunteer'`;
    var data = await Datatables.build(req, sql,where);
    res.json(data);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.createEmpVolunteering = async function (req, res, next) {
  try {
    let userId = req?.body?.payload?.id;
    const id = req?.params?.id;

    const {
      tevol_name,
      tevol_department,
      tevol_another_mem_no,
      tevol_another_mem_name,
      tevol_description,
    } = req.body;

    if (!tevol_name || !tevol_department || !userId) {
      return next(CustomErrorHandler.validationError("Missing required fields."));
    }

    // Check for duplicate name + department
    const duplicateCheck = await EmpVolunteeringModel.findOne({
      where: {
        tevol_name: { [Op.iLike]: tevol_name },
        tevol_department: { [Op.iLike]: tevol_department },
        ...(id && { tevol_id: { [Op.ne]: id } }), // exclude current ID in update case
      },
    });

    if (duplicateCheck) {
      return res.status(409).json({
        status: false,
        message: "Name and Department already exists.",
      });
    }

    if (id) {
      const existingRecord = await EmpVolunteeringModel.findOne({ where: { tevol_id: id } });

      if (!existingRecord) {
        return next(CustomErrorHandler.notFound("Record not found."));
      }

      await EmpVolunteeringModel.update(
        {
          tevol_name,
          tevol_department,
          tevol_another_mem_no,
          tevol_another_mem_name,
          tevol_description,
          tevol_updated_by: userId,
          tevol_updated_at: new Date()
        },
        { where: { tevol_id: id } }
      );

      return res.json({
        status: true,
        message: "Emp Volunteering updated successfully.",
      });

    } else {
      const newRecord = await EmpVolunteeringModel.create({
        tevol_name,
        tevol_department,
        tevol_another_mem_no,
        tevol_another_mem_name,
        tevol_description,
        tevol_created_by: userId,
        tevol_updated_by: userId
        // timestamps handled by DB
      });

      return res.json({
        status: true,
        message: "Emp Volunteering created successfully.",
        data: newRecord,
      });
    }
  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};



// module.exports.create_update_user_fun = async (req, res, next) => {
//   const id = !isEmpty(req?.body?.user_id) && req?.body?.user_id;
//   const formData = req?.body;

//   const creater_id = req.body.payload.id;

//   console.log("req.body------------- ",req.body);
//   // return;
  

//   const RolesDetails = await RolesModel.findOne({ where: { trl_role_slug: 'employee_volunteer' } });

//   const requestData = {
//     ...(!isEmpty(formData.name) && { name: formData.name }),
//     ...(!isEmpty(formData.email) && { email: formData.email }),
//     ...(!isEmpty(formData.phone) && { phone: formData.phone }),
//     ...(!isEmpty(formData.status) && { status: formData.status }),
//     // ...(!isEmpty(formData.vertical_id) && {vertical_id: formData.vertical_id}),
//     // ...(!isEmpty(formData.region_id) && {region_id: formData.region_id}),
//     // ...(!isEmpty(formData.company_sub_maser_id) && {company_sub_maser_id: formData.company_sub_maser_id,}),
//     role_id : RolesDetails?.trl_role_id,
//     name_slug: convertToSlug(formData.name) || "",
//     // ngo_id: ngo_id,
//     user_type: "employee_volunteer",
//   };

//   if (Object.keys(requestData).length > 0) {
//     if (!id) {
//       if (requestData.email) {
//         const where = {
//           where: {
//             email: requestData.email,
//             ...(id && { id: { [Op.not]: id } }),
//           },
//         };

//         try {
//           const existingUser = await User.findOne(where);
//           // if (existingUser) {
//           //   return next(CustomErrorHandler.validationError("Email is already in use."));
//           // }

//           const password = formData.password;
//           if (!password) {
//             return res.json({
//               status: 0,
//               message: "Please add password.",
//             });
//           }

//           const hashedPassword = await new Promise((resolve, reject) => {
//             cryptPassword(password, (err, hash) => {
//               if (err) return reject(err);
//               resolve(hash);
//             });
//           });

//           requestData.password = hashedPassword;
//           requestData.created_by = creater_id;
//           const newUser = await User.create(requestData);

//           // Extract state_district_blocks from formData
//           const state_district_blocks = formData.state_district_blocks || [];

//           for (const data_of_st of state_district_blocks) {
//             await UserStateDistrictModel.create({
//               tus_user_id: newUser.id,
//               tus_state_id: data_of_st.state_id, // Adjust if `state_id` is named differently
//               tus_district_id: data_of_st.district_id,
//               tus_created_by: creater_id,
//               tus_updated_by: creater_id,
//             });
//           }

//           res.json({
//             status: 1,
//             message: "User created and districts updated successfully",
//           });
//         } catch (err) {
//           next(CustomErrorHandler.internalServerError(err));
//         }
//       }
//     } else {
//       if (req.body.password !== undefined) {
//         const password = req.body.password;

//         try {
//           const hashedPassword = await new Promise((resolve, reject) => {
//             cryptPassword(password, (err, hash) => {
//               if (err) return reject(err);
//               resolve(hash);
//             });
//           });

//           requestData.password = hashedPassword;
//         } catch (err) {
//           return next(CustomErrorHandler.internalServerError(err));
//         }
//       }

//       try {
//          requestData.updated_by = creater_id;
//         await User.update(requestData, { where: { id } });

//         // Update records in t_user_state_district
//         await UserStateDistrictModel.destroy({ where: { tus_user_id: id } }); // Remove old districts

//         // Extract state_district_blocks from formData
//         const state_district_blocks = formData.state_district_blocks || [];
//         // console.log(state_district_blocks);
//         for (const data_of_st of state_district_blocks) {
//           await UserStateDistrictModel.create({
//             tus_user_id: id,

//             tus_state_id: data_of_st.state_id, // Adjust if `state_id` is named differently
//             tus_district_id: data_of_st.district_id,
//             tus_created_by: creater_id,
//             tus_updated_by: creater_id,
//           });
//         }

//         res.json({
//           status: 1,
//           message: "User updated and districts updated successfully",
//         });
//       } catch (err) {
//         next(CustomErrorHandler.databaseError(err));
//       }
//     }
//   } else {
//     next(CustomErrorHandler.validationError("Request body required."));
//   }
// };



module.exports.create_update_user_fun = async (req, res, next) => {
  const id = !isEmpty(req?.body?.user_id) && req?.body?.user_id;
  const formData = req?.body;
  const creater_id = req.body.payload.id;

  try {
    /* ================= ROLE FETCH ================= */
    const RolesDetails = await RolesModel.findOne({
      where: { trl_role_slug: "employee_volunteer" }
    });

    if (!RolesDetails) {
      return res.json({
        status: 0,
        message: "Role not found"
      });
    }

    /* ================= REQUEST DATA ================= */
    const requestData = {
      ...(!isEmpty(formData.name) && { name: formData.name }),
      ...(!isEmpty(formData.email) && { email: formData.email }),
      ...(!isEmpty(formData.phone) && { phone: formData.phone }),
      ...(!isEmpty(formData.status) && { status: formData.status }),
      role_id: RolesDetails.trl_role_id,
      name_slug: convertToSlug(formData.name) || "",
      user_type: "employee_volunteer"
    };

    if (Object.keys(requestData).length === 0) {
      return next(CustomErrorHandler.validationError("Request body required."));
    }

    /* =================================================
       =============== CREATE USER =====================
       ================================================= */
    if (!id) {

      /* ===== Email check ===== */
      if (!requestData.email) {
        return res.json({
          status: 0,
          message: "Email is required"
        });
      }

      const existingUser = await User.findOne({
        where: { email: requestData.email }
      });

      if (existingUser) {
        return res.json({
          status: 0,
          message: "Email is already in use."
        });
      }

      /* ===== Password check ===== */
      if (!formData.password) {
        return res.json({
          status: 0,
          message: "Please add password."
        });
      }

      const hashedPassword = await new Promise((resolve, reject) => {
        cryptPassword(formData.password, (err, hash) => {
          if (err) return reject(err);
          resolve(hash);
        });
      });

      requestData.password = hashedPassword;
      requestData.created_by = creater_id;

      const newUser = await User.create(requestData);

      /* ===== State / District mapping ===== */
      const state_district_blocks = formData.state_district_blocks || [];

      for (const data of state_district_blocks) {
        await UserStateDistrictModel.create({
          tus_user_id: newUser.id,
          tus_state_id: data.state_id,
          tus_district_id: data.district_id,
          tus_created_by: creater_id,
          tus_updated_by: creater_id
        });
      }

      return res.json({
        status: 1,
        message: "User created successfully"
      });
    }

    /* =================================================
       =============== UPDATE USER =====================
       ================================================= */

    /* ===== Email check (exclude current user) ===== */
    if (requestData.email) {
      const existingUser = await User.findOne({
        where: {
          email: requestData.email,
          id: { [Op.not]: id }
        }
      });

      if (existingUser) {
        return res.json({
          status: 0,
          message: "Email is already in use by another user."
        });
      }
    }

    /* ===== Password update ===== */
    if (formData.password !== undefined) {
      const hashedPassword = await new Promise((resolve, reject) => {
        cryptPassword(formData.password, (err, hash) => {
          if (err) return reject(err);
          resolve(hash);
        });
      });

      requestData.password = hashedPassword;
    }

    requestData.updated_by = creater_id;

    await User.update(requestData, { where: { id } });

    /* ===== Refresh State / District mapping ===== */
    await UserStateDistrictModel.destroy({
      where: { tus_user_id: id }
    });

    const state_district_blocks = formData.state_district_blocks || [];

    for (const data of state_district_blocks) {
      await UserStateDistrictModel.create({
        tus_user_id: id,
        tus_state_id: data.state_id,
        tus_district_id: data.district_id,
        tus_created_by: creater_id,
        tus_updated_by: creater_id
      });
    }

    return res.json({
      status: 1,
      message: "User updated successfully"
    });

  } catch (err) {
    console.error("Create/Update User Error:", err);
    return next(CustomErrorHandler.internalServerError(err));
  }
};
