// const { conn, sequelize, DataTypes } = require('../config/database.config');
const { sequelize, DataTypes } = require('../../config/db');
const BlockModel = sequelize.define('t_block', {
  wkb_geometry: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
  tbl_block_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tbl' || lpad(((nextval('t_block_id_seq'::regclass))::TEXT)::TEXT, 10, '0'))`)
  },
  tbl_block_name: DataTypes.STRING(100),
  tbl_district_id: DataTypes.STRING(100),
  tbl_state_id: DataTypes.STRING(100),
  tbl_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tbl_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tbl_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tbl_created_at: {
    type: DataTypes.DATE,
   defaultValue: sequelize.literal('now()'),
  },
  tbl_updated_at: {
    type: DataTypes.DATE,
   defaultValue: sequelize.literal('now()'),
  },
  tbl_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = BlockModel;
