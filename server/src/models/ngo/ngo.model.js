// const { sequelize, DataTypes } = require('../../config/db');

// const NgoModel = sequelize.define('t_ngo', {
//   tngo_id: {
//     type: DataTypes.STRING(50),
//     defaultValue: sequelize.literal(
//       `('tngo'::text || lpad(((nextval('t_ngo_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
//     ),
//     primaryKey: true,
//   },
//   tngo_name: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//    tngo_date: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   tngo_amount_received: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: true,
//   },
//   tngo_amount_spent: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: true,
//   },


  
  
//   tngo_csr_one_res_org: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_res_certificate_org: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_register_id: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_pan_card_org: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_twelve_aa_certificate: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_eighty_g_certificate_org: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_list_of_exist_gov_body_members: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_details_of_office_bearers: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_audit_report_org_with_income_tax_return: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_bank_account_no: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_bank_account_name: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_bank_name: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_bank_ifsc_code: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_bank_address_of_the_bank: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
//   tngo_fcra_reg_certificate: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_niti_aayog_darpan_reg: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_complete_address_reg_doc_org: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
//   tngo_contact_name: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_contact_phone_no: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_contact_email: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_contact_office_address: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_key_person_name: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_key_person_phone_no: {
//     type: DataTypes.STRING(255),   // ✅ correct for phone numbers
//     allowNull: true,
//   },
//   tngo_key_person_email: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_key_person_office_address: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//     tngo_name_of_entity: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_status_of_entity_id: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },

//   tngo_user_id: {
//     type: DataTypes.BIGINT,
//     allowNull: true,
//   },
//   tngo_registered_off_address: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },

//   tngo_status: {
//     type: DataTypes.STRING(100),
//     defaultValue: 'pending',
//   },
//   tngo_corporate_off_address: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_branches: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
 
//   tngo_name_of_group: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_pan: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_gst: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_website: {
//     type: DataTypes.STRING(255),
//     allowNull: true,
//   },
//   tngo_register_status: {
//     type: DataTypes.STRING(100),
//     allowNull: true,
//   },
//   tngo_approval_order: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//   },
//   tngo_created_by: {
//     type: DataTypes.BIGINT,
//     allowNull: true,
//   },
//   tngo_created_at: {
//     type: DataTypes.DATE,
//     defaultValue: sequelize.literal('now()'),
//   },
//   tngo_updated_by: {
//     type: DataTypes.BIGINT,
//     allowNull: true,
//   },
//   tngo_updated_at: {
//     type: DataTypes.DATE,
//     defaultValue: sequelize.literal('now()'),
//   },
//   tngo_deleted_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   tngo_fl_archive: {
//     type: DataTypes.STRING(1),
//     defaultValue: 'N',
//   },
// }, {
//   tableName: 't_ngo',
//   timestamps: false,
//   freezeTableName: true,
// });

// module.exports = NgoModel;

const { sequelize, DataTypes } = require('../../config/db');

const NgoModel = sequelize.define('t_ngo', {

  tngo_id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: sequelize.literal(
      `('tngo'::text || lpad(((nextval('t_ngo_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
    )
  },

  tngo_user_id: {
    type: DataTypes.BIGINT,
  },
  tngo_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_area_of_expertise: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_category: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_contact_no: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_email_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_ngo_darpan_no: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_reg_address_of_org: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  tngo_present_address_of_org: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  tngo_state_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_csr_reg_no: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_niti_aayog_darpan_por_reg: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_pan_no: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_bank_account_no: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_bank_account_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_bank_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_bank_ifsc_code: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_address_of_the_bank: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  tngo_remarks: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  tngo_status: {
    type: DataTypes.STRING(100),
    defaultValue: 'pending'
  },

  tngo_created_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },

  tngo_created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  },

  tngo_updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true
  },

  tngo_updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  },

  tngo_deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  tngo_fl_archive: {
    type: DataTypes.STRING(1),
    defaultValue: 'N'
  }

}, {
  tableName: 't_ngo',
  timestamps: false,
  freezeTableName: true
});

module.exports = NgoModel;
