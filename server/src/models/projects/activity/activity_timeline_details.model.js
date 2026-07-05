const { sequelize, DataTypes } = require('../../../config/db');

const ActivityTimelineDetailsModel = sequelize.define('t_activity_timeline_details', {
    atd_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        defaultValue: sequelize.literal(
            `('ATD'::text || lpad(((nextval('t_activity_timeline_details_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
        )
    },
    atd_project_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    atd_activity_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    atd_activity_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    atd_activity_details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    atd_status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending'
    },
    atd_created_by: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    atd_created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('now()')
    },
    atd_updated_by: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    atd_updated_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('now()')
    },
    atd_fl_archive: {
        type: DataTypes.STRING(1),
        defaultValue: 'N'
    }
}, {
    tableName: 't_activity_timeline_details',
    timestamps: false,
    freezeTableName: true
});

module.exports = ActivityTimelineDetailsModel;
