const { sequelize, DataTypes } = require('../../config/db');

const SubProjectTypeModel = sequelize.define('t_sub_project_type', {

  tsprj_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tprj'::text || lpad(((nextval('t_project_type_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },

  tsprj_sub_project_type_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tsprj_project_type_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tsprj_sub_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },


  tsprj_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // tsprj_created_by: {
  //   type: DataTypes.STRING(100),
  //   defaultValue: 'SYSTEM'
  // },
  // tsprj_updated_by: {
  //   type: DataTypes.STRING(100),
  //   defaultValue: 'SYSTEM'
  // },

  tsprj_created_by: {
  type: DataTypes.BIGINT,
  allowNull: true,        // or false if required
},

tsprj_updated_by: {
  type: DataTypes.BIGINT,
  allowNull: true,
},


  tsprj_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsprj_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tsprj_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_sub_project_type',
  timestamps: false,
  freezeTableName: true
});

module.exports = SubProjectTypeModel;
