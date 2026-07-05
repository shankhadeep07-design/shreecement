const { sequelize, DataTypes } = require('../../config/db');

const Gallery = sequelize.define('t_gallery', {

  tgl_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tgl'::text || lpad(((nextval('t_gallery_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tgl_theme_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tgl_project_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tgl_status: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tgl_created_by: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },

  tgl_updated_by: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },

  tgl_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tgl_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tgl_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }

}, {
  tableName: 't_gallery',
  timestamps: false,
  freezeTableName: true
});

module.exports = Gallery;