const { sequelize, DataTypes } = require('../../config/db');

const ProfitCenterMaster = sequelize.define('t_profit_center_master', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true,
  },
  tprofc_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tprofc'::text || lpad(((nextval('t_profit_center_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    ),
  },
  tprofc_corporate: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tprofc_bu: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tprofc_gl_account: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tprofc_profit_centre: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tprofc_cost_centre: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tprofc_state_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tprofc_district_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tprofc_location_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tprofc_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tprofc_created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  tprofc_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  tprofc_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false,
  },
  tprofc_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false,
  },
  tprofc_deleted_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 't_profit_center_master',
  timestamps: false,
  freezeTableName: true,
});

module.exports = ProfitCenterMaster;
