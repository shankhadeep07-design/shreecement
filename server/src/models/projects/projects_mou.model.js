const { sequelize, DataTypes } = require("../../config/db");

const ProjectMouModel = sequelize.define(
  "t_project_mous",
  {
    tpmou_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        `('TPMOU'::text || lpad(((nextval('t_project_mous_id_seq'::regclass))::character varying)::text, 10, '0'))`,
      ),
    },

    tpmou_proposal_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpmou_project_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    /* ================= NEW FIELDS ================= */
    tpmou_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tpmou_valid_from: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tpmou_valid_to: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tpmou_mou_type: {
      type: DataTypes.STRING(255), // 'MOU' or 'Addendum'
      allowNull: true,
    },
    tpmou_status: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    tpmou_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    /* =============================================== */

    tpmou_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },

    tpmou_created_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tpmou_updated_by: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },

    tpmou_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
      allowNull: false,
    },

    tpmou_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
      allowNull: false,
    },

    tpmou_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "t_project_mous",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = ProjectMouModel;
