const { sequelize, DataTypes } = require('../../config/db');

const SubThemeManagement = sequelize.define('t_sub_theme_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tsthm_sub_theme_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tsthm'::text || lpad(((nextval('t_sub_theme_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tsthm_theme_id: {
    type: DataTypes.STRING(100),
  },
  tsthm_sub_theme_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tsthm_sub_theme_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tsthm_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tsthm_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsthm_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsthm_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsthm_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsthm_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }

}, {
  tableName: 't_sub_theme_master',  // ✅ updated table name too
  timestamps: false,
  freezeTableName: true
});

module.exports = SubThemeManagement;