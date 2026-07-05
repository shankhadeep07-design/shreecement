const { sequelize, DataTypes } = require("../../config/db");

const ApprovalChannelModel = sequelize.define(
  "t_approval_channel",
  {
    tac_id: {
      type: DataTypes.STRING(100),
      defaultValue: sequelize.literal(`('TAC'::text || lpad(((nextval('t_approval_channel_id_seq'::regclass))::character varying)::text, 10, '0'::text))`),
      primaryKey: true
    },
    tac_intemator_id: DataTypes.STRING,
    tac_status: DataTypes.STRING,
    tac_initiator_role_id: DataTypes.STRING,
    tac_approval_json: {
      type: DataTypes.JSONB
    },
    tac_module_id: DataTypes.STRING,
    tac_approval_master_id: DataTypes.STRING,
    tac_bu_id: DataTypes.STRING,
    tac_module_name: DataTypes.STRING,
    tac_from_amount: DataTypes.DECIMAL,
    tac_to_amount: DataTypes.DECIMAL,
    tac_approved_type: DataTypes.STRING,
    tac_fl_archive: {
      type: DataTypes.STRING,
      defaultValue: 'N',
    },
    tac_created_by: DataTypes.STRING(100),
    tac_updated_by: DataTypes.STRING(100),
    tac_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    tac_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    tac_published_date: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
  },
  {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    freezeTableName: true,
  }
);

module.exports = { ApprovalChannelModel };
