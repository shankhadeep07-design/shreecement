const { sequelize, DataTypes } = require("../../config/db");

const ProjectPurchaseOrderModel = sequelize.define(
  "t_project_purchase_orders",
  {
    tppo_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('TPPO'::text || lpad(((nextval('t_project_purchase_orders_id_seq'::regclass))::character varying)::text, 10, '0'))`,
      ),
    },
    tppo_proposal_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tppo_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tppo_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tppo_valid_from: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tppo_valid_to: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tppo_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tppo_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    tppo_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },
    tppo_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tppo_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tppo_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
      allowNull: false,
    },
    tppo_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
      allowNull: false,
    },
    tppo_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_project_purchase_orders",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = ProjectPurchaseOrderModel;
