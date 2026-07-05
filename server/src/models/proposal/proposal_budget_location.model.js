const { sequelize, DataTypes } = require('../../config/db');

const ProposalBudgetLocationModel = sequelize.define('t_proposal_budget_location', {
  tpbl_id: {
    type: DataTypes.STRING(255),
    defaultValue: sequelize.literal(
      `('tpbl'::text || lpad(((nextval('t_proposal_budget_location_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    ),
    primaryKey: true,
  },
  tpbl_proposal_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpbl_proposal_budget_location_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpbl_fl_archive: {
    type: DataTypes.STRING(1),
    defaultValue: 'N',
  },
  tpbl_created_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tpbl_updated_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tpbl_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tpbl_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tpbl_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 't_proposal_budget_location',
  timestamps: false,
  freezeTableName: true,
});

module.exports = ProposalBudgetLocationModel;
