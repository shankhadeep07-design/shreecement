var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const { Op } = require("sequelize");
const CategoryModel = require("../../../models/masters/category.model");
const EducationModel = require("../../../models/masters/education.model");

module.exports.getAllEducationList = async (req, res, next) => {
  try {


    const categorys = await EducationModel.findAll({
      order: [["tedu_education_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = categorys.map((ct) => ({
      value: ct?.tedu_id,
      label: ct?.tedu_education_name,
    }));




    return res.status(200).json({
      status: true,
      message: "Education levels fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};