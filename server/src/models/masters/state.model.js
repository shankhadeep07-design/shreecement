const { sequelize, DataTypes } = require('../../config/db');

const StateModel = sequelize.define('t_state', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tsl_state_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tsl'::text || lpad(((nextval('t_state_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tsl_state_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tsl_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tsl_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsl_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsl_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsl_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsl_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_state',
  timestamps: false,
  freezeTableName: true
});

module.exports = StateModel;
