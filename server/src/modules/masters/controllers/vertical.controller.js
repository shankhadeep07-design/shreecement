var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const VerticalModel = require("../../../models/masters/vertical.model");
const { generateSlug } = require("../../../utils/slugify");

module.exports.fetch_vertical_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_vertical`;

    var where = `t_vertical.tvm_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createVertical = async function (req, res, next) {
  try {
    let userId = req?.body?.payload?.id;
    const id = req?.params?.id;
    const { tvm_vertical_name } = req?.body;

    if (!tvm_vertical_name || !userId) {
      return next(CustomErrorHandler.validationError("Invalid request body."));
    }

    if (id) {
      const existingVertical = await VerticalModel.findOne({
        where: { tvm_id: id },
      });

      if (!existingVertical) {
        return next(CustomErrorHandler.validationError("No Vertical found."));
      }

      // Check for duplicate vertical name
      const duplicateVertical = await VerticalModel.findOne({
        where: {
          tvm_vertical_name: {
            [Op.iLike]: tvm_vertical_name,
          },
        },
      });

      if (duplicateVertical && duplicateVertical.tvm_id !== id) {
        return res.status(409).json({
          status: false,
          message: "Vertical name already exists",
        });
      }

      await VerticalModel.update(
        {
          tvm_vertical_name,
          tvm_updated_by: userId,
          tvm_vertical_slug:generateSlug(tvm_vertical_name),
        },
        { where: { tvm_id: id } }
      );

      return res.json({
        status: 1,
        message: "Vertical updated successfully.",
      });

    } else {
      // Check for duplicate entry
      const existingVertical = await VerticalModel.findOne({
        where: {
          tvm_vertical_name: {
            [Op.iLike]: tvm_vertical_name,
          },
        },
      });

      if (existingVertical) {
        return res.status(409).json({
          status: false,
          message: "Vertical name already exists",
        });
      }

      const newVertical = await VerticalModel.create({
        tvm_vertical_name,
        tvm_created_by: userId,
        tvm_updated_by: userId,
        tvm_vertical_slug:generateSlug(tvm_vertical_name),
        // tvm_created_at and tvm_updated_at are handled by DB defaults
      });

      return res.json({
        status: 1,
        message: "Vertical created successfully.",
        data: newVertical,
      });
    }
  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};


module.exports.getAllVerticalList = async (req, res, next) => {
  try {

    // Fetch verticals
    const verticals = await VerticalModel.findAll({
      order: [["tvm_vertical_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = verticals.map((vertical) => ({
      value: vertical?.tvm_id,
      label: vertical?.tvm_vertical_name,
      slug: vertical?.tvm_vertical_slug,
    }));

   
    

    return res.status(200).json({
      status: true,
      message: "Vertical fetched successfully",
      data: response,
    });
  } catch (err) {    
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportVerticalList = async (req, res, next) => {
  try {
    var sql = `select * from t_vertical`;
    var where = `t_vertical.tvm_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
     next(CustomErrorHandler.internalServerError(err.message));
  }
};
