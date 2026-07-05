const { sequelize, DataTypes } = require('../../config/db');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    defaultValue: sequelize.literal(`nextval('users_id_seq'::regclass)`),
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  register_from: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ngo_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  education_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  name_slug: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  remember_token: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  role_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  otp: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  is_admin: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  deleted_at: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  api_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  app_permission: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  unit_id_json: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  permission_id_json: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  user_type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  user_vertical: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  foundation_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

   unit_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },


   created_by: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
  updated_by: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },


}, {
  tableName: 'users',
  timestamps: false, // Because you're handling created_at & updated_at manually
});

module.exports = User;
