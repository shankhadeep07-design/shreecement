const { sequelize, DataTypes } = require('../../config/db');

const ProjectKpiTargetModel = sequelize.define('t_project_kpi_target', {

    tpkt_id: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        defaultValue: sequelize.literal(`('tpkt'::text || lpad(((nextval('t_project_kpi_target_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
    },

    tpkt_project_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    tpkt_kpi_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    tpkt_target: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },

    tpkt_created_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },

    tpkt_updated_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },

    tpkt_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },

    tpkt_updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },

    tpkt_deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }

}, {
    tableName: 't_project_kpi_target',
    timestamps: false,
    freezeTableName: true
});

module.exports = ProjectKpiTargetModel;