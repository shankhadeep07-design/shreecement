const { sequelize, DataTypes } = require('../../config/db');

const ApprovalPathModel = sequelize.define(
  "t_approval_path",
  {
    tapp_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `'TAPP' || lpad(nextval('t_approval_path_id_seq')::text, 10, '0')`
      ),
    },
    tapp_tap_id: {
      type: DataTypes.STRING(100),
    },
    tapp_tap_slug: {
      type: DataTypes.STRING,
    },
    tapp_role_id: {
      type: DataTypes.STRING,
    },
    tapp_approval_order: {
      type: DataTypes.INTEGER,
    },
    tapp_created_by: {
      type: DataTypes.STRING(100),
      defaultValue: 'SYSTEM',
    },
    tapp_updated_by: {
      type: DataTypes.STRING(100),
      defaultValue: 'SYSTEM',
    },
    tapp_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()'),
    },
    tapp_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()'),
    },
    tapp_deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = ApprovalPathModel;
