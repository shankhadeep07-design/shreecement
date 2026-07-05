const { sequelize, DataTypes } = require("../../config/db");

const KpiVariableMasterModel = sequelize.define(
  "t_kpi_variable_master",
  {
    tkpiv_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tkpiv'::text || lpad((nextval('t_kpi_variable_master_id_seq'::regclass))::text, 10, '0'::text))`,
      ),
    },

    tkpiv_thematic_area_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tkpiv_kpi_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tkpiv_kpi_variable: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tkpiv_desc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tkpiv_is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    tkpiv_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tkpiv_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tkpiv_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tkpiv_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tkpiv_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "t_kpi_variable_master",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = KpiVariableMasterModel;