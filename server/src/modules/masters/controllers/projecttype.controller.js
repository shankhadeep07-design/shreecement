var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const StateModel = require("../../../models/masters/state.model");

const ProjectTypeModel = require("../../../models/masters/project_type.model");

const { Op } = require("sequelize");

module.exports.fetch_project_types_datatable = async (req, res, next) => {
  try {
    var sql = `SELECT * FROM t_project_type`;

    // var where = `t_project_type.tprj_is_active = 'true' `;
    var where ;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};





module.exports.createProjectType = async function (req, res, next) {
  try {
    const id = req?.params?.id;
    const { tprj_project_type_name, tprj_desc } = req?.body;


    const userId = req?.user?.[0]?.id || 0;


    if (!tprj_project_type_name) {
      return next(
        CustomErrorHandler.validationError("Project type name is required.")
      );
    }

    if (id) {
      const existingProjectType = await ProjectTypeModel.findOne({
        where: { tprj_id: id },
      });

      if (!existingProjectType) {
        return next(
          CustomErrorHandler.validationError("No Project Type found.")
        );
      }

      const duplicateProjectType = await ProjectTypeModel.findOne({
        where: {
          tprj_project_type_name: {
            [Op.iLike]: tprj_project_type_name,
          },
        },
      });

      if (
        duplicateProjectType &&
        duplicateProjectType.tprj_id !== id
      ) {
        return res.status(409).json({
          status: 0,
          message: "Project type name already exists",
        });
      }

      await ProjectTypeModel.update(
        {
          tprj_project_type_name,
          tprj_desc,
          tprj_updated_at: new Date(),
            tprj_updated_by: userId

        },
        { where: { tprj_id: id } }
      );

      return res.json({
        status: 1,
        message: "Project type updated successfully.",
      });

    } else {
      const existingProjectType = await ProjectTypeModel.findOne({
        where: {
          tprj_project_type_name: {
            [Op.iLike]: tprj_project_type_name,
          },
        },
      });

      if (existingProjectType) {
        return res.status(409).json({
          status: 0,
          message: "Project type name already exists",
        });
      }

      const newProjectType = await ProjectTypeModel.create({
        tprj_project_type_name,
        tprj_desc,
        tprj_created_by: userId,
  tprj_updated_by: userId
      });

      return res.json({
        status: 1,
        message: "Project type created successfully.",
        data: newProjectType,
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

module.exports.getExcelExportProjectTypeList = async (req, res, next) => {
  try {
    var sql = `select * from t_project_type`;
    var where = `t_project_type.tprj_is_active = 'true' `;

    var records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    console.log(err);
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.getAllProjectTypeList = async (req, res, next) => {
  try {
    // Fetch states
    const states = await ProjectTypeModel.findAll({
    });

    // Format response as label-value pairs
    const response = states.map((state) => ({
      value: state?.tprj_id,
      label: state?.tprj_project_type_name,
    }));



    console.log('all project type'+response);
    return res.status(200).json({
      status: true,
      message: "Project Type Fetch successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



