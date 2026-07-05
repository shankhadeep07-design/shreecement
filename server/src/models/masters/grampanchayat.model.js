const { sequelize, DataTypes } = require('../../config/db');

const GrampanchayatModel = sequelize.define('t_grampanchayat', {

  wkb_geometry: {
    type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    allowNull: true
  },

  tgrm_grampanchayat_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tgrm'::text || lpad(((nextval('t_grampanchayat_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tgrm_grampanchayat_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tgrm_state_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tgrm_district_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tgrm_block_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tgrm_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tgrm_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tgrm_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tgrm_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tgrm_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tgrm_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: 't_grampanchayat',
  timestamps: false,
  freezeTableName: true
});

module.exports = GrampanchayatModel;