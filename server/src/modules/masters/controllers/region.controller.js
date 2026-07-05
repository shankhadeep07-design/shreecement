var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const RegionModel = require("../../../models/masters/region.model");

module.exports.fetch_region_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_region`;

    var where = `t_region.treg_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.createRegion = async function (req, res, next) {
  try {
    const id = req?.params?.id;
    const { treg_region_name } = req?.body;

    if (!treg_region_name) {
      return next(CustomErrorHandler.validationError("Invalid request body."));
    }


    if (id) {
      const existingRegion = await RegionModel.findOne({ where: { treg_id: id } });

      if (!existingRegion) {
        return next(CustomErrorHandler.validationError("No Region found."));
      }

      // Check for duplicate state name
      const duplicateRegion = await RegionModel.findOne({
        where: {
          treg_region_name: {
            [Op.iLike]: treg_region_name, // Case-insensitive check
          },
        },
      });

      if (duplicateRegion && duplicateRegion.treg_id !== id) {
        return res.status(409).json({
          status: false,
          message: "Region name already exists",
        });
      }

      await RegionModel.update({ treg_region_name }, { where: { treg_id: id } });
      return res.json({
        status: 1,
        message: "Region updated successfully.",
      });

    } else {

      // Check for duplicate entry
      const existingRegion = await RegionModel.findOne({
        where: {
          treg_region_name: {
            [Op.iLike]: treg_region_name,
          },
        },
      });
      if (existingRegion) {
        return res.status(409).json({
          status: false,
          message: "Region name already exists",
        });
      }

      const newRegion = await RegionModel.create({ treg_region_name });
      return res.json({
        status: 1,
        message: "Region created successfully.",
        data: newRegion,
      });
    }
  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getAllRegionList = async (req, res, next) => {
  try {

    // Fetch states
    const regions = await RegionModel.findAll({
      order: [["treg_region_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = regions.map((state) => ({
      value: state?.treg_id,
      label: state?.treg_region_name,
    }));

   
    

    return res.status(200).json({
      status: true,
      message: "Region fetched successfully",
      data: response,
    });
  } catch (err) {    
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportRegionList = async (req, res, next) => {
  try {
    var sql = `select * from t_region`;
    var where = `t_region.treg_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
     next(CustomErrorHandler.internalServerError(err.message));
  }
};



