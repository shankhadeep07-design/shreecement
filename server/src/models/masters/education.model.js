const { sequelize, DataTypes } = require('../../config/db');

const EducationModel = sequelize.define('t_education', {

  wkb_geometry: {
    type: DataTypes.GEOMETRY,
    allowNull: true
  },

  tedu_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tedu'::text || lpad(((nextval('t_education_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tedu_education_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tedu_education_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  tedu_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tedu_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tedu_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tedu_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tedu_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tedu_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }

}, {
  tableName: 't_education',
  timestamps: false,
  freezeTableName: true
});

module.exports = EducationModel;