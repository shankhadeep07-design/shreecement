const { sequelize, DataTypes } = require("../../config/db");

const BudgetMasterModel = sequelize.define(
  "t_budget_master",
  {
    tbm_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tbm'::text || lpad(((nextval('t_budget_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
      ),
    },

    tbm_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbm_fy_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbm_unit_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbm_state_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbm_district_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbm_block_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tbm_gram_panchayat_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tbm_revenue_village_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tbm_village_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tbm_village_type_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tbm_status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "draft",
    },

    tbm_fl_archive: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: "N",
    },

    tbm_created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    tbm_updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    tbm_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tbm_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tbm_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tbm_proposed_total_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    tbm_approval_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    tbm_approval_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tbm_approver_index: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    tbm_user_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tbm_user_role_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tbm_not_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "t_budget_master",
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = { BudgetMasterModel };