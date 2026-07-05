const { sequelize, DataTypes } = require('../../config/db');

const BeneficiaryMasterModel = sequelize.define('t_beneficiary_master', {
    tben_id: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        defaultValue: sequelize.literal(`('TBEN'::text || lpad(((nextval('t_beneficiary_master_id_seq'::regclass))::character varying)::text, 11, '0'::text))`)
    },
    tben_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tben_phone: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tben_gender: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tben_age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tben_unique_no: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tben_created_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    tben_updated_by: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    tben_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },
    tben_updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('now()')
    },
    tben_deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tben_state_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tben_district_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tben_block_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tben_village_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tben_dob: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    tben_unique_key: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tben_cumulative: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tben_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tben_type: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 't_beneficiary_master',
    timestamps: false,
    freezeTableName: true
});

module.exports = BeneficiaryMasterModel;
