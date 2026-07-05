const { sequelize, DataTypes } = require('../../../config/db');

const ActivityTimelineMasterModel = sequelize.define('t_activity_timeline_master', {
    atim_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        defaultValue: sequelize.literal(
            `('ATIM'::text || lpad(((nextval('t_activity_timeline_master_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
        )
    },
    atim_project_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    atim_activities: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    atim_parent_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    atim_planned_start_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    atim_planned_end_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    atim_actual_start_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    atim_actual_end_dt: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    atim_actual_start_dt_user: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    atim_actual_end_dt_user: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    atim_actual_start_dt_by: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    atim_actual_end_dt_by: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    atim_wightage: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    atim_completion_per: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    atim_order: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    atim_date_change_history: {
        type: DataTypes.JSON,
        allowNull: true
    },
    atim_status: {
        type: DataTypes.STRING(50),
        defaultValue: 'not started'
    },
    atim_created_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    atim_updated_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    atim_created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('now()')
    },
    atim_updated_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('now()')
    },
    atim_fl_archive: {
        type: DataTypes.STRING(1),
        defaultValue: 'N'
    }
}, {
    tableName: 't_activity_timeline_master',
    timestamps: false,
    freezeTableName: true
});

module.exports = ActivityTimelineMasterModel;
