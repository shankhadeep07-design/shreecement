const { sequelize, DataTypes } = require('../../config/db');

const EventClosedFormModel = sequelize.define('t_event_closed_form', {
  tecf_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tevnt'::text || lpad(((nextval('t_event_closed_form_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },
  tecf_event_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tecf_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  tecf_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  tecf_start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  tecf_end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  tecf_status: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tecf_created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tecf_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tecf_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tecf_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tecf_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 't_event_closed_form',
  timestamps: false, // you're using explicit columns, not Sequelize auto timestamps
  freezeTableName: true // to prevent Sequelize from pluralizing table names
});

module.exports = EventClosedFormModel;
