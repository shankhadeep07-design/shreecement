var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");


module.exports.projects_implementation_datatable = async (req, res, next) => {
  try {
    var sql = `
          select  * from t_project_implementation  `;

    // let where = ` 1=1 `;

    var records = await Datatables.build(req, sql);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};