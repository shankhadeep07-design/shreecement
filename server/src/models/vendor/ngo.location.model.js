const { sequelize, DataTypes } = require('../../config/db');

const NgoLocationModel = sequelize.define(
  't_ngo_location',
  {
    tnl_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: sequelize.literal(
        "'tnl' || lpad(nextval('t_ngo_location_id_seq')::text, 10, '0')"
      ),
    },
    tnl_ngo_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tnl_state_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tnl_district_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tnl_created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'SYSTEM',
    },
    tnl_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    tnl_updated_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'SYSTEM',
    },
    tnl_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    tnl_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tnl_fl_archive: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: 'N',
    },
  },
  {
    tableName: 't_ngo_location', // FIXED table name
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = NgoLocationModel;
