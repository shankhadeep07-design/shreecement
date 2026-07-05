const { sequelize, DataTypes } = require('../../config/db');

const DepartmentModel = sequelize.define(
  't_department',
  {
    td_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(`'td' || lpad(nextval('t_department_id_seq')::text, 10, '0')`),
    },
    td_department_name: {
      type: DataTypes.TEXT,
    },
    td_department_slug: {
      type: DataTypes.TEXT,
    },
    td_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    td_created_by: {
      type: DataTypes.BIGINT,
    },
    td_updated_by: {
      type: DataTypes.BIGINT,
    },
    td_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    td_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    td_deleted_at: {
      type: DataTypes.TIME,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = { DepartmentModel };
