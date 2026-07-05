const { sequelize, DataTypes } = require('../../config/db');

const AuthAuditLog = sequelize.define('auth_audit_logs', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  operation: {
    type: DataTypes.STRING(50),  // LOGIN / LOGOUT
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  session_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  }
}, {
  schema: 'audit',               // 🔹 keep it in audit schema
  tableName: 'auth_audit_logs',
  timestamps: false,
  freezeTableName: true
});

module.exports = AuthAuditLog;
