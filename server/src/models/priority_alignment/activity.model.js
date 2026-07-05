const { sequelize, DataTypes } = require('../../config/db');

const ActivityMaster = sequelize.define('t_activity_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tactm_activity_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tactm'::text || lpad(((nextval('t_activity_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tactm_activity_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tactm_schedule_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tactm_focus_area_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tactm_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tactm_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tactm_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tactm_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tactm_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tactm_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_activity_master',
  timestamps: false,
  freezeTableName: true
});

module.exports = ActivityMaster;
