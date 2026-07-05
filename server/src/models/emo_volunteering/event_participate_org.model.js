const { sequelize, DataTypes } = require('../../config/db');

const EventParticipateOrgModel = sequelize.define('t_event_participate_org', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: true
  },
  tevntpo_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tevntpo'::text || lpad(((nextval('t_event_participate_org_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },
  tevntpo_tevnt_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevntpo_participate_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevntpo_participate_details: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevntpo_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tevntpo_created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tevntpo_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  tevntpo_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tevntpo_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tevntpo_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tevntpo_event_participate_org_slug: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevntpo_status: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tevntpo_lat: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  tevntpo_long: {
    type: DataTypes.DOUBLE,
    allowNull: true
  }
}, {
  tableName: 't_event_participate_org',
  timestamps: false,
  freezeTableName: true
});

module.exports = EventParticipateOrgModel;
