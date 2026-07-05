const { sequelize, DataTypes } = require('../../config/db');

const EventAssignModel = sequelize.define('t_event_assign', {
  tea_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tea'::text || lpad(((nextval('t_event_assign_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },
  tea_event_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tea_user_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tea_status: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tea_final_status: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tea_excel_upload_status: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tea_booked: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  tea_waiting_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tea_responded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tea_remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tea_form_submit: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tea_created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tea_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tea_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tea_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tea_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 't_event_assign',
  timestamps: false,
  freezeTableName: true
});

module.exports = EventAssignModel;
