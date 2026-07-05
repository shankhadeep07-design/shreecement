const { sequelize, DataTypes } = require("../../config/db");

const KpiOutcomeMasterModel = sequelize.define(
  "t_kpi_outcome_master",
  {
    tkpio_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tkpio'::text || lpad((nextval('t_kpi_outcome_master_id_seq'::regclass))::text, 10, '0'::text))`,
      ),
    },

    tkpio_thematic_area_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tkpio_kpi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tkpio_outcome_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tkpio_desc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tkpio_is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    tkpio_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tkpio_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tkpio_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tkpio_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    tkpio_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "t_kpi_outcome_master",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = KpiOutcomeMasterModel;