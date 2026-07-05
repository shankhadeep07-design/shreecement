var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const SdgMasterModel = require("../../../models/priority_alignment/sdg.model");
const { Op } = require("sequelize");
const {
  saveUpdateAndPrepareDocumentMetadata,
} = require("../../../helpers/document.helper");
const DocumentModel = require("../../../models/documents/documents.model");
const fs = require("fs/promises");
module.exports.sdgsMasterDatatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_sdg_master 
    LEFT JOIN t_documents ON t_documents.final_doc_id = t_sdg_master.tsdg_id
    `;

    // var where = `t_sdg_master.tsdg_is_active = 'true' `;
    var where;
    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

// module.exports.createSdgMaster = async function (req, res, next) {
//   try {
//     const id = req?.params?.id;
//     const { tsdg_name } = req?.body;
//     const files = req?.files;

//     let transaction;
//     let uploadedFilePaths = [];

//     // console.log("file-------------- ", file);
//     // const tsdg_icon = req?.files?.find(file => file.fieldname === 'tsdg_icon');
//     // console.log("Uploaded icon: ", tsdg_icon);

//     if (!tsdg_name) {
//       return next(CustomErrorHandler.validationError("Invalid request body."));
//     }

//     if (id) {
//       const existingSdg = await SdgMasterModel.findOne({ where: { tsdg_id: id } });

//       if (!existingSdg) {
//         return next(CustomErrorHandler.validationError("No Sdg Master found."));
//       }

//       // Check for duplicate sdg name
//       const duplicateSdg = await SdgMasterModel.findOne({
//         where: {
//           tsdg_name: {
//             [Op.iLike]: tsdg_name, // Case-insensitive check
//           },
//         },
//       });

//       if (duplicateSdg && duplicateSdg.tsdg_id !== id) {
//         return res.status(409).json({
//           status: false,
//           message: "Sdg Master name already exists",
//         });
//       }

//       await SdgMasterModel.update({ tsdg_name }, { where: { tsdg_id: id } });

//        if (files?.length > 0) {
//         const grouped = files.reduce((acc, file) => {
//           (acc[file.fieldname] ||= []).push(file);
//           return acc;
//         }, {});

//         const singleFile = ["tsdg_icon"];

//         for (const [key, fileGroup] of Object.entries(grouped)) {
//           let handlerFn;

//           if (singleFile.includes(key)) {
//             handlerFn = saveUpdateAndPrepareDocumentMetadata;
//           } else {
//             continue; // Skip keys not in the defined sets
//           }

//           const { metadata, filePaths } = await handlerFn(
//             fileGroup,
//             newSdg.tsdg_id,
//             "uploads/sdg-master",
//             null,
//             transaction
//           );

//           uploadedFilePaths = filePaths;

//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         }
//       }
//       await transaction.commit();

//       return res.json({
//         status: 1,
//         message: "Sdg Master updated successfully.",
//       });

//     } else {

//       // Check for duplicate entry
//       const existingSdg = await SdgMasterModel.findOne({
//         where: {
//           tsdg_name: {
//             [Op.iLike]: tsdg_name,
//           },
//         },
//         transaction,
//       });
//       if (existingSdg) {
//         return res.status(409).json({
//           status: false,
//           message: "Sdg Master name already exists",
//         });
//       }
//       transaction = await sequelize.transaction();
//       const newSdg = await SdgMasterModel.create({ tsdg_name }, { transaction });

//       if (files?.length > 0) {
//         const grouped = files.reduce((acc, file) => {
//           (acc[file.fieldname] ||= []).push(file);
//           return acc;
//         }, {});

//         const singleFile = ["tsdg_icon"];

//         for (const [key, fileGroup] of Object.entries(grouped)) {
//           let handlerFn;

//           if (singleFile.includes(key)) {
//             handlerFn = saveUpdateAndPrepareDocumentMetadata;
//           } else {
//             continue; // Skip keys not in the defined sets
//           }

//           const { metadata, filePaths } = await handlerFn(
//             fileGroup,
//             newSdg.tsdg_id,
//             "uploads/sdg-master",
//             null,
//             transaction
//           );

//           uploadedFilePaths = filePaths;

//           if (metadata.length) {
//             await DocumentModel.bulkCreate(metadata, { transaction });
//           }
//         }
//       }
//       await transaction.commit();

//       return res.json({
//         status: 1,
//         message: "Sdg Master created successfully.",
//         data: newSdg,
//       });

//     }
//   } catch (err) {
//     console.log("err-------- ",err);

//     return next(CustomErrorHandler.databaseError(err.message));
//   }
// };

module.exports.createSdgMaster = async function (req, res, next) {
  let transaction;
  let uploadedFilePaths = [];

  try {
    const id = req?.params?.id;
    const { tsdg_name, tsdg_desc } = req.body;
    const files = req?.files;
            const userId = req?.user?.[0]?.id || 0;

    if (!tsdg_name) {
      return next(CustomErrorHandler.validationError("Invalid request body."));
    }

    const singleFileFields = ["tsdg_icon"];

    if (id) {
      // Update SDG
      const existingSdg = await SdgMasterModel.findOne({
        where: { tsdg_id: id },
      });
      if (!existingSdg) {
        return next(CustomErrorHandler.validationError("No Sdg Master found."));
      }

      const duplicateSdg = await SdgMasterModel.findOne({
        where: {
          tsdg_name: { [Op.iLike]: tsdg_name },
          tsdg_id: { [Op.ne]: id },
        },
      });

      if (duplicateSdg) {
        return res.status(409).json({
          status: false,
          message: "Sdg Master name already exists",
        });
      }

      transaction = await sequelize.transaction();
      await SdgMasterModel.update(
        { tsdg_name, tsdg_desc,tsdg_updated_by:userId,tsdg_updated_at:new Date() },
        { where: { tsdg_id: id }, transaction },
      );

      if (files?.length > 0) {
        const grouped = files.reduce((acc, file) => {
          (acc[file.fieldname] ||= []).push(file);
          return acc;
        }, {});

        for (const [key, fileGroup] of Object.entries(grouped)) {
          if (!singleFileFields.includes(key)) continue;

          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              id,
              "uploads/sdg-master",
              null,
              transaction,
            );

          uploadedFilePaths.push(...filePaths);

          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        }
      }

      await transaction.commit();

      return res.json({
        status: 1,
        message: "Sdg Master updated successfully.",
      });
    } else {
      // Create SDG
      transaction = await sequelize.transaction();

      const existingSdg = await SdgMasterModel.findOne({
        where: {
          tsdg_name: { [Op.iLike]: tsdg_name },
        },
        transaction,
      });

      if (existingSdg) {
        await transaction.rollback();
        return res.status(409).json({
          status: false,
          message: "Sdg Master name already exists",
        });
      }

      const newSdg = await SdgMasterModel.create(
        { tsdg_name, tsdg_desc,tsdg_created_by:userId,tsdg_updated_by:userId },
        { transaction },
      );

      if (files?.length > 0) {
        const grouped = files.reduce((acc, file) => {
          (acc[file.fieldname] ||= []).push(file);
          return acc;
        }, {});

        for (const [key, fileGroup] of Object.entries(grouped)) {
          if (!singleFileFields.includes(key)) continue;

          const { metadata, filePaths } =
            await saveUpdateAndPrepareDocumentMetadata(
              fileGroup,
              newSdg.tsdg_id,
              "uploads/sdg-master",
              null,
              transaction,
            );

          uploadedFilePaths.push(...filePaths);

          if (metadata.length) {
            await DocumentModel.bulkCreate(metadata, { transaction });
          }
        }
      }

      await transaction.commit();

      return res.json({
        status: 1,
        message: "Sdg Master created successfully.",
        data: newSdg,
      });
    }
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }

    // Delete uploaded files on failure
    await Promise.all(
      uploadedFilePaths.map(async (filePath) => {
        await fs
          .unlink(filePath)
          .catch((err) =>
            console.error(`Error deleting file: ${filePath}`, err),
          );
      }),
    );

    return next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getAllSdgMasterList = async (req, res, next) => {
  try {
    // Fetch Sdg
    const sdgData = await SdgMasterModel.findAll({
      order: [["tsdg_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = sdgData.map((sdg) => ({
      value: sdg?.tsdg_id,
      label: sdg?.tsdg_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Sdg fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportSdgMasterList = async (req, res, next) => {
  try {
    var sql = `select * from t_sdg_master`;
    // var where = `t_sdg_master.tsdg_is_active = 'true' `;
    var where;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
