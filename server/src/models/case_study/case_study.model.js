const { sequelize, DataTypes } = require('../../config/db');

const CaseStudy = sequelize.define('t_case_study', {

  tcs_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tcs'::text || lpad(((nextval('t_case_study_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tcs_theme_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tcs_project_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tcs_problem: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  tcs_solution: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  tcs_benefit: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  tcs_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tcs_created_by: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },

  tcs_updated_by: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },

  tcs_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tcs_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tcs_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }

}, {
  tableName: 't_case_study',
  timestamps: false,
  freezeTableName: true
});

module.exports = CaseStudy;