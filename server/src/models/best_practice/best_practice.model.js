const { sequelize, DataTypes } = require('../../config/db');

const BestPractice = sequelize.define('t_best_practice', {

  tbp_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tbp'::text || lpad(((nextval('t_best_practice_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },






  tbp_project_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tbp_theme_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tbp_focus_area_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tbp_problem: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tbp_solution: {
    type: DataTypes.TEXT,
    allowNull: true
  },


  tbp_benefit: {
    type: DataTypes.TEXT,
    allowNull: true
  },


  tbp_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tbp_created_by: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  tbp_updated_by: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  tbp_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tbp_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tbp_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_best_practice',
  timestamps: false,
  freezeTableName: true
});

module.exports = BestPractice;