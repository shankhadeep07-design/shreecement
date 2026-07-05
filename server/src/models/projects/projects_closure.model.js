const { sequelize, DataTypes } = require("../../config/db");

const ProjectClosureModel = sequelize.define(
  "t_project_closures",
  {
    tpclsr_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('TPCLSR' || lpad(nextval('t_project_closures_id_seq')::text, 10, '0'))`
      ),
    },

    tpclsr_project_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    tpclsr_deliverable_achieved: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tpclsr_closure_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tpclsr_beneficiary_impacted: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpclsr_closed_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    tpclsr_closed_finally: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    tpclsr_summary_report: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tpclsr_total_payment_received: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    tpclsr_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    tpclsr_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },

    tpclsr_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tpclsr_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tpclsr_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    /* ========= Missing fields added ========= */

    tpclsr_not_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tpclsr_approval_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tpclsr_approver_index: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    tpclsr_user_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tpclsr_user_role_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    /* ======================================= */
  },
  {
    tableName: "t_project_closures",
    timestamps: true,
    createdAt: "tpclsr_created_at",
    updatedAt: "tpclsr_updated_at",
  }
);

module.exports = ProjectClosureModel;