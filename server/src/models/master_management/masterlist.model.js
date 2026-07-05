const { sequelize, DataTypes } = require("../../config/db");

const MasterListModel = sequelize.define(
  "t_master_list",
  {
    wkb_geometry: {
      type: DataTypes.GEOMETRY("POINT", 4326),
      allowNull: true,
      validate: {
        isValidGeometry(value) {
          // Sequelize doesn't support CHECK constraints natively, but we can validate geometry type here
          if (value && value.type !== "Point") {
            throw new Error("Geometry must be of type POINT");
          }
        },
      },
    },
    tml_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tml'::text || lpad(((nextval('t_master_list_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
      ),
    },
    tml_master_list_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tml_master_list_desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tml_master_list_slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tml_is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tml_created_by: {
      type: DataTypes.STRING(100),
      defaultValue: "SYSTEM",
    },
    tml_updated_by: {
      type: DataTypes.STRING(100),
      defaultValue: "SYSTEM",
    },
    tml_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tml_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("now()"),
    },
    tml_deleted_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
    },
  },
  {
    tableName: "t_master_list",
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = MasterListModel;
