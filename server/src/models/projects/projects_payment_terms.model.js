const { sequelize, DataTypes } = require("../../config/db");

const ProjectPaymentTermsModel = sequelize.define(
  "t_project_payment_terms",
  {
    tppayt_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('TPPAYT'::text || lpad(((nextval('t_project_payment_terms_id_seq'::regclass))::character varying)::text, 10, '0'))`,
      ),
    },

    tppayt_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tppayt_short_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tppayt_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tppayt_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tppayt_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },

    tppayt_created_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    tppayt_updated_by: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    tppayt_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
      allowNull: false,
    },

    tppayt_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
      allowNull: false,
    },

    tppayt_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_project_payment_terms",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = ProjectPaymentTermsModel;
