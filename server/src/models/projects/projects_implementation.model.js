const { sequelize, DataTypes } = require('../../config/db');

const ProjectsImplementation = sequelize.define('t_project_implementation', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tpi_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tpi'::text || lpad(((nextval('t_project_implementation_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tpi_implementation_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tpi_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tpi_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tpi_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tpi_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tpi_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tpi_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_project_implementation',
  timestamps: false,
  freezeTableName: true
});

module.exports = ProjectsImplementation;
