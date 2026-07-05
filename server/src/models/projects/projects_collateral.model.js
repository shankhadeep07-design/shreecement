const { sequelize, DataTypes } = require("../../config/db");

const ProjectCollateralModel = sequelize.define(
  "t_project_collateral",
  {
    tpcol_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tpcol'::text || lpad(((nextval('t_project_collateral_id_seq'::regclass))::character varying)::text, 10, '0'::text))`,
      ),
    },
    tpcol_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpcol_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpcol_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tpcol_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tpcol_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },
    tpcol_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpcol_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpcol_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpcol_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpcol_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_project_collateral",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = ProjectCollateralModel;