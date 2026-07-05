const { sequelize, DataTypes } = require('../../config/db');

const EventReviewFormModel = sequelize.define('t_event_review_forms', {
  terf_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('terf'::text || lpad(((nextval('t_event_review_forms_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },
  terf_event_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  terf_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  terf_emp_user_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  terf_phone_no: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  terf_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  terf_attending_event: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  terf_duration: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  terf_family_vol_presence_no: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  terf_event_join_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  terf_event_join_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  terf_event_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  terf_event_end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  terf_remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  terf_approved_remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  terf_status: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  terf_created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  terf_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  terf_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  terf_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  terf_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 't_event_review_forms',
  timestamps: false,
  freezeTableName: true
});

module.exports = EventReviewFormModel;
