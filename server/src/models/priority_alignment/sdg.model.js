const { sequelize, DataTypes } = require('../../config/db');

const SdgMasterModel = sequelize.define('t_sdg_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tsdg_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tsdg'::text || lpad(((nextval('t_sdg_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tsdg_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tsdg_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tsdg_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tsdg_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsdg_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsdg_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsdg_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsdg_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_sdg_master',
  timestamps: false,
  freezeTableName: true
});

module.exports = SdgMasterModel;
