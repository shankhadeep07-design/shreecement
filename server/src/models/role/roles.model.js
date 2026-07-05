const { sequelize, DataTypes } = require('../../config/db');

const RolesModel = sequelize.define('t_roles', {
  trl_role_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('trl'::text || lpad(((nextval('t_roles_role_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  trl_role_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  trl_role_slug: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  trl_tmd_module_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trl_ttm_type_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trl_is_admin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trl_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  trl_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  trl_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  trl_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  trl_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  trl_access_amount: {
    type: DataTypes.DOUBLE,
  },
  trl_min_access_amount: {
    type: DataTypes.DOUBLE,
  },
  trl_max_access_amount: {
    type: DataTypes.DOUBLE,
  },
  trl_department: {
    type: DataTypes.STRING(100),
  },
}, {
  tableName: 't_roles',
  timestamps: false,
  freezeTableName: true
});

module.exports = RolesModel;
