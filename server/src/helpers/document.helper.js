// const fs = require("fs");
// const path = require("path");

// /**
//  * Saves uploaded files and prepares document metadata.
//  *
//  * @param {Array} files - Array of uploaded files from multer (req.files).
//  * @param {string} userId - The user ID (used for folder naming and metadata).
//  * @param {string} baseFolder - Base upload folder path (e.g., "uploads/profile/ngo").
//  * @param {string|number} createdBy - User ID for metadata creation.
//  * @returns {Promise<{ metadata: Array, filePaths: Array }>}
//  */
// const saveAndPrepareDocumentMetadata = async (files, userId, baseFolder, createdBy) => {
//   const folderPath = path.join(baseFolder, userId.toString());
//   await fs.promises.mkdir(folderPath, { recursive: true });

//   const filePaths = [];
//   const metadata = await Promise.all(
//     files.map(async (file, idx) => {
//       const fileName = `${idx + 1}_${Date.now()}_${file.originalname}`;
//       const filePath = path.join(folderPath, fileName);

//       await fs.promises.writeFile(filePath, file.buffer);
//       filePaths.push(filePath);

//       return {
//         final_doc_id: userId,
//         doc_purpose: file.fieldname,
//         doc_type: file.mimetype,
//         file_path: filePath.replace(/^uploads[\\/]/, ""),
//         file_name: fileName,
//         doc_ext: path.extname(fileName),
//         created_by: createdBy,
//       };
//     })
//   );

//   return { metadata, filePaths };
// };

// module.exports = { saveAndPrepareDocumentMetadata };

const fs = require("fs");
const path = require("path");
const DocumentModel = require("../models/documents/documents.model");

const saveUpdateAndPrepareDocumentMetadata = async (
  files,
  id,
  baseFolder,
  createdBy,
  transaction
) => {
  const folderPath = path.join(baseFolder, id.toString());
  await fs.promises.mkdir(folderPath, { recursive: true });

  const filePaths = [];

  const metadata = await Promise.all(
    files.map(async (file, idx) => {
      const fileName = `${idx + 1}_${Date.now()}_${file.originalname}`;
      const filePath = path.join(folderPath, fileName);

      // Check for existing document with same fieldName
      const existingDoc = await DocumentModel.findOne({
        where: {
          final_doc_id: id.toString(),
          doc_purpose: file.fieldname,
        },
        transaction,
      });

      // Delete old file if exists
      if (existingDoc && existingDoc.doc_path) {
        const oldPath = path.join("uploads", existingDoc.doc_path);
        try {
          await fs.promises.unlink(oldPath);
        } catch (err) {
          console.warn(`Old file not found or could not delete: ${oldPath}`);
        }
      }

      // Save new file
      await fs.promises.writeFile(filePath, file.buffer);
      filePaths.push(filePath);

      const metadata = {
        final_doc_id: id.toString(),
        doc_purpose: file.fieldname,
        doc_type: file.mimetype,
        doc_path: filePath.replace(/^uploads[\\/]/, "").replace(/\\/g, "/"),
        doc_name: fileName,
        doc_ext: path.extname(fileName),
        created_by: createdBy,
      };

      if (existingDoc) {
        await existingDoc.update(metadata, { transaction });
        return null; // skip bulk insert
      }

      return metadata;
    })
  );

  return {
    metadata: metadata.filter(Boolean), // only new entries
    filePaths,
  };
};

// For multiple file uploads, this function saves the files and prepares the document metadata.
const saveAndPrepareDocumentMetadata = async (
  files,
  id,
  baseFolder,
  createdBy,
  transaction
) => {
  const folderPath = path.join(baseFolder, id.toString());
  await fs.promises.mkdir(folderPath, { recursive: true });

  const filePaths = [];

  const metadata = await Promise.all(
    files.map(async (file, idx) => {
      const fileName = `${idx + 1}_${Date.now()}_${file.originalname}`;
      const filePath = path.join(folderPath, fileName);

      // Save new file
      await fs.promises.writeFile(filePath, file.buffer);
      filePaths.push(filePath);

      return {
        final_doc_id: id.toString(),
        doc_purpose: file.fieldname,
        doc_type: file.mimetype,
        doc_path: filePath.replace(/^uploads[\\/]/, "").replace(/\\/g, "/"),
        doc_name: fileName,
        doc_ext: path.extname(fileName),
        created_by: createdBy,
      };
    })
  );

  return {
    metadata,
    filePaths,
  };
};

const deleteDocumentById = async (documentId, transaction = null) => {
  const document = await DocumentModel.findByPk(documentId, { transaction });

  if (!document) {
    throw new Error(`Document with ID ${documentId} not found`);
  }

  const filePath = path.join("uploads", document.file_path);

  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    // Log and continue (don't block deletion if file missing)
    console.warn(`Could not delete file: ${filePath}`, err.message);
  }

  await document.destroy({ transaction });
};

module.exports = {
  saveUpdateAndPrepareDocumentMetadata,
  saveAndPrepareDocumentMetadata,
  deleteDocumentById,
};
