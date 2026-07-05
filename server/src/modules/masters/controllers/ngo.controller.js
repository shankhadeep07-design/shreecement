var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const CategoryModel = require("../../../models/masters/category.model");
const EducationModel = require("../../../models/masters/education.model");
const SdgMasterModel = require("../../../models/priority_alignment/sdg.model");
const NgoModel = require("../../../models/ngo/ngo.model");

module.exports.getAllNgoList = async (req, res, next) => {
  try {


    const categorys = await NgoModel.findAll({
      order: [["tngo_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = categorys.map((ct) => ({
      value: ct?.tngo_id,
      label: ct?.tngo_name,
    }));




    return res.status(200).json({
      status: true,
      message: "NGO fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};