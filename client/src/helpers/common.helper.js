var bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const path = require("path");

const { DocumentsModel } = require("../models/documents/documents.model");

exports.cryptPassword = function (password, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return callback(err);

    bcrypt.hash(password, salt, function (err, hash) {
      return callback(err, hash);
    });
  });
};

exports.comparePassword = function (plainPass, hashword, callback) {
  bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
    return err == null ? callback(null, isPasswordMatch) : callback(err);
  });
};

exports.isEmpty = function (val) {
  return val === null || val === undefined || val.length === 0 || val === "";
};

exports.isSet = function (val) {
  return val === null || val === undefined;
};

exports.getBoundary = function (request) {
  let contentType = request.headers["content-type"];
  const contentTypeArray = contentType.split(";").map((item) => item.trim());
  const boundaryPrefix = "boundary=";
  let boundary = contentTypeArray.find((item) =>
    item.startsWith(boundaryPrefix)
  );
  if (!boundary) return null;
  boundary = boundary.slice(boundaryPrefix.length);
  if (boundary) boundary = boundary.trim();
  return boundary;
};

exports.getMatching = function (string, regex) {
  // Helper function when using non-matching groups
  const matches = string.match(regex);
  if (!matches || matches.length < 2) {
    return null;
  }
  return matches[1];
};

// exports.uploadFile = function(req = {}, path = '', accept = [], name = ''){
//   return new Promise((resolve, reject) => {
//     const storage = multer.diskStorage({
//       destination : function(req, file, cb)
//       {
//           cb(null, `${path}`);
//       },
//       filename : function (req, file, cb)
//       {
//           var name = Date.now()+'-'+file.originalname;
//           cb(null, name);
//       }
//     })

//     const fileFilter = (req, file, cb) => {
//       if(accept == [] || accept == '')
//       {
//         cb(null, true);
//         return;
//       }
//       (accept.indexOf(file.mimetype) > -1) ? cb(null, true) : cb(null, false);
//     }

//     const upload = multer({storage:storage, fileFilter : fileFilter})
//     upload.single(`${name}`)(req, {}, function (err) {
//         if (err) reject(err);
//         resolve(req.file);
//     })
//   })
// }

exports.saveArrayAsFile = (arrayBuffer, filePath) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, Buffer.from(arrayBuffer), "binary", (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
};

exports.uploadFile = (file, dirPath) => {
  var uploadDirPath = `${process.env.FILE_UPLOAD_PATH}/${dirPath}`;
  if (cleanOrCreateDirectory(uploadDirPath)) {
    return new Promise((resolve, reject) => {
      var fileName = `${generateUniqueId()}${path.extname(
        file["originalname"]
      )}`;
      var buffer = file["buffer"];

      dirPath = trimSlashes(dirPath);
      var originalFilePath = `${uploadDirPath}/${fileName}`;
      var filePath = `static/${dirPath}/${fileName}`;
      fs.writeFile(originalFilePath, Buffer.from(buffer), "binary", (err) => {
        if (err) reject(err);
        resolve({
          sub_type: `${file["fieldname"]}`,
          file_path: `${filePath}`,
          file_name: `${fileName}`,
          file_original_path: `${originalFilePath}`,
          original_file_name: `${file["originalname"]}`,
        });
      });
    });
  }
};

exports.saveFile = async (buffer, filepath, cb) => {
  try {
    // Extract directory path
    const dirPath = filepath.substring(0, filepath.lastIndexOf("/"));

    // Create directory if it doesn't exist
    await fs.promises.mkdir(dirPath, { recursive: true });

    // Save the file to disk
    await fs.promises.writeFile(filepath, buffer);

    // Call the callback function with no error
    cb(null);
  } catch (err) {
    console.error("Error saving file:", err);
    // Call the callback function with the error
    cb(err);
  }
};

const cleanOrCreateDirectory = async (path, deleteStatus = true) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
    return true;
  }
  return true;
};

module.exports.cleanOrCreateDirectory = cleanOrCreateDirectory;

module.exports.getRandomPassword = (start, end) => {
  return Math.floor(start + Math.random() * end);
};

exports.getunAuthorisedUrl = function () {
  return [
    "/api/v1/admin/login",
    "/api/v1/admin/map/plots",
    "/api/v1/admin/map/villageLayers",
    "/api/v1/admin/map/lease_boundary_layer",
    "/api/v1/admin/map/map_fetch_popover",
    "/api/v1/admin/users/submit-admin",
    "/api/v1/admin/users/is-validate-product-key",
  ];
};

exports.convertToSlug = (str) => {
  const slug = str.toLowerCase().replace(/\s+/g, "_");
  return slug;
};

exports.saveToDocumentsTable = async () => {
  return true;
};

exports.publishMessageInRedisChannel = async (channel, notificationContent) => {
  return "";
};

exports.getNotiCountByUserId = async (userIds) => {
  try {
    return await AllNotifications.count({
      where: {
        tan_user_id: userIds,
      },
    });
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

function trimSlashes(str) {
  return str.replace(/^\/+|\/+$/g, "");
}

function generateUniqueId() {
  return uuidv4();
}

exports.saveDocuments = async function (basePath, documents = []) {
  try {
    // Ensure the base directory exists, create it if it doesn't
    if (!fs.existsSync(basePath)) {
      await fs.promises.mkdir(basePath, { recursive: true });
    }

    const savedDocuments = [];

    // Process each document
    for (const document of documents) {
      const { fileName, fileData } = document;

      // Validate document structure
      if (!fileName || !fileData) {
        throw new Error(
          "Invalid document format: missing fileName or fileData."
        );
      }

      // Construct the full file path
      const filePath = path.join(basePath, fileName);

      // Validate the file data type (must be a Buffer)
      if (!Buffer.isBuffer(fileData)) {
        throw new Error(
          `Invalid fileData for ${fileName}: fileData must be a Buffer.`
        );
      }

      try {
        // Write file data to the filesystem
        await fs.promises.writeFile(filePath, fileData);

        // Track the saved document's metadata
        savedDocuments.push({ fileName, filePath });
      } catch (writeError) {
        // Handle specific file write errors
        console.error(`Error writing file ${fileName}:`, writeError.message);
        throw new Error(
          `Failed to save file ${fileName}: ${writeError.message}`
        );
      }
    }

    return savedDocuments;
  } catch (error) {
    // Log and throw a higher-level error if something fails
    console.error("Error in saveDocuments:", error.message);
    throw new Error(`Error saving documents: ${error.message}`);
  }
};

// Handle document uploads
exports.handleDocumentUploads = async (
  files,
  tableId,
  user_id,
  doc_title = [],
  folderName
) => {
  try {
    const proposalFolderPath = path.join(`uploads/${folderName}`, tableId);

    // Save documents using reusable saveDocuments utility
    const documents = files.map((file) => ({
      fileName: `${Date.now()}-${file.originalname}`,
      fileData: file.buffer,
      fileContentType: file.mimetype,
    }));

    const savedDocuments = await saveDocuments(proposalFolderPath, documents);

    // Save metadata to the database
    const documentMetadata = documents.map((doc, index) => ({
      final_doc_id: tableId,
      doc_title: doc_title?.[index],
      doc_type: doc?.fileContentType,
      file_path: path.join(`${folderName}`, tableId, doc?.fileName),
      file_name: doc?.fileName,
      doc_ext: path.extname(doc?.fileName),
      created_by: user_id,
    }));

    const uploadedData = await DocumentsModel.bulkCreate(
      documentMetadata
    );

    return uploadedData;
  } catch (error) {
    throw new Error(`Error uploading documents: ${error.message}`);
  }
};

module.exports.generateUniqueId = generateUniqueId;
