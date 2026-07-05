const { Notification } = require("../../../models/notification/notification.model");

const submitNotificationForEnvKrishMitra = async (tekm_id,receiverId, senderId ) => {
    
  try {
 
      await Notification.create({
        tnot_module: 'environment_krish_mitra',
        tnot_type: 'environment_krish_mitra',
        tnot_item_id: tekm_id,
        tnot_receiver_id: receiverId,
        tnot_sender_id: senderId,
        tnot_text: `environment_krish_mitra published: ${tekm_id}`,
        tnot_url: `/environment_krish_mitra/beneficiary/${tekm_id}`,
        tnot_created_by: senderId,
        tnot_updated_by: senderId,
      });


  } catch (error) {
    console.error("Error sending event notifications:", error);
  }
};
const submitNotificationForEnvMangrove = async (tenvman_id,receiverId, senderId ) => {
    
  try {
 
      await Notification.create({
        tnot_module: 'environment_mangrove',
        tnot_type: 'environment_mangrove',
        tnot_item_id: tenvman_id,
        tnot_receiver_id: receiverId,
        tnot_sender_id: senderId,
        tnot_text: `Environment mangrove published: ${tenvman_id}`,
        tnot_url: `/environment_mangrove/beneficiary/${tenvman_id}`,
        tnot_created_by: senderId,
        tnot_updated_by: senderId,
      });


  } catch (error) {
    console.error("Error sending event notifications:", error);
  }
};

module.exports = { submitNotificationForEnvKrishMitra,submitNotificationForEnvMangrove };