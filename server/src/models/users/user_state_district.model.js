const { sequelize, DataTypes } = require('../../config/db');

// Define the model
const UserStateDistrictModel = sequelize.define('t_user_state_district', {
  tus_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    allowNull: false,
    defaultValue: sequelize.literal(`'TUS' || lpad(nextval('t_user_state_district_id_seq')::text, 10, '0')`),
  },
  tus_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  tus_region_id: {
    type: DataTypes.STRING,
  },
  // tus_mine_id: {
  //   type: DataTypes.STRING,
  // },
  tus_state_id: {
    type: DataTypes.STRING(255),
  },
  tus_district_id: {
    type: DataTypes.STRING,
  },
  tus_block_id: {
    type: DataTypes.STRING,
  },
  tus_role_id: {
    type: DataTypes.STRING,
  },
  tus_factory_id: {
    type: DataTypes.STRING,
  },
  tus_location_id: {
    type: DataTypes.STRING,
  },
  tus_created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  tus_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  tus_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  tus_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
  tus_deleted_at: {
    type: DataTypes.DATE,
  }
}, {
  timestamps: false, // Disable Sequelize's automatic timestamps
  tableName: 't_user_state_district' // Specify the table name explicitly
});

// Export the model
module.exports = UserStateDistrictModel;
