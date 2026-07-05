const { sequelize, DataTypes } = require('../../config/db');

const NgoFactorysModel = sequelize.define('t_ngo_factorys', {
  tnfac_id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tnfac'::text || lpad(((nextval('t_ngo_factorys_id_seq'::regclass))::character varying)::text, 10, '0'))`
    )
  },
  tnfac_ngo_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tnfac_factory_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tnfac_created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tnfac_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: true
  },
  tnfac_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tnfac_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: true
  },
  tnfac_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tnfac_fl_archive: {
    type: DataTypes.STRING(1),
    defaultValue: 'N',
    allowNull: true
  }
}, {
  tableName: 't_ngo_factorys',
  timestamps: false,
  freezeTableName: true
});

module.exports = NgoFactorysModel;
