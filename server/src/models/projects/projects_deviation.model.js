const { sequelize, DataTypes } = require("../../config/db");

const ProjectDeviationModel = sequelize.define(
  "t_projects_deviation",
  {
    tpdev_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tpdev'::text || lpad(((nextval('t_projects_deviation_id_seq'::regclass))::character varying)::text, 10, '0'::text))`,
      ),
    },
    tpdev_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tpdev_deviation_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tpdev_no_of_days: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    tpdev_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tpdev_brief_fact: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tpdev_reason_for_deviation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tpdev_program_change: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tpdev_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tpdev_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },
    tpdev_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpdev_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpdev_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpdev_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpdev_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_projects_deviation",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = ProjectDeviationModel;
