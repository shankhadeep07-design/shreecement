const { sequelize, DataTypes } = require('../../config/db');

const ProposalModel = sequelize.define('t_proposal', {
  tpros_id: {
    type: DataTypes.STRING(255),
    defaultValue: sequelize.literal(
      `('tpros'::text || lpad(((nextval('t_proposal_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    ),
    primaryKey: true,
  },
  tpros_financial_year_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_introduction: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_background_need: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_objectives: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_scope_of_the_project: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_activities: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_expected_outcomes: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_proposal_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_schedule_seven_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_focus_area_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_activity_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_sub_activity_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_approved_amount: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  tpros_status: {
    type: DataTypes.STRING(255),
    defaultValue: 'draft',
  },
  tpros_approval_order: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tpros_approval_type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpros_fl_archive: {
    type: DataTypes.STRING(1),
    defaultValue: 'N',
  },
  tpros_created_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tpros_updated_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tpros_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tpros_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tpros_deleted_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 't_proposal',
  timestamps: false,
  freezeTableName: true,
});

module.exports = ProposalModel;
