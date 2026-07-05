const { sequelize, DataTypes } = require('../../config/db');

const ModuleModel = sequelize.define('t_modules', {
  tmd_name: {
    type: DataTypes.STRING(100),
    primaryKey: true
  },
  tmd_slug_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tmd_actions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tmd_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tmd_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tmd_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tmd_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  }
}, {
  tableName: 't_modules',
  timestamps: false,
  freezeTableName: true
});

module.exports = ModuleModel;
