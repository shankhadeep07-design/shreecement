const { sequelize, DataTypes } = require('../../config/db');

const ProjectTypeModel = sequelize.define('t_project_type', {

  tprj_id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tprj'::text || lpad(((nextval('t_project_type_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tprj_project_type_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tprj_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },


  tprj_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
tprj_created_by: {
  type: DataTypes.BIGINT,
  allowNull: true,        // or false if required
},

tprj_updated_by: {
  type: DataTypes.BIGINT,
  allowNull: true,
},

  tprj_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tprj_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()'),
    allowNull: false
  },
  tprj_deleted_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 't_project_type',
  timestamps: false,
  freezeTableName: true
});

module.exports = ProjectTypeModel;
