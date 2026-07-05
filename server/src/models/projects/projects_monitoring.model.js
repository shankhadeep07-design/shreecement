const { sequelize, DataTypes } = require("../../config/db");

const ProjectMonitoringModel = sequelize.define(
  "t_project_monitoring",
  {
    tpmon_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tpmon'::text || lpad(((nextval('t_project_monitoring_id_seq'::regclass))::character varying)::text, 10, '0'::text))`,
      ),
    },
    tpmon_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tpmon_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tpmon_subject: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpmon_start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    tpmon_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    tpmon_members: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpmon_discussion_points: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tpmon_action_points: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tpmon_latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tpmon_longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    tpmon_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tpmon_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },
    tpmon_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpmon_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpmon_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpmon_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpmon_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_project_monitoring",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = ProjectMonitoringModel;
