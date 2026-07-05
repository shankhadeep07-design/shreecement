const { sequelize, DataTypes } = require('../../config/db');

const RevenueVillageModel = sequelize.define('t_revenue_village', {

  trevvlg_revenue_village_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('trevvlg'::text || lpad(((nextval('t_revenue_village_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  trevvlg_revenue_village_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  trevvlg_state_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  trevvlg_district_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  trevvlg_block_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  trevvlg_grampanchayat_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  trevvlg_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  trevvlg_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  trevvlg_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  trevvlg_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  trevvlg_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  trevvlg_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true
  }

}, {
  tableName: 't_revenue_village',
  timestamps: false,
  freezeTableName: true
});

module.exports = RevenueVillageModel;