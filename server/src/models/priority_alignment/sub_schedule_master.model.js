const { sequelize, DataTypes } = require('../../config/db');

const SubScheduleMaster = sequelize.define('t_sub_schedule_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },

  tsubshcm_sub_schedule_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tsubshcm'::text || lpad(((nextval('t_sub_schedule_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tsubshcm_theme_id: {
    type: DataTypes.STRING(255),
  },
  tsubshcm_desc: {
    type: DataTypes.TEXT,
  },
  tsubshcm_sub_schedule_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tsubshcm_schedule_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tsubshcm_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tsubshcm_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tsubshcm_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tsubshcm_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tsubshcm_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tsubshcm_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }

}, {
  tableName: 't_sub_schedule_master',
  timestamps: false,
  freezeTableName: true
});

module.exports = SubScheduleMaster;
