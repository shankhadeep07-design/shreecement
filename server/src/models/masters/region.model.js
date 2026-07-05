const { sequelize, DataTypes } = require('../../config/db');

const RegionModel = sequelize.define('t_region', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true
  },
  treg_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('treg'::text || lpad(((nextval('t_region_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  treg_region_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  treg_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  treg_created_by: {
    type: DataTypes.BIGINT,
    defaultValue: 'SYSTEM'
  },
  treg_updated_by: {
    type: DataTypes.BIGINT,
    defaultValue: 'SYSTEM'
  },
  treg_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  treg_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  treg_deleted_at: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 't_region',
  timestamps: false,
  freezeTableName: true
});

module.exports = RegionModel;
