const { sequelize, DataTypes } = require("../../config/db");

const VendorModel = sequelize.define(
  "t_vendor",
  {
    tvendor_id: {
      type: DataTypes.STRING(50),
      defaultValue: sequelize.literal(
        `('tvendor'::text || lpad(((nextval('t_vendor_id_seq'::regclass))::character varying)::text, 10, '0'::text))`
      ),
      primaryKey: true,
    },
    tvendor_prospect_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_preferred_location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_additional_location: {
    type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_state_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tvendor_district_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_block_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_pin_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_gst: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_description_goods: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_hsn_codes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_pan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_adhar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_msme: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_statues: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_msme_udyam: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_cin: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_office_phone1: {
     type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_office_phone2: {
    type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tvendor_work_phone1: {
    type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tvendor_work_phone2: {
   type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tvendor_office_fax1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_office_fax2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_work_fax_1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_work_fax_2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_email_1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_email_2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_contact_person_name: {
      type: DataTypes.STRING(255), // ✅ correct for phone numbers
      allowNull: true,
    },
    tvendor_contact_person_no: {
       type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tvendor_relative_working: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_relative_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_relative_designation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_relative_location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tvendor_relative_mobile: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    tvendor_bank_name: {
      type: DataTypes.STRING(255),
     allowNull: true,
    },
    tvendor_bank_branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_bank_account_no: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    tvendor_bank_ifsc_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_declaration: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_bank_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tvendor_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
   
    tvendor_approval_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
     tvendor_status: {
    type: DataTypes.STRING(100),
    defaultValue: 'pending',
  },
    tvendor_created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    tvendor_created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
    },
    tvendor_updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    tvendor_updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("now()"),
    },
    tvendor_deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tvendor_fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },
  },
  {
    tableName: "t_vendor",
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = VendorModel;
