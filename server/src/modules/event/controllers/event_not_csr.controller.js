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
const ExcelJS = require("exceljs");
module.exports.event_list_datatableNotCsr = async (req, res, next) => {
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
        COALESCE(rejected.rejected_participants, 0) AS rejected_participants,
        public_access.role_ids
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

      LEFT JOIN (
          SELECT
              tac.tac_id,
              STRING_AGG(master ->> 'role_id', ',') AS role_ids
          FROM t_approval_channel tac
          LEFT JOIN LATERAL jsonb_array_elements(tac.tac_approval_json) AS master ON TRUE
          WHERE (master ->> 'sequence')::int = 1
          GROUP BY tac.tac_id
      ) AS public_access
          ON public_access.tac_id = t_event.tevent_approval_channel_id
    `;

    /*
      WHERE CONDITIONS
      - Only user’s events
      - Only active events
      - CSR events (default)
    */
    const where = `
      1 = 1
      AND t_event.tevent_is_active = true
      AND tevent_type = 'social_development'
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

module.exports.createEventFormNotCsr = async (req, res, next) => {
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
      tevent_contact_details,

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
        tevent_contact_details,
        tevent_vehicle_arrangement,
        tevent_status: "submitted",
        tevent_created_by: userId,
        tevent_updated_by: userId,
        tevent_type: "social_development",
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

module.exports.updateEventFormNotCsr = async (req, res, next) => {
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
      tevent_contact_details,

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
        tevent_contact_details,

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

module.exports.eventDetailsNotCsr = async (req, res, next) => {
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
            'created_at', a.tea_created_at,
            'responded_at', a.tea_responded_at,
            'name', u.name
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


exports.exportNotCsrEventExcel = async (req, res, next) => {
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
          e.tevent_contact_details,
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
        tevent_type is not null
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
        { header: "Domain", key: "tevent_domain", width: 20 },
        { header: "Activity Title", key: "tevent_activity_title", width: 30 },
        { header: "Activity Description", key: "tevent_activity_description", width: 35 },
        { header: "Expected Impact", key: "tevent_expected_impact", width: 30 },
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
        { header: "Org Type", key: "tevent_org_type", width: 15 },
        { header: "BU", key: "tevent_bu", width: 15 },
        { header: "Start Date", key: "tevent_start_date", width: 15 },
        { header: "End Date", key: "tevent_end_date", width: 15 },
        { header: "Start Time", key: "tevent_start_time", width: 12 },
        { header: "End Time", key: "tevent_end_time", width: 12 },
        { header: "Volunteers Needed", key: "tevent_volunteers_needed", width: 18 },
        { header: "Family Participation", key: "tevent_family_participation", width: 18 },
        { header: "Family Members Count", key: "tevent_family_members_count", width: 20 },
        { header: "Partner Contact", key: "tevent_partner_contact", width: 25 },
        { header: "Contact Person", key: "tevent_contact_person", width: 22 },
        { header: "Contact Details", key: "tevent_contact_details", width: 30 },
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

