const { sequelize, DataTypes } = require('../../config/db');

const UnitStateDistrictModel = sequelize.define('t_unit_state_district', {

  tunsd_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tunsd'::text || lpad(((nextval('t_unit_state_district_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tunsd_unit_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tunsd_type_of_village_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tunsd_distance: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },

  tunsd_state_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tunsd_district_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tunsd_block_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tunsd_grampanchayat_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tunsd_revenue_village_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tunsd_village_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tunsd_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tunsd_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tunsd_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tunsd_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tunsd_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tunsd_slug_name: {
    type: DataTypes.STRING,
    allowNull: true
  }

}, {
  tableName: 't_unit_state_district',
  timestamps: false,
  freezeTableName: true
});

module.exports = UnitStateDistrictModel;