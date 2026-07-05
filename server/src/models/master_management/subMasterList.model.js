const { sequelize, DataTypes } = require('../../config/db');

const SubMasterListModel = sequelize.define('t_sub_master_list', {
  wkb_geometry: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: true,
    validate: {
      isValidGeometry(value) {
        if (value && value.type !== 'Point') {
          throw new Error('Geometry must be of type POINT');
        }
      }
    }
  },
  tsml_id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    defaultValue: sequelize.literal(`('tsml'::text || lpad(((nextval('t_sub_master_list_id_seq'::regclass))::character varying)::text, 10, '0'::text))`)
  },
  tsml_tml_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tsml_sub_master_list_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tsml_sub_master_list_desc: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tsml_master_slug: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tsml_sub_master_list_slug: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tsml_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tsml_created_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsml_updated_by: {
    type: DataTypes.STRING(100),
    defaultValue: 'SYSTEM'
  },
  tsml_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tsml_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('now()')
  },
  tsml_deleted_at: {
    type: DataTypes.DATE,
     allowNull: true,
  }
}, {
  tableName: 't_sub_master_list',
  timestamps: false,
  freezeTableName: true
});

module.exports = SubMasterListModel;
