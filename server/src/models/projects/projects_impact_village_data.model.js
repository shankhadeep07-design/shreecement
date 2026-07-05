const { sequelize, DataTypes } = require('../../config/db');

const ProjectImpactVillageDataModel = sequelize.define('t_project_impact_village_data', {
    tpiavd_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        defaultValue: sequelize.literal(
            `('tpiavd'::text || lpad(((nextval('t_project_impact_village_data_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
        )
    },
    tpiavd_project_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tpiavd_project_impact_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tpiavd_no_of_village: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tpiavd_no_of_male: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tpiavd_no_of_female: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tpiavd_remarks: {
        type: DataTypes.STRING(255),   // in your table it's INTEGER, if it should be text update to STRING
        allowNull: true
    },
    tpiavd_fl_archive: {
        type: DataTypes.STRING(1),
        defaultValue: 'N'
    },
    tpiavd_created_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    tpiavd_updated_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    tpiavd_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },
    tpiavd_updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },
    tpiavd_deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 't_project_impact_village_data',
    timestamps: false,
    freezeTableName: true
});

module.exports = ProjectImpactVillageDataModel;
