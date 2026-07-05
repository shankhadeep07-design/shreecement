// const { getIO } = require("../../../config/socket");
const 
  NotificationModel
 = require("../../../models/notification/notifications.model");
const { BudgetMasterModel } = require("../../../models/budget/budget_amount_master_model");
const ProposalModel = require("../../../models/proposal/proposal.model");
const EventModel = require("../../../models/emo_volunteering/event.model");
const ProjectClosureModel = require("../../../models/projects/projects_closure.model");
const { getIO } = require("../../../config/socket");
const NgoModel = require("../../../models/ngo/ngo.model");
const sendNotificationForPublishedEvent = async (event_id, users, senderId) => {
  try {
    // ✅ Correct use of findOne
    const event = await EventModel.findOne({ where: { tevent_id: event_id } });
    if (!event) {
      console.error("Event not found");
      return;
    }

    const io = getIO();
    // console.log("senderId--------------- ",senderId);
    console.log("event--------------- ",event.tevent_activity_title);
    // console.log("users--------------- ",users);
    // return;
    let notification_text = ``;
    let notification_url = ``;
    if (event.tevent_type == 'social_development') {
      notification_text = `New social development event published: ${event.tevent_activity_title}`;
      notification_url = `/event-social-development/${event_id}`; 
    } else {
      notification_text = `New volunteering event published: ${event.tevent_activity_title}`;
      notification_url = `/event-cil/${event_id}`;
    }
    
    // ✅ Create notifications
    for (const user of users) {
      await NotificationModel.create({
        tnot_module: "event",
        tnot_type: "event",
        tnot_item_id: event_id,
        tnot_receiver_id: user.id,
        tnot_sender_id: senderId,
        tnot_text: notification_text,
        tnot_url: notification_url,
        tnot_created_by: senderId,
        tnot_updated_by: senderId,
      });
    }

    // ✅ Emit once to global room
    // io.to("global_notifications").emit("event_created", {
    //   title: event.tevent_activity_title,
    //   id: event.id,
    //   timestamp: new Date(),
    // });
  } catch (error) {
    console.error("Error sending event notifications:", error);
  }
};

const notificationStatusChanged = async (itemId, status, userId) => {
  console.log(
    "Updating notification status for itemId:",
    itemId,
    "to status:",
    status,
    "for userId:",
    userId
  );

  try {
    await NotificationModel.update(
      {
        tnot_is_read: "Y",
        tnot_status: status,
      },
      {
        where: {
          tnot_item_id: itemId,
          tnot_receiver_id: userId,
        },
      }
    );
  } catch (error) {
    console.error("Error updating notification status:", error);
  }
};


const budgetDetailsOrderUpdate = async (status, order, budgeting_id ,user_id ) => {
  console.log(
    "Updating budget details status for budgeting_id:",
    budgeting_id,
    "to status:",
    status
  );
  try {
    await BudgetMasterModel.update(
      {
        tbm_approval_order: order,
        tbm_status: status,
      },
      {
        where: {
          tbm_id: budgeting_id,
        },
      }
    );
  } catch (error) {
    console.error("Error updating notification status:", error);
  }
};

const proposalNotificationUpdate = async (status, order, proposal_id ,user_id ) => {
  console.log(
    "Updating budget details status for proposal_id:",
    proposal_id,
    "to status:",
    status
  );
  try {
    await ProposalModel.update(
      {
        tpros_approval_order: order,
        tpros_status: status,
      },
      {
        where: {
          tpros_id: proposal_id,
        },
      }
    );
  } catch (error) {
    console.error("Error updating notification status:", error);
  }
};

const eventNotificationUpdate = async (status, order, event_id ,user_id ) => {
  console.log(
    "Updating event details status for event_id:",
    event_id,
    "to status:",
    status
  );
  try {
    await EventModel.update(
      {
        tevnt_approval_order: order,
        tevnt_status: status,
      },
      {
        where: {
          tevnt_id: event_id,
        },
      }
    );
  } catch (error) {
    console.error("Error updating notification status:", error);
  }
};

const ngoNotificationUpdate = async (status, order, ngo_id ,user_id ) => {
  console.log(
    "Updating ngo details status for ngo_id:",
    ngo_id,
    "to status:",
    status
  );
  try {
    await NgoModel.update(
      {
        tngo_approval_order: order,
        tngo_status: status,
      },
      {
        where: {
          tngo_id: ngo_id,
        },
      }
    );
  } catch (error) {
    console.error("Error updating notification status:", error);
  }
};

const projectNotificationUpdate = async (status, order, project_id, user_id) => {
  console.log(
    "Updating project details status for project_id:",
    project_id,
    "to status:",
    status
  );
  try {
    await ProjectsModel.update(
      {
        tproj_approver_index: order,
        tproj_status: status,
      },
      {
        where: {
          tproj_id: project_id,
        },
      }
    );
  } catch (error) {
    console.error("Error updating project notification status:", error);
  }
};

const projectClosureNotificationUpdate = async (status, order, tpclsr_id, user_id) => {
  console.log(
    "Updating project closure details status for tpclsr_id:",
    tpclsr_id,
    "to status:",
    status
  );
  try {
    await ProjectClosureModel.update(
      {
        tpclsr_approver_index: order,
        tpclsr_status: status,
      },
      {
        where: {
          tpclsr_id: tpclsr_id,
        },
      }
    );
  } catch (error) {
    console.error("Error updating project closure notification status:", error);
  }
};

module.exports = {
  notificationStatusChanged,
  budgetDetailsOrderUpdate,
  proposalNotificationUpdate,
  sendNotificationForPublishedEvent,
  eventNotificationUpdate,
  ngoNotificationUpdate,
  projectNotificationUpdate,
  projectClosureNotificationUpdate,
};
