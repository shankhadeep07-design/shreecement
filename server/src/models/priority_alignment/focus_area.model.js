const { sequelize, DataTypes } = require('../../config/db');

const FocusAreaMaster = sequelize.define('t_focus_area_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tfam_focus_area_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tfam'::text || lpad(((nextval('t_focus_area_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tfam_focus_area_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tfam_schedule_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tfam_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tfam_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tfam_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tfam_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tfam_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tfam_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_focus_area_master',
  timestamps: false,
  freezeTableName: true
});

module.exports = FocusAreaMaster;
