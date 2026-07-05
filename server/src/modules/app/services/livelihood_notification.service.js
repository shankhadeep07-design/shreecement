const { Notification } = require("../../../models/notification/notification.model");

const submitNotificationForLivelihood = async (tliv_id,receiverId, senderId ) => {
    
  try {
 
      await Notification.create({
        tnot_module: 'livelihood',
        tnot_type: 'livelihood',
        tnot_item_id: tliv_id,
        tnot_receiver_id: receiverId,
        tnot_sender_id: senderId,
        tnot_text: `Nlivelihood published: ${tliv_id}`,
        tnot_url: `/livelihood/beneficiary/${tliv_id}`,
        tnot_created_by: senderId,
        tnot_updated_by: senderId,
      });


  } catch (error) {
    console.error("Error sending event notifications:", error);
  }
};

module.exports = { submitNotificationForLivelihood };