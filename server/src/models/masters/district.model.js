const { sequelize, DataTypes } = require('../../config/db');

const DistrictModel = sequelize.define('t_district', {
  tdl_district_id: {
    type: DataTypes.TEXT,
    defaultValue: sequelize.literal(`('tdl'::text || lpad(((nextval('t_district_id_seq'::regclass))::character varying)::text, 10, '0'::text))`),
    primaryKey: true,
  },
  tdl_district_name: {
    type: DataTypes.CITEXT, // If CITEXT is supported in your DB
    allowNull: true,
  },
  tdl_state_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tdl_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tdl_created_by: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tdl_updated_by: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tdl_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tdl_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tdl_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
}, {
  tableName: 't_district',
  timestamps: false,
  freezeTableName: true,
});

module.exports = DistrictModel;
