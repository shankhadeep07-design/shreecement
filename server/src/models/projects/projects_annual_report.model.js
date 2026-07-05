
const { sequelize, DataTypes } = require("../../config/db");

const ProjectAnnualReportModel = sequelize.define(
  "t_project_annual_report",
  {
    tpar_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tpar'::text || lpad(((nextval('t_project_annual_report_id_seq'::regclass))::character varying)::text, 10, '0'::text))`,
      ),
    },
    tpar_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpar_report_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpar_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    

    tpar_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tpar_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },
    tpar_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpar_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpar_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpar_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpar_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_project_annual_report",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = ProjectAnnualReportModel;