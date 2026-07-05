const { sequelize, DataTypes } = require("../../config/db");

const ApprovalProcessTrackModel = sequelize.define(
  "t_approval_process_track",
  {
    apt_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `'APT' || lpad(nextval('t_approval_process_track_id_seq')::text, 20, '0')`
      ),
    },
    apt_type: {
      type: DataTypes.STRING(255),
    },
    apt_item_id: {
      type: DataTypes.STRING(255),
    },
    apt_user_id: {
      type: DataTypes.BIGINT,
    },
    apt_user_role: {
      type: DataTypes.STRING(255),
    },
    apt_accept_step: {
      type: DataTypes.STRING(255),
    },
    apt_remarks: {
      type: DataTypes.TEXT,
    },
    apt_recipient_role: {
      type: DataTypes.STRING(255),
    },
    apt_recipient_id: {
      type: DataTypes.BIGINT,
    },
    apt_accept_status: {
      type: DataTypes.STRING(255),
    },
    apt_status_flag: {
      type: DataTypes.STRING,
    },
    apt_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    apt_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    apt_deleted_at: {
      type: DataTypes.DATE,
    },
    apt_created_by: {
      type: DataTypes.STRING(100),
      defaultValue: "SYSTEM",
    },
    apt_updated_by: {
      type: DataTypes.STRING(100),
      defaultValue: "SYSTEM",
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = ApprovalProcessTrackModel;
