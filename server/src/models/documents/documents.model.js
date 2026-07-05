const { sequelize, DataTypes } = require("../../config/db");

const DocumentModel = sequelize.define(
  "t_documents",
  {
    tdoc_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      defaultValue: sequelize.literal(
        "('TDOC' || lpad((nextval('t_documents_upload_id_seq'))::text, 10, '0'))"
      ),
    },
    draft_doc_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    final_doc_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    doc_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doc_ext: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    doc_original_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doc_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doc_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sub_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doc_title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doc_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doc_informations: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: true,
    },
    doc_purpose: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    fl_archive: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
    },
    created_by: {
      type: DataTypes.BIGINT,
    },
    updated_by: {
      type: DataTypes.BIGINT,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    paranoid: false,
    freezeTableName: true,
    hooks: {
      beforeSave: async (instance) => {
        for (const key in instance.dataValues) {
          if (
            typeof instance.dataValues[key] === "string" &&
            instance.dataValues[key] !== null
          ) {
            instance.dataValues[key] = instance.dataValues[key].trim();
          }
        }
      },
    },
  }
);

module.exports = DocumentModel;
