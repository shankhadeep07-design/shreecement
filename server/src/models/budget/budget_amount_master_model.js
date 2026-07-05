const { sequelize, DataTypes } = require('../../config/db');

const BudgetAmountMasterModel = sequelize.define(
  't_budget_amount_master',
  {
    tbam_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `'tbam' || lpad(nextval('t_budget_amount_id_seq')::text, 10, '0')`
      ),
    },
    tbam_budget_id: {
      type: DataTypes.STRING(100),
    },
    tbam_fy_id: {
      type: DataTypes.STRING(100),
    },
     tbam_state_id: {
      type: DataTypes.STRING(100),
    },
     tbam_district_id: {
      type: DataTypes.STRING(100),
    },
     tbam_block_id: {
      type: DataTypes.STRING(100),
    },
     tbam_total_amount: {
      type: DataTypes.DOUBLE,
    },

    tbam_status: {
      type: DataTypes.STRING(100),
    },
   
    tbam_fl_archive: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'N',
    },
    tbam_created_by: {
      type: DataTypes.BIGINT,
    },
    tbam_updated_by: {
      type: DataTypes.BIGINT,
    },
    tbam_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    tbam_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    tbam_deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = { BudgetAmountMasterModel };
