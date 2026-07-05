const { sequelize, DataTypes } = require("../../config/db");

const KpiMasterModel = sequelize.define(
  "t_kpi_master",
  {
    tkpi_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tkpi'::text || lpad((nextval('t_kpi_master_id_seq'::regclass))::text, 10, '0'::text))`,
      ),
    },

    tkpi_thematic_area_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tkpi_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tkpi_desc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tkpi_slug: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tkpi_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tkpi_is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    tkpi_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tkpi_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tkpi_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tkpi_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tkpi_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_kpi_master",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = KpiMasterModel;
