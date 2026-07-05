var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes, Op } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const DocumentModel = require("../../../models/documents/documents.model");
const {
  saveUpdateAndPrepareDocumentMetadata,
  saveAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");

const EventModel = require("../../../models/emo_volunteering/event.model");
const EventAssignModel = require("../../../models/emo_volunteering/event_assign_model");
const User = require("../../../models/users/user.model");
const {
  sendNotificationForPublishedEvent,
  notificationStatusChanged,
} = require("../../notification/services/notification.service");
const EventReviewFormModel = require("../../../models/emo_volunteering/event_review_form.model");
const { Worker } = require("worker_threads");
const path = require("path");
const ExcelJS = require("exceljs");

// exports.exportEventExcel = async (req, res, next) => {
//   try {
//     const userId = req?.user[0]?.id;

//     const [rows] = await sequelize.query(`
//       SELECT t_event.*, t_region.treg_region_name, t_state.tsl_state_name, t_vertical.tvm_vertical_name, users.name
//       FROM t_event
//       LEFT JOIN t_vertical ON t_vertical.tvm_id = t_event.tevent_vertical_id
//       LEFT JOIN t_projects ON t_projects.tproj_id = t_event.tevent_project_id
//       LEFT JOIN users ON users.id = t_event.tevent_created_by
//       LEFT JOIN t_region ON t_region.treg_id = t_event.tevent_treg_id
//       LEFT JOIN t_state ON t_state.tsl_state_id = t_event.tevent_tsl_state_id
//       WHERE t_event.tevent_created_by = '${userId}' AND t_event.tevent_type = 'csr'
//     `);

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Events");

//     worksheet.columns = [
//       // { header: "Event ID", key: "tevent_id", width: 20 },
//       { header: "Activity title", key: "tevent_activity_title", width: 30 },
//       { header: "Activity Details", key: "tevent_activity_details", width: 20 },
//       { header: "Objectives", key: "tevent_objective", width: 20 },
//       { header: "Sort Description", key: "tevent_sort_desc", width: 20 },
//       { header: "State", key: "tsl_state_name", width: 15 },
//       { header: "District", key: "tdl_district_name", width: 15 },
//       { header: "Profit Centre", key: "tprofc_profit_centre", width: 30 },
//       { header: "Activity Location", key: "tevent_activity_location", width: 15 },
//       { header: "Start Date", key: "tevent_start_date_event", width: 15 },
//       { header: "End Date", key: "tevent_end_date_event", width: 15 },
//       { header: "Start Time", key: "tevent_start_time", width: 15 },
//       { header: "End Time", key: "tevent_end_time", width: 15 },
//       { header: "Number of volunteer hours required from each volunteer", key: "tevent_no_vol_hr_each_vol", width: 15 },
//       { header: "Implementation", key: "implementation", width: 15 },
//       { header: "NGO Partner Name", key: "tevent_ngo_partner_name", width: 15 },
//       { header: "Mode of the event", key: "mode_event", width: 15 },
//       { header: "Contact Person name CSR", key: "tevent_contact_person_csr_name", width: 15 },
//       { header: "CSR person contact details", key: "tevent_csr_contact_person_details", width: 15 },
//       { header: "Vehicle arrangement", key: "tevent_vehicle_arrangement", width: 15 },
//       { header: "Vehicle arrangement", key: "tevent_vehicle_arrangement", width: 15 },
//       { header: "Created By", key: "name", width: 20 },
//     ];

//     rows.forEach((row) => worksheet.addRow(row));

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=event_list.xlsx"
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     next(err);
//   }
// };


exports.exportEventExcel = async (req, res, next) => {
  try {
    const userId = req?.user?.[0]?.id;
    const tevent_id = req.query?.tevent_id || null;
    const eventType = req.query?.type || null; // csr | not_csr | null

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    /* =====================================================
       FETCH EVENT DATA (ALL FIELDS)
    ===================================================== */
    const [rows] = await sequelize.query(
      `
      SELECT
        e.tevent_id,
        e.tevent_domain,
        e.tevent_activity_title,
        e.tevent_activity_description,
        e.tevent_expected_impact,
        e.tevent_ngo_id,
        ngo.tngo_name AS ngo_name,
        e.tevent_mode,
        e.tevent_event_link,
        e.tevent_schedule_vii,
        ssv.tschm_schedule_name AS schedule_name,
        sssm.tsubshcm_sub_schedule_name AS sub_schedule_name,
        e.tevent_sub_schedule,
        e.tevent_sdgs_id,
        e.tevent_volunteer_roles,
        e.tevent_state_id,
        s.tsl_state_name,
        e.tevent_district_id,
        d.tdl_district_name,
        e.tevent_block_id,
        b.tbl_block_name,
        e.tevent_village,
        e.tevent_location,
        e.tevent_map_location,
        e.tevent_org_type,
        e.tevent_bu,
        e.tevent_start_date,
        e.tevent_end_date,
        e.tevent_start_time,
        e.tevent_end_time,
        e.tevent_volunteers_needed,
        e.tevent_family_participation,
        e.tevent_family_members_count,
        e.tevent_partner_contact,
        e.tevent_contact_person,
        e.tevent_contact_email,
        e.tevent_vehicle_arrangement,
        e.tevent_status,
        e.tevent_is_active,
        e.tevent_approval_order,
        e.tevent_created_by,
        u.name AS created_by_name,
        e.tevent_updated_by,
        e.tevent_created_at,
        e.tevent_updated_at,
        e.tevent_deleted_at,
        e.tevent_type
      FROM public.t_event e
      LEFT JOIN users u 
        ON u.id = e.tevent_created_by
      LEFT JOIN t_schedule_seven_master ssv
        ON ssv.tschm_schedule_id = e.tevent_schedule_vii
      LEFT JOIN t_sub_schedule_master sssm
        ON sssm.tsubshcm_sub_schedule_id = e.tevent_sub_schedule

      LEFT JOIN t_state s 
        ON s.tsl_state_id = e.tevent_state_id
      LEFT JOIN t_district d 
        ON d.tdl_district_id = e.tevent_district_id
      LEFT JOIN t_block b
        ON b.tbl_block_id = e.tevent_block_id
      LEFT JOIN t_ngo ngo
        ON ngo.tngo_id = e.tevent_ngo_id
      WHERE 
      tevent_type is null
      AND e.tevent_created_by = :userId
        ${eventType ? "AND e.tevent_type = :eventType" : ""}
        ${tevent_id ? "AND e.tevent_id = :tevent_id" : ""}
      ORDER BY e.tevent_created_at DESC
      `,
      {
        replacements: { userId, tevent_id, eventType },
      }
    );

    /* =====================================================
       SDG MASTER MAP
    ===================================================== */
    const [sdgMaster] = await sequelize.query(`
      SELECT tsdg_id, tsdg_name
      FROM t_sdg_master
      WHERE tsdg_is_active = true
    `);

    const sdgMap = Object.fromEntries(
      sdgMaster.map((s) => [s.tsdg_id, s.tsdg_name])
    );

    rows.forEach((row) => {
      row.sdgs = row.tevent_sdgs_id
        ? row.tevent_sdgs_id
            .split(",")
            .map((id) => sdgMap[id.trim()] || id.trim())
            .join(", ")
        : "";
    });

    /* =====================================================
       EXCEL GENERATION
    ===================================================== */
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Events");

    worksheet.columns = [
      { header: "Event ID", key: "tevent_id", width: 28 },
      { header: "Activity Title", key: "tevent_activity_title", width: 30 },
      { header: "Activity Description", key: "tevent_activity_description", width: 35 },
      { header: "NGO", key: "ngo_name", width: 25 },
      { header: "Mode", key: "tevent_mode", width: 15 },
      { header: "Event Link", key: "tevent_event_link", width: 30 },
      { header: "Schedule VII", key: "schedule_name", width: 20 },
      { header: "Sub Schedule", key: "sub_schedule_name", width: 20 },
      { header: "SDGs", key: "sdgs", width: 40 },
      { header: "Volunteer Roles", key: "tevent_volunteer_roles", width: 30 },
      { header: "State", key: "tsl_state_name", width: 18 },
      { header: "District", key: "tdl_district_name", width: 18 },
      { header: "Block", key: "tbl_block_name", width: 18 },
      { header: "Village", key: "tevent_village", width: 20 },
      { header: "Location", key: "tevent_location", width: 30 },
      { header: "Map Location", key: "tevent_map_location", width: 30 },
      { header: "Start Date", key: "tevent_start_date", width: 15 },
      { header: "End Date", key: "tevent_end_date", width: 15 },
      { header: "Start Time", key: "tevent_start_time", width: 12 },
      { header: "End Time", key: "tevent_end_time", width: 12 },
      { header: "Volunteers Needed", key: "tevent_volunteers_needed", width: 18 },
      { header: "Family Participation", key: "tevent_family_participation", width: 18 },
      { header: "Family Members Count", key: "tevent_family_members_count", width: 20 },
      { header: "Partner Contact", key: "tevent_partner_contact", width: 25 },
      { header: "Contact Person", key: "tevent_contact_person", width: 22 },
      { header: "Contact Email", key: "tevent_contact_email", width: 30 },
      { header: "Vehicle Arrangement", key: "tevent_vehicle_arrangement", width: 20 },
      { header: "Status", key: "tevent_status", width: 15 },
      { header: "Is Active", key: "tevent_is_active", width: 10 },
      { header: "Approval Order", key: "tevent_approval_order", width: 15 },
      { header: "Created By", key: "created_by_name", width: 20 },
      { header: "Created At", key: "tevent_created_at", width: 22 },
      { header: "Updated At", key: "tevent_updated_at", width: 22 },
      { header: "Event Type", key: "tevent_type", width: 15 },
    ];

    rows.forEach((row) => worksheet.addRow(row));

    /* =====================================================
       RESPONSE
    ===================================================== */
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=event_list.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Event Excel Export Error:", err);
    next(err);
  }
};



module.exports.event_list_datatable = async (req, res, next) => {
  try {
    const userId = req?.user?.[0]?.id;

    /*
      NOTE:
      - All column names updated to tevent_*
      - Removed legacy joins (vertical, project, region)
      - Kept participant stats
    */

    const sql = `
      SELECT 
        t_event.*,
        t_state.tsl_state_name,
        users.name AS created_by_name,

        COALESCE(total.total_participants, 0) AS total_participants,
        COALESCE(accepted.accepted_participants, 0) AS accepted_participants,
        COALESCE(rejected.rejected_participants, 0) AS rejected_participants

      FROM t_event

      /* ===== CREATED BY ===== */
      LEFT JOIN users 
        ON users.id = t_event.tevent_created_by

      /* ===== STATE ===== */
      LEFT JOIN t_state 
        ON t_state.tsl_state_id = t_event.tevent_state_id

      /* ===== TOTAL ASSIGNED ===== */
      LEFT JOIN (
        SELECT 
          COUNT(*) AS total_participants, 
          tea_event_id
        FROM t_event_assign
        GROUP BY tea_event_id
      ) AS total 
        ON total.tea_event_id = t_event.tevent_id

      /* ===== ACCEPTED ===== */
      LEFT JOIN (
        SELECT 
          COUNT(*) AS accepted_participants, 
          tea_event_id
        FROM t_event_assign
        WHERE tea_status = 'accepted'
        GROUP BY tea_event_id
      ) AS accepted 
        ON accepted.tea_event_id = t_event.tevent_id

      /* ===== REJECTED ===== */
      LEFT JOIN (
        SELECT 
          COUNT(*) AS rejected_participants, 
          tea_event_id
        FROM t_event_assign
        WHERE tea_status = 'rejected'
        GROUP BY tea_event_id
      ) AS rejected 
        ON rejected.tea_event_id = t_event.tevent_id
    `;

    /*
      WHERE CONDITIONS
      - Only user’s events
      - Only active events
      - CSR events (default)
    */
    const where = `
      1 = 1
      AND t_event.tevent_created_by = '${userId}'
      AND t_event.tevent_is_active = true
      AND t_event.tevent_type is null
    `;

    const records = await Datatables.build(req, sql, where);

    return res.json(records);
  } catch (err) {
    return next(
      CustomErrorHandler.internalServerError(
        err.message || "Failed to fetch event list"
      )
    );
  }
};


module.exports.createEventForm = async (req, res, next) => {
  const userId = req?.user?.[0]?.id;
  const transaction = await sequelize.transaction();
  const files = req?.files || [];

  try {
    const {
      /* ================= BASIC ================= */
      tevent_domain,
      tevent_activity_title,
      tevent_activity_description,
      tevent_expected_impact,

      /* ================= NGO & MODE ================= */
      tevent_ngo_id,
      tevent_mode,
      tevent_theme_id,
      tevent_event_link,

      /* ================= COMPLIANCE ================= */
      tevent_schedule_vii,
      tevent_sub_schedule,
      tevent_sdgs_id,
      tevent_volunteer_roles,

      /* ================= LOCATION ================= */
      tevent_state_id,
      tevent_district_id,
      tevent_block_id,
      tevent_village,
      tevent_location,
      tevent_map_location,
      tevent_gps_latitude,
      tevent_gps_longitude,

      /* ================= ORGANIZATION ================= */
      tevent_org_type,
      tevent_bu,

      /* ================= SCHEDULE ================= */
      tevent_start_date,
      tevent_end_date,
      tevent_start_time,
      tevent_end_time,

      /* ================= VOLUNTEERS ================= */
      tevent_volunteers_needed,
      tevent_family_participation,
      tevent_family_members_count,

      /* ================= CONTACT ================= */
      tevent_partner_contact,
      tevent_contact_person,
      tevent_contact_email,

      /* ================= LOGISTICS ================= */
      tevent_vehicle_arrangement,
    } = req.body;

    /* ================= CREATE EVENT ================= */
    const event = await EventModel.create(
      {
        tevent_domain,
        tevent_activity_title,
        tevent_activity_description,
        tevent_expected_impact,

        tevent_ngo_id,
        tevent_mode,
        tevent_theme_id,
        tevent_event_link,

        tevent_schedule_vii,
        tevent_sub_schedule,

        tevent_sdgs_id: Array.isArray(tevent_sdgs_id)
          ? tevent_sdgs_id.join(",")
          : tevent_sdgs_id,

        tevent_volunteer_roles,

        tevent_state_id,
        tevent_district_id,
        tevent_block_id,
        tevent_village,
        tevent_location,
        tevent_map_location,
        tevent_gps_latitude,
        tevent_gps_longitude,

        tevent_org_type,
        tevent_bu,

        tevent_start_date,
        tevent_end_date,
        tevent_start_time,
        tevent_end_time,

        tevent_volunteers_needed,
        tevent_family_participation,
        tevent_family_members_count:
          tevent_family_participation === "yes"
            ? tevent_family_members_count
            : null,

        tevent_partner_contact,
        tevent_contact_person,
        tevent_contact_email,

        tevent_vehicle_arrangement,

        tevent_status: "submitted",
        tevent_created_by: userId,
        tevent_updated_by: userId,
      },
      { transaction }
    );

    /* ================= FILE UPLOAD ================= */
    if (files.length > 0) {
      const groupedFiles = files.reduce((acc, file) => {
        (acc[file.fieldname] ||= []).push(file);
        return acc;
      }, {});

      for (const [fieldName, fileGroup] of Object.entries(groupedFiles)) {
        const { metadata } =
          await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            event.tevent_id,
            "uploads/event",
            userId,
            transaction
          );

        if (metadata?.length) {
          await DocumentModel.bulkCreate(metadata, { transaction });
        }
      }
    }

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: "Event created successfully",
      tevent_id: event.tevent_id,
    });
  } catch (err) {
    await transaction.rollback();
    return next(
      CustomErrorHandler.internalServerError(err.message || "Event creation failed")
    );
  }
};

module.exports.publish_event_fun = async (req, res, next) => {
  const userId = req?.user[0]?.id;
  const transaction = await sequelize.transaction();

  try {
    const { tevent_id, tevent_status } = req.body;

    const existingEvent = await EventModel.findOne({
      where: { tevent_id , tevent_status: 'approved' },
    });
    if (!existingEvent) {
      return res.status(404).json({
        status: false,
        message: "Event not found or not approved",
      });
    }

    let present_date = new Date();
    let present_date_time = present_date
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    if (present_date_time > existingEvent.tevent_start_date_event) {
      return res.status(400).json({
        status: false,
        message: "Event has expired",
      });
    }

    // Create main project record first
    await EventModel.update(
      {
        tevent_status,
      },
      {
        where: {
          tevent_id: tevent_id,
        },
      },
      { transaction }
    );

    let users = `SELECT *
        FROM users
        JOIN t_roles ON users.role_id = t_roles.trl_role_id
        WHERE 
          trl_role_slug = 'employee_volunteer'
          AND users.id NOT IN (
            SELECT tea_user_id
            FROM t_event_assign
            WHERE tea_event_id = '${tevent_id}'
          )
          `;

    let usersData = await sequelize.query(users, { type: QueryTypes.SELECT });

    await EventAssignModel.bulkCreate(
      usersData.map((user) => ({
        tea_event_id: tevent_id,
        tea_user_id: user.id,
        tea_created_by: userId,
        tea_updated_by: userId,
      })),
      { transaction }
    );
    

    await sendNotificationForPublishedEvent(tevent_id, usersData, userId);

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: "Event published successfully",
    });
  } catch (err) {
    await transaction.rollback();
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

// module.exports.updateEventForm = async (req, res, next) => {
//   const userId = req?.user[0]?.id;
//   const transaction = await sequelize.transaction();
//   const files = req?.files || [];
//   const tevent_id = req?.params?.id;
//   // console.log("tevent_id---------------- ",tevent_id);
//   // console.log("req.body---------------- ",req.body);
//   // return;

//   try {
//     const {
//       tevent_company_id,
//       tevent_vertical_id,
//       tevent_vertical_type,
//       tevent_health_type,
//       tevent_environment_type,
//       tevent_ngo_id,
//       tevent_ngo_desc,
//       tevent_project_id,
//       tevent_activity_title,
//       tevent_start_date_event,
//       tevent_end_date_event,
//       tevent_start_time,
//       tevent_end_time,
//       tevent_objective_of_the_event,
//       tevent_activity_location_id,
//       tevent_project_spock_person,
//       tevent_participating_organizations,
//     } = req.body;

//     if (!tevent_id) {
//       throw new Error("Event ID (tevent_id) is required for update");
//     }

//     // 1. Update main event record
//     await EventModel.update(
//       {
//         tevent_company_id,
//         tevent_vertical_id,
//         tevent_vertical_type,
//         tevent_health_type,
//         tevent_environment_type,
//         tevent_ngo_id,
//         tevent_ngo_desc,
//         tevent_project_id,
//         tevent_activity_title,
//         tevent_start_date_event,
//         tevent_end_date_event,
//         tevent_start_time,
//         tevent_end_time,
//         tevent_objective_of_the_event,
//         tevent_activity_location_id,
//         tevent_project_spock_person,
//         tevent_updated_by: userId,
//       },
//       {
//         where: { tevent_id },
//         transaction,
//       }
//     );

//     // 2. Update participating organizations
//     if (tevent_participating_organizations) {
//       let partData = [];

//       try {
//         partData = JSON.parse(tevent_participating_organizations);
//       } catch (error) {
//         throw new Error(
//           "Invalid JSON format for tevent_participating_organizations"
//         );
//       }

//       // First, remove all old participants
//       await EventParticipateOrgModel.destroy({
//         where: { tevntpo_tevent_id: tevent_id },
//         transaction,
//       });

//       // Insert updated participants
//       const parRecords = partData.map((item) => ({
//         tevntpo_tevent_id: tevent_id,
//         tevntpo_participate_name: item.org_name,
//         tevntpo_participate_details: item.org_details,
//         tevntpo_created_by: userId,
//         tevntpo_updated_by: userId,
//       }));

//       if (parRecords.length > 0) {
//         await EventParticipateOrgModel.bulkCreate(parRecords, { transaction });
//       }
//     }

//     // Optional: File upload logic if needed

//     await transaction.commit();

//     return res.status(200).json({
//       status: true,
//       message: "Event Updated successfully",
//       message: "Event updated successfully",
//     });
//   } catch (err) {
//     await transaction.rollback();
//     return next(CustomErrorHandler.internalServerError(err.message));
//   }
// };

module.exports.updateEventForm = async (req, res, next) => {
  const userId = req?.user?.[0]?.id;
  const transaction = await sequelize.transaction();
  const files = req?.files || [];
  const tevent_id = req?.params?.id;

  try {
    if (!tevent_id) {
      throw new Error("Event ID (tevent_id) is required for update");
    }

    const {
      /* ================= BASIC ================= */
      tevent_domain,
      tevent_activity_title,
      tevent_activity_description,
      tevent_expected_impact,

      /* ================= NGO & MODE ================= */
      tevent_ngo_id,
      tevent_mode,
      tevent_theme_id,
      tevent_event_link,

      /* ================= COMPLIANCE ================= */
      tevent_schedule_vii,
      tevent_sub_schedule,
      tevent_sdgs_id,
      tevent_volunteer_roles,

      /* ================= LOCATION ================= */
      tevent_state_id,
      tevent_district_id,
      tevent_block_id,
      tevent_village,
      tevent_location,
      tevent_map_location,
      tevent_gps_latitude,
      tevent_gps_longitude,

      /* ================= ORGANIZATION ================= */
      tevent_org_type,
      tevent_bu,

      /* ================= SCHEDULE ================= */
      tevent_start_date,
      tevent_end_date,
      tevent_start_time,
      tevent_end_time,

      /* ================= VOLUNTEERS ================= */
      tevent_volunteers_needed,
      tevent_family_participation,
      tevent_family_members_count,

      /* ================= CONTACT ================= */
      tevent_partner_contact,
      tevent_contact_person,
      tevent_contact_email,

      /* ================= LOGISTICS ================= */
      tevent_vehicle_arrangement,
    } = req.body;

    /* ================= UPDATE EVENT ================= */
    await EventModel.update(
      {
        tevent_domain,
        tevent_activity_title,
        tevent_activity_description,
        tevent_expected_impact,

        tevent_ngo_id,
        tevent_mode,
        tevent_theme_id,
        tevent_event_link,

        tevent_schedule_vii,
        tevent_sub_schedule,

        tevent_sdgs_id: Array.isArray(tevent_sdgs_id)
          ? tevent_sdgs_id.join(",")
          : tevent_sdgs_id,

        tevent_volunteer_roles,

        tevent_state_id,
        tevent_district_id,
        tevent_block_id,
        tevent_village,
        tevent_location,
        tevent_map_location,
        tevent_gps_latitude,
        tevent_gps_longitude,

        tevent_org_type,
        tevent_bu,

        tevent_start_date,
        tevent_end_date,
        tevent_start_time,
        tevent_end_time,

        tevent_volunteers_needed,
        tevent_family_participation,
        tevent_family_members_count:
          tevent_family_participation === "yes"
            ? tevent_family_members_count
            : null,

        tevent_partner_contact,
        tevent_contact_person,
        tevent_contact_email,

        tevent_vehicle_arrangement,

        tevent_updated_by: userId,
      },
      {
        where: { tevent_id },
        transaction,
      }
    );

    /* ================= FILE UPLOAD (ONLY NEW FILES) ================= */
    if (files.length > 0) {
      const groupedFiles = files.reduce((acc, file) => {
        (acc[file.fieldname] ||= []).push(file);
        return acc;
      }, {});

      for (const [fieldName, fileGroup] of Object.entries(groupedFiles)) {
        const { metadata } =
          await saveUpdateAndPrepareDocumentMetadata(
            fileGroup,
            tevent_id,
            "uploads/event",
            userId,
            transaction
          );

        if (metadata?.length) {
          await DocumentModel.bulkCreate(metadata, { transaction });
        }
      }
    }

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: "Event updated successfully",
      tevent_id,
    });
  } catch (err) {
    await transaction.rollback();
    return next(
      CustomErrorHandler.internalServerError(
        err.message || "Event update failed"
      )
    );
  }
};


module.exports.eventDetails = async (req, res, next) => {
  try {
    const tevent_id = req?.params?.id;
    const userId = req?.user?.[0]?.id;
    const file_url = process.env.SERVER_FILE_URL || "";

    if (!tevent_id) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const sql = `
      SELECT
        e.*,

        /* ===== STATE / DISTRICT ===== */
        st.tsl_state_name,
        d.tdl_district_name,
        t.tthm_theme_name,

        /* ===== DOCUMENTS ===== */
        (
          SELECT json_agg(
            to_jsonb(doc) ||
            jsonb_build_object('full_url', '${file_url}' || doc.doc_path)
          )
          FROM t_documents doc
          WHERE doc.final_doc_id = e.tevent_id
        ) AS documents,

        /* ===== PARTICIPANT COUNTS ===== */
        (
          SELECT COUNT(*)
          FROM t_event_assign a
          WHERE a.tea_event_id = e.tevent_id
        ) AS total_participants,

        (
          SELECT COUNT(*)
          FROM t_event_assign a
          WHERE a.tea_event_id = e.tevent_id
          AND a.tea_status = 'accepted'
        ) AS accepted_participants,

        (
          SELECT COUNT(*)
          FROM t_event_assign a
          WHERE a.tea_event_id = e.tevent_id
          AND a.tea_status = 'rejected'
        ) AS rejected_participants,

        /* ===== CURRENT USER ACCESS ===== */
        (
          SELECT COUNT(*)
          FROM t_event_assign a
          WHERE a.tea_event_id = e.tevent_id
          AND a.tea_status = 'accepted'
          AND a.tea_user_id = '${userId}'
        ) AS access_of_event_number,

        (
          SELECT to_jsonb(a)
          FROM t_event_assign a
          WHERE a.tea_event_id = e.tevent_id
          AND a.tea_user_id = '${userId}'
          LIMIT 1
        ) AS assign_event_details,

        (
          SELECT json_agg(json_build_object(
            'user_id', a.tea_user_id,
            'status', a.tea_status,
            'booked', a.tea_booked,
            'waiting_number', a.tea_waiting_number,
            'form_submit', a.tea_form_submit,
            'created_at', a.tea_created_at,
            'responded_at', a.tea_responded_at,
            'name', u.name,
            'email', u.email
          ))
          FROM t_event_assign a
          LEFT JOIN users u ON u.id = a.tea_user_id
          WHERE a.tea_event_id = e.tevent_id
        ) AS assign_event_list,

        /* ===== SDGs ===== */
        (
          SELECT json_agg(json_build_object(
            'value', s.tsdg_id,
            'label', s.tsdg_name
          ))
          FROM unnest(string_to_array(e.tevent_sdgs_id, ',')) AS x(id)
          JOIN t_sdg_master s ON s.tsdg_id = x.id
        ) AS sdgs

      FROM t_event e
      LEFT JOIN t_state st ON st.tsl_state_id = e.tevent_state_id
      LEFT JOIN t_district d ON d.tdl_district_id = e.tevent_district_id
      LEFT JOIN t_theme_master t ON t.tthm_theme_id = e.tevent_theme_id
      WHERE e.tevent_id = '${tevent_id}'
      LIMIT 1;
    `;

    const [event] = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "Event details fetched successfully",
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


module.exports.my_event_datatable = async (req, res, next) => {
  const userId = req?.user[0]?.id;

  // try {
    //     var sql = `
    //          SELECT *
    // FROM t_event
    // WHERE
    //    t_event.tevent_id IN (
    // 	SELECT tea_event_id
    // 	FROM t_event_assign
    // 	WHERE tea_user_id = '${userId}'
    // )
    //           `;

    // let where = ` 1=1 `;

    var sql = `
  SELECT t_event.*
  FROM t_event
`;

    let where = `
  t_event.tevent_id IN (
    SELECT tea_event_id
    FROM t_event_assign
    WHERE tea_user_id = '${userId}' and tea_status = 'accepted'
  )
`;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  // } catch (err) {
  //   next(CustomErrorHandler.internalServerError(err.message));
  // }
};
module.exports.comming_soon_events_datatable = async (req, res, next) => {
  // try {
    const file_url = process.env.SERVER_FILE_URL;
    const userId = req?.user?.[0]?.id;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized user'
      });
    }

    /* =====================================================
       BASE QUERY (NO WHERE)
    ===================================================== */
    const sql = `
      SELECT 
        te.*,

        /* Documents */
        COALESCE(docs.documents, '[]'::json) AS documents

      FROM public.t_event te

      /* Documents (LATERAL JOIN) */
      LEFT JOIN LATERAL (
        SELECT json_agg(
          to_jsonb(td) ||
          jsonb_build_object(
            'full_url', '${file_url}' || td.doc_path
          )
        ) AS documents
        FROM public.t_documents td
        WHERE td.final_doc_id = te.tevent_id
      ) docs ON true
    `;

    /* =====================================================
       WHERE: EVENTS ASSIGNED TO USER
       AND NOT RESPONDED YET
    ===================================================== */
    const where = `
      te.tevent_id IN (
        SELECT DISTINCT tea_event_id
        FROM public.t_event_assign
        WHERE tea_user_id = '${userId}'
          AND tea_status IS NULL
      )
      AND te.tevent_is_active = true
      AND te.tevent_deleted_at IS NULL
    `;

    /* =====================================================
       BUILD DATATABLE RESPONSE
    ===================================================== */
    const records = await Datatables.build(req, sql, where);

    return res.json(records);

  // } catch (err) {
  //   return next(
  //     CustomErrorHandler.internalServerError(err.message)
  //   );
  // }
};

// module.exports.event_accept_reject_fun = async (req, res, next) => {
//   const userId = req?.user[0]?.id;
//   const transaction = await sequelize.transaction();

//   try {
//     const { tea_event_id, tea_remarks, tea_status } = req.body;

//     const existingEvent = await EventAssignModel.findOne({
//       where: { tea_event_id: tea_event_id, tea_user_id: userId },
//     });

//     if (!existingEvent) {
//       return res.status(404).json({
//         status: false,
//         message: "Event not found",
//       });
//     }

//     // Create main project record first
//     await EventAssignModel.update(
//       {
//         tea_remarks: tea_remarks,
//         tea_status: tea_status,
//       },
//       {
//         where: {
//           tea_event_id: tea_event_id,
//           tea_user_id: userId,
//         },
//       },
//       { transaction }
//     );

//     await notificationStatusChanged(tea_event_id, tea_status, userId);

//     await transaction.commit();

//     return res.status(200).json({
//       status: true,
//       message: "Event status changed successfully",
//     });
//   } catch (err) {
//     await transaction.rollback();
//     return next(CustomErrorHandler.internalServerError(err.message));
//   }
// };

module.exports.join_new_volunteer_in_event_fun = async (req, res, next) => {
  const userId = req?.user[0]?.id;
  const transaction = await sequelize.transaction();

  try {
    const { tevent_id } = req.body;

    const existingEvent = await EventModel.findOne({
      where: { tevent_id },
    });
    if (!existingEvent) {
      return res.status(404).json({
        status: false,
        message: "Event not found",
      });
    }

    let present_date = new Date();
    let present_date_time = present_date
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    if (present_date_time > existingEvent.tevent_start_date_event) {
      return res.status(400).json({
        status: false,
        message: "Event has expired",
      });
    }

    let users = `SELECT *
        FROM users
        JOIN t_roles ON users.role_id = t_roles.trl_role_id
        WHERE 
          trl_role_slug = 'employee_volunteer'
          AND users.id NOT IN (
            SELECT tea_user_id
            FROM t_event_assign
            WHERE tea_event_id = '${tevent_id}'
          )
          `;

    let usersData = await sequelize.query(users, { type: QueryTypes.SELECT });

    await EventAssignModel.bulkCreate(
      usersData.map((user) => ({
        tea_event_id: tevent_id,
        tea_user_id: user.id,
        tea_created_by: userId,
        tea_updated_by: userId,
      })),
      { transaction }
    );

    await sendNotificationForPublishedEvent(tevent_id, usersData, userId);

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: "Sent notification to new volunteers successfully",
    });
  } catch (err) {
    await transaction.rollback();
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.copy_event_fun = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { tevent_id, tevent_status } = req.body;
    if (!tevent_id) {
      return res.status(400).json({
        status: false,
        message: "tevent_id is required",
      });
    }

    // 1. Find the existing event
    const existingEvent = await EventModel.findOne({
      where: { tevent_id },
      raw: true,
    });

    if (!existingEvent) {
      return res.status(404).json({
        status: false,
        message: "Event not found",
      });
    }

    // 2. Prepare new title with copy suffix
    const baseTitle = existingEvent.tevent_activity_title;
    let newTitle = `${baseTitle}_copy`;

    const copies = await EventModel.findAll({
      where: {
        tevent_activity_title: {
          [Op.iLike]: `${baseTitle}_copy%`,
        },
      },
      raw: true,
    });

    if (copies.length > 0) {
      newTitle = `${baseTitle}_copy${copies.length + 1}`;
    }

    // 3. Remove primary key & timestamps to allow auto-generation
    delete existingEvent.tevent_id;
    delete existingEvent.tevent_created_at;
    delete existingEvent.tevent_updated_at;
    delete existingEvent.tevent_deleted_at;

    // 4. Insert new event
    const newEvent = await EventModel.create(
      {
        ...existingEvent,
        tevent_status,
        tevent_activity_title: newTitle,
        tevent_created_by: req?.user[0]?.id || null,
        tevent_updated_by: req?.user[0]?.id || null,
      },
      { transaction }
    );

    // 5. Copy documents where final_doc_id = old tevent_id
    const oldDocuments = await DocumentModel.findAll({
      where: { final_doc_id: tevent_id },
      raw: true,
    });

    if (oldDocuments.length > 0) {
      const newDocuments = oldDocuments.map((doc) => {
        // remove primary key to allow default sequence
        delete doc.tdoc_id;
        delete doc.created_at;
        delete doc.updated_at;
        delete doc.deleted_at;

        return {
          ...doc,
          final_doc_id: newEvent.tevent_id, // link to new event
          created_by: req?.user[0]?.id || "SYSTEM",
          updated_by: req?.user[0]?.id || "SYSTEM",
        };
      });

      await DocumentModel.bulkCreate(newDocuments, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      status: true,
      message: "Event and related documents copied successfully",
      newEvent,
    });
  } catch (err) {
    await transaction.rollback();
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.excel_upload_user_event_notification_send_fun = async (
  req,
  res,
  next
) => {
  const transaction = await sequelize.transaction();
  try {
    const { event_id, emails } = req.body;

    if (!event_id || !emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        status: false,
        message: "event_id and emails[] are required",
      });
    }

    // 1. Find users by emails
    const users = await User.findAll({
      where: { email: { [Op.in]: emails } },
      raw: true,
    });

    if (users.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No matching users found for given emails",
      });
    }

    // 2. Get already assigned users for this event
    const existingAssignments = await EventAssignModel.findAll({
      where: {
        tea_event_id: event_id,
        tea_user_id: { [Op.in]: users.map((u) => u.id) },
      },
      raw: true,
    });

    const alreadyAssignedIds = existingAssignments.map((ea) => ea.tea_user_id);

    // 3. Filter only new users (not already assigned)
    const newUsers = users.filter((u) => !alreadyAssignedIds.includes(u.id));

    if (newUsers.length === 0) {
      return res.status(200).json({
        status: true,
        message: "All provided users are already assigned to this event",
      });
    }

    // 4. Prepare insert data
    const newAssignments = newUsers.map((user) => ({
      tea_event_id: event_id,
      tea_user_id: user.id,
      tea_excel_upload_status: "excel_upload",
      tea_created_by: req?.user[0]?.id || null,
      tea_updated_by: req?.user[0]?.id || null,
    }));

    // 5. Bulk insert
    await EventAssignModel.bulkCreate(newAssignments, { transaction });

    await transaction.commit();

    return res.status(201).json({
      status: true,
      message: "Users assigned to event successfully",
      assignedUsers: newUsers,
    });
  } catch (err) {
    await transaction.rollback();
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.event_review_form_excel_upload_fun = async (
  req,
  res,
  next
) => {
  
   const transaction = await sequelize.transaction();

  try {
    const { event_id, users } = req.body;

    if (!event_id || !users || !users.length) {
      return res.status(400).json({
        status: false,
        message: "Invalid request data",
      });
    }

    // Get all assigned users for this event
    const assignedUsers = await EventAssignModel.findAll({
      where: { tea_event_id: event_id },
      transaction,
    });

    const assignedUserIds = assignedUsers.map(u => u.tea_user_id);

    let createdRecords = [];

    for (const user of users) {

      // Get user by email
      const existingUser = await User.findOne({
        where: { email: user.email },
        transaction,
      });

      if (!existingUser) continue;

      // Check if assigned to event
      if (!assignedUserIds.includes(existingUser.id)) continue;

      // Check if already submitted
      const alreadySubmitted = await EventReviewFormModel.findOne({
        where: {
          terf_event_id: event_id,
          terf_created_by: existingUser.id,
        },
        transaction,
      });

      if (alreadySubmitted) continue;

      // Create review form
      const review = await EventReviewFormModel.create(
        {
          terf_event_id: event_id,
          terf_name: existingUser.name,
          terf_event_join_date: user.join_date || null,
          terf_event_join_time: user.join_time || null,
          terf_event_end_date: user.end_date || null,
          terf_event_end_time: user.end_time || null,
          terf_remarks: user.remarks || null,
          terf_status: "submitted",
          terf_created_by: existingUser.id,
          terf_updated_by: existingUser.id,
        },
        { transaction }
      );

      // Update assign table
      await EventAssignModel.update(
        { tea_form_submit: "yes" },
        {
          where: {
            tea_event_id: event_id,
            tea_user_id: existingUser.id,
          },
          transaction,
        }
      );

      createdRecords.push(review);
    }

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: "Excel review forms uploaded successfully",
      data: createdRecords,
    });

  } catch (err) {
    await transaction.rollback();
    return next(CustomErrorHandler.internalServerError(err.message));
  }
  
};

module.exports.event_accept_reject_fun = async (req, res, next) => {
  const userId = req?.user[0]?.id;
  const transaction = await sequelize.transaction();

  try {
    const { tea_event_id, tea_remarks, tea_status } = req.body;

    const existingEvent = await EventAssignModel.findOne({
      where: { tea_event_id, tea_user_id: userId },
    });

    if (!existingEvent) {
      return res.status(404).json({
        status: false,
        message: "Event not has not been assigned to you",
      });
    }

    // Fetch max participants from event table
    const event = await EventModel.findOne({
      where: { tevent_id: tea_event_id },
    });

    if (!event) {
      return res
        .status(404)
        .json({ status: false, message: "Event not found." });
    }

    const maxParticipants = event.tevent_volunteers_needed;

    // Count how many users are already booked
    const bookedCount = await EventAssignModel.count({
      where: {
        tea_event_id,
        tea_booked: true,
        tea_status: "accepted",
      },
    });
    

 
    // If user is accepting
    if (tea_status === "accepted") {
      let updateData = {
        tea_remarks,
        tea_status,
        tea_responded_at: new Date(),
      };

      if (bookedCount <= maxParticipants) {
        // Book directly
        updateData.tea_booked = true;
        updateData.tea_waiting_number = null;
      } else {
        // Add to waiting list
        const waitingCount = await EventAssignModel.count({
          where: {
            tea_event_id,
            tea_status: "accepted",
            tea_booked: false,
          },
        });

        updateData.tea_booked = false;
        updateData.tea_waiting_number = waitingCount + 1;
      }

      await EventAssignModel.update(updateData, {
        where: { tea_event_id, tea_user_id: userId },
        transaction,
      });
    } else if (tea_status === "rejected") {
      // Get the rejecting user's record
      const existingRecord = await EventAssignModel.findOne({
        where: { tea_event_id, tea_user_id: userId },
        transaction,
      });

      const wasBooked = existingRecord?.tea_booked;
      const rejectedWaitingNumber = existingRecord?.tea_waiting_number;

      // Reject the user
      await EventAssignModel.update(
        {
          tea_status,
          tea_remarks: null,
          tea_booked: false,
          tea_waiting_number: null,
          tea_responded_at: new Date(),
        },
        {
          where: { tea_event_id, tea_user_id: userId },
          transaction,
        }
      );

      // CASE 1: Booked user rejects
      if (wasBooked) {
        // Promote next waiting user to booked
        const nextUser = await EventAssignModel.findOne({
          where: {
            tea_event_id,
            tea_status: "accepted",
            tea_booked: false,
          },
          order: [["tea_waiting_number", "ASC"]],
          transaction,
        });

        if (nextUser) {
          const nextWaitingNumber = nextUser.tea_waiting_number;

          // Promote to booked
          await EventAssignModel.update(
            {
              tea_booked: true,
              tea_waiting_number: null,
            },
            {
              where: { tea_id: nextUser.tea_id },
              transaction,
            }
          );

          // Shift all users after promoted one up by 1
          await EventAssignModel.update(
            {
              tea_waiting_number: sequelize.literal("tea_waiting_number - 1"),
            },
            {
              where: {
                tea_event_id,
                tea_status: "accepted",
                tea_booked: false,
                tea_waiting_number: {
                  [Op.gt]: nextWaitingNumber,
                },
              },
              transaction,
            }
          );
        }

        // CASE 2: Waiting user rejects
      } else if (rejectedWaitingNumber) {
        // Shift all users with higher waiting number up by 1
        await EventAssignModel.update(
          {
            tea_waiting_number: sequelize.literal("tea_waiting_number - 1"),
          },
          {
            where: {
              tea_event_id,
              tea_status: "accepted",
              tea_booked: false,
              tea_waiting_number: {
                [Op.gt]: rejectedWaitingNumber,
              },
            },
            transaction,
          }
        );
      }
    }

    // If user is rejecting
    // else if (tea_status === 'rejected') {
    //   // Set user to rejected and unbooked
    //   await EventAssignModel.update(
    //     {
    //       tea_status,
    //       tea_remarks : null,
    //       tea_booked: false,
    //       tea_waiting_number: null,
    //       tea_responded_at: new Date(),
    //     },
    //     {
    //       where: { tea_event_id, tea_user_id: userId },
    //       transaction,
    //     }
    //   );

    //   // Promote next waiting user (if any)
    //   const nextUser = await EventAssignModel.findOne({
    //     where: {
    //       tea_event_id,
    //       tea_status: 'accepted',
    //       tea_booked: false,
    //     },
    //     order: [['tea_waiting_number', 'ASC']],
    //     transaction,
    //   });

    //   if (nextUser) {
    //     await EventAssignModel.update(
    //       {
    //         tea_booked: true,
    //         tea_waiting_number: null,
    //       },
    //       {
    //         where: { tea_id: nextUser.tea_id },
    //         transaction,
    //       }
    //     );
    //   }
    // }

    await notificationStatusChanged(tea_event_id, tea_status, userId);

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: "Event status changed successfully",
    });
  } catch (err) {
    await transaction.rollback();
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.event_review_form_list_fun = async (req, res, next) => {
  const userId = req?.user[0]?.id;
  const event_id = req?.body?.event_id;
  if (!event_id) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  try {
    let file_url = process.env.SERVER_FILE_URL;

    var sql = `
        SELECT t_event_review_forms.*,
        users.name,
        COALESCE(docs.documents, '[]'::json) AS documents
        FROM t_event_review_forms
        left join users on users.id = terf_created_by
        LEFT JOIN LATERAL (
          SELECT json_agg(
              to_jsonb(td) ||
              jsonb_build_object(
                  'full_url', '${file_url}' || td.doc_path
              )
          ) AS documents
          FROM t_documents td
          WHERE td.final_doc_id = t_event_review_forms.terf_id
        ) docs ON true
        WHERE terf_event_id = '${event_id}'
      `;
    var records = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    return res.status(200).json({
      status: true,
      message: "Event review form list fetched successfully",
      data: records || null,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.event_review_form_submit_fun = async (req, res, next) => {
  const userId = req?.user?.[0]?.id;
  const transaction = await sequelize.transaction();
  const files = req?.files || [];

  // console.log(files);return

  try {
    const {
      terf_id, // ← use this to check if it's update
      terf_event_id,
      terf_name,
      terf_event_join_date,
      terf_event_join_time,
      terf_event_end_date,
      terf_event_end_time,
      terf_remarks,
    } = req.body;

    const existingEvent = await EventAssignModel.findOne({
      where: { tea_event_id: terf_event_id, tea_user_id: userId },
    });

    if (!existingEvent) {
      return res.status(404).json({
        status: false,
        message: "You are not assigned to this event",
      });
    }

    let eventsubmitData = await EventReviewFormModel.findAll({
      where: { terf_event_id, terf_created_by: userId },
      transaction,
    });

    if (eventsubmitData.length > 0 && !terf_id) {
      return res.status(400).json({
        status: false,
        message: "You have already submitted a review form for this event",
      });
    }

    let reviewFormData;

    let terf_status = "submitted";

    if (terf_id) {
      // Update existing form
      await EventReviewFormModel.update(
        {
          terf_event_id,
          terf_name,
          terf_event_join_date,
          terf_event_join_time,
          terf_event_end_date,
          terf_event_end_time,
          terf_remarks,
          terf_status,
          terf_updated_by: userId,
          terf_updated_at: new Date(),
        },
        {
          where: { terf_id },
          transaction,
        }
      );

      reviewFormData = await EventReviewFormModel.findOne({
        where: { terf_id },
        transaction,
      });
    } else {
      // Create new form
      reviewFormData = await EventReviewFormModel.create(
        {
          terf_event_id,
          terf_name,
          terf_event_join_date,
          terf_event_join_time,
          terf_event_end_date,
          terf_event_end_time,
          terf_remarks,
          terf_status,
          terf_created_by: userId,
          terf_updated_by: userId,
        },
        { transaction }
      );
    }

    await EventAssignModel.update(
      { tea_form_submit: "yes" },
      {
        where: { tea_event_id: terf_event_id, tea_user_id: userId },
        transaction,
      }
    );

    // File upload logic
    if (files?.length > 0) {
      const grouped = files.reduce((acc, file) => {
        (acc[file.fieldname] ||= []).push(file);
        return acc;
      }, {});

      for (const [field, fileGroup] of Object.entries(grouped)) {
        const { metadata } = await saveAndPrepareDocumentMetadata(
          fileGroup,
          reviewFormData.terf_id,
          "uploads/events/review",
          userId,
          transaction
        );

        if (metadata.length) {
          await DocumentModel.bulkCreate(metadata, { transaction });
        }
      }
    }

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: `Event review form ${
        terf_id ? "updated" : "submitted"
      } successfully`,
      data: reviewFormData,
    });
  } catch (err) {
    await transaction.rollback();
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.event_review_form_approve_fun = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      terf_id,
      terf_status,
      terf_approved_remarks,
    } = req.body;

    const adminId = req?.user?.[0]?.id;

    if (!terf_id || !terf_status) {
      return res.status(400).json({
        status: false,
        message: "Invalid request data",
      });
    }

    if (!["approved", "rejected"].includes(terf_status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status value",
      });
    }

    const existingRecord = await EventReviewFormModel.findOne({
      where: { terf_id },
      transaction,
    });

    if (!existingRecord) {
      return res.status(404).json({
        status: false,
        message: "Review form not found",
      });
    }

    // Prevent double approval
    if (existingRecord.terf_status === "approved") {
      return res.status(400).json({
        status: false,
        message: "Already approved",
      });
    }

    await EventReviewFormModel.update(
      {
        terf_status,
        terf_approved_remarks: terf_approved_remarks || null,
        terf_updated_by: adminId,
        terf_updated_at: new Date(),
      },
      {
        where: { terf_id },
        transaction,
      }
    );

    await transaction.commit();

    return res.status(200).json({
      status: true,
      message: `Form ${terf_status} successfully`,
    });

  } catch (err) {
    await transaction.rollback();
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.event_certificate_send_fun = async (req, res, next) => {
  // const transaction = await sequelize.transaction();
  // try {
  const { event_id, event_form_id, send_user_id } = req.body;

  // console.log(event_id, event_form_id,send_user_id);return;

  if (!event_id) {
    return res.status(400).json({
      status: false,
      message: "event_id are required",
    });
  }

  // 1. Find users by emails
  const user = await User.findOne({
    where: { id: send_user_id },
    raw: true,
  });

  // Fetch max participants from event table
  const event = await EventModel.findOne({
    where: { tevent_id: event_id },
  });

  if (user.length === 0) {
    return res.status(404).json({
      status: false,
      message: "No matching user found",
    });
  }

  const worker = new Worker(
    path.resolve(__dirname, "../../../workers/certificateWorker.js")
  );

  worker.postMessage({
    userEmail: user.email,
    name: user.name,
    eventName: event?.tevent_activity_title,
    date: new Date().toLocaleDateString(),
  });

  worker.on("message", (msg) => {
    if (!msg.success) {
      console.error(`Failed for ${user.email}: ${msg.error}`);
    } else {
      console.log(`Certificate sent to ${user.email}`);
    }
    worker.terminate();
  });

  // await transaction.commit();

  return res.status(201).json({
    status: true,
    message: "Users assigned to event successfully",
    assignedUsers: [],
  });
  // } catch (err) {
  //   await transaction.rollback();
  //   return next(CustomErrorHandler.internalServerError(err.message));
  // }
};
