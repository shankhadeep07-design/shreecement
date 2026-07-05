const { sequelize, DataTypes } = require("../../config/db");

const EventModel = sequelize.define(
  "t_event",
  {
    tevent_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `'tevent' || lpad(nextval('t_event_id_seq')::text, 10, '0')`
      ),
    },

    /* ================= BASIC ================= */
    tevent_domain: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tevent_activity_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_activity_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tevent_expected_impact: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    /* ================= NGO & MODE ================= */
    tevent_ngo_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_mode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tevent_event_link: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tevent_theme_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    /* ================= COMPLIANCE ================= */
    tevent_schedule_vii: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_sub_schedule: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_sdgs_id: {
      type: DataTypes.TEXT, // comma-separated IDs
      allowNull: true,
    },
    tevent_volunteer_roles: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    /* ================= LOCATION ================= */
    tevent_state_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_district_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_block_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_village: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tevent_map_location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tevent_gps_latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    tevent_gps_longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    /* ================= ORGANIZATION ================= */
    tevent_org_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tevent_bu: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    /* ================= SCHEDULE ================= */
    tevent_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tevent_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tevent_start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    tevent_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    /* ================= VOLUNTEERS ================= */
    tevent_volunteers_needed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tevent_family_participation: {
      type: DataTypes.STRING(10), // yes / no
      allowNull: true,
    },
    tevent_family_members_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    /* ================= CONTACT ================= */
    tevent_partner_contact: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tevent_contact_person: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    /* ================= LOGISTICS ================= */
    tevent_vehicle_arrangement: {
      type: DataTypes.STRING(10), // yes / no
      allowNull: true,
    },

    /* ================= SYSTEM ================= */
    tevent_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tevent_status: {
      type: DataTypes.STRING(50),
      defaultValue: "draft",
    },
    tevent_is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tevent_approval_channel_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tevent_approval_role_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tevent_approval_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tevent_created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    tevent_updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    tevent_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
    },
    tevent_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
    },
    tevent_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_event",
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = EventModel;
