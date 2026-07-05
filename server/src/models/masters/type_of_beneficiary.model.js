const { sequelize, DataTypes } = require('../../config/db');

const TypeOfBeneficiaryModel = sequelize.define('t_type_of_beneficiary', {

  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true
  },

  tben_beneficiary_type_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tben'::text || lpad(((nextval('t_type_of_beneficiary_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tben_beneficiary_type_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },


   tben_beneficiary_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  tben_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tben_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tben_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tben_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tben_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tben_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }

}, {
  tableName: 't_type_of_beneficiary',
  timestamps: false,
  freezeTableName: true
});

module.exports = TypeOfBeneficiaryModel;