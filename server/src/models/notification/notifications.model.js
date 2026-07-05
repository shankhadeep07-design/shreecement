const { sequelize, DataTypes } = require("../../config/db");

const NotificationModel = sequelize.define(
  "t_notifications",
  {
    tnot_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: sequelize.literal(
        "('tnot' || lpad(nextval('t_notification_id_seq')::text, 10, '0'))"
      ),
    },
    tnot_financial_year_id: {
      type: DataTypes.STRING,
    },
    tnot_state_id: {
      type: DataTypes.STRING,
    
    },
    tnot_module: {
      type: DataTypes.STRING,
    },
    tnot_type: {
      type: DataTypes.STRING,
    },
    tnot_item_id: {
      type: DataTypes.STRING,
    },
    tnot_receiver_id: {
      type: DataTypes.BIGINT,
    },
    tnot_sender_id: {
      type: DataTypes.BIGINT,
    },
    tnot_text: {
      type: DataTypes.STRING, // varchar in SQL
    },
    tnot_url: {
      type: DataTypes.TEXT,
    },
      tnot_table_type: {
      type: DataTypes.TEXT,
    },
    tnot_status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    tnot_is_read: {
      type: DataTypes.CHAR(1),
      defaultValue: "N",
    },
    tnot_approval_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tnot_fl_archive: {
      type: DataTypes.CHAR(1),
      defaultValue: "N",
    },
    tnot_created_by: {
      type: DataTypes.BIGINT,
    },
    tnot_updated_by: {
      type: DataTypes.BIGINT,
    },
    tnot_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    tnot_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    timestamps: false, // since you have custom timestamp fields
    freezeTableName: true, // prevent Sequelize from pluralizing table name
  }
);

module.exports = NotificationModel;
