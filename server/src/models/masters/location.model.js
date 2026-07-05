const { sequelize, DataTypes } = require('../../config/db');

const LocationModel = sequelize.define('t_location', {
  tloc_location_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tloc'::text || lpad(((nextval('t_location_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tloc_location_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tloc_state_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tloc_district_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tloc_block_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tloc_factory_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tloc_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tloc_created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tloc_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tloc_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tloc_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tloc_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 't_location',
  timestamps: false,
  freezeTableName: true
});

module.exports = LocationModel;
