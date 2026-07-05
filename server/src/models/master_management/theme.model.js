const { sequelize, DataTypes } = require('../../config/db');

const ThemeManagement = sequelize.define('t_theme_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tthm_theme_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tthm'::text || lpad(((nextval('t_theme_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tthm_theme_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tthm_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tthm_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tthm_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tthm_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tthm_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tthm_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }

}, {
  tableName: 't_theme_master',
  timestamps: false,
  freezeTableName: true
});

module.exports = ThemeManagement;
