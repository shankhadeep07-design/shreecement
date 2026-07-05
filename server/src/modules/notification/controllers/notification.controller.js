const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");
const NotificationModel = require("../../../models/notification/notifications.model");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const ApprovalProcessTrackModel = require("../../../models/approval/ApprovalProcessTrackModel");
const {
  notificationStatusChange,
  ApprovalPathList,
  getUserByRoleId,
  generateTenDigitNumber,
   getApprovalUsersRole,
  FindNextApproval,
  getUserById
} = require("../../../helpers/web.helper");
const 
 
  {BudgetAmountMasterModel}
 = require("../../../models/budget/budget_amount_master_model");
 
const ProjectClosureModel = require("../../../models/projects/projects_closure.model");
const {
  budgetDetailsOrderUpdate,
  proposalNotificationUpdate,
  eventNotificationUpdate,
  ngoNotificationUpdate,
  projectNotificationUpdate,
  projectClosureNotificationUpdate,
} = require("../services/notification.service");
const { BudgetsModel } = require("../../../models/budget/budgets.model");
const ProposalModel = require("../../../models/proposal/proposal.model");
const ProjectsModel = require("../../../models/projects/projects.model");
const EventModel = require("../../../models/emo_volunteering/event.model");
const NgoModel = require("../../../models/ngo/ngo.model");
const { isEmpty } = require("../../../helpers/common.helper");
const {BudgetMasterModel} = require("../../../models/budget/budget_master.model");
const ProjectModel = require("../../../models/projects/projects.model");
module.exports.notificationCount = async (req, res, next) => {
  try {
    // console.log(req.body,'------------------------------------------------------');

    const data = await NotificationModel.findAll({
      where: { tnot_receiver_id: req.body.payload.id, tnot_is_read: "N" },
    });

    // console.log(data.length);

    // console.log(data);
    res.json({
      status: 1,
      message: "Notifications count successfully fetched",
      data,
    });
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.pendingNotificationDetailsFun = async (req, res, next) => {
  try {
    const { item_id } = req.body;

    const data = await NotificationModel.findAll({
      where: {
        tnot_receiver_id: req.body.payload.id,
        tnot_item_id: item_id,
        tnot_is_read: "N",
      },
    });

    if (data.length === 0) {
      return res.json({
        status: 0,
        message: "No pending notifications found",
        data: [],
      });
    }
    // console.log(data);
    res.json({
      status: 1,
      message: "Notification successfully fetched",
      data,
    });
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.get_notification_module_wise = async (req, res, next) => {
  // console.log(req.body);
  try {
    const data = await NotificationModel.findAll({
      attributes: [
        "tnot_type",
        [sequelize.fn("COUNT", sequelize.col("tnot_type")), "count"],
      ],
      where: {
        tnot_receiver_id: req.body.payload.id,
        tnot_is_read: "N",
      },
      group: ["tnot_type"],
    });

    res.json({
      status: 1,
      message: "Notifications successfully fetched",
      data,
    });
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.get_all_notification_lists = async (req, res, next) => {
  const user_id = req?.body?.payload?.id;

  if (user_id != undefined) {
    const notiSql = `
  SELECT 
    t_notifications.*,
    t1.budget_master,
    t2.proposal,
    t3.events
  FROM public.t_notifications
  LEFT JOIN (
    SELECT 
      t_budget_master.tbm_id,
      json_agg(
        json_build_object(
          'tbm_id', t_budget_master.tbm_id,
          'tbm_type', t_budget_master.tbm_type,
          'tbm_fy_id', t_budget_master.tbm_fy_id,
          'tbm_proposed_total_amount', t_budget_master.tbm_proposed_total_amount,
          'tbm_status', t_budget_master.tbm_status,
          'tbm_approval_order', t_budget_master.tbm_approval_order
        )
      ) AS budget_master
    FROM t_budget_master
    GROUP BY t_budget_master.tbm_id
  ) t1 ON t1.tbm_id = t_notifications.tnot_item_id  AND t_notifications.tnot_type = 'budgeting'
  LEFT JOIN (
    SELECT 
      t_proposal.tpros_id,
      json_agg(
        json_build_object(
          'tpros_id', t_proposal.tpros_id,
          'tpros_proposal_name', t_proposal.tpros_proposal_name,
          
          'tpros_status', t_proposal.tpros_status,
          'tpros_approval_order', t_proposal.tpros_approval_order,
          'financial_year', t_financial_year.tfy_year_label
        )
      ) AS proposal
    FROM t_proposal
    LEFT JOIN t_financial_year ON t_proposal.tpros_financial_year_id = t_financial_year.tfy_id
    GROUP BY t_proposal.tpros_id
  ) t2 ON t2.tpros_id = t_notifications.tnot_item_id  AND t_notifications.tnot_type = 'proposal'

    LEFT JOIN (
                SELECT 
                    t_event.tevent_id,
                    json_agg(
                    json_build_object(
                        'tevent_id', t_event.tevent_id,
                        'tevent_activity_title', t_event.tevent_activity_title,
                        'tevent_start_date', t_event.tevent_start_date,
                        'tevent_end_date', t_event.tevent_end_date,
                        'tevent_start_time', t_event.tevent_start_time,
                        'tevent_end_time', t_event.tevent_end_time,
                        'tevent_status', t_event.tevent_status
                    )
                    ) AS events
                FROM 
                    t_event

                GROUP BY 
                    t_event.tevent_id
                ) t3 ON t3.tevent_id = t_notifications.tnot_item_id AND t_notifications.tnot_type = 'event'

  WHERE 
    t_notifications.tnot_is_read = 'N' 
    AND t_notifications.tnot_receiver_id = :receiver_id
  ORDER BY t_notifications.tnot_id DESC
`;

    const notification_list = await sequelize.query(notiSql, {
      replacements: { receiver_id: user_id },
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

module.exports.approvalTrackFun = async function (req, res, next) {
  const item_id = req.body.item_id;

  if (item_id != undefined) {
    const query = `
          SELECT *  
          FROM t_approval_process_track 
          left join users on users.id = CAST(t_approval_process_track.apt_created_by AS BIGINT)
          Where apt_item_id = '${item_id}'
          ORDER BY apt_id ASC
        `;

    // Execute the query
    const notifications = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    // Respond with the fetched data
    res.status(200).json({
      status: 1,
      message: "Notifications Approval Track fetched successfully",
      data: notifications,
    });
  } else {
    res.status(200).json({
      status: 1,
      message: "Please provide the user id",
      data: [],
    });
  }
};

// Approval notification
module.exports.submitNotification = async function (req, res, next) {
  try {
    const {
      approval_item_id,
      approval_status,
      approval_remarks,
      approval_type,
    } = req.body;

    if (!approval_status) {
      return res.status(400).json({ message: "Approval status is required" });
    }

    if (!approval_remarks) {
      return res.status(400).json({ message: "Approval remarks is required" });
    }

    // console.log("-------------------------------------------------", req.body);return

    const creatorUserId = req.body.payload.id;
    const creatorRoleId = req.body.payload.role_id;
    const item_id = approval_item_id;

    const tenDigitNumber = generateTenDigitNumber();

    if (!approval_type) {
      return res.status(400).json({ message: "Approval type is required" });
    }

    // ---- BUDGETING APPROVAL FLOW ----
    if (approval_type === "budgeting") {
      if (!approval_item_id) {
        return res
          .status(400)
          .json({ message: "Approval item ID is required" });
      }

      // Fetch budget details
      const budgetDetails = await BudgetMasterModel.findOne({
        where: { tbm_id: approval_item_id },
      });

      if (!budgetDetails) {
        return res.status(404).json({ message: "Budget data not found" });
      }

      // Notify system about status change
      await notificationStatusChange("budgeting", approval_item_id);

      // Next approval order
      const approval_order = (budgetDetails?.tbm_approval_order || 0) + 1;

      // Get Approval Path
      const ApprovalPathListData = await ApprovalPathList(
        "budgeting",
        approval_order,
      );

      // ---- HANDLE APPROVAL STATUSES ----
      if (ApprovalPathListData.length > 0) {
        switch (approval_status) {
          case "approved":
            await budgetDetailsOrderUpdate(
              "send_for_approval",
              approval_order,
              item_id,
              creatorUserId,
            );

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
                  tnot_module: "budgeting",
                  tnot_type: "budgeting",
                  tnot_item_id: approval_item_id,
                  tnot_receiver_id: user_data.id,
                  tnot_sender_id: creatorUserId,

                  tnot_text: "Approval for budgeting",
                  tnot_url: `budgeting/budgeting_details/${approval_item_id}?rand=${tenDigitNumber}`,
                }));

                await NotificationModel.bulkCreate(notifications);
              }
            }

            break;

          case "reject":
            await budgetDetailsOrderUpdate(
              "reject",
              null,
              item_id,
              creatorUserId,
            );
            break;

          case "resend":
            // Reset status back to "pending" and keep same approval order
            await budgetDetailsOrderUpdate(
              "pending",
              null,
              item_id,
              creatorUserId,
            );

            await NotificationModel.create({
              tnot_module: "budgeting",
              tnot_type: "budgeting",
              tnot_item_id: approval_item_id,
              tnot_receiver_id: budgetDetails.tbm_created_by,
              tnot_text: "Resend for budgeting approval",
              tnot_url:
                "budgeting/budgeting_details/" +
                approval_item_id +
                "?rand=" +
                tenDigitNumber,
              tnot_sender_id: creatorUserId,
            });

            break;

          default:
            await budgetDetailsOrderUpdate(
              approval_status,
              null,
              item_id,
              creatorUserId,
            );
            break;
        }

        // Insert approval tracking
        await ApprovalProcessTrackModel.create({
          apt_type: "budgeting",
          apt_item_id: item_id,
          apt_user_id: creatorUserId,
          apt_user_role: creatorRoleId,
          apt_recipient_id: creatorUserId,
          apt_remarks: approval_remarks,
          apt_accept_step:
            approval_status === "approved"
              ? "reviewed"
              : approval_status === "reject"
                ? "reject"
                : approval_status === "resend"
                  ? "resend"
                  : "reviewed",
          apt_accept_status: approval_status,
          apt_created_at: new Date(),
          apt_updated_at: new Date(),
          apt_created_by: creatorUserId,
          apt_updated_by: creatorUserId,
        });
      } else {
        switch (approval_status) {
          case "approved":
            // No approval path found → directly update
            await budgetDetailsOrderUpdate(
              "approved",
              null,
              item_id,
              creatorUserId,
            );
            break;

          case "reject":
            await budgetDetailsOrderUpdate(
              approval_status,
              null,
              approval_item_id,
              creatorUserId,
            );
            break;

          case "resend":
            // Reset status back to "pending" and keep same approval order
            await budgetDetailsOrderUpdate(
              "draft",
              null,
              approval_item_id,
              creatorUserId,
            );
            await NotificationModel.create({
              tnot_module: "budgeting",
              tnot_type: "budgeting",
              tnot_item_id: approval_item_id,
              tnot_receiver_id: budgetDetails.tpros_created_by,
              tnot_text: "Resend for budgeting approval",
              tnot_url:
                "budgeting/budgeting_details/" +
                approval_item_id +
                "?rand=" +
                tenDigitNumber,
              tnot_sender_id: creatorUserId,
            });
            break;

          default:
            await budgetDetailsOrderUpdate(
              approval_status,
              null,
              approval_item_id,
              creatorUserId,
            );
            break;
        }

        await ApprovalProcessTrackModel.create({
          apt_type: "budgeting",
          apt_item_id: item_id,
          apt_user_id: creatorUserId,
          apt_user_role: creatorRoleId,
          apt_recipient_id: creatorUserId,
          apt_remarks: approval_remarks,
          apt_accept_step:
            approval_status === "approved"
              ? "approved"
              : approval_status === "reject"
                ? "reject"
                : approval_status === "resend"
                  ? "resend"
                  : "reviewed",
          apt_accept_status: approval_status,
          apt_created_at: new Date(),
          apt_updated_at: new Date(),
          apt_created_by: creatorUserId,
          apt_updated_by: creatorUserId,
        });
      }
    } else if (approval_type === "project") {
      if (!approval_item_id) {
        return res
          .status(400)
          .json({ message: "Approval item ID is required" });
      }

      // Fetch project details
      const projectDetails = await ProjectsModel.findOne({
        where: { tproj_id: approval_item_id },
      });

      if (!projectDetails) {
        return res.status(404).json({ message: "Project data not found" });
      }

      // Notify system about status change
      await notificationStatusChange("project", approval_item_id);

      // Next approval order
      const approval_order = (projectDetails?.tproj_approver_index || 0) + 1;

      // Get Approval Path
      const ApprovalPathListData = await ApprovalPathList(
        "project",
        approval_order,
      );

      // ---- HANDLE APPROVAL STATUSES ----
      if (ApprovalPathListData.length > 0) {
        switch (approval_status) {
          case "approved":
          case "send_for_approval":
            await projectNotificationUpdate(
              "pending",
              approval_order,
              item_id,
              creatorUserId,
            );

            // Notify next approval role users
            for (const data of ApprovalPathListData) {
              const roleIds = data.tapp_role_id.split(",").map((r) => r.trim());

              let approvalUsers = [];
              for (const roleId of roleIds) {
                const users = await getUserByRoleId(roleId);
                approvalUsers = approvalUsers.concat(users);
              }

              if (approvalUsers.length > 0) {
                const notifications = approvalUsers.map((user_data) => ({
                  tnot_module: "project",
                  tnot_type: "project",
                  tnot_item_id: approval_item_id,
                  tnot_receiver_id: user_data.id,
                  tnot_sender_id: creatorUserId,
                  tnot_text: "Approval for project",
                  tnot_url: `project/view-list/${approval_item_id}?rand=${tenDigitNumber}`,
                }));

                await NotificationModel.bulkCreate(notifications);
              }
            }
            break;

          case "reject":
            await projectNotificationUpdate(
              "rejected",
              null,
              item_id,
              creatorUserId,
            );
            break;

          case "resend":
          case "returned":
            // Reset status back to "returned" and keep same approval order
            await projectNotificationUpdate(
              "returned",
              null,
              item_id,
              creatorUserId,
            );

            await NotificationModel.create({
              tnot_module: "project",
              tnot_type: "project",
              tnot_item_id: approval_item_id,
              tnot_receiver_id: projectDetails.tproj_created_by,
              tnot_text: "Project returned for correction",
              tnot_url: `project/view-list/${approval_item_id}?rand=${tenDigitNumber}`,
              tnot_sender_id: creatorUserId,
            });
            break;

          default:
            await projectNotificationUpdate(
              approval_status,
              null,
              item_id,
              creatorUserId,
            );
            break;
        }

        // Insert approval tracking
        await ApprovalProcessTrackModel.create({
          apt_type: "project",
          apt_item_id: item_id,
          apt_user_id: creatorUserId,
          apt_user_role: creatorRoleId,
          apt_recipient_id: creatorUserId,
          apt_remarks: approval_remarks,
          apt_accept_step:
            approval_status === "approved" || approval_status === "send_for_approval"
              ? "reviewed"
              : approval_status === "reject" || approval_status === "rejected"
                ? "reject"
                : approval_status === "resend" || approval_status === "returned"
                  ? "resend"
                  : "reviewed",
          apt_accept_status: approval_status,
          apt_created_at: new Date(),
          apt_updated_at: new Date(),
          apt_created_by: creatorUserId,
          apt_updated_by: creatorUserId,
        });
      } else {
        // FINAL STEP APPROVAL
        switch (approval_status) {
          case "approved":
          case "direct_approved":
            await projectNotificationUpdate(
              "approved",
              null,
              item_id,
              creatorUserId,
            );
            break;

          case "reject":
          case "rejected":
            await projectNotificationUpdate(
              "rejected",
              null,
              item_id,
              creatorUserId,
            );
            break;

          case "resend":
          case "returned":
            await projectNotificationUpdate(
              "returned",
              null,
              item_id,
              creatorUserId,
            );
            await NotificationModel.create({
              tnot_module: "project",
              tnot_type: "project",
              tnot_item_id: approval_item_id,
              tnot_receiver_id: projectDetails.tproj_created_by,
              tnot_text: "Project returned for correction",
              tnot_url: `project/view-list/${approval_item_id}?rand=${tenDigitNumber}`,
              tnot_sender_id: creatorUserId,
            });
            break;

          default:
            await projectNotificationUpdate(
              approval_status,
              null,
              item_id,
              creatorUserId,
            );
            break;
        }

        await ApprovalProcessTrackModel.create({
          apt_type: "project",
          apt_item_id: item_id,
          apt_user_id: creatorUserId,
          apt_user_role: creatorRoleId,
          apt_recipient_id: creatorUserId,
          apt_remarks: approval_remarks,
          apt_accept_step:
            approval_status === "approved" || approval_status === "direct_approved"
              ? "approved"
              : approval_status === "reject" || approval_status === "rejected"
                ? "reject"
                : approval_status === "resend" || approval_status === "returned"
                  ? "resend"
                  : "reviewed",
          apt_accept_status: approval_status,
          apt_created_at: new Date(),
          apt_updated_at: new Date(),
          apt_created_by: creatorUserId,
          apt_updated_by: creatorUserId,
        });
      }
    } else if (approval_type === "event") {

      const transaction = await sequelize.transaction();

      // try {

        if (!approval_item_id) {
          return res.status(400).json({ message: "Approval item ID is required" });
        }

        const currentUserId = req.body.payload?.id;
        const currentRoleId = req.body.payload?.role_id;

        if (!currentUserId || !currentRoleId) {
          return res.status(400).json({ message: "Invalid user data" });
        }

        /* ======================================
          FETCH EVENT
        ======================================= */
        const eventDetails = await EventModel.findOne({
          where: { tevent_id: approval_item_id },
          transaction
        });

        if (!eventDetails) {
          await transaction.rollback();
          return res.status(404).json({ message: "Event not found" });
        }

        await notificationStatusChange("event", approval_item_id);

        const currentOrder = eventDetails.tevent_approval_order || 1;
        const nextOrder = currentOrder + 1;
        const approval_channel_id = eventDetails.tevent_approval_channel_id;

        const event_type =
          eventDetails.tevent_type === "social_development"
            ? "event_social_development"
            : "event_cil";

        /* ======================================
          GET NEXT APPROVAL ROLE
        ======================================= */
        const ApprovalPathListData = await getApprovalUsersRole(
          event_type,
          nextOrder,
          currentRoleId,
          'no',
          approval_channel_id
        );

        // console.log(ApprovalPathListData);return;

        /* ======================================
          APPROVED
        ======================================= */
        if (approval_status === "approved") {

          if (ApprovalPathListData && ApprovalPathListData.length > 0) {

            const nextRoleRaw = ApprovalPathListData[0]?.role_id || null;

            const nextRoleId =
              nextRoleRaw?.split(",")[0]?.trim() || null;

            /* ---- Update Event for Next Level ---- */
            await EventModel.update(
              {
                tevent_approval_order: nextOrder,
                tevent_approval_role_id: nextRoleId,
                tevent_approval_channel_id: eventDetails.tevent_approval_channel_id,
                tevent_status: "send_for_approval"
              },
              { where: { tevent_id: approval_item_id }, transaction }
            );

            /* ---- Notify Next Role Users ---- */
            const roleIds = nextRoleRaw.split(",").map(r => r.trim());

            let approvalUsers = [];

            for (const roleId of roleIds) {
              const users = await getUserByRoleId(roleId);
              if (users?.length) approvalUsers = approvalUsers.concat(users);
            }

            if (approvalUsers.length > 0) {

              let notification_text = "";
              let notification_url = "";

              if (eventDetails.tevent_type === "social_development") {
                notification_text = `New Social Development event sent for approval: ${eventDetails.tevent_activity_title}`;
                notification_url = `/event-social-development/${approval_item_id}`;
              } else {
                notification_text = `CIL event sent for approval: ${eventDetails.tevent_activity_title}`;
                notification_url = `/event-cil/${approval_item_id}`;
              }

              const notifications = approvalUsers.map(user => ({
                tnot_module: "event",
                tnot_type: "event",
                tnot_item_id: approval_item_id,
                tnot_receiver_id: user.id,
                tnot_text: notification_text,
                tnot_url: notification_url,
                tnot_sender_id: currentUserId,
                tnot_approval_order: nextOrder
              }));

              await NotificationModel.bulkCreate(notifications, { transaction });
            }

          } else {

            /* ---- Final Approval ---- */
            await EventModel.update(
              {
                tevent_status: "approved",
                tevent_approval_order: nextOrder,
                tevent_approval_role_id: null
              },
              { where: { tevent_id: approval_item_id }, transaction }
            );
          }
        }

        /* ======================================
          REJECT
        ======================================= */
        else if (approval_status === "reject") {

          await EventModel.update(
            {
              tevent_status: "reject",
              tevent_approval_role_id: null
            },
            { where: { tevent_id: approval_item_id }, transaction }
          );

          await NotificationModel.create({
            tnot_module: "event",
            tnot_type: "event",
            tnot_item_id: approval_item_id,
            tnot_receiver_id: eventDetails.tevent_created_by,
            tnot_text: `Your event has been rejected: ${eventDetails.tevent_activity_title}`,
            tnot_url:
              eventDetails.tevent_type === "social_development"
                ? `/event-social-development/${approval_item_id}`
                : `/event-cil/${approval_item_id}`,
            tnot_sender_id: currentUserId,
            tnot_approval_order: currentOrder
          }, { transaction });
        }

        /* ======================================
          RESEND
        ======================================= */
        else if (approval_status === "resend") {

          await EventModel.update(
            {
              tevent_status: "draft",
              tevent_approval_order: 1,
              tevent_approval_role_id: null
            },
            { where: { tevent_id: approval_item_id }, transaction }
          );

          await NotificationModel.create({
            tnot_module: "event",
            tnot_type: "event",
            tnot_item_id: approval_item_id,
            tnot_receiver_id: eventDetails.tevent_created_by,
            tnot_text: `Your event has been sent back for modification: ${eventDetails.tevent_activity_title}`,
            tnot_url:
              eventDetails.tevent_type === "social_development"
                ? `/event-social-development/${approval_item_id}`
                : `/event-cil/${approval_item_id}`,
            tnot_sender_id: currentUserId,
            tnot_approval_order: 1
          }, { transaction });
        }

        /* ======================================
          OTHER STATUS
        ======================================= */
        else {
          await EventModel.update(
            { tevent_status: approval_status },
            { where: { tevent_id: approval_item_id }, transaction }
          );
        }

        /* ======================================
          INSERT APPROVAL TRACK
        ======================================= */

        const hasNextLevel = Array.isArray(ApprovalPathListData) && ApprovalPathListData.length > 0;

        const acceptStep =
          approval_status === "approved"
            ? (hasNextLevel ? "reviewed" : "approved")
            : approval_status;

        await ApprovalProcessTrackModel.create({
          apt_type: "event",
          apt_item_id: approval_item_id,
          apt_user_id: currentUserId,
          apt_user_role: currentRoleId,
          apt_recipient_id: currentUserId,
          apt_remarks: approval_remarks || null,
          apt_accept_step: acceptStep,
          apt_accept_status: approval_status,
          apt_created_at: new Date(),
          apt_updated_at: new Date(),
          apt_created_by: currentUserId,
          apt_updated_by: currentUserId,
        }, { transaction });

        await transaction.commit();

        return res.json({
          status: true,
          message: "Event approval processed successfully"
        });

      // } catch (error) {

      //   await transaction.rollback();
      //   console.error("Event approval error:", error);

      //   return res.status(500).json({
      //     status: false,
      //     message: "Something went wrong",
      //     error: error.message
      //   });
      // }
    } else if (approval_type === "ngo") {
      if (!approval_item_id) {
        return res
          .status(400)
          .json({ message: "Approval item ID is required" });
      }

      // Fetch ngo details
      const ngoDetails = await NgoModel.findOne({
        where: { tngo_id: approval_item_id },
      });

      if (!ngoDetails) {
        return res.status(404).json({ message: "ngo data not found" });
      }

      // Notify system about status change
      await notificationStatusChange("ngo", approval_item_id);

      // Next approval order
      const approval_order = (ngoDetails?.tngo_approval_order || 0) + 1;

      console.log("approval_order", approval_order);

      // Get Approval Path
      const ApprovalPathListData = await ApprovalPathList(
        "ngo",
        approval_order,
      );

      // console.log("ApprovalPathListData--------------------------------", ApprovalPathListData);return

      // ---- HANDLE APPROVAL STATUSES ----
      if (ApprovalPathListData.length > 0) {
        switch (approval_status) {
          case "approved":
            await ngoNotificationUpdate(
              "send_for_approval",
              approval_order,
              approval_item_id,
              creatorUserId,
            );

            // Notify next approval role users
            for (const data of ApprovalPathListData) {
              // Split comma-separated role IDs → ["3", "4", "7"]
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
                  tnot_item_id: approval_item_id,
                  tnot_receiver_id: user_data.id,
                  tnot_text: "Approval for ngo",
                  tnot_url: `ngo/view/${approval_item_id}?rand=${tenDigitNumber}`,
                  tnot_sender_id: creatorUserId,
                }));

                // Bulk insert instead of one by one
                await NotificationModel.bulkCreate(notifications);
              }
            }

            break;

          case "reject":
            await ngoNotificationUpdate(
              "reject",
              null,
              approval_item_id,
              creatorUserId,
            );
            break;

          case "resend":
            // Reset status back to "pending" and keep same approval order
            await ngoNotificationUpdate(
              null,
              null,
              approval_item_id,
              creatorUserId,
            );
            await NotificationModel.create({
              tnot_module: "ngo",
              tnot_type: "ngo",
              tnot_item_id: approval_item_id,
              tnot_receiver_id: ngoDetails.tpros_created_by,
              tnot_text: "Resend for ngo approval",
              tnot_url:
                "ngo/view/" + approval_item_id + "?rand=" + tenDigitNumber,
              tnot_sender_id: creatorUserId,
            });

            break;

          default:
            await ngoNotificationUpdate(
              approval_status,
              null,
              approval_item_id,
              creatorUserId,
            );
            break;
        }

        // Insert approval tracking
        await ApprovalProcessTrackModel.create({
          apt_type: "ngo",
          apt_item_id: approval_item_id,
          apt_user_id: creatorUserId,
          apt_user_role: creatorRoleId,
          apt_recipient_id: creatorUserId,
          apt_remarks: approval_remarks,
          apt_accept_step:
            approval_status === "approved"
              ? "reviewed"
              : approval_status === "reject"
                ? "reject"
                : approval_status === "resend"
                  ? "resend"
                  : "reviewed",
          apt_accept_status: approval_status,
          apt_created_at: new Date(),
          apt_updated_at: new Date(),
          apt_created_by: creatorUserId,
          apt_updated_by: creatorUserId,
        });
      } else {
        switch (approval_status) {
          case "approved":
            // No approval path found → directly update
            await ngoNotificationUpdate(
              "approved",
              null,
              item_id,
              creatorUserId,
            );
            break;

          case "reject":
            await ngoNotificationUpdate(
              approval_status,
              null,
              approval_item_id,
              creatorUserId,
            );
            break;

          case "resend":
            // Reset status back to "pending" and keep same approval order
            await ngoNotificationUpdate(
              "draft",
              null,
              approval_item_id,
              creatorUserId,
            );
            await NotificationModel.create({
              tnot_module: "ngo",
              tnot_type: "ngo",
              tnot_item_id: approval_item_id,
              tnot_receiver_id: ngoDetails.tpros_created_by,
              tnot_text: "Resend for ngo approval",
              tnot_url:
                "ngo/view/" + approval_item_id + "?rand=" + tenDigitNumber,
              tnot_sender_id: creatorUserId,
            });
            break;

          default:
            await ngoNotificationUpdate(
              approval_status,
              null,
              approval_item_id,
              creatorUserId,
            );
            break;
        }

        await ApprovalProcessTrackModel.create({
          apt_type: "ngo",
          apt_item_id: item_id,
          apt_user_id: creatorUserId,
          apt_user_role: creatorRoleId,
          apt_recipient_id: creatorUserId,
          apt_remarks: approval_remarks,
          apt_accept_step:
            approval_status === "approved"
              ? "approved"
              : approval_status === "reject"
                ? "reject"
                : approval_status === "resend"
                  ? "resend"
                  : "reviewed",
          apt_accept_status: approval_status,
          apt_created_at: new Date(),
          apt_updated_at: new Date(),
          apt_created_by: creatorUserId,
          apt_updated_by: creatorUserId,
        });
      }
    }

    // ---- SUCCESS RESPONSE ----
    res.json({
      status: 1,
      message: "Notification submitted successfully",
      data: [],
    });
  } catch (error) {
    console.error("Error in submitNotification:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

// module.exports.sendForApprovalEventsNotificationFun = async function (
//   req,
//   res,
//   next,
// ) {
//   try {
//     const { item_id, remarks, status } = req.body;
//     let user_id = req.body.payload.id;
//     let role_id = req.body.payload.role_id;

//     const event = await EventModel.findOne({ where: { tevent_id: item_id } });
//     if (!event) {
//       return res
//         .status(404)
//         .json({ status: false, message: "Event not found" });
//     }
//     const tenDigitNumber = generateTenDigitNumber();

//     // Get initial approval path
//     const ApprovalPathListData = await ApprovalPathList("event", 1);

//     // Notify next approval role users (budgeting)
//     for (const data of ApprovalPathListData) {
//       // Handle comma-separated role ids
//       const roleIds = data.tapp_role_id.split(",").map((r) => r.trim());

//       let approvalUsers = [];
//       for (const roleId of roleIds) {
//         const users = await getUserByRoleId(roleId);
//         approvalUsers = approvalUsers.concat(users);
//       }

//       if (approvalUsers.length > 0) {
//         let notification_text = ``;
//         let notification_url = ``;
//         if (event.tevent_type == "social_development") {
//           notification_text = `New Social development event send for approval: ${event.tevent_activity_title}`;
//           notification_url = `/event-social-development/${item_id}`;
//         } else {
//           notification_text = `CIL event send for approval: ${event.tevent_activity_title}`;
//           notification_url = `/event-cil/${item_id}`;
//         }

//         const notifications = approvalUsers.map((user_data) => ({
//           tnot_module: "event",
//           tnot_type: "event",
//           tnot_item_id: item_id,
//           tnot_receiver_id: user_data.id,
//           tnot_text: notification_text,
//           tnot_url: notification_url,
//           tnot_sender_id: req.body.payload.id,
//           tnot_approval_order: 1,
//         }));

//         await NotificationModel.bulkCreate(notifications);
//       }
//     }

//     await ApprovalProcessTrackModel.create({
//       apt_type: "event",
//       apt_item_id: item_id,
//       apt_user_id: user_id,
//       apt_user_role: role_id,
//       apt_recipient_id: user_id,
//       apt_remarks: remarks,
//       apt_accept_step: "initial",
//       apt_accept_status: status,
//       apt_created_at: new Date(),
//       apt_updated_at: new Date(),
//       apt_created_by: user_id,
//       apt_updated_by: user_id,
//     });

//     EventModel.update(
//       { tevent_status: "send_for_approval", tevent_approval_order: 1 },
//       { where: { tevent_id: item_id } },
//     );

//     res.json({
//       status: 1,
//       message: "Notification submitted successfully",
//       data: [],
//     });
//   } catch (error) {
//     console.error("Error in submitNotification:", error);
//     res.status(500).json({ message: "An error occurred", error });
//   }
// };

module.exports.sendForApprovalNgoNotificationFun = async function (
  req,
  res,
  next,
) {
  try {
    const { item_id, remarks, status } = req.body;
    let user_id = req.body.payload.id;
    let role_id = req.body.payload.role_id;

    const ngo = await NgoModel.findOne({ where: { tngo_id: item_id } });
    if (!ngo) {
      return res.status(404).json({ status: false, message: "ngo not found" });
    }
    const tenDigitNumber = generateTenDigitNumber();

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
          tnot_item_id: item_id,
          tnot_receiver_id: user_data.id,
          tnot_text: "Send NGO for  approval",
          tnot_url: `ngo/view/${item_id}?rand=${tenDigitNumber}`,
          tnot_sender_id: req.body.payload.id,
        }));

        await NotificationModel.bulkCreate(notifications);
      }
    }

    await ApprovalProcessTrackModel.create({
      apt_type: "ngo",
      apt_item_id: item_id,
      apt_user_id: user_id,
      apt_user_role: role_id,
      apt_recipient_id: user_id,
      apt_remarks: remarks,
      apt_accept_step: "initial",
      apt_accept_status: status,
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: user_id,
      apt_updated_by: user_id,
    });

    NgoModel.update(
      { tngo_status: "send_for_approval", tngo_approval_order: 1 },
      { where: { tngo_id: item_id } },
    );

    res.json({
      status: 1,
      message: "Notification submitted successfully",
      data: [],
    });
  } catch (error) {
    console.error("Error in submitNotification:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

// module.exports.pendingFromUsersEventsNotificationFun = async function (
//   req,
//   res,
//   next,
// ) {
//   try {
//     const { item_id } = req.body;
//     let user_id = req.body.payload.id;
//     let role_id = req.body.payload.role_id;

//     NotificationModel.findAll({
//       where: {
//         tnot_receiver_id: user_id,
//         tnot_item_id: item_id,
//         tnot_is_read: "N",
//       },
//       order: [["tnot_created_at", "DESC"]],
//     }).then((data) => {});
//   } catch (error) {
//     console.error("Error in submitNotification:", error);
//     res.status(500).json({ message: "An error occurred", error });
//   }
// };

module.exports.submitBudgetNotification = async function (req, res, next) {
  // try {
  const {
    item_id,
    creator_id,
    user_id,
    status,
    remarks,
    notification_type,
    approvar_index,
   
  } = req.body;

  // console.log(notification_type);return

  if (isEmpty(item_id))
    return next(CustomErrorHandler.validationError("Item id is required."));

  if (isEmpty(notification_type))
    return next(
      CustomErrorHandler.validationError("Notification type is required."),
    );

  const BudgetDetails = await BudgetMasterModel.findAll({
    where: { tbm_id: item_id },
  });

  if (isEmpty(BudgetDetails))
    return next(
      CustomErrorHandler.validationError("Budget details not found."),
    );

  notificationStatusChange(notification_type, item_id);

  let approval_id = BudgetDetails[0]?.tbm_approval_id;

  if (approvar_index === 1 && status === "resend") {
    await BudgetMasterModel.update(
      {
        tbm_status: null,
        tbm_not_type: null,
        tbm_approval_id: null,
        tbm_approver_index: null,
        tbm_user_role_id: null,
        tbm_user_id: null,
        tbm_forward: null,
      },
      { where: { tbm_id: item_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: BudgetDetails[0]?.tbm_created_by,
      tnot_text: "Approval For Budget resend",
      tnot_url: `budgeting/budgeting_details/${item_id}`,
      tnot_sender_id: creator_id,
      tnot_status: status,
      tnot_table_type: "budgeting",
    };

    // Create notification
    await NotificationModel.create(notification);

    await ApprovalProcessTrackModel.create({
      apt_type: notification_type,
      apt_item_id: item_id,
      apt_user_id: creator_id,
      apt_user_role: req.body.payload.role_id,
      apt_recipient_id: creator_id,
      apt_remarks: remarks,
      apt_accept_step: "resend",
      apt_accept_status: status,
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: creator_id,
      apt_updated_by: creator_id,
    });

    return res.json({
      status: 1,
      message: "Notification resend successfully",
      data: [], // Sending the created ID in the response
    });
  }

  if (status === "direct_approved") {
    BudgetMasterModel.update(
      {
        tbm_user_id: null,
        tbm_user_role_id: null,
        tbm_status: "approved",
      },
      { where: { tbm_id: item_id } },
    );

    // BudgetAmountMasterModel.update(
    //   { tbam_status: "approved" },
    //   { where: { tbam_budget_id: item_id } },
    // );



    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: BudgetDetails[0]?.tbm_created_by,
      tnot_text: "Budget Approved",
      tnot_url: `budgeting/budgeting_details/${item_id}`,
      tnot_sender_id: user_id,
      tnot_table_type: "budgeting",
    };

    // Create notification
    await NotificationModel.create(notification);

    await ApprovalProcessTrackModel.create({
      apt_type: notification_type,
      apt_item_id: item_id,
      apt_user_id: creator_id,
      apt_user_role: req.body.payload.role_id,
      apt_recipient_id: creator_id,
      apt_remarks: remarks,
      apt_accept_step: "approved",
      apt_accept_status: "approved",
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: creator_id,
      apt_updated_by: creator_id,
    });

    return res.json({
      status: 1,
      message: "Notification resend successfully",
      data: [], // Sending the created ID in the response
    });
  }

  // Check where `tsvld_head_office_proposal_order` is located
  let approval_order = parseInt(approvar_index) + 1;


  var ApprovalPathData = await FindNextApproval(approval_id, approval_order);
  // console.log(ApprovalPathData[0].approval_row);return

  if (status === "approved") {
    BudgetMasterModel.update(
      {
        tbm_user_id: null,
        tbm_user_role_id: null,
        tbm_status: status,
      },
      { where: { tbm_id: item_id } },
    );
    // BudgetAmountMasterModel.update(
    //   { tbam_status: status },
    //   { where: { tbam_budget_id: item_id } },
    // );
  

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: BudgetDetails[0]?.tbm_created_by,
      tnot_text: "Budget Approved",
      tnot_url: `budgeting/budgeting_details/${item_id}`,
      tnot_sender_id: user_id,
      tnot_table_type: "budgeting",
    };

    // Create notification
    await NotificationModel.create(notification);
  } else if (status === "send_for_approval") {
    
   
     var userDetails = await getUserById(user_id);

        // if (ProposalDetails[0]?.tcpr_forward === null) {
        
          BudgetMasterModel.update(
            { 
              tbm_approver_index: approval_order, 
              tbm_user_role_id: userDetails[0]?.role_id, 
              tbm_user_id: user_id,
            }, 
            { where: { tbm_id: item_id } 
          });

    var state_id = BudgetDetails[0]?.tbm_state_id;
    var district_id = BudgetDetails[0]?.tbm_district_id;
    var block_id = BudgetDetails[0]?.tbm_block_id;
    var role_id = ApprovalPathData[0].taca_role_id;

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: user_id,
      tnot_text: "Approval For Budget",
      tnot_url: `budgeting/budgeting_details/${item_id}`,
      tnot_sender_id: creator_id,
      tnot_action_type: status,
      tnot_noti_type: "approval",
      tnot_table_type: "budgeting",
    };

    // Create notification
    await NotificationModel.create(notification);
  }  else if (status === "resend") {
    var ApprovalPathData = await FindNextApproval(
      approval_id,
      approvar_index - 1,
    );
    

    BudgetMasterModel.update(
      {
        tbm_approver_index: approvar_index - 1,
        tbm_user_id: user_id,
        tbm_user_role_id: role_id,
      },
      { where: { tbm_id: item_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: user_id,
      tnot_text: "Approval For Budget resend",
      tnot_url: `budgeting/budgeting_details/${item_id}`,
      tnot_sender_id: creator_id,
      tnot_status: status,
      tnot_table_type: "budgeting",
    };

    // Create notification
    await NotificationModel.create(notification);
  } else if (status === "reject") {
    BudgetMasterModel.update(
      { tbm_status: status },
      { where: { tbm_id: item_id } },
    );
    // BudgetAmountMasterModel.update(
    //   { tbam_status: status },
    //   { where: { tbam_budget_id: item_id } },
    // );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: BudgetDetails[0]?.tbm_created_by,
      tnot_text: "Budget Rejected",
      tnot_url: `budgeting/budgeting_details/${item_id}`,
      tnot_sender_id: user_id,
      tnot_table_type: "budgeting",
    };

    // Create notification
    await NotificationModel.create(notification);
  }

  var accept_step = "";

  if (status == "resend") {
    accept_step = "resend";
  } else if (status == "approved") {
    accept_step = "approved";
  } else {
    accept_step = "reviewed";
  }

  await ApprovalProcessTrackModel.create({
    apt_type: "budgeting",
    apt_item_id: item_id,
    apt_user_id: creator_id,
    apt_user_role: req.body.payload.role_id,
    apt_recipient_id: creator_id,
    apt_remarks: remarks,
    apt_accept_step: accept_step,
    apt_accept_status: status,
    apt_created_at: new Date(),
    apt_updated_at: new Date(),
    apt_created_by: creator_id,
    apt_updated_by: creator_id,
  });

  res.json({
    status: 1,
    message: "Notification submitted successfully",
    data: [], // Sending the created ID in the response
  });

  // } catch (error) {
  //   console.error('Error in submitNotification:', error);
  //   res.status(500).json({ message: "An error occurred", error });
  // }
};

module.exports.pendingFromUsersEventsNotificationFun = async function (req, res, next) {
  try {

    const { item_id } = req.body;

    if (!item_id) {
      return res.status(400).json({
        status: false,
        message: "Item ID is required"
      });
    }

    const user_id = req.body.payload?.id;
    const role_id = req.body.payload?.role_id;

    if (!user_id || !role_id) {
      return res.status(400).json({
        status: false,
        message: "Invalid user data"
      });
    }

    /* ===============================
       GET EVENT
    ================================ */
    const event = await EventModel.findOne({
      where: { tevent_id: item_id }
    });

    if (!event) {
      return res.status(404).json({
        status: false,
        message: "Event not found"
      });
    }

    /* ===============================
       CHECK STATUS
    ================================ */
    if (event.tevent_status !== "send_for_approval") {
      return res.json({
        status: true,
        message: "No pending approvals",
        data: []
      });
    }
       let pendingUsers = [];
    const roleIds = event.tevent_approval_role_id.split(",").map(r => r.trim());

      for (const rId of roleIds) {
        const users = await getUserByRoleId(rId);
        if (users?.length) {
          pendingUsers = pendingUsers.concat(users);
        }
      }
   
    /* ===============================
       REMOVE DUPLICATES
    ================================ */
    const uniqueUsers = [
      ...new Map(pendingUsers.map(user => [user.id, user])).values()
    ];

    return res.json({
      status: true,
      message: "Pending users fetched successfully",
      data: uniqueUsers
    });

  } catch (error) {
    console.error("Error in pendingFromUsersEventsNotificationFun:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred",
      error: error.message
    });
  }
};


module.exports.sendForApprovalEventsNotificationFun = async function (req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const { item_id, remarks, status } = req.body;

    if (!item_id) {
      return res.status(400).json({ status: false, message: "Item ID is required" });
    }

    const user_id = req.body.payload?.id;
    const role_id = req.body.payload?.role_id;

    if (!user_id || !role_id) {
      return res.status(400).json({ status: false, message: "Invalid user data" });
    }

    /* ==============================
       FIND EVENT
    =============================== */
    const event = await EventModel.findOne({
      where: { tevent_id: item_id },
      transaction
    });

    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ status: false, message: "Event not found" });
    }

    /* ==============================
       EVENT TYPE
    =============================== */
    const event_type = event.tevent_type === "social_development" ? "event_social_development" : "event_cil";

    /* ==============================
       APPROVAL CHANNEL
    =============================== */
    const approval_channel_data = await sequelize.query(
      `
        SELECT *
        FROM t_approval_channel
        WHERE tac_status = 'active'
          AND tac_module_id = :event_type
          AND tac_initiator_role_id = :role_id
        LIMIT 1
      `,
      {
        replacements: { role_id, event_type },
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    if (!approval_channel_data.length) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        message: "Approval channel not configured"
      });
    }

    /* ==============================
       GET APPROVAL PATH
    =============================== */
    const ApprovalPathListData = await getApprovalUsersRole(
      event_type,
      1,
      role_id,
      'yes'
    );

    if (!ApprovalPathListData || !ApprovalPathListData.length) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        message: "Approval path not found"
      });
    }

    /* ==============================
       SEND NOTIFICATIONS
    =============================== */
    for (const data of ApprovalPathListData) {

      if (!data?.role_id) continue;

      const roleIds = data.role_id.split(",").map(r => r.trim());

      let approvalUsers = [];

      for (const rId of roleIds) {
        const users = await getUserByRoleId(rId);
        if (users?.length) {
          approvalUsers = approvalUsers.concat(users);
        }
      }

      if (approvalUsers.length > 0) {

        let notification_text = "";
        let notification_url = "";

        if (event.tevent_type === "social_development") {
          notification_text = `New Social Development event sent for approval: ${event.tevent_activity_title}`;
          notification_url = `/event-social-development/${item_id}`;
        } else {
          notification_text = `CIL event sent for approval: ${event.tevent_activity_title}`;
          notification_url = `/event-cil/${item_id}`;
        }

        const notifications = approvalUsers.map(user => ({
          tnot_module: "event",
          tnot_type: "event",
          tnot_item_id: item_id,
          tnot_receiver_id: user.id,
          tnot_text: notification_text,
          tnot_url: notification_url,
          tnot_sender_id: user_id,
          tnot_approval_order: 1
        }));

        await NotificationModel.bulkCreate(notifications, { transaction });
      }
    }

    /* ==============================
       CREATE APPROVAL TRACK
    =============================== */
    await ApprovalProcessTrackModel.create(
      {
        apt_type: "event",
        apt_item_id: item_id,
        apt_user_id: user_id,
        apt_user_role: role_id,
        apt_recipient_id: user_id,
        apt_remarks: remarks || null,
        apt_accept_step: "initial",
        apt_accept_status: status || "pending",
        apt_created_at: new Date(),
        apt_updated_at: new Date(),
        apt_created_by: user_id,
        apt_updated_by: user_id,
      },
      { transaction }
    );

    /* ==============================
       UPDATE EVENT
    =============================== */
    await EventModel.update(
      {
        tevent_approval_channel_id: approval_channel_data[0].tac_id,
        tevent_approval_role_id: ApprovalPathListData[0]?.role_id || null,
        tevent_status: "send_for_approval",
        tevent_approval_order: 1,
      },
      {
        where: { tevent_id: item_id },
        transaction
      }
    );

    await transaction.commit();

    return res.json({
      status: 1,
      message: "Notification submitted successfully",
      data: [],
    });

  } catch (error) {
    console.error("Error in sendForApprovalEventsNotificationFun:", error);
    await transaction.rollback();
    return res.status(500).json({
      status: false,
      message: "An error occurred",
      error: error.message
    });
  }
};

module.exports.submitProjectNotification = async function (req, res, next) {
  const {
    item_id,
    creator_id,
    user_id,
    status,
    remarks,
    notification_type,
    approvar_index,
  } = req.body;

  if (isEmpty(item_id))
    return next(CustomErrorHandler.validationError("Item id is required."));

  if (isEmpty(notification_type))
    return next(
      CustomErrorHandler.validationError("Notification type is required."),
    );

  const ProjectDetails = await ProjectsModel.findAll({
    where: { tproj_id: item_id },
  });

  if (isEmpty(ProjectDetails))
    return next(
      CustomErrorHandler.validationError("Project details not found."),
    );

  notificationStatusChange(notification_type, item_id);

  let approval_id = ProjectDetails[0]?.tproj_approval_id;

  if (approvar_index === 1 && status === "resend") {
    await ProjectsModel.update(
      {
        tproj_status: "draft",
        tproj_approval_id: null,
        tproj_approver_index: null,
        tproj_user_role_id: null,
        tproj_user_id: null,
      },
      { where: { tproj_id: item_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: ProjectDetails[0]?.tproj_created_by,
      tnot_text: "Approval For Project returned",
      tnot_url: `project/view-list/${item_id}`,
      tnot_sender_id: creator_id,
      tnot_status: status,
      tnot_table_type: "t_projects",
    };

    await NotificationModel.create(notification);

    await ApprovalProcessTrackModel.create({
      apt_type: notification_type,
      apt_item_id: item_id,
      apt_user_id: creator_id,
      apt_user_role: req.body.payload.role_id,
      apt_recipient_id: creator_id,
      apt_remarks: remarks,
      apt_accept_step: "resend",
      apt_accept_status: status,
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: creator_id,
      apt_updated_by: creator_id,
    });

    return res.json({
      status: 1,
      message: "Notification returned successfully",
      data: [],
    });
  }

  if (status === "direct_approved") {
    await ProjectsModel.update(
      {
        tproj_user_id: null,
        tproj_user_role_id: null,
        tproj_status: "approved",
      },
      { where: { tproj_id: item_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: ProjectDetails[0]?.tproj_created_by,
      tnot_text: "Project Approved",
      tnot_url: `project/view-list/${item_id}`,
      tnot_sender_id: user_id,
      tnot_table_type: "t_projects",
    };

    await NotificationModel.create(notification);

    await ApprovalProcessTrackModel.create({
      apt_type: notification_type,
      apt_item_id: item_id,
      apt_user_id: creator_id,
      apt_user_role: req.body.payload.role_id,
      apt_recipient_id: creator_id,
      apt_remarks: remarks,
      apt_accept_step: "approved",
      apt_accept_status: "approved",
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: creator_id,
      apt_updated_by: creator_id,
    });

    return res.json({
      status: 1,
      message: "Project direct approved successfully",
      data: [],
    });
  }

  let approval_order = parseInt(approvar_index) + 1;

  if (status === "approved") {
    await ProjectsModel.update(
      {
        tproj_user_id: null,
        tproj_user_role_id: null,
        tproj_status: "approved",
      },
      { where: { tproj_id: item_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: ProjectDetails[0]?.tproj_created_by,
      tnot_text: "Project Approved",
      tnot_url: `project/view-list/${item_id}`,
      tnot_sender_id: user_id,
      tnot_table_type: "t_projects",
    };

    await NotificationModel.create(notification);
  } else if (status === "send_for_approval") {
    const userDetailsArray = await getUserById(user_id);
    const targetUserId = userDetailsArray[0]?.id;
    const targetRoleId = userDetailsArray[0]?.role_id;

    await ProjectsModel.update(
      { 
        tproj_approver_index: approval_order, 
        tproj_user_role_id: targetRoleId, 
        tproj_user_id: targetUserId,
      }, 
      { where: { tproj_id: item_id } 
    });

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: targetUserId,
      tnot_text: "Approval For Project",
      tnot_url: `project/view-list/${item_id}`,
      tnot_sender_id: creator_id,
      tnot_action_type: status,
      tnot_noti_type: "approval",
      tnot_table_type: "t_projects",
    };

    await NotificationModel.create(notification);
  } else if (status === "reject") {
    await ProjectsModel.update(
      { tproj_status: "rejected" },
      { where: { tproj_id: item_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: ProjectDetails[0]?.tproj_created_by,
      tnot_text: "Project Rejected",
      tnot_url: `project/view-list/${item_id}`,
      tnot_sender_id: user_id,
      tnot_table_type: "t_projects",
    };

    await NotificationModel.create(notification);
  }

  let accept_step = "";
  if (status === "resend") accept_step = "resend";
  else if (status === "approved" || status === "direct_approved") accept_step = "approved";
  else accept_step = "reviewed";

  await ApprovalProcessTrackModel.create({
    apt_type: notification_type,
    apt_item_id: item_id,
    apt_user_id: creator_id,
    apt_user_role: req.body.payload.role_id,
    apt_recipient_id: creator_id,
    apt_remarks: remarks,
    apt_accept_step: accept_step,
    apt_accept_status: status,
    apt_created_at: new Date(),
    apt_updated_at: new Date(),
    apt_created_by: creator_id,
    apt_updated_by: creator_id,
  });

  res.json({
    status: 1,
    message: "Project notification submitted successfully",
    data: [],
  });
};

module.exports.submitProjectClosureNotification = async function (req, res, next) {
  const {
    item_id,
    creator_id,
    user_id,
    status,
    remarks,
    notification_type,
    approvar_index,
  } = req.body;

  if (isEmpty(item_id))
    return next(CustomErrorHandler.validationError("Item id is required."));

  if (isEmpty(notification_type))
    return next(
      CustomErrorHandler.validationError("Notification type is required."),
    );

  const ClosureDetails = await ProjectClosureModel.findAll({
    where: { tpclsr_id: item_id },
  });

  if (isEmpty(ClosureDetails))
    return next(
      CustomErrorHandler.validationError("Project closure details not found."),
    );

  const tenDigitNumber = generateTenDigitNumber();
  notificationStatusChange(notification_type, item_id);

  let approval_id = ClosureDetails[0]?.tpclsr_approval_id;

  if (approvar_index === 1 && status === "resend") {
    await ProjectClosureModel.update(
      {
        tpclsr_status: "draft",
        tpclsr_approval_id: null,
        tpclsr_approver_index: null,
        tpclsr_user_role_id: null,
        tpclsr_user_id: null,
      },
      { where: { tpclsr_id: item_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: ClosureDetails[0]?.tpclsr_created_by,
      tnot_text: "Approval For Project Closure returned",
      tnot_url: `project/closure/view-list/${item_id}?rand=${tenDigitNumber}`,
      tnot_sender_id: creator_id,
      tnot_status: status,
      tnot_table_type: "t_project_closures",
    };

    await NotificationModel.create(notification);

    await ApprovalProcessTrackModel.create({
      apt_type: notification_type,
      apt_item_id: item_id,
      apt_user_id: creator_id,
      apt_user_role: req.body.payload.role_id,
      apt_recipient_id: creator_id,
      apt_remarks: remarks,
      apt_accept_step: "resend",
      apt_accept_status: status,
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: creator_id,
      apt_updated_by: creator_id,
    });

    return res.json({
      status: 1,
      message: "Notification returned successfully",
      data: [],
    });
  }

  if (status === "direct_approved") {
    await ProjectClosureModel.update(
      {
        tpclsr_user_id: null,
        tpclsr_user_role_id: null,
        tpclsr_status: "approved",
      },
      { where: { tpclsr_id: item_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: ClosureDetails[0]?.tpclsr_created_by,
      tnot_text: "Project Closure Approved",
      tnot_url: `project/closure/view-list/${item_id}?rand=${tenDigitNumber}`,
      tnot_sender_id: user_id,
      tnot_table_type: "t_project_closures",
    };

    await NotificationModel.create(notification);

    await ApprovalProcessTrackModel.create({
      apt_type: notification_type,
      apt_item_id: item_id,
      apt_user_id: creator_id,
      apt_user_role: req.body.payload.role_id,
      apt_recipient_id: creator_id,
      apt_remarks: remarks,
      apt_accept_step: "approved",
      apt_accept_status: "approved",
      apt_created_at: new Date(),
      apt_updated_at: new Date(),
      apt_created_by: creator_id,
      apt_updated_by: creator_id,
    });

    return res.json({
      status: 1,
      message: "Project closure direct approved successfully",
      data: [],
    });
  }

  let approval_order = parseInt(approvar_index) + 1;

  if (status === "approved") {
    await ProjectClosureModel.update(
      {
        tpclsr_user_id: null,
        tpclsr_user_role_id: null,
        tpclsr_status: "approved",
      },
      { where: { tpclsr_id: item_id } },
    );

    ProjectModel.update(
      { tproj_status: "closed" },
      { where: { tproj_id: ClosureDetails[0]?.tpclsr_project_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: ClosureDetails[0]?.tpclsr_created_by,
      tnot_text: "Project Closure Approved",
      tnot_url: `project/closure/view-list/${item_id}?rand=${tenDigitNumber}`,
      tnot_sender_id: user_id,
      tnot_table_type: "t_project_closures",
    };

    await NotificationModel.create(notification);
  } else if (status === "send_for_approval") {
    const userDetailsArray = await getUserById(user_id);
    const targetUserId = userDetailsArray[0]?.id;
    const targetRoleId = userDetailsArray[0]?.role_id;

    await ProjectClosureModel.update(
      { 
        tpclsr_approver_index: approval_order, 
        tpclsr_user_role_id: targetRoleId, 
        tpclsr_user_id: targetUserId,
      }, 
      { where: { tpclsr_id: item_id } 
    });

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: targetUserId,
      tnot_text: "Approval For Project Closure",
      tnot_url: `project/closure/view-list/${item_id}?rand=${tenDigitNumber}`,
      tnot_sender_id: creator_id,
      tnot_action_type: status,
      tnot_noti_type: "approval",
      tnot_table_type: "t_project_closures",
    };

    await NotificationModel.create(notification);
  } else if (status === "reject") {
    await ProjectClosureModel.update(
      { tpclsr_status: "rejected" },
      { where: { tpclsr_id: item_id } },
    );

    const notification = {
      tnot_type: notification_type,
      tnot_item_id: item_id,
      tnot_receiver_id: ClosureDetails[0]?.tpclsr_created_by,
      tnot_text: "Project Closure Rejected",
      tnot_url: `project/closure/view-list/${item_id}?rand=${tenDigitNumber}`,
      tnot_sender_id: user_id,
      tnot_table_type: "t_project_closures",
    };

    await NotificationModel.create(notification);
  }

  let accept_step = "";
  if (status === "resend") accept_step = "resend";
  else if (status === "approved" || status === "direct_approved") accept_step = "approved";
  else accept_step = "reviewed";

  await ApprovalProcessTrackModel.create({
    apt_type: notification_type,
    apt_item_id: item_id,
    apt_user_id: creator_id,
    apt_user_role: req.body.payload.role_id,
    apt_recipient_id: creator_id,
    apt_remarks: remarks,
    apt_accept_step: accept_step,
    apt_accept_status: status,
    apt_created_at: new Date(),
    apt_updated_at: new Date(),
    apt_created_by: creator_id,
    apt_updated_by: creator_id,
  });

  res.json({
    status: 1,
    message: "Project closure notification submitted successfully",
    data: [],
  });
};

