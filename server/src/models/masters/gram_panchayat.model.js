const { sequelize, DataTypes } = require('../../config/db');

const GramPanchayatModel = sequelize.define('t_gram_panchayat', {
  tgp_grampanchayat_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tgp'::text || lpad(((nextval('t_location_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tgp_location_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tgp_state_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tgp_district_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tgp_block_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tgp_factory_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tgp_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tgp_created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tgp_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tgp_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tgp_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tgp_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 't_gram_panchayat',
  timestamps: false,
  freezeTableName: true
});

module.exports = LocationModel;