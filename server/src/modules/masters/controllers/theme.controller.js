var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const StateModel = require("../../../models/masters/state.model");

const ProjectTypeModel = require("../../../models/masters/project_type.model");


const ThemeManagement = require("../../../models/master_management/theme.model");
const { Op } = require("sequelize");
const { log } = require("handlebars/runtime");



module.exports.fetch_themes_datatable = async (req, res, next) => {
  try {


    const sql = `
      SELECT
        t.tthm_theme_id,
        t.tthm_theme_name,
        t.tthm_is_active,
        t.tthm_created_at,
        t.tthm_updated_at
      FROM t_theme_master t
    `;

    // optional filter
    // let where = `t.tthm_is_active = true`;
    let where = null;

    const records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};


module.exports.createOrUpdateTheme = async function (req, res, next) {
  try {
    const id = req?.params?.id;
    const userId = req?.user?.[0]?.id || 0;

    const { tthm_theme_name } = req.body;

    // 🔴 Validation
    if (!tthm_theme_name || !tthm_theme_name.trim()) {
      return next(
        CustomErrorHandler.validationError("Theme name is required.")
      );
    }

    const cleanName = tthm_theme_name.trim();

    /* ===========================
       UPDATE
    ============================ */
    if (id) {
      const existingTheme = await ThemeManagement.findOne({
        where: { tthm_theme_id: id },
      });

      if (!existingTheme) {
        return next(
          CustomErrorHandler.validationError("No Theme found.")
        );
      }

      // 🔁 Duplicate check (ignore same id)
      const duplicate = await ThemeManagement.findOne({
        where: {
          tthm_theme_name: {
            [Op.iLike]: cleanName,
          },
          tthm_theme_id: {
            [Op.ne]: id,
          },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          status: 0,
          message: "Theme name already exists.",
        });
      }

      await ThemeManagement.update(
        {
          tthm_theme_name: cleanName,
          tthm_updated_by: userId,
          tthm_updated_at: new Date(),
        },
        { where: { tthm_theme_id: id } }
      );

      return res.json({
        status: 1,
        message: "Theme updated successfully.",
      });
    }

    /* ===========================
       CREATE
    ============================ */

    const duplicate = await ThemeManagement.findOne({
      where: {
        tthm_theme_name: {
          [Op.iLike]: cleanName,
        },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        status: 0,
        message: "Theme name already exists.",
      });
    }

    const newTheme = await ThemeManagement.create({
      tthm_theme_name: cleanName,
      tthm_created_by: userId,
      tthm_updated_by: userId,
    });

    return res.json({
      status: 1,
      message: "Theme created successfully.",
      data: newTheme,
    });

  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};


module.exports.getExcelExportThemeList = async (req, res, next) => {
  try {
    var sql = `select * from t_theme_master`;
    // var where = `t_sub_project_type.tsprj_is_active = 'true' `;
      var where = null;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getAllThemeList = async (req, res, next) => {
  try {


    const themes = await ThemeManagement.findAll({
      order: [["tthm_theme_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = themes.map((ct) => ({
      value: ct?.tthm_theme_id,
      label: ct?.tthm_theme_name,
    }));




    return res.status(200).json({
      status: true,
      message: "Themes fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};





