var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");

// const SdgMasterModel = require("../../../models/priority_alignment/sdg.model");

const NationalIndicatorModel = require("../../../models/priority_alignment/national_indicator.model");


const { Op } = require("sequelize");
const { saveUpdateAndPrepareDocumentMetadata } = require("../../../helpers/document.helper");
const DocumentModel = require("../../../models/documents/documents.model");
const fs = require("fs/promises");


module.exports.nationalIndicatorMasterDatatable = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        tnif.tnif_id,
        tnif.tnif_sdg_id,
        sdg.tsdg_name AS sdg_name,
        tnif.tnif_target,
        tnif.tnif_indicator,
        tnif.tnif_is_active,
        tnif.tnif_created_at,
        tnif.tnif_updated_at
      FROM t_national_indicator_master tnif
      LEFT JOIN t_sdg_master sdg
        ON sdg.tsdg_id = tnif.tnif_sdg_id
    `;

    // const where = `
    //   tnif.tnif_is_active = true
    //   AND (sdg.tsdg_is_active = true OR sdg.tsdg_id IS NULL)
    // `;
     var where;

    const records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};





module.exports.createNationalIndicatorMaster = async function (req, res, next) {
  let transaction;

  try {
    const id = req?.params?.id;

    // ✅ Map frontend keys → DB keys
    const tnif_target = req.body.tnif_target || req.body.target;
    const tnif_indicator = req.body.tnif_indicator || req.body.indicators;
    const tnif_sdg_id = req.body.tnif_sdg_id;

    // ✅ Validation
    if (!tnif_target || !tnif_indicator || !tnif_sdg_id) {
      return next(
        CustomErrorHandler.validationError("Invalid request body.")
      );
    }

    if (id) {
      // ================= UPDATE =================
      const existingIndicator = await NationalIndicatorModel.findOne({
        where: { tnif_id: id },
      });

      if (!existingIndicator) {
        return next(
          CustomErrorHandler.validationError(
            "No National Indicator found."
          )
        );
      }

      transaction = await sequelize.transaction();

      await NationalIndicatorModel.update(
        {
          tnif_sdg_id,
          tnif_target,
          tnif_indicator,
          tnif_updated_at: sequelize.literal("now()"),
        },
        {
          where: { tnif_id: id },
          transaction,
        }
      );

      await transaction.commit();

      return res.json({
        status: 1,
        message: "National Indicator updated successfully.",
      });

    } else {
      // ================= CREATE =================
      transaction = await sequelize.transaction();

      const newIndicator = await NationalIndicatorModel.create(
        {
          tnif_sdg_id,
          tnif_target,
          tnif_indicator,
        },
        { transaction }
      );

      await transaction.commit();

      return res.json({
        status: 1,
        message: "National Indicator created successfully.",
        data: newIndicator,
      });
    }

  } catch (err) {
    console.error(err);

    if (transaction) {
      await transaction.rollback();
    }

    return next(
      CustomErrorHandler.internalServerError(err.message)
    );
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

module.exports.getExcelExportNationalIndicatorMasterList = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        tnif.tnif_id,
        sdg.tsdg_name AS sdg_name,
        tnif.tnif_target,
        tnif.tnif_indicator,
        tnif.tnif_is_active,
        tnif.tnif_created_at,
        tnif.tnif_updated_at
      FROM t_national_indicator_master tnif
      LEFT JOIN t_sdg_master sdg
        ON sdg.tsdg_id = tnif.tnif_sdg_id
    `;

    const where = `
      tnif.tnif_is_active = true
      AND (sdg.tsdg_is_active = true OR sdg.tsdg_id IS NULL)
    `;

    const records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.error(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.getNationalIndicatorBySdg = async (req, res, next) => {
  try {
    const { tnif_sdg_id } = req?.params;

    // Validate schedule seven ID
    if (!tnif_sdg_id) {
      return res.status(400).json({
        status: false,
        message: "Sdg ID is required",
      });
    }

    // Fetch focus areas by schedule seven ID
    const nationalIndicator = await NationalIndicatorModel.findAll({
      where: { tnif_sdg_id: tnif_sdg_id },
      attributes: ["tnif_id", "tnif_indicator"],
      order: [["tnif_indicator", "ASC"]],
    });

    // Format response as label-value pairs
    const response = nationalIndicator.map((nindicator) => ({
      value: nindicator?.tnif_id,
      label: nindicator?.tnif_indicator,
    }));

    return res.status(200).json({
      status: true,
      message: "National Indicator fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.databaseError(err.message));
  }
};
