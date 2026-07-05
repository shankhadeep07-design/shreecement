const { sequelize, DataTypes } = require('../../config/db');

const ScheduleSevenMaster = sequelize.define('t_schedule_seven_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tschm_schedule_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tschm'::text || lpad(((nextval('t_schedule_seven_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tschm_schedule_name: {
    type: DataTypes.TEXT,
    allowNull: true
  },




  tschm_theme_id: {
    type: DataTypes.STRING(255),
  },
  tschm_schedule_vii_line_item: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tschm_sub_activity_item_number: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tschm_sub_activity_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },




  tschm_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tschm_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tschm_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tschm_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tschm_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tschm_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_schedule_seven_master',
  timestamps: false,
  freezeTableName: true
});

module.exports = ScheduleSevenMaster;
