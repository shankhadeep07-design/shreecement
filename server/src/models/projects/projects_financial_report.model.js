const { sequelize, DataTypes } = require("../../config/db");

const ProjectFinancialReportModel = sequelize.define(
  "t_project_financial_report",
  {
    tpfr_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tpfr'::text || lpad(((nextval('t_project_financial_report_id_seq'::regclass))::character varying)::text, 10, '0'::text))`,
      ),
    },
    tpfr_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpfr_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpfr_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tpfr_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tpfr_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tpfr_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },
    tpfr_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpfr_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpfr_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpfr_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpfr_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_project_financial_report",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = ProjectFinancialReportModel;
