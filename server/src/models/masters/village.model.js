const { sequelize, DataTypes } = require('../../config/db');

const VillagesModel = sequelize.define('t_villages', {

  ogc_fid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true
  },

  tvl_village_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: sequelize.literal(
      `('tvl'::text || lpad(((nextval('t_villages_village_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tvl_village_name: {
    type: DataTypes.STRING,
    allowNull: true
  },

  tvl_state_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tvl_district_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tvl_block_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tvl_grampanchayat_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tvl_revenue_village_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tvl_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tvl_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tvl_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tvl_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tvl_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tvl_area_name: {
    type: DataTypes.STRING
  },

  tvl_tun_unit_id: {
    type: DataTypes.STRING
  },

  tvl_location_id: {
    type: DataTypes.STRING
  },

  tvl_ca: {
    type: DataTypes.STRING(1)
  },

  tvl_tun_unit_name: {
    type: DataTypes.STRING
  },

  tvl_subdivision: {
    type: DataTypes.STRING(100)
  },

  tvl_tehsil: {
    type: DataTypes.STRING(100)
  },

  tvl_thana: {
    type: DataTypes.STRING(100)
  },

  tvl_tdl_district_id: {
    type: DataTypes.STRING
  },

  tvl_ttll_taluka_id: {
    type: DataTypes.STRING
  },

  gid: {
    type: DataTypes.INTEGER
  },

  tvl_village_number: {
    type: DataTypes.INTEGER
  },

  tvl_village_abbreviation: {
    type: DataTypes.STRING
  },
  tvl_village_type: {
    type: DataTypes.STRING(100),
    allowNull: true,   
},


}, {
  tableName: 't_villages',
  timestamps: false,
  freezeTableName: true
});

module.exports = VillagesModel;