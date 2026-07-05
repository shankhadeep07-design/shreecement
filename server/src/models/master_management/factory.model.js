const { sequelize, DataTypes } = require('../../config/db');

const FactoryMaster = sequelize.define('t_factory_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tfact_factory_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tfact'::text || lpad(((nextval('t_factory_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tfact_factory_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tfact_state_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tfact_district_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tfact_block_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tfact_location_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tfact_business_area_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'tfact_business_area_id'   // 👈 IMPORTANT FIX

  },
  tfact_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tfact_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tfact_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tfact_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tfact_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tfact_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_factory_master',
  timestamps: false,
  freezeTableName: true
});

module.exports = FactoryMaster;
