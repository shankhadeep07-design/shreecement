const { sequelize, DataTypes } = require('../../config/db');

const SubActivityMaster = sequelize.define('t_sub_activity_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tsactm_sub_activity_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tsactm'::text || lpad(((nextval('t_sub_activity_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tsactm_sub_activity_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tsactm_schedule_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tsactm_focus_area_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tsactm_activity_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tsactm_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tsactm_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsactm_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsactm_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsactm_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsactm_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_sub_activity_master',
  timestamps: false,
  freezeTableName: true
});

module.exports = SubActivityMaster;
