const { sequelize,DataTypes } = require("../../config/db");

const Permission = sequelize.define(
  "t_permissions",
  {
    tpr_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
      defaultValue: sequelize.literal(
        `'TPR' || LPAD(nextval('t_permissions_id_seq')::text, 10, '0')`
      ),
    },
    tpr_role_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tpr_module_id: {
      type: DataTypes.STRING(255),
    },
    tpr_actions: {
      type: DataTypes.STRING(255),
    },
    tpr_deleted_at: {
      type: "timestamp without time zone",
      defaultValue: sequelize.literal(`now()`),
    },
    tpr_created_by: {
      type: DataTypes.STRING(255),
      defaultValue: "SYSTEM",
    },
    tpr_updated_by: {
      type: DataTypes.STRING(255),
      defaultValue: "SYSTEM",
    },
    tpr_created_at: {
      type: "timestamp without time zone",
      defaultValue: sequelize.literal(`now()`),
    },
    tpr_updated_at: {
      type: "timestamp without time zone",
      defaultValue: sequelize.literal(`now()`),
    },
  },
  {
    timestamps: false, // Assuming you handle timestamps manually
    tableName: "t_permissions",
    underscored: true, // Use underscores in column names
  }
);

module.exports = {Permission};
