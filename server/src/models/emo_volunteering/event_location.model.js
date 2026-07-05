const { sequelize, DataTypes } = require('../../config/db');

const EventLocationModel = sequelize.define(
  't_event_location',
  {
    tle_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('TEL'::text || lpad(((nextval('t_event_location_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
      )
    },

    tle_event_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    tle_region_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    tle_state_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    tle_district_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    tle_block_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    tle_village_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    tle_created_by: {
      type: DataTypes.BIGINT,
      allowNull: true
    },

    tle_updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true
    },

    tle_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('now()')
    },

    tle_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('now()')
    },

    tle_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 't_event_location',
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = EventLocationModel;
