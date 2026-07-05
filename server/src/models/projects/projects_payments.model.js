const { sequelize, DataTypes } = require('../../config/db');

const ProjectPaymentsModel = sequelize.define('t_project_payments', {
  tppay_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('TPPAY'::text || lpad(((nextval('t_project_payments_id_seq'::regclass))::character varying)::text, 10, '0'))`
    )
  },
  tppay_proposal_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tppay_project_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tppay_milestone_name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tppay_milestone_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tppay_milestone_amount: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  tppay_payment_type: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tppay_payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  tppay_file_path: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tppay_file_name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tppay_milestone_release_amount: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  tppay_milestone_release_file_path: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tppay_milestone_release_file_name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tppay_status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tppay_fl_archive: {
    type: DataTypes.STRING(1),
    defaultValue: 'N'
  },
  tppay_created_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tppay_updated_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tppay_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tppay_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tppay_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 't_project_payments',
  timestamps: false,
  freezeTableName: true
});

module.exports = ProjectPaymentsModel;
