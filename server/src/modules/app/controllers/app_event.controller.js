const { sequelize } = require("../../../config/db");
const { isEmpty } = require("../../../helpers/common.helper");
const EventModel = require("../../../models/emo_volunteering/event.model");
const EventAssignModel = require("../../../models/emo_volunteering/event_assign_model");
const {
  notificationStatusChanged,
} = require("../../notification/services/notification.service");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { QueryTypes } = require("sequelize");
const DocumentModel = require("../../../models/documents/documents.model");
const { saveAndPrepareDocumentMetadata } = require("../../../helpers/document.helper");
const EventReviewFormModel = require("../../../models/emo_volunteering/event_review_form.model");

module.exports.event_accept_reject_fun = async (req, res, next) => {
 const userId = req?.user?.id || req.body.userId;
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

    const maxParticipants = event.tevent_no_of_participants;

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

      if (bookedCount < maxParticipants) {
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

module.exports.my_event_list = async (req, res, next) => {
const userId = req?.user?.id || req.body.userId;
  try {
    
    const sql=`
    SELECT e.*, 
    n.tngo_name, 
    ea.tea_id,
    ea.tea_form_submit, 
    ea.tea_status, 
    ea.tea_final_status,
    tss.tschm_schedule_name, 
    tssm.tsubshcm_sub_schedule_name,
    tsdg.tsdg_name,
    t_state.tsl_state_name,
    t_district.tdl_district_name

    FROM t_event e
    LEFT JOIN t_ngo n
      ON e.tevent_ngo_id = n.tngo_id
    LEFT JOIN t_schedule_seven_master tss
      ON e.tevent_schedule_vii = tss.tschm_schedule_id
    LEFT JOIN t_sub_schedule_master tssm
      ON e.tevent_sub_schedule = tssm.tsubshcm_sub_schedule_id
    LEFT JOIN t_sdg_master tsdg
      ON e.tevent_sdgs_id = tsdg.tsdg_id
    LEFT JOIN t_state ON e.tevent_state_id = t_state.tsl_state_id
    LEFT JOIN t_district ON e.tevent_district_id = t_district.tdl_district_id
    INNER JOIN t_event_assign ea
      ON e.tevent_id = ea.tea_event_id
      AND ea.tea_user_id = :userId
      AND ea.tea_status IN ('accepted', 'final_accepted');
  `

    // console.log("sql------------ ",sql);
    

    // ✅ Run raw query with replacements
    const records = await sequelize.query(sql, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    // ✅ Response
    return res.status(200).json({
      status: true,
      message: "Event list fetched successfully",
      data: records?.length ? records : null,
    });
  } catch (err) {
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.comming_soon_events_list = async (req, res, next) => {
  let file_url = process.env.SERVER_FILE_URL;
const userId = req?.user?.id || req.body.userId;


  try {

    const sql = `
      SELECT 
          e.*,
          n.tngo_name,
          tss.tschm_schedule_name, 
          tssm.tsubshcm_sub_schedule_name,
          tsdg.tsdg_name,
          t_state.tsl_state_name,
          t_district.tdl_district_name,
        t_state.tsl_state_name,
        COALESCE(docs.documents, '[]'::json) AS documents
      FROM t_event as e
          LEFT JOIN t_ngo n
            ON e.tevent_ngo_id = n.tngo_id
          LEFT JOIN t_schedule_seven_master tss
            ON e.tevent_schedule_vii = tss.tschm_schedule_id
          LEFT JOIN t_sub_schedule_master tssm
            ON e.tevent_sub_schedule = tssm.tsubshcm_sub_schedule_id
          LEFT JOIN t_sdg_master tsdg
            ON e.tevent_sdgs_id = tsdg.tsdg_id
          LEFT JOIN t_state ON e.tevent_state_id = t_state.tsl_state_id
          LEFT JOIN t_district ON e.tevent_district_id = t_district.tdl_district_id

      LEFT JOIN LATERAL (
          SELECT json_agg(
              to_jsonb(td) ||
              jsonb_build_object(
                  'full_url', :fileUrl || td.doc_path
              )
          ) AS documents
          FROM t_documents td
          WHERE td.final_doc_id = e.tevent_id
      ) docs ON true
      WHERE e.tevent_id IN (
        SELECT DISTINCT tea_event_id
        FROM t_event_assign
        WHERE tea_user_id = :userId
          AND tea_status IS NULL
      )
    `;

    // console.log("sql------------------- ",sql);
    

    // ✅ Run query with replacements
    const records = await sequelize.query(sql, {
      replacements: { userId, fileUrl: file_url },
      type: QueryTypes.SELECT,
    });

    // ✅ Response
    return res.status(200).json({
      status: true,
      message: "Coming soon events fetched successfully",
      data: records?.length ? records : null,
    });
  } catch (err) {
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.get_all_notification_lists = async (req, res, next) => {

const user_id = req?.user?.id || req.body.userId;


  if (user_id != undefined) {
   
    const notiSql = `
            SELECT 
                t_notifications.*,
                t1.events
                FROM public.t_notifications

                

                LEFT JOIN (
                SELECT 
                    t_event.tevent_id,
                    json_agg(
                    json_build_object(
                        'tevent_id', t_event.tevent_id,
                        'tevent_activity_title', t_event.tevent_activity_title,
                        'tevent_start_date_event', t_event.tevent_start_date_event,
                        'tevent_end_date_event', t_event.tevent_end_date_event,
                        'tevent_start_time', t_event.tevent_start_time,
                        'tevent_end_time', t_event.tevent_end_time,
                        'tevent_status', t_event.tevent_status
                    )
                    ) AS events
                FROM 
                    t_event
                GROUP BY 
                    t_event.tevent_id
                ) t1 ON t1.tevent_id = t_notifications.tnot_item_id AND t_notifications.tnot_type = 'event'


                WHERE 
                t_notifications.tnot_is_read = 'N' 
                AND t_notifications.tnot_receiver_id = ${user_id}
                ORDER BY 
                t_notifications.tnot_id DESC;

          `;

    const notification_list = await sequelize.query(notiSql, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json({
      status: 1,
      message: "Notification fetched successfully",
      data: notification_list,
    });
  } else {
    res.status(200).json({
      status: 1,
      message: "Please provide the user id",
      data: [],
    });
  }
};

module.exports.final_event_accept_reject_fun = async (req, res, next) => {
  const userId = req?.user?.id || req.body.userId;
  const transaction = await sequelize.transaction();

  try {
    const { tea_event_id, tea_remarks, tea_final_status } = req.body;
    let tea_status=tea_final_status;
    // ✅ Step 1: Check if event is assigned to user
    const existingEvent = await EventAssignModel.findOne({
      where: { tea_event_id, tea_user_id: userId },
    });

    if (!existingEvent) {
      return res.status(404).json({
        status: false,
        message: "Event has not been assigned to you",
      });
    }

    // ✅ Step 2: Block if not already accepted
    if (existingEvent.tea_status !== "accepted") {
      return res.status(403).json({
        status: false,
        message: "You can proceed only if you have already accepted this event.",
      });
    }

    // ✅ Step 3: Continue with your existing logic
    const event = await EventModel.findOne({
      where: { tevent_id: tea_event_id },
    });

    if (!event) {
      return res
        .status(404)
        .json({ status: false, message: "Event not found." });
    }

    const maxParticipants = event.tevent_no_of_participants;

    const bookedCount = await EventAssignModel.count({
      where: {
        tea_event_id,
        tea_booked: true,
        tea_status: "final_accepted",
      },
    });

    if (tea_status === "final_accepted") {
      let updateData = {
        tea_remarks,
        tea_status,
        tea_responded_at: new Date(),
      };

      if (bookedCount < maxParticipants) {
        updateData.tea_booked = true;
        updateData.tea_waiting_number = null;
        updateData.tea_final_status = tea_status;

      } else {
        const waitingCount = await EventAssignModel.count({
          where: {
            tea_event_id,
            tea_status: "final_accepted",
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
      const existingRecord = await EventAssignModel.findOne({
        where: { tea_event_id, tea_user_id: userId },
        transaction,
      });

      const wasBooked = existingRecord?.tea_booked;
      const rejectedWaitingNumber = existingRecord?.tea_waiting_number;

      await EventAssignModel.update(
        {
          tea_status,
          tea_remarks: null,
          tea_booked: false,
          tea_waiting_number: null,
          tea_responded_at: new Date(),
          tea_final_status: tea_status,
        },
        {
          where: { tea_event_id, tea_user_id: userId },
          transaction,
        }
      );

      if (wasBooked) {
        const nextUser = await EventAssignModel.findOne({
          where: {
            tea_event_id,
            tea_status: "final_accepted",
            tea_booked: false,
          },
          order: [["tea_waiting_number", "ASC"]],
          transaction,
        });

        if (nextUser) {
          const nextWaitingNumber = nextUser.tea_waiting_number;

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

          await EventAssignModel.update(
            {
              tea_waiting_number: sequelize.literal("tea_waiting_number - 1"),
            },
            {
              where: {
                tea_event_id,
                tea_status: "final_accepted",
                tea_booked: false,
                tea_waiting_number: {
                  [Op.gt]: nextWaitingNumber,
                },
              },
              transaction,
            }
          );
        }
      } else if (rejectedWaitingNumber) {
        await EventAssignModel.update(
          {
            tea_waiting_number: sequelize.literal("tea_waiting_number - 1"),
          },
          {
            where: {
              tea_event_id,
              tea_status: "final_accepted",
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

module.exports.event_review_form_submit_fun = async (req, res, next) => {
   const userId = req?.auth?.id || 0;
  const transaction = await sequelize.transaction();
  const files = req?.files || [];


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
      terf_emp_user_name,
      terf_phone_no,
      terf_email,
      terf_attending_event,
      terf_duration,
      terf_family_vol_presence_no,
    } = req.body;

    let terf_status = "submitted";

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
          terf_emp_user_name,
          terf_phone_no,
          terf_email,
          terf_attending_event,
          terf_duration,
          terf_family_vol_presence_no,
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
          terf_emp_user_name,
          terf_phone_no,
          terf_email,
          terf_attending_event,
          terf_duration,
          terf_family_vol_presence_no,
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
          "uploads/event/review",
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

// module.exports.event_review_form_list_fun = async (req, res, next) => {
//   const userId = req?.auth?.id || 0;
//   const file_url = process.env.SERVER_FILE_URL;

//   const sql = `
//     SELECT
//       erf.terf_id,
//       erf.terf_event_id,
//       erf.terf_name,
//       erf.terf_event_join_date,
//       erf.terf_event_join_time,
//       erf.terf_event_end_date,
//       erf.terf_event_end_time,
//       erf.terf_remarks,
//       erf.terf_status,
//       erf.terf_emp_user_name,
//       erf.terf_phone_no,
//       erf.terf_email,
//       erf.terf_attending_event,
//       erf.terf_duration,
//       erf.terf_family_vol_presence_no,
//       erf.terf_created_at,

//       /* ---------- EVENT DETAILS ---------- */
//       jsonb_build_object(
//         'event_id', em.tevent_id,
//         'event_name', em.tevent_activity_title,
//         'event_start_date', em.tevent_start_date,
//         'event_end_date', em.tevent_end_date,
//         'event_location', em.tevent_location,
//         'event_type', em.tevent_type
//       ) AS event_details,

//       /* ---------- DOCUMENT LIST WITH FULL URL ---------- */
//       COALESCE(docs.documents, '[]') AS documents

//     FROM t_event_review_forms erf

//     INNER JOIN t_event em
//       ON em.tevent_id = erf.terf_event_id

//     /* 🔥 LATERAL JOIN FOR DOCUMENTS */
//     LEFT JOIN LATERAL (
//       SELECT jsonb_agg(
//         to_jsonb(td) ||
//         jsonb_build_object(
//           'full_url', '${file_url}' || td.doc_path
//         )
//       ) AS documents
//       FROM t_documents td
//       WHERE td.final_doc_id = erf.terf_id
//     ) docs ON true

//     WHERE erf.terf_created_by = :userId

//     ORDER BY erf.terf_created_at DESC
//   `;

//   const data = await sequelize.query(sql, {
//     replacements: { userId },
//     type: sequelize.QueryTypes.SELECT,
//   });

//   return res.status(200).json({
//     status: true,
//     message: "Event review form list fetched successfully",
//     data,
//   });
// };


module.exports.event_review_form_list_fun = async (req, res, next) => {
  const userId = req?.auth?.id || 0;
  const file_url = process.env.SERVER_FILE_URL;

  try {
    const sql = `
      SELECT
        /* ---------- REVIEW FORM ---------- */
        erf.terf_id,
        erf.terf_event_id,
        erf.terf_name,
        erf.terf_event_join_date,
        erf.terf_event_join_time,
        erf.terf_event_end_date,
        erf.terf_event_end_time,
        erf.terf_remarks,
        erf.terf_status,
        erf.terf_emp_user_name,
        erf.terf_phone_no,
        erf.terf_email,
        erf.terf_attending_event,
        erf.terf_duration,
        erf.terf_family_vol_presence_no,
        erf.terf_created_at,

        /* ---------- EVENT + RELATED DATA (SAME AS my_event_list) ---------- */
        e.*,
        n.tngo_name,
        ea.tea_id,
        ea.tea_form_submit,
        ea.tea_status,
        ea.tea_final_status,
        tss.tschm_schedule_name,
        tssm.tsubshcm_sub_schedule_name,
        tsdg.tsdg_name,
        t_state.tsl_state_name,
        t_district.tdl_district_name,

        /* ---------- DOCUMENT LIST WITH FULL URL ---------- */
        COALESCE(docs.documents, '[]') AS documents

      FROM t_event_review_forms erf

      /* ---------- EVENT ---------- */
      INNER JOIN t_event e
        ON e.tevent_id = erf.terf_event_id

      /* ---------- SAME JOINS AS my_event_list ---------- */
      LEFT JOIN t_ngo n
        ON e.tevent_ngo_id = n.tngo_id

      LEFT JOIN t_schedule_seven_master tss
        ON e.tevent_schedule_vii = tss.tschm_schedule_id

      LEFT JOIN t_sub_schedule_master tssm
        ON e.tevent_sub_schedule = tssm.tsubshcm_sub_schedule_id

      LEFT JOIN t_sdg_master tsdg
        ON e.tevent_sdgs_id = tsdg.tsdg_id

      LEFT JOIN t_state
        ON e.tevent_state_id = t_state.tsl_state_id

      LEFT JOIN t_district
        ON e.tevent_district_id = t_district.tdl_district_id

      INNER JOIN t_event_assign ea
        ON e.tevent_id = ea.tea_event_id
        AND ea.tea_user_id = :userId
        AND ea.tea_status IN ('accepted', 'final_accepted')

      /* ---------- DOCUMENTS (LATERAL JOIN) ---------- */
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(
          to_jsonb(td) ||
          jsonb_build_object(
            'full_url', '${file_url}' || td.doc_path
          )
        ) AS documents
        FROM t_documents td
        WHERE td.final_doc_id = erf.terf_id
      ) docs ON true

      WHERE erf.terf_created_by = :userId

      ORDER BY erf.terf_created_at DESC
    `;

    const data = await sequelize.query(sql, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({
      status: true,
      message: "Event review form list fetched successfully",
      data,
    });
  } catch (err) {
    return next(CustomErrorHandler.internalServerError(err.message));
  }
};


