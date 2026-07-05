const { sequelize, DataTypes } = require("../../config/db");

const ProjectPaymentModel = sequelize.define(
  "t_projects_payment",
  {
    tpay_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tpay'::text || lpad(((nextval('t_projects_payment_id_seq'::regclass))::character varying)::text, 10, '0'::text))`,
      ),
    },
    tpay_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tpay_payment_terms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tpay_amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tpay_fund_received_till_date: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tpay_fund_spent_till_date: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tpay_spent_percentage: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tpay_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tpay_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tpay_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },
    tpay_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpay_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpay_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpay_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tpay_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_projects_payment",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = ProjectPaymentModel;
