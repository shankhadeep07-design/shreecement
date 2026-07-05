const { sequelize, DataTypes } = require('../../config/db');

const ProjectBeneficiaryModel = sequelize.define('t_project_beneficiary', {
    tpben_id: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        defaultValue: sequelize.literal(`('TPBEN'::text || lpad(((nextval('t_project_beneficiary_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
    },
    tpben_project_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tpben_kpi_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    tpben_beneficiary_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tpben_created_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    tpben_updated_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    tpben_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },
    tpben_updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },
    tpben_deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 't_project_beneficiary',
    timestamps: false,
    freezeTableName: true
});

module.exports = ProjectBeneficiaryModel;
