const { sequelize, DataTypes } = require('../../config/db');

const EmpVolunteeringModel = sequelize.define('t_emp_volunteering', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
    validate: {
      isValidGeometry(value) {
        if (value && value.type !== 'MultiPolygon') {
          throw new Error('Geometry must be a MULTIPOLYGON');
        }
      }
    }
  },
  tevol_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tevol'::text || lpad(((nextval('t_emp_volunteering_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tevol_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevol_department: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevol_another_mem_no: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevol_another_mem_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevol_description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevol_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tevol_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tevol_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tevol_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tevol_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tevol_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_emp_volunteering',
  timestamps: false,
  freezeTableName: true
});

module.exports = EmpVolunteeringModel;
