const { sequelize, DataTypes } = require('../../config/db');

const ProjectKpiModel = sequelize.define('t_project_kpi', {
  tprojkpi_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tprojkpi'::text || lpad(((nextval('t_project_kpi_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tprojkpi_kpi_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tprojkpi_project_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tprojkpi_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tprojkpi_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tprojkpi_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tprojkpi_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tprojkpi_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tprojkpi_slug_name: {
    type: DataTypes.STRING,
    allowNull: true
  }

}, {
  tableName: 't_project_kpi',
  timestamps: false,
  freezeTableName: true
});

module.exports = ProjectKpiModel;