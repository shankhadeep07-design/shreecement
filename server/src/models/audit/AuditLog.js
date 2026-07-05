const { sequelize, DataTypes } = require('../../config/db');

const AuditLog = sequelize.define('audit_logs', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true // uses sequence audit.audit_logs_id_seq
  },
  schema_name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  table_name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  operation: {
    type: DataTypes.TEXT,   // INSERT / UPDATE / DELETE
    allowNull: false
  },
  record_id: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  old_data: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  new_data: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  changed_by: {
    type: DataTypes.TEXT,
    defaultValue: sequelize.literal('CURRENT_USER')
  },
  changed_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: true
  },
  client_ip: {
    type: DataTypes.INET,
    defaultValue: sequelize.literal('inet_client_addr()')
  },
  client_app: {
    type: DataTypes.TEXT,
    defaultValue: sequelize.literal("current_setting('application_name', true)")
  }
}, {
  schema: 'audit',              // use audit schema
  tableName: 'audit_logs',
  timestamps: false,
  freezeTableName: true
});

module.exports = AuditLog;
