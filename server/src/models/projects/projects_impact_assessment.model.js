const { sequelize, DataTypes } = require('../../config/db');

const ProjectImpactAssessmentModel = sequelize.define(
  't_project_impact_assessment',
  {
    tpia_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('tpia'::text || lpad(((nextval('t_project_impact_assessment_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
      ),
    },

    tpia_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },


    /* ===============================
        NEW FIELDS (FRONTEND)
    =============================== */
    tpia_actual_beneficiary: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpia_before_after_comparison: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    tpia_is_80g_applicable: {
      type: DataTypes.STRING(100), // yes / no
      allowNull: true,
    },

    tpia_csr1_form_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    
    tpia_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: 'N',
    },

    tpia_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tpia_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tpia_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('now()'),
    },

    tpia_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('now()'),
    },

    tpia_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 't_project_impact_assessment',
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = ProjectImpactAssessmentModel;
