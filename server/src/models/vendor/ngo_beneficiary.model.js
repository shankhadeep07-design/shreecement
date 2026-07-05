const { sequelize, DataTypes } = require('../../config/db');

const NgoBeneficiaryModel = sequelize.define('t_ngo_beneficiary', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
    validate: {
      // You may optionally add client-side geometry validation here,
      // but actual enforcement relies on PostGIS constraints in DB.
    }
  },
  tnben_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tnben'::text || lpad(((nextval('t_ngo_beneficiary_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tnben_tngo_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tnben_ngo_beneficiary_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tnben_ngo_beneficiary_slug: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tnben_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tnben_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tnben_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tnben_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tnben_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tnben_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_ngo_beneficiary',
  timestamps: false,
  freezeTableName: true
});

module.exports = NgoBeneficiaryModel;
