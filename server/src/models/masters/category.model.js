const { sequelize, DataTypes } = require('../../config/db');

const CategoryModel = sequelize.define('t_category', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY,
    allowNull: true,
  },

  tcat_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tcat'::text || lpad(((nextval('t_category_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tcat_category_type: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tcat_category_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  tcat_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tcat_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tcat_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tcat_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },

  tcat_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },

  tcat_deleted_at: {
    type: DataTypes.DATE,
     allowNull: true
  }

}, {
  tableName: 't_category',
  timestamps: false,
  freezeTableName: true
});

module.exports = CategoryModel;