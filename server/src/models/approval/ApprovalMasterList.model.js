const { sequelize, DataTypes } = require("../../config/db");

const ApprovalMasterListModel = sequelize.define(
  "t_approval_master_list",
  {
    taml_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `'TAML' || lpad(nextval('t_approval_master_list_id_seq')::text, 10, '0')`
      ),
    },
    taml_approval_name: {
      type: DataTypes.STRING(100),
    },
    taml_slug: {
      type: DataTypes.STRING(100),
    },
    taml_description: {
      type: DataTypes.TEXT,
    },
    taml_created_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    taml_updated_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    taml_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    taml_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    taml_deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = ApprovalMasterListModel;
