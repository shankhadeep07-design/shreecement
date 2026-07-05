const { sequelize, DataTypes } = require('../../config/db');

const FinancialYearModel = sequelize.define('t_financial_year', {
  tfy_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('TFY' || lpad(((nextval('t_financial_year_id_seq'::regclass))::TEXT)::TEXT, 10, '0'))`)
  },
  tfy_year_label: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tfy_year: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  tfy_year_no: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  tfy_current_year: {
    type: DataTypes.STRING(1),
    allowNull: false,
    defaultValue: 'N'
  },
  tfy_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tfy_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tfy_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  },
  tfy_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  },
  tfy_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = FinancialYearModel;
