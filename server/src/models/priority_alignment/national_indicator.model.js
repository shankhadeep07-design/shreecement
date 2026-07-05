const { sequelize, DataTypes } = require('../../config/db');

const NationalIndicatorModel = sequelize.define('t_national_indicator_master', {

  tnif_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tnif'::text || lpad(((nextval('t_national_indicator_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

   tnif_sdg_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tnif_target: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tnif_indicator: {
       type: DataTypes.STRING(255),
    allowNull: true
  },

  tnif_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tnif_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tnif_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tnif_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tnif_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tnif_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }

}, {
  tableName: 't_national_indicator_master',
  timestamps: false,
  freezeTableName: true
});

module.exports = NationalIndicatorModel;
