const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../../models/users/user.model");
const JwtService = require("../services/jwt.service");
const {
  getModuleNameRoleWise,
  getRoleDetailsBySlug,
  ApprovalPathList,
  getUserByRoleId,
} = require("../../../helpers/web.helper");
const RegionModel = require("../../../models/masters/region.model");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const StateModel = require("../../../models/masters/state.model");
const CompanyModel = require("../../../models/masters/company.model");
const UserStateDistrictModel = require("../../../models/users/user_state_district.model");
const { sequelize } = require("../../../config/db");
const { QueryTypes, Op } = require("sequelize");
const {
  isEmpty,
  convertToSlug,
  cryptPassword,
} = require("../../../helpers/common.helper");
const NgoModel = require("../../../models/ngo/ngo.model");
const DocumentModel = require("../../../models/documents/documents.model");
const {
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const ApprovalProcessTrackModel = require("../../../models/approval/ApprovalProcessTrackModel");
const NotificationModel = require("../../../models/notification/notifications.model");
const { generateOtp } = require("../../../utils/otpGenerator");
const {
  sendForgetPasswordOTPEmail,
} = require("../../../email/services/forgetPasswordService");

const volunteerCreateFun = async (req, res, next) => {
  const formData = req?.body;

  try {
    // 1. Get role details and validate
    const role = await getRoleDetailsBySlug("employee_volunteer");
    console.log("role", role);

    if (!role || !role[0]?.trl_role_id) {
      return res.json({
        status: 0,
        message: "Volunteer role not found.",
      });
    }

    // Assign role_id to formData safely
    formData.role_id = role[0].trl_role_id;

    // 2. Prepare sanitized request data
    const requestData = {
      // ...(!isEmpty(formData.company_sub_maser_id) && { company_sub_maser_id: formData.company_sub_maser_id }),
      ...(!isEmpty(formData.name) && { name: formData.name }),
      ...(!isEmpty(formData.email) && { email: formData.email }),
      ...(!isEmpty(formData.phone) && { phone: formData.phone }),
      ...(!isEmpty(formData.status) && { status: formData.status }),
      // ...(!isEmpty(formData.region_id) && { region_id: formData.region_id }),
      name_slug: convertToSlug(formData.name) || "",
      user_type: "employee_volunteer",
      role_id: formData.role_id,
    };

    if (Object.keys(requestData).length === 0) {
      return next(CustomErrorHandler.validationError("Request body required."));
    }

    // 3. Start transaction
    const t = await sequelize.transaction();

    try {
      // 4. Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: requestData.email }, { phone: requestData.phone }],
        },
        transaction: t,
      });

      if (existingUser) {
        await t.rollback();
        return res.json({
          status: 0,
          message: "Email or phone already exists.",
        });
      }

      // 5. Validate password
      const password = formData.password;
      if (!password) {
        await t.rollback();
        return res.json({
          status: 0,
          message: "Please add password.",
        });
      }

      // 6. Hash password
      const hashedPassword = await new Promise((resolve, reject) => {
        cryptPassword(password, (err, hash) => {
          if (err) return reject(err);
          resolve(hash);
        });
      });

      requestData.password = hashedPassword;

      // 7. Create user
      const newUser = await User.create(requestData, { transaction: t });

      // 8. Create state-district mappings
      const state_district_blocks = formData.state_district_blocks || [];

      for (const data_of_st of state_district_blocks) {
        await UserStateDistrictModel.create(
          {
            tus_user_id: newUser.id,
            tus_state_id: data_of_st.state_id?.trim(),
            tus_district_id: data_of_st.district_id?.trim(),
          },
          { transaction: t },
        );
      }

      // 9. Commit transaction
      await t.commit();

      return res.json({
        status: 1,
        message: "Volunteer created successfully",
      });
    } catch (err) {
      await t.rollback();
      return next(CustomErrorHandler.internalServerError(err));
    }
  } catch (err) {
    return next(CustomErrorHandler.internalServerError(err));
  }
};

// const ngoRegisterUserCreateFun = async (req, res, next) => {
//   // const formData = req?.body;
//   const formData = req.body;
//     const files = req.files || [];
//   console.log("formData------------ ",formData);
//   return;
//   try {
//     // 1. Get role details and validate
//     const role = await getRoleDetailsBySlug('ngo');

//     if (!role || !role[0]?.trl_role_id) {
//       return res.json({
//         status: 0,
//         message: "Ngo role not found.",
//       });
//     }

//     // Assign role_id to formData safely
//     formData.role_id = role[0].trl_role_id;

//     // 2. Prepare sanitized request data
//     const requestData = {
//       // ...(!isEmpty(formData.company_sub_maser_id) && { company_sub_maser_id: formData.company_sub_maser_id }),
//       ...(!isEmpty(formData.name) && { name: formData.name }),
//       ...(!isEmpty(formData.email) && { email: formData.email }),
//       ...(!isEmpty(formData.phone) && { phone: formData.phone }),
//       ...(!isEmpty(formData.status) && { status: formData.status }),
//       register_from: "ngo",
//       // ...(!isEmpty(formData.region_id) && { region_id: formData.region_id }),
//       name_slug: convertToSlug(formData.name) || "",
//       user_type: "ngo",
//       role_id: formData.role_id
//     };

//     if (Object.keys(requestData).length === 0) {
//       return next(CustomErrorHandler.validationError("Request body required."));
//     }

//     // 3. Start transaction
//     const t = await sequelize.transaction();

//     try {
//       // 4. Check if user already exists
//       const existingUser = await User.findOne({
//         where: {
//           [Op.or]: [
//           { email: requestData.email },
//           { phone: requestData.phone }
//         ]
//       },
//         transaction: t
//       });

//       if (existingUser) {
//         await t.rollback();
//         return res.json({
//           status: 0,
//           message: "Email or phone already exists.",
//         });
//       }

//       // 5. Validate password
//       const password = formData.password;
//       if (!password) {
//         await t.rollback();
//         return res.json({
//           status: 0,
//           message: "Please add password.",
//         });
//       }

//       // 6. Hash password
//       const hashedPassword = await new Promise((resolve, reject) => {
//         cryptPassword(password, (err, hash) => {
//           if (err) return reject(err);
//           resolve(hash);
//         });
//       });

//       requestData.password = hashedPassword;

//       // 7. Create user
//       const newUser = await User.create(requestData, { transaction: t });

//       // 8. Create state-district mappings
//       const state_district_blocks = formData.state_district_blocks || [];

//       for (const data_of_st of state_district_blocks) {
//         await UserStateDistrictModel.create({
//           tus_user_id: newUser.id,
//           tus_state_id: data_of_st.state_id?.trim(),
//           tus_district_id: data_of_st.district_id?.trim(),
//         }, { transaction: t });
//       }

//       // 9. Commit transaction
//       await t.commit();

//       return res.json({
//         status: 1,
//         message: "Ngo created successfully",
//       });
//     } catch (err) {
//       await t.rollback();
//       return next(CustomErrorHandler.internalServerError(err));
//     }
//   } catch (err) {
//     console.log("err----------- ",err);

//     return next(CustomErrorHandler.internalServerError(err));
//   }
// };

const ngoRegisterUserCreateFun = async (req, res, next) => {
  const formData = req.body;
  const files = req.files || [];
  const creator_by = req?.user?.id || null;
  const role_id = formData.role_id || null;

  // console.log("formData---------- ",formData);
  // console.log("files---------- ",files);
  // return;

  try {
    // 1. Get role details and validate
    const role = await getRoleDetailsBySlug("ngo");

    if (!role || !role[0]?.trl_role_id) {
      return res.json({
        status: 0,
        message: "Ngo role not found.",
      });
    }

    // Assign role_id to formData safely
    formData.role_id = role[0].trl_role_id;

    // 2. Start transaction
    const t = await sequelize.transaction();

    try {
      /** -------------------------
       * STEP 1: CREATE NGO RECORD
       * ------------------------- */
      const ngoRequestData = {
        ...(formData.tngo_name && { tngo_name: formData.tngo_name }),
        ...(formData.tngo_date && { tngo_date: formData.tngo_date }),
        ...(formData.tngo_csr_one_res_org && {
          tngo_csr_one_res_org: formData.tngo_csr_one_res_org,
        }),
        ...(formData.tngo_res_certificate_org && {
          tngo_res_certificate_org: formData.tngo_res_certificate_org,
        }),
        ...(formData.tngo_amount_received && {
          tngo_amount_received: formData.tngo_amount_received,
        }),
        ...(formData.tngo_amount_spent && {
          tngo_amount_spent: formData.tngo_amount_spent,
        }),
        ...(formData.tngo_register_id && {
          tngo_register_id: formData.tngo_register_id,
        }),
        ...(formData.tngo_pan_card_org && {
          tngo_pan_card_org: formData.tngo_pan_card_org,
        }),
        ...(formData.tngo_twelve_aa_certificate && {
          tngo_twelve_aa_certificate: formData.tngo_twelve_aa_certificate,
        }),
        ...(formData.tngo_eighty_g_certificate_org && {
          tngo_eighty_g_certificate_org: formData.tngo_eighty_g_certificate_org,
        }),
        ...(formData.tngo_by_law_org_doc && {
          tngo_by_law_org_doc: formData.tngo_by_law_org_doc,
        }),
        ...(formData.tngo_list_of_exist_gov_body_members && {
          tngo_list_of_exist_gov_body_members:
            formData.tngo_list_of_exist_gov_body_members,
        }),
        ...(formData.tngo_details_of_office_bearers && {
          tngo_details_of_office_bearers:
            formData.tngo_details_of_office_bearers,
        }),
        ...(formData.tngo_audit_report_org_with_income_tax_return && {
          tngo_audit_report_org_with_income_tax_return:
            formData.tngo_audit_report_org_with_income_tax_return,
        }),
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
        ...(formData.tngo_bank_address_of_the_bank && {
          tngo_bank_address_of_the_bank: formData.tngo_bank_address_of_the_bank,
        }),
        ...(formData.tngo_fcra_reg_certificate && {
          tngo_fcra_reg_certificate: formData.tngo_fcra_reg_certificate,
        }),
        ...(formData.tngo_niti_aayog_darpan_reg && {
          tngo_niti_aayog_darpan_reg: formData.tngo_niti_aayog_darpan_reg,
        }),
        ...(formData.tngo_complete_address_reg_doc_org && {
          tngo_complete_address_reg_doc_org:
            formData.tngo_complete_address_reg_doc_org,
        }),
        ...(formData.tngo_contact_name && {
          tngo_contact_name: formData.tngo_contact_name,
        }),
        ...(formData.tngo_contact_phone_no && {
          tngo_contact_phone_no: formData.tngo_contact_phone_no,
        }),
        ...(formData.tngo_contact_email && {
          tngo_contact_email: formData.tngo_contact_email,
        }),
        ...(formData.tngo_contact_office_address && {
          tngo_contact_office_address: formData.tngo_contact_office_address,
        }),
        ...(formData.tngo_key_person_name && {
          tngo_key_person_name: formData.tngo_key_person_name,
        }),
        ...(formData.tngo_key_person_phone_no && {
          tngo_key_person_phone_no: formData.tngo_key_person_phone_no,
        }),
        ...(formData.tngo_key_person_email && {
          tngo_key_person_email: formData.tngo_key_person_email,
        }),
        ...(formData.tngo_key_person_office_address && {
          tngo_key_person_office_address:
            formData.tngo_key_person_office_address,
        }),
        ...(formData.tngo_name_of_entity && {
          tngo_name_of_entity: formData.tngo_name_of_entity,
        }),
        ...(formData.tngo_status_of_entity_id && {
          tngo_status_of_entity_id: formData.tngo_status_of_entity_id,
        }),
        ...(formData.tngo_registered_off_address && {
          tngo_registered_off_address: formData.tngo_registered_off_address,
        }),
        ...(formData.tngo_corporate_off_address && {
          tngo_corporate_off_address: formData.tngo_corporate_off_address,
        }),
        ...(formData.tngo_branches && {
          tngo_branches: formData.tngo_branches,
        }),
        ...(formData.tngo_name_of_group && {
          tngo_name_of_group: formData.tngo_name_of_group,
        }),
        ...(formData.tngo_pan && { tngo_pan: formData.tngo_pan }),
        ...(formData.tngo_gst && { tngo_gst: formData.tngo_gst }),
        ...(formData.tngo_website && { tngo_website: formData.tngo_website }),
        tngo_status: "send_for_approval",
        tngo_register_status: "registered",
        tngo_approval_order: "1",
        tngo_created_by: creator_by,
        tngo_updated_by: creator_by,
      };

      const newNgo = await NgoModel.create(ngoRequestData, { transaction: t });

      if (!newNgo || !newNgo.tngo_id) {
        await t.rollback();
        return res.json({
          status: 0,
          message: "Failed to create NGO.",
        });
      }

      let ngo_id = newNgo?.tngo_id;
      let tenDigitNumber = Math.floor(1000000000 + Math.random() * 9000000000);

      // console.log("newNgo---------- ",newNgo?.tngo_id);
      //   return;
      /** -------------------------
       * STEP 2: CREATE USER RECORD
       * ------------------------- */
      const requestData = {
        ...(!isEmpty(formData.tngo_contact_name) && {
          name: formData.tngo_contact_name,
        }),
        ...(!isEmpty(formData.tngo_contact_email) && {
          email: formData.tngo_contact_email,
        }),
        ...(!isEmpty(formData.tngo_contact_phone_no) && {
          phone: formData.tngo_contact_phone_no,
        }),
        ...(!isEmpty(formData.status) && { status: formData.status }),
        register_from: "ngo",
        name_slug: convertToSlug(formData.tngo_contact_name) || "",
        user_type: "ngo",
        role_id: formData.role_id,
        ngo_id: newNgo?.tngo_id, // 🔗 Linking NGO ID
      };

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: requestData.email }, { phone: requestData.phone }],
        },
        transaction: t,
      });

      if (existingUser) {
        await t.rollback();
        return res.json({
          status: 0,
          message: "Email or phone already exists.",
        });
      }

      // Validate password
      const password = formData.password;
      // if (!password) {
      //   await t.rollback();
      //   return res.json({
      //     status: 0,
      //     message: "Please add password.",
      //   });
      // }

      // Hash password
      const hashedPassword = await new Promise((resolve, reject) => {
        cryptPassword("123456", (err, hash) => {
          if (err) return reject(err);
          resolve(hash);
        });
      });

      requestData.password = hashedPassword;

      // Create user
      const newUser = await User.create(requestData, { transaction: t });
      const ngo_user_id = newUser?.id;

      /** -------------------------
       * STEP 3: STATE-DISTRICT MAPPING
       * ------------------------- */
      const state_district_blocks =
        JSON.parse(formData.state_district_blocks) || [];

      for (const data_of_st of state_district_blocks) {
        // console.log("data_of_st------------- ",data_of_st);

        await UserStateDistrictModel.create(
          {
            tus_user_id: newUser.id,
            tus_state_id: data_of_st.state_id?.trim(),
            tus_district_id: data_of_st.district_id?.trim(),
          },
          { transaction: t },
        );
      }

      /** -------------------------
       * STEP 4: FILE UPLOAD HANDLING
       * ------------------------- */
      let uploadedFilePaths = [];

      if (files?.length > 0) {
        const grouped = files.reduce((acc, file) => {
          (acc[file.fieldname] ||= []).push(file);
          return acc;
        }, {});

        for (const [key, fileGroup] of Object.entries(grouped)) {
          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newNgo?.tngo_id,
              "uploads/ngo",
              creator_by,
              t,
            );
          uploadedFilePaths.push(...filePaths);
          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction: t });
          }
        }
      }

      /** -------------------------
       * STEP 5: Send approval Notification
       * ------------------------- */

      // Get initial approval path
      const ApprovalPathListData = await ApprovalPathList("ngo", 1);

      // Notify next approval role users (budgeting)
      for (const data of ApprovalPathListData) {
        // Handle comma-separated role ids
        const roleIds = data.tapp_role_id.split(",").map((r) => r.trim());

        let approvalUsers = [];
        for (const roleId of roleIds) {
          const users = await getUserByRoleId(roleId);
          approvalUsers = approvalUsers.concat(users);
        }

        if (approvalUsers.length > 0) {
          const notifications = approvalUsers.map((user_data) => ({
            tnot_module: "ngo",
            tnot_type: "ngo",
            tnot_item_id: ngo_id,
            tnot_receiver_id: user_data.id,
            tnot_text: "Send NGO for  approval",
            tnot_url: `ngo/view/${ngo_id}?rand=${tenDigitNumber}`,
            tnot_sender_id: creator_by,
          }));

          await NotificationModel.bulkCreate(notifications);
        }
      }

      await ApprovalProcessTrackModel.create({
        apt_type: "ngo",
        apt_item_id: ngo_id,
        apt_user_id: ngo_user_id,
        apt_user_role: role_id,
        apt_recipient_id: ngo_user_id,
        apt_remarks: "NGO registered and sent for approval",
        apt_accept_step: "initial",
        apt_accept_status: "initial",
        apt_created_at: new Date(),
        apt_updated_at: new Date(),
        apt_created_by: ngo_user_id,
        apt_updated_by: ngo_user_id,
      });

      /** -------------------------
       * FINAL STEP: COMMIT TRANSACTION
       * ------------------------- */
      // ✅ Commit everything
      await t.commit();

      return res.json({
        status: 1,
        message: "Ngo created successfully",
        data: {
          ngo: newNgo,
          user: newUser,
          uploadedFiles: uploadedFilePaths,
        },
      });
    } catch (err) {
      await t.rollback();
      console.error("Error in ngoRegisterUserCreateFun:", err);
      return next(CustomErrorHandler.internalServerError(err));
    }
  } catch (err) {
    console.log("err----------- ", err);
    return next(CustomErrorHandler.internalServerError(err));
  }
};

const addLoginLogoutLog = async (
  user_id,
  log_type,
  created_by,
  updated_by,
  status,
  user_agent,
  ip_address,
) => {
  try {
    console.log("🔵 Inserting log for log_type:", log_type); // 👈 debug
    await sequelize.query(
      `INSERT INTO t_login_logout_logs 
        (user_id, log_type, created_by, updated_by, status, ip_address, user_agent, created_at, updated_at)
       VALUES 
        (:user_id, :log_type, :created_by, :updated_by, :status, :ip_address, :user_agent, NOW(), NOW())`,
      {
        replacements: {
          user_id,
          log_type,
          created_by,
          updated_by,
          status,
          ip_address,
          user_agent,
        },
        type: QueryTypes.INSERT,
      },
    );
    console.log("✅ Log inserted successfully"); // 👈 debug
    return { status: "success", message: "Log added successfully." };
  } catch (error) {
    console.error("❌ Log insert error:", error.message); // 👈 debug
    return {
      status: "error",
      message: "Unable to insert the log: " + error.message,
    };
  }
};

const getDbConnectionIp = async () => {
  const result = await sequelize.query(
    "SELECT inet_client_addr()::text AS ip",
    { type: QueryTypes.SELECT },
  );
  const ip = result[0]?.ip || "127.0.0.1";
  return ip.replace(/\/\d+$/, ""); // ✅ removes /32 or any CIDR suffix
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    // const user = await User.findOne({ where: { email,status:true } });

    // if (!user) return res.status(401).json({ error: "Invalid credentials" });

     if (!user) {
      await addLoginLogoutLog(
        null,       // ✅ no user id, user doesn't exist
        "Login",
        null,       // ✅
        null,       // ✅
        "Failure",
        "web",
        await getDbConnectionIp(),
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

     if (!isMatch) {
      await addLoginLogoutLog(
        parseInt(user.id),  // ✅ user exists here
        "Login",
        parseInt(user.id),
        parseInt(user.id),
        "Failure",
        "web",
        await getDbConnectionIp(),
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    var payLoad = {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      phone: user.phone,
      user_type: user.user_type,
      status: user.status,
    };

    const result = await getModuleNameRoleWise(req.body.email);
    const access_token = await JwtService.sign(payLoad);
    let res_data = {
      userData: user.dataValues,
      moduleAccess: result,
    };

    res_data.accessToken = access_token;

    const rawUserAgent = req.headers["user-agent"] || "";
    const deviceType = rawUserAgent.toLowerCase().includes("mozilla")
      ? "web"
      : "app";

    await addLoginLogoutLog(
      parseInt(user.id),
      "Login",
      parseInt(user.id),
      parseInt(user.id),
      "Success",
      deviceType, // ✅ "Web" or "App"
      //getRealIp(req), // ✅
      await getDbConnectionIp(), // ✅ same as master audit IP
    );

    // await updateLoginAttempts(user.dataValues.email, true);
    return res.status(200).json({
      status: 1,
      message: "User login successful.",
      data: res_data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const logout = async (req, res) => {
  try {
    console.log("------------------- logout method is called");
    console.log("req.user:", req.user); // 👈 check what req.user looks like

    const user = req.user[0];
    console.log("user:", user); // 👈 check user object

    const rawUserAgent = req.headers["user-agent"] || "";
    const deviceType = rawUserAgent.toLowerCase().includes("mozilla")
      ? "web"
      : "app";

    await addLoginLogoutLog(
      parseInt(user.id),
      "Logout",
      parseInt(user.id),
      parseInt(user.id),
      "Success",
      deviceType,
     // getRealIp(req), // ✅
      await getDbConnectionIp(), // ✅ same as master audit IP

    );

    return res.status(200).json({
      status: 1,
      message: "User logout successful.",
    });
  } catch (err) {
    console.error("❌ logout error:", err.message); // 👈 check actual error
    res.status(500).json({ error: err.message });
  }
};
const forgetPassword = async (req, res, next) => {
  try {
    const { email, password, confirm_password, type, token, otp } = req.body;

    // Normalize input
    const emailTrim = email?.trim();
    if (!emailTrim)
      return res.status(400).json({
        status: false,
        message: "Email is required",
        errors: { email: "Email is required" },
      });

    // Fetch user
    const user = await User.findOne({ where: { email: emailTrim }, raw: true });

    console.log("user------------- ", user);

    // Prevent enumeration
    if (!user || !user?.email) {
      if (type === "email_verify") {
        const payload = {
          type: "otp_verify",
        };

        const jwtToken = sign(payload, process.env.JWT_SECRET, {
          expiresIn: "10m",
        });

        return res.status(200).json({
          status: true,
          token: jwtToken,
          type: "otp_verify",
          message:
            "If your account exists, we’ve sent a verification code to your email. Please check your email and enter the OTP to continue.",
        });
      } else if (type === "otp_verify") {
        return res.status(400).json({
          status: true,
          message: "Invalid or expired OTP.",
          errors: {
            otp: "Invalid or expired OTP.",
          },
        });
      } else {
        return res.status(401).json({
          status: false,
          message: "Invalid request type.",
        });
      }
      // return res.status(400).json({
      //   status: false,
      //   message: "Verification Failed.",
      // });
    }

    // STEP 1 — Email VERIFY: send OTP
    if (type === "email_verify") {
      const otpValue = generateOtp();
      const expiry = new Date(
        Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000,
      );

      await User.update(
        {
          otp: otpValue,
          expires_at: expiry,
        },
        {
          where: { id: user.id },
        },
      );

      // Send OTP email
      sendForgetPasswordOTPEmail({
        name: user.name,
        email: user.email,
        otp: otpValue,
      });

      const payload = {
        user_id: user.id,
        email: user.email,
        type: "otp_verify",
      };

      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "10m",
      });

      return res.status(200).json({
        status: true,
        token: jwtToken,
        type: "otp_verify",
        message:
          "If your account exists, we’ve sent a verification code to your email. Please check your email and enter the OTP to continue.",
      });
    }

    // STEP 2 — OTP VERIFY: verify OTP & issue reset token
    if (type === "otp_verify") {
      if (!token || !otp)
        return res
          .status(401)
          .json({ status: false, message: "Token and OTP are required" });

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        return res
          .status(401)
          .json({ status: false, message: "Invalid or expired token" });
      }

      // Validate token type and ownership
      if (decoded.type !== "otp_verify" || decoded.user_id !== user.id) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid or expired token" });
      }

      // Verify OTP from DB
      const otpRecord = await User.findOne({
        where: { id: decoded.user_id },
      });

      if (
        !otpRecord ||
        otpRecord.otp !== otp.trim() ||
        new Date() > new Date(otpRecord.expires_at)
      ) {
        return res.status(400).json({
          status: false,
          message: "Invalid or expired OTP.",
          errors: {
            otp: "Invalid or expired OTP.",
          },
        });
      }

      // OTP valid → delete from DB and create reset token
      await User.update(
        {
          otp: null,
          expires_at: null,
        },
        {
          where: { id: decoded.user_id },
        },
      );

      const resetPayload = {
        user_id: decoded.user_id,
        email: decoded.email,
        email: decoded.email,
        type: "reset_password",
      };

      const resetToken = jwt.sign(resetPayload, process.env.JWT_SECRET, {
        expiresIn: "10m",
      });

      return res.status(200).json({
        status: true,
        type: "reset_password",
        token: resetToken,
        message: "OTP verified successfully. You can now reset your password.",
      });
    }

    // STEP 3 — RESET PASSWORD
    if (type === "reset_password") {
      if (!token || !password || !confirm_password) {
        return res.status(401).json({
          status: false,
          message: "Token, password, and confirm_password are required",
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid or expired token" });
      }

      if (decoded.type !== "reset_password" || decoded.user_id !== user.id) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid or expired token" });
      }

      // Password validation
      if (password?.trim() !== confirm_password?.trim()) {
        return res.status(400).json({
          status: false,
          errors: {
            confirm_password: "Password and confirm password do not match",
          },
        });
      }

      const passwordRegex = {
        lowercase: /[a-z]/,
        uppercase: /[A-Z]/,
        number: /\d/,
        specialChar: /[@$!%*?&]/,
      };

      if (password.length < 6) {
        return res.status(400).json({
          status: false,
          errors: {
            password: "Password must be at least 6 characters long",
          },
        });
      }

      if (!passwordRegex.lowercase.test(password)) {
        return res.status(400).json({
          status: false,
          errors: {
            password: "Password must contain at least one lowercase letter",
          },
        });
      }

      if (!passwordRegex.uppercase.test(password)) {
        return res.status(400).json({
          status: false,
          errors: {
            password: "Password must contain at least one uppercase letter",
          },
        });
      }

      if (!passwordRegex.number.test(password)) {
        return res.status(400).json({
          status: false,
          errors: {
            password: "Password must contain at least one number",
          },
        });
      }

      if (!passwordRegex.specialChar.test(password)) {
        return res.status(400).json({
          status: false,
          errors: {
            password:
              "Password must contain at least one special character (@$!%*?&)",
          },
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password.trim(), 10);

      await User.update(
        { password: hashedPassword },
        { where: { id: user.id } },
      );

      return res.status(200).json({
        status: true,
        message: "Password updated successfully",
      });
    }

    // INVALID TYPE
    return res
      .status(400)
      .json({ status: false, message: "Invalid request type" });
  } catch (error) {
    return next(CustomErrorHandler.databaseError(error.message));
  }
};

const region_list_fun = async (req, res, next) => {
  try {
    // Fetch states
    const regions = await RegionModel.findAll({
      order: [["treg_region_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = regions.map((state) => ({
      value: state?.treg_id,
      label: state?.treg_region_name,
    }));
    return res.status(200).json({
      status: true,
      message: "Region fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

const state_list_fun = async (req, res, next) => {
  try {
    // Fetch states
    const states = await StateModel.findAll({
      order: [["tsl_state_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = states.map((state) => ({
      value: state?.tsl_state_id,
      label: state?.tsl_state_name,
    }));

    return res.status(200).json({
      status: true,
      message: "State fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

const company_list_fun = async (req, res, next) => {
  try {
    // Fetch companys
    const companys = await CompanyModel.findAll({
      order: [["tcom_company_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = companys.map((com) => ({
      value: com?.tcom_id,
      label: com?.tcom_company_name,
      slug: com?.tcom_company_slug,
    }));
    return res.status(200).json({
      status: true,
      message: "Company fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

const get_public_districts_list_by_state_fun = async function (req, res, next) {
  const state_ids = req?.body?.state_ids; // Assuming this is an array of IDs
  if (state_ids && state_ids.length > 0) {
    try {
      // Join the array values with commas and wrap each one with single quotes
      const formattedStateIds = state_ids.map((id) => `'${id}'`).join(",");
      const sql = `SELECT tdl_district_id, tdl_district_name,tdl_state_id FROM t_district WHERE tdl_state_id IN (${formattedStateIds})`;

      const districsDetails = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      });

      if (districsDetails.length > 0) {
        // Send the response with status 200
        return res.status(200).json({
          status: 1,
          message: "District lists fetched successfully",
          data: districsDetails,
        });
      } else {
        // Send a response indicating no data found
        return res.status(200).json({
          status: 0,
          message: "No data found",
          data: [],
        });
      }
    } catch (error) {
      // Pass the error to the error handler
      return next(error);
    }
  } else {
    // Send a response if `state_ids` is empty or invalid
    return res.status(400).json({
      status: 0,
      message: "Region IDs cannot be empty",
    });
  }
};

const subMasterListByMasterSlug = async function (req, res, next) {
  let { master_slug } = req?.body;
  try {
    var sql = `SELECT * FROM t_sub_master_list join t_master_list on t_master_list.tml_id = t_sub_master_list.tsml_tml_id where t_master_list.tml_master_list_slug = '${master_slug}'`;

    var records = await sequelize.query(sql, { type: QueryTypes.SELECT });

    return res.json({
      status: 1,
      message: "Sub Master List by Master Slug.",
      data: records,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports = {
  subMasterListByMasterSlug,
  ngoRegisterUserCreateFun,
  login,
  logout,
  forgetPassword,
  region_list_fun,
  state_list_fun,
  company_list_fun,
  get_public_districts_list_by_state_fun,
  volunteerCreateFun,
};
