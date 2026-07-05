const { sequelize, DataTypes } = require('../../config/db');

const ProposalModel = sequelize.define(
  't_proposal',
  {
    tpros_id: {
      type: DataTypes.STRING(255),
      defaultValue: sequelize.literal(
        `('tpros'::text || lpad(((nextval('t_proposal_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
      ),
      primaryKey: true,
    },

    // ✅ Keep as-is (exception)
    tpros_financial_year_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // ===================== Proposal Details =====================
    tpros_proposal_name: { type: DataTypes.STRING(255), allowNull: true },
    tpros_current_date: { type: DataTypes.DATE, allowNull: true },
    tpros_nature_of_the_project: { type: DataTypes.STRING(255), allowNull: true },
    tpros_project_type: { type: DataTypes.STRING(255), allowNull: true },
    tpros_ngo_engagement: { type: DataTypes.STRING(255), allowNull: true },
    tpros_description: { type: DataTypes.TEXT, allowNull: true },
    tpros_base_project_year: { type: DataTypes.STRING(255), allowNull: true },
    tpros_project_value: { type: DataTypes.BIGINT, allowNull: true },

    // ===================== Dates =====================
    tpros_date_of_the_program: { type: DataTypes.DATE, allowNull: true },
    tpros_start_date: { type: DataTypes.DATE, allowNull: true },
    tpros_end_date: { type: DataTypes.DATE, allowNull: true },
    tpros_frequency: { type: DataTypes.STRING(255), allowNull: true },

    // ===================== Location =====================
    tpros_state: { type: DataTypes.STRING(100), allowNull: true },
    tpros_district: { type: DataTypes.STRING(100), allowNull: true },
    tpros_sub_district: { type: DataTypes.STRING(100), allowNull: true },
    tpros_location: { type: DataTypes.STRING(100), allowNull: true },

    tpros_gps_latitude: { type: DataTypes.DOUBLE },
    tpros_gps_longitude: { type: DataTypes.DOUBLE },



    // ===================== New Fields =====================
    tpros_is_aspirational_district: { type: DataTypes.STRING(100), allowNull: true },
    tpros_is_gromor_village: { type: DataTypes.STRING(100), allowNull: true },
    tpros_schedule_seven: { type: DataTypes.STRING(100), allowNull: true },
    tpros_sdg: { type: DataTypes.STRING(100), allowNull: true },

    // ===================== Organization =====================
    tpros_org_unit: { type: DataTypes.STRING(255), allowNull: true },
    tpros_bu: { type: DataTypes.STRING(255), allowNull: true },
    tpros_thematic_area: { type: DataTypes.STRING(100), allowNull: true },
    tpros_gl_code: { type: DataTypes.STRING(255), allowNull: true },
    tpros_profit_center: { type: DataTypes.STRING(255), allowNull: true },
    tpros_cost_center: { type: DataTypes.STRING(255), allowNull: true },






    // ===================== Beneficiaries =====================
    tpros_target_beneficiaries: { type: DataTypes.STRING(100), allowNull: true },
    tpros_male_beneficiaries: { type: DataTypes.INTEGER, allowNull: true },
    tpros_female_beneficiaries: { type: DataTypes.INTEGER, allowNull: true },
    tpros_mix_group_beneficiaries: { type: DataTypes.INTEGER, allowNull: true },

    // ===================== Project Types =====================
    tpros_type_of_the_project: { type: DataTypes.STRING(100), allowNull: true },
    tpros_type_of_the_sub_project: { type: DataTypes.STRING(100), allowNull: true },




    // ===================== Budget =====================
    tpros_approved_line_item: { type: DataTypes.TEXT, allowNull: true },
    tpros_allocate_budget_for_approved_line_item: { type: DataTypes.BIGINT, allowNull: true },
    tpros_utilized_till_date: { type: DataTypes.BIGINT, allowNull: true },
    tpros_project_budget: { type: DataTypes.BIGINT, allowNull: true },

    // ===================== Implementation =====================
    tpros_implementation_by: { type: DataTypes.STRING(255), allowNull: true },
    tpros_implementation_partner_name: { type: DataTypes.STRING(255), allowNull: true },

    // ===================== Compliance & Program =====================
    tpros_ngo_compliance_check: { type: DataTypes.STRING(255), allowNull: true },
    tpros_vendor_compliance_check: { type: DataTypes.STRING(255), allowNull: true },
    tpros_program_background: { type: DataTypes.STRING(255), allowNull: true },
    tpros_baseline_data_information: { type: DataTypes.STRING(255), allowNull: true },
    tpros_proposal_details: { type: DataTypes.STRING(255), allowNull: true },
    tpros_govt_scheme_linkage: { type: DataTypes.STRING(255), allowNull: true },
    tpros_stakeholder_request_level: { type: DataTypes.STRING(255), allowNull: true },
    tpros_government_approval: { type: DataTypes.STRING(255), allowNull: true },
    tpros_program_objective: { type: DataTypes.STRING(255), allowNull: true },
    tpros_activities_planned: { type: DataTypes.STRING(255), allowNull: true },
    tpros_expected_outcome: { type: DataTypes.STRING(255), allowNull: true },
    tpros_project_uniqueness: { type: DataTypes.STRING(255), allowNull: true },
    tpros_branding_communication: { type: DataTypes.STRING(255), allowNull: true },
    tpros_monitoring_scope: { type: DataTypes.STRING(255), allowNull: true },
    tpros_budget_breakup: { type: DataTypes.BIGINT, allowNull: true },


    ///////////////////////////



    // ===================== Budget Line Items =====================
    tpros_particular: { type: DataTypes.STRING(255), allowNull: true },
    tpros_unit: { type: DataTypes.STRING(255), allowNull: true },
    tpros_no_of_units: { type: DataTypes.INTEGER, allowNull: true },
    tpros_unit_cost: { type: DataTypes.INTEGER, allowNull: true },
    tpros_total_amount: { type: DataTypes.DOUBLE, allowNull: true },
    tpros_gst_amount: { type: DataTypes.DOUBLE, allowNull: true },
    tpros_total_incl_gst: { type: DataTypes.DOUBLE, allowNull: true },

    // ===================== Cost Breakdown =====================
    tpros_capex_cost: { type: DataTypes.DOUBLE, allowNull: true },
    tpros_opex_cost: { type: DataTypes.DOUBLE, allowNull: true },
    tpros_service_charges: { type: DataTypes.DOUBLE, allowNull: true },
    tpros_tax_details: { type: DataTypes.DOUBLE, allowNull: true },
    tpros_total_project_cost: { type: DataTypes.DOUBLE, allowNull: true },



    tpros_l1_party_budget: { type: DataTypes.STRING(255), allowNull: true },
    tpros_recommended_party: { type: DataTypes.STRING(255), allowNull: true },
    tpros_justification_other_than_l1: { type: DataTypes.TEXT, allowNull: true },
    tpros_single_party_justification: { type: DataTypes.TEXT, allowNull: true },
    tpros_remarks: { type: DataTypes.TEXT, allowNull: true },


    // ===================== System Fields =====================
    tpros_status: {
      type: DataTypes.STRING(255),
      defaultValue: 'draft',
    },
    tpros_approval_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tpros_approval_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tpros_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: 'N',
    },
    tpros_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpros_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    tpros_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('now()'),
    },
    tpros_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('now()'),
    },
    tpros_deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 't_proposal',
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = ProposalModel;
