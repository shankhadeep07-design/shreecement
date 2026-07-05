const { sequelize, DataTypes } = require("../../config/db");

const BudgetsModel = sequelize.define(
  "t_budgets",
  {
    tbad_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('TBAD'::text || lpad(((nextval('t_budgets_id_seq'::regclass))::character varying)::text, 10, '0'::text))`,
      ),
    },

    tbad_theme_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tbad_budget_master_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbad_sch_vii_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbad_sub_theme: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbad_project_identified: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbad_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tbad_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    tbad_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tbad_status: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    tbad_fy_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tbad_budget_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tbad_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },

    tbad_created_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    tbad_updated_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    tbad_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tbad_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
  },
  {
    tableName: "t_budgets",
    timestamps: false,
    freezeTableName: true,
  },
);


module.exports = { BudgetsModel };
