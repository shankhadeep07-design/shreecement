const { sequelize, DataTypes } = require("../../config/db");

const TypeOfVillageModel = sequelize.define(
  "t_type_of_village",
  {
    ttovill_type_village_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('ttovill'::text || lpad(((nextval('t_type_of_village_id_seq'::regclass))::character varying)::text, 10, '0'::text))`,
      ),
    },

    ttovill_type_of_village: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ttovill_slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    ttovill_is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    ttovill_created_by: {
      type: DataTypes.STRING(100),
      defaultValue: "SYSTEM",
    },

    ttovill_updated_by: {
      type: DataTypes.STRING(100),
      defaultValue: "SYSTEM",
    },

    ttovill_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    ttovill_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },

    ttovill_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    wkb_geometry: {
      type: DataTypes.GEOMETRY("MULTIPOLYGON", 4326),
      allowNull: true,
    },
  },
  {
    tableName: "t_type_of_village",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = TypeOfVillageModel;
