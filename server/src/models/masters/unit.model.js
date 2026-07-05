const { sequelize, DataTypes } = require('../../config/db');

const UnitModel = sequelize.define('t_unit', {

  tun_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tun'::text || lpad(((nextval('t_unit_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tun_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  tun_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  tun_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tun_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },

  tun_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tun_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },

  tun_slug_name: {
    type: DataTypes.STRING,
    allowNull: true
  },

}, {
  tableName: 't_unit',
  timestamps: false,
  freezeTableName: true
});

module.exports = UnitModel;