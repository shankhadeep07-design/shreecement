const { sequelize } = require('../../../config/db');
const { isEmpty, convertToSlug, cryptPassword } = require('../../../helpers/common.helper');
const User = require('../../../models/users/user.model');
const UserStateDistrictModel = require('../../../models/users/user_state_district.model');
const CustomErrorHandler = require('../../../service/CustomErrorHandler');
const Datatables = require('../../../service/DatatableService');
const { getAllUsers, getUserById } = require('../services/user.service');
const { QueryTypes } = require("sequelize");
const bcrypt = require('bcryptjs');
const RolesModel = require('../../../models/role/roles.model');
const { Op } = require("sequelize");

const fetchAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const fetchUserById = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listUsers = async (req, res, next) => {
  try {

    var sql = `select * from users left join t_roles on t_roles.trl_role_id = users.role_id`;


    var data = await Datatables.build(req, sql);
    res.json(data);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

const getExcelExportUserList = async (req, res, next) => {
  try {
    var sql = `select * from users left join t_roles on t_roles.trl_role_id = users.role_id`;
    const data = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })

    res.json({
      status: 1,
      message: "Users List",
      data: data // Sending the created ID in the response
    });
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


// const createUser = async (req, res, next) => {
//   try {
//     const id = !isEmpty(req?.body?.id) ? req.body.id : null;
//     const formData = req.body;
//     const creater_id = req.body.payload.id;
//     const { factory_ids = [] } = req.body;


    

//     const factory_id =
//       Array.isArray(factory_ids) && factory_ids.length
//         ? factory_ids.join(',') // ✅ CSV
//         : null;

//     /* ---------------- ROLE DETAILS ---------------- */
//     const RolesDetails = await RolesModel.findOne({
//       where: { trl_role_id: formData.role_id },
//     });

//     /* ---------------- USER DATA ---------------- */
//     const requestData = {
//       ...(!isEmpty(formData.name) && { name: formData.name }),
//       ...(!isEmpty(formData.email) && { email: formData.email }),
//       ...(!isEmpty(formData.phone) && { phone: formData.phone }),
//       ...(!isEmpty(formData.status) && { status: formData.status }),
//       ...(!isEmpty(formData.role_id) && { role_id: formData.role_id }),
//       ...(factory_id && { factory_id }),

//       name_slug: convertToSlug(formData.name) || '',
//       user_type: RolesDetails?.trl_role_slug,
//     };

//     if (!Object.keys(requestData).length) {
//       return next(CustomErrorHandler.validationError("Request body required."));
//     }

//     /* ====================================================
//        =================== CREATE USER ====================
//        ==================================================== */
//     if (!id) {


//       /* --------- DUPLICATE CHECK --------- */


//       const where = {
//         where: {
//           [Op.or]: [
//             requestData.email && { email: requestData.email },
//             requestData.phone && { phone: requestData.phone },
//           ].filter(Boolean),
//         },
//       };

//       const existingUser = await User.findOne(where);

//       if (existingUser) {
//         if (existingUser.email === requestData.email) {
//           return res.json({ status: 0, message: "Email already existing." });
//         }
//         if (existingUser.phone === requestData.phone) {
//           return res.json({ status: 0, message: "Phone number already existing." });
//         }
//       }

//       /* --------- PASSWORD --------- */
//       if (!formData.password) {
//         return res.json({ status: 0, message: "Please add password." });
//       }

//       requestData.password = await new Promise((resolve, reject) => {
//         cryptPassword(formData.password, (err, hash) =>
//           err ? reject(err) : resolve(hash)
//         );
//       });

//       requestData.created_by = creater_id;

//       const newUser = await User.create(requestData);

//       /* --------- STATE / DISTRICT / BLOCK MAPPING --------- */

//       const state_district_blocks = formData.state_district_blocks || [];



//       // Prepare rows for bulk insert
//       const rows = [];
//       for (const state of state_district_blocks) {
//         // Use 'value' from frontend object instead of .trim()
//         const stateId = state.state_id;
//         if (!stateId) continue;
//         for (const district of state.districts || []) {
//           const districtId = district.district_id;
//           if (!districtId) continue;
//           for (const block of district.sub_district_ids || []) {
//             // block can also be object { value, label } from MultiSelect
//             const blockId = block;
//             if (!blockId) continue;
//             rows.push({
//               tus_user_id: Number(id || newUser.id),
//               tus_state_id: stateId,
//               tus_district_id: districtId,
//               tus_block_id: blockId,
//               tus_created_by: Number(creater_id),
//               tus_updated_by: Number(creater_id),
//             });
//           }
//         }
//       }
//       if (rows.length) {
//         await UserStateDistrictModel.bulkCreate(rows);
//       }
//       return res.json({ status: 1, message: "User created." });
//     }

//     /* ====================================================
//        =================== UPDATE USER ====================
//        ==================================================== */
//     if (req.body.password !== undefined) {
//       requestData.password = await new Promise((resolve, reject) => {
//         cryptPassword(req.body.password, (err, hash) =>
//           err ? reject(err) : resolve(hash)
//         );
//       });
//     }

//     requestData.updated_by = creater_id;
//     await User.update(requestData, { where: { id } });

//     /* --------- CLEAR OLD MAPPINGS --------- */
//     await UserStateDistrictModel.destroy({
//       where: { tus_user_id: id },
//     });
//     /* --------- RE-INSERT NEW MAPPINGS --------- */
//     const state_district_blocks = formData.state_district_blocks || [];
//     // Prepare rows for bulk insert
//     const rows = [];

//     for (const state of state_district_blocks) {
//       // Use 'value' from frontend object instead of .trim()
//       const stateId = state.state_id;
//       if (!stateId) continue;
//       for (const district of state.districts || []) {
//         const districtId = district.district_id;
//         if (!districtId) continue;
//         for (const block of district.sub_district_ids || []) {
//           // block can also be object { value, label } from MultiSelect
//           const blockId = block;
//           if (!blockId) continue;
//           rows.push({
//             tus_user_id: Number(id || newUser.id),
//             tus_state_id: stateId,
//             tus_district_id: districtId,
//             tus_block_id: blockId,
//             tus_created_by: Number(creater_id),
//             tus_updated_by: Number(creater_id),
//           });

//         }
//       }
//     }
//     if (rows.length) {
//       await UserStateDistrictModel.bulkCreate(rows);
//     }

//     return res.json({ status: 1, message: "User updated." });

//   } catch (err) {
//     next(CustomErrorHandler.internalServerError(err));
//   }
// };

const createUser = async (req, res, next) => {
  try {
    const id = !isEmpty(req?.body?.id) ? req.body.id : null;
    const formData = req.body;
    const creater_id = req.body.payload.id;
    const { unit_ids = [] } = req.body;


    const cleanName = formData.name ? formData.name.trim() : '';
    const cleanEmail = formData.email ? formData.email.trim().toLowerCase() : '';

    const factory_id =
      Array.isArray(unit_ids) && unit_ids.length
        ? unit_ids.join(',')
        : null;

    /* ---------------- ROLE DETAILS ---------------- */
    const RolesDetails = await RolesModel.findOne({
      // where: { trl_role_id: formData.role_id },
            where: { trl_role_id: 'trl0000000013' }, // TEMPORARY FIX - ASSUMING ALL USERS ARE OF SAME ROLE, REPLACE WITH ABOVE LINE WHEN ROLE SELECTION ADDED IN UI

    });

    /* ---------------- USER DATA ---------------- */
    const requestData = {
      ...(!isEmpty(cleanName) && { name: cleanName }),
      ...(!isEmpty(cleanEmail) && { email: cleanEmail }),
      ...(!isEmpty(formData.phone) && { phone: formData.phone }),
      ...(!isEmpty(formData.status) && { status: formData.status }),
      ...(!isEmpty(formData.role_id) && { role_id: formData.role_id }),
      ...(factory_id && { unit_id: factory_id }),

      name_slug: convertToSlug(cleanName) || '',
      user_type: RolesDetails?.trl_role_slug,
    };

    if (!Object.keys(requestData).length) {
      return next(CustomErrorHandler.validationError("Request body required."));
    }

    /* ====================================================
       =================== CREATE USER ====================
       ==================================================== */
    if (!id) {

      /* --------- DUPLICATE CHECK --------- */
      const where = {
        where: {
          [Op.or]: [
            cleanEmail && { email: cleanEmail },
            formData.phone && { phone: formData.phone },
          ].filter(Boolean),
        },
      };

      const existingUser = await User.findOne(where);

      if (existingUser) {
        if (existingUser.email === cleanEmail) {
          return res.json({ status: 0, message: "Email already existing." });
        }
        if (existingUser.phone === formData.phone) {
          return res.json({ status: 0, message: "Phone number already existing." });
        }
      }

      /* --------- PASSWORD --------- */
      if (!formData.password) {
        return res.json({ status: 0, message: "Please add password." });
      }

      requestData.password = await new Promise((resolve, reject) => {
        cryptPassword(formData.password, (err, hash) =>
          err ? reject(err) : resolve(hash)
        );
      });

      requestData.created_by = creater_id;
      requestData.updated_by = creater_id;  // ✅ ADD THIS

      const newUser = await User.create(requestData);

      /* --------- STATE / DISTRICT MAPPING --------- */
      const state_district_blocks = formData.state_district_blocks || [];

      const rows = [];
      for (const state of state_district_blocks) {
        const stateId = state.state_id;
        if (!stateId) continue;
        for (const district of state.districts || []) {
          const districtId = district.district_id;
          if (!districtId) continue;
          rows.push({
            tus_user_id: Number(newUser.id),
            tus_state_id: stateId,
            tus_district_id: districtId,
            tus_block_id: null,
            tus_created_by: Number(creater_id),
            tus_updated_by: Number(creater_id),
          });
        }
      }

      if (rows.length) {
        await UserStateDistrictModel.bulkCreate(rows);
      }

      return res.json({ status: 1, message: "User created." });
    }

    /* ====================================================
       =================== UPDATE USER ====================
       ==================================================== */

    if (req.body.password !== undefined) {
      requestData.password = await new Promise((resolve, reject) => {
        cryptPassword(req.body.password, (err, hash) =>
          err ? reject(err) : resolve(hash)
        );
      });
    }

    requestData.updated_by = creater_id;
    requestData.updated_at = new Date();  // ✅ ADD THIS

    await User.update(requestData, { where: { id } });

    /* --------- CLEAR OLD MAPPINGS --------- */
    await UserStateDistrictModel.destroy({
      where: { tus_user_id: id },
    });

    /* --------- RE-INSERT NEW MAPPINGS --------- */
    const state_district_blocks = formData.state_district_blocks || [];
    const rows = [];

    for (const state of state_district_blocks) {
      const stateId = state.state_id;
      if (!stateId) continue;
      for (const district of state.districts || []) {
        const districtId = district.district_id;
        if (!districtId) continue;
        rows.push({
          tus_user_id: Number(id),
          tus_state_id: stateId,
          tus_district_id: districtId,
          tus_block_id: null,
          tus_created_by: Number(creater_id),
          tus_updated_by: Number(creater_id),
        });
      }
    }

    if (rows.length) {
      await UserStateDistrictModel.bulkCreate(rows);
    }

    return res.json({ status: 1, message: "User updated." });

  } catch (err) {
    next(CustomErrorHandler.internalServerError(err));
  }
};


const userDetails = async (req, res, next) => {
  var id = !isEmpty(req.params.id) && req.params.id;

  if (id) {


    var sql = `
SELECT
  u.id,
  u.id AS user_id,
  u.name,
  u.email,
  u.phone,
  u.status,
  u.role_id,
  u.unit_id AS unit_ids,

  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object(
      'state_id', TRIM(BOTH FROM usd.tus_state_id),
      'state_name', s.tsl_state_name
    ))
    FROM public.t_user_state_district usd
    JOIN public.t_state s 
      ON usd.tus_state_id = s.tsl_state_id
    WHERE usd.tus_user_id = u.id
  ) AS states,

  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object(
      'district_id', TRIM(BOTH FROM usd.tus_district_id),
      'district_name', d.tdl_district_name,
      'stateId', d.tdl_state_id
    ))
    FROM public.t_user_state_district usd
    JOIN public.t_district d 
      ON usd.tus_district_id = d.tdl_district_id
    WHERE usd.tus_user_id = u.id
  ) AS districts,

  (
    SELECT jsonb_agg(DISTINCT jsonb_build_object(
      'districtId', TRIM(BOTH FROM usd.tus_district_id),
      'sub_district_id', TRIM(BOTH FROM usd.tus_block_id),
      'sub_district_name', b.tbl_block_name
    ))
    FROM public.t_user_state_district usd
    JOIN public.t_block b 
      ON usd.tus_block_id = b.tbl_block_id
    WHERE usd.tus_user_id = u.id
  ) AS sub_districts

FROM public.users u
WHERE u.id = '${id}';
`;



    const user = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.json({ status: 1, data: user, message: "User details" });
  } else {
    return res.json({
      status: 0,
      message: "Invalid user id.",
    });
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { old_password, new_password, confirm_password } = req?.body;
    const userId = req.body?.payload?.id; // authenticated user ID

    if (!old_password || !new_password || !confirm_password) {
      return res.status(200).json({ status: 0, message: "All password fields are required." });
    }

    // Check new password match
    if (new_password !== confirm_password) {
      return res.status(200).json({ status: 0, message: "New password and confirm password do not match." });
    }

    // Password strength check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(new_password)) {
      return res.status(200).json({
        status: 0,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }

    // Fetch user by ID
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(200).json({ status: 0, message: "User not found." });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(200).json({ status: 0, message: "Old password is incorrect." });
    }

    // Hash new password
    const hashedPassword = await new Promise((resolve, reject) => {
      cryptPassword(new_password, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });

    // Update user password
    const updatePayload = {
      password: hashedPassword,
      updated_by: userId,
      updated_at: new Date()
    };

    const [updatedRows] = await User.update(updatePayload, { where: { id: userId } });

    if (updatedRows === 0) {
      return res.status(500).json({ status: 0, message: "Failed to update password." });
    }

    return res.json({ status: 1, message: "Password updated successfully" });

  } catch (err) {
    return next(CustomErrorHandler.internalServerError(err));
  }
};

const users_role_slug_wise_function = async (req, res, next) => {
  try {

    let role_slug = req.params.id;

    var sql = `select * from users left join t_roles on t_roles.trl_role_id = users.role_id where t_roles.trl_role_slug = '${role_slug}'`;

    const user = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.json({ status: 1, data: user, message: "User details" });

  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports = { fetchAllUsers, fetchUserById, listUsers, getExcelExportUserList, createUser, userDetails, changePassword, users_role_slug_wise_function };
