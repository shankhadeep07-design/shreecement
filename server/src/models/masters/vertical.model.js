const { sequelize, DataTypes } = require('../../config/db');

const VerticalModel = sequelize.define('t_vertical', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tvm_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tvm'::text || lpad(((nextval('t_vertical_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tvm_vertical_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
   tvm_vertical_slug: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tvm_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tvm_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tvm_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tvm_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tvm_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tvm_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_vertical',
  timestamps: false,
  freezeTableName: true
});

module.exports = VerticalModel;
