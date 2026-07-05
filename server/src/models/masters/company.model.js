const { sequelize, DataTypes } = require('../../config/db');

const CompanyModel = sequelize.define('t_company', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true
  },
  tcom_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tcom'::text || lpad(((nextval('t_company_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tcom_company_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tcom_company_slug: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tcom_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tcom_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tcom_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tcom_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tcom_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tcom_deleted_at: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 't_company',
  timestamps: false,
  freezeTableName: true
});

module.exports = CompanyModel;
