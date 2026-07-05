const { sequelize, DataTypes } = require('../../config/db');

const DistanceModel = sequelize.define('t_distance', {

  // tdis_id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true,
  //   autoIncrement: true
  // },

  tdis_distance_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
        primaryKey: true,          // ✅ set as PK so Sequelize stops looking for "id"

    defaultValue: sequelize.literal(
      `('tdis'::text || lpad(((nextval('t_distance_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tdis_state_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tdis_district_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tdis_block_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tdis_grampanchayat_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tdis_revenue_village_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tdis_village_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tdis_village_type_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tdis_value: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },

  tdis_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tdis_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tdis_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tdis_created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: sequelize.literal('now()')
  },

  tdis_updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: sequelize.literal('now()')
  }

}, {
  tableName: 't_distance',
  timestamps: false,       // ✅ FIXED: was true, causing Sequelize to inject "createdAt"/"updatedAt"
  freezeTableName: true
});

module.exports = DistanceModel;