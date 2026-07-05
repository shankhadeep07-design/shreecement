var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const StateModel = require("../../../models/masters/state.model");
const { Op } = require("sequelize");

module.exports.fetch_states_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_state`;

    // var where = `t_state.tsl_is_active = 'true' `;
    var where;
    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.createState = async function (req, res, next) {
  try {
            const userId = req?.user?.[0]?.id || 0;

    const id = req?.params?.id;
    const { tsl_state_name } = req?.body;

    if (!tsl_state_name) {
      return next(CustomErrorHandler.validationError("Invalid request body."));
    }

    if (id) {
      const existingState = await StateModel.findOne({
        where: { tsl_state_id: id },
      });

      if (!existingState) {
        return next(CustomErrorHandler.validationError("No State found."));
      }

      // Check for duplicate state name
      const duplicateState = await StateModel.findOne({
        where: {
          tsl_state_name: {
            [Op.iLike]: tsl_state_name, // Case-insensitive check
          },
        },
      });

      if (duplicateState && duplicateState.tsl_state_id !== id) {
        return res.status(409).json({
          status: false,
          message: "State name already exists",
        });
      }

      await StateModel.update(
        { tsl_state_name, tsl_updated_by: userId,  
          tsl_updated_at: new Date(), },
        { where: { tsl_state_id: id } },
      );
      return res.json({
        status: 1,
        message: "State updated successfully.",
      });
    } else {
      // Check for duplicate entry
      const existingState = await StateModel.findOne({
        where: {
          tsl_state_name: {
            [Op.iLike]: tsl_state_name,
          },
        },
      });
      if (existingState) {
        return res.status(409).json({
          status: false,
          message: "State name already exists",
        });
      }

      const newState = await StateModel.create({ tsl_state_name, tsl_created_by: userId,
        tsl_updated_by: userId, });
      return res.json({
        status: 1,
        message: "State created successfully.",
        data: newState,
      });
    }
  } catch (err) {
    return next(CustomErrorHandler.databaseError(err.message));
  }
};

module.exports.getAllStateList = async (req, res, next) => {
  try {
    // Fetch states
    const states = await StateModel.findAll({
      order: [["tsl_state_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = states.map((state) => ({
      value: state?.tsl_state_id,
      label: state?.tsl_state_name,
    }));

    return res.status(200).json({
      status: true,
      message: "State fetched successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};

module.exports.getExcelExportStateList = async (req, res, next) => {
  try {
    var sql = `select * from t_state`;
    // var where = `t_state.tsl_is_active = 'true' `;
        var where;


    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};
