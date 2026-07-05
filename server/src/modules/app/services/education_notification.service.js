const { Notification } = require("../../../models/notification/notification.model");

module.exports.submitNotificationForEducation = async (edu_id,receiverId, senderId ) => {
    
  try {
 
      await Notification.create({
        tnot_module: 'education',
        tnot_type: 'education',
        tnot_item_id: edu_id,
        tnot_receiver_id: receiverId,
        tnot_sender_id: senderId,
        tnot_text: `Education Sakhi published: ${edu_id}`,
        tnot_url: `/education/beneficiary/${edu_id}`,
        tnot_created_by: senderId,
        tnot_updated_by: senderId,
      });


  } catch (error) {
    console.error("Error sending event notifications:", error);
  }
};

module.exports.submitNotificationForEducationCt = async (edu_id,receiverId, senderId ) => {
    
  try {
 
      await Notification.create({
        tnot_module: 'education_ct',
        tnot_type: 'education_ct',
        tnot_item_id: edu_id,
        tnot_receiver_id: receiverId,
        tnot_sender_id: senderId,
        tnot_text: `Education CT published: ${edu_id}`,
        tnot_url: `/education_ct/beneficiary/${edu_id}`,
        tnot_created_by: senderId,
        tnot_updated_by: senderId,
      });


  } catch (error) {
    console.error("Error sending event notifications:", error);
  }
};
