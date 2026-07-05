const { sequelize, DataTypes } = require('../../config/db');

const ProjectClosureStakeholderModel = sequelize.define('t_project_closure_stakeholder', {
    tpclsrsh_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        defaultValue: sequelize.literal(`('tpclsrsh'::text || lpad(((nextval('t_project_closure_stakeholder_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
    },
    tpclsrsh_project_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tpclsrsh_project_closure_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tpclsrsh_stackeholder_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tpclsrsh_role_in_project: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tpclsrsh_feedback_summary: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tpclsrsh_action_taken: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tpclsrsh_comments: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tpclsrsh_fl_archive: {
        type: DataTypes.STRING(1),
        defaultValue: 'N'
    },
    tpclsrsh_created_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    tpclsrsh_updated_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    tpclsrsh_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },
    tpclsrsh_updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },
    tpclsrsh_deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 't_project_closure_stakeholder',
    timestamps: false,
    freezeTableName: true
});

module.exports = ProjectClosureStakeholderModel;
