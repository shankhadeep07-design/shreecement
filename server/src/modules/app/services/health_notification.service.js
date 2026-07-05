const { Notification } = require("../../../models/notification/notification.model");

const submitNotificationForHealthVision = async (thvis_id,receiverId, senderId ) => {
    
  try {
 
      await Notification.create({
        tnot_module: 'health_vision',
        tnot_type: 'health_vision',
        tnot_item_id: thvis_id,
        tnot_receiver_id: receiverId,
        tnot_sender_id: senderId,
        tnot_text: `health_vision published: ${thvis_id}`,
        tnot_url: `/health_vision/beneficiary/${thvis_id}`,
        tnot_created_by: senderId,
        tnot_updated_by: senderId,
      });


  } catch (error) {
    console.error("Error sending event notifications:", error);
  }
};
const submitNotificationForHealthMhv = async (thmhv_id,receiverId, senderId ) => {
    
  try {
 
      await Notification.create({
        tnot_module: 'health_mhv',
        tnot_type: 'health_mhv',
        tnot_item_id: thmhv_id,
        tnot_receiver_id: receiverId,
        tnot_sender_id: senderId,
        tnot_text: `health_mhv published: ${thmhv_id}`,
        tnot_url: `/health_mhv/beneficiary/${thmhv_id}`,
        tnot_created_by: senderId,
        tnot_updated_by: senderId,
      });


  } catch (error) {
    console.error("Error sending event notifications:", error);
  }
};

module.exports = { submitNotificationForHealthVision,submitNotificationForHealthMhv };