const { sequelize, DataTypes } = require('../../config/db');

const ProposalAdditionalInformationModel = sequelize.define('t_proposal_additional_information', {
  tpai_id: {
    type: DataTypes.STRING(255),
    defaultValue: sequelize.literal(
      `('tpai'::text || lpad(((nextval('t_proposal_additional_information_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    ),
    primaryKey: true,
  },
  tpai_proposal_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpai_particular: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tpai_unit: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },


  tpai_no_of_unit: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },


  tpai_unit_cost: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },


  tpai_total: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },

  tpai_gst_percentage: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },


  tpai_total_including_gst: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },



  tpai_created_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tpai_updated_by: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tpai_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tpai_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
  },
  tpai_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 't_proposal_additional_information',
  timestamps: false,
  freezeTableName: true,
});

module.exports = ProposalAdditionalInformationModel;
