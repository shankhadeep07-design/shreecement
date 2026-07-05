var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");


module.exports.theme_master_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_theme_master`;

    var where = `t_theme_master.tthm_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};