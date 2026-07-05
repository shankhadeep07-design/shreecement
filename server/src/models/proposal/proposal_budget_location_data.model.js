const { sequelize, DataTypes } = require('../../config/db');

const ProposalBudgetLocationDataModel = sequelize.define('t_proposal_budget_location_data', {
  tpbld_id: {
    type: DataTypes.STRING(255),
    defaultValue: sequelize.literal(
      `('tpbld'::text || lpad(((nextval('t_proposal_budget_location_data_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    ),
    primaryKey: true,
  },
  tpbld_proposal_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpbld_proposal_location_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpbld_sub_activity_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpbld_description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpbld_unit: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  tpbld_frequency: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  tpbld_rate: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  tpbld_amount: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  tpbld_fl_archive: {
    type: DataTypes.STRING(1),
    defaultValue: 'N',
  },
  tpbld_created_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tpbld_updated_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tpbld_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tpbld_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tpbld_deleted_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 't_proposal_budget_location_data',
  timestamps: false,
  freezeTableName: true,
});

module.exports = ProposalBudgetLocationDataModel;
