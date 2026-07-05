const { sequelize, DataTypes } = require('../../config/db');

const BudgetAmmendmentMasterModel = sequelize.define(
  't_budget_ammendment_master',
  {
    tbam_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `'tbam' || lpad(nextval('t_budget_ammendment_master_id_seq')::text, 10, '0')`
      ),
    },
    tbam_budget_master_id: {
      type: DataTypes.STRING(100),
    },
    tbam_domain_id: {
      type: DataTypes.STRING(100),
    },
     tbam_plant_id: {
      type: DataTypes.STRING(100),
    },
     tbam_bu_id: {
      type: DataTypes.STRING(100),
    },
     tbam_sbu_id: {
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
     tbam_nature_of_project: {
      type: DataTypes.STRING(100),
    },
     tbam_schedule_vii_id: {
      type: DataTypes.STRING(100),
    },
     tbam_sub_schedule_vii_id: {
      type: DataTypes.STRING(100),
    },
     tbam_sdg_id: {
      type: DataTypes.STRING(100),
    },
    tbam_national_indicator_framework: {
      type: DataTypes.STRING(100),
    },
   
    tbam_thematic_area: {
      type: DataTypes.STRING(100),
    },
   
    tbam_status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'submitted',
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

module.exports = { BudgetAmmendmentMasterModel };
