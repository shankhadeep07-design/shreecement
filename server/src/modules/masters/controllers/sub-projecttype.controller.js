var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
const StateModel = require("../../../models/masters/state.model");

const ProjectTypeModel = require("../../../models/masters/project_type.model");


const SubProjectTypeModel = require("../../../models/masters/sub_project_type.model");

const { Op } = require("sequelize");

module.exports.fetch_sub_project_types_datatable = async (req, res, next) => {
  try {
    const sql = `
      SELECT
        s.tsprj_id,
        s.tsprj_project_type_id,
        p.tprj_project_type_name,
        s.tsprj_sub_project_type_name,
        s.tsprj_sub_desc,
          s.tsprj_is_active
      FROM t_sub_project_type s
      LEFT JOIN t_project_type p
        ON p.tprj_id = s.tsprj_project_type_id
    `;

    // var where = `s.tsprj_is_active = true`;
    var where;

    const records = await Datatables.build(req, sql, where);

    res.json(records);
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};







module.exports.createSubProjectType = async function (req, res, next) {
  try {
    const id = req?.params?.id;
    const userId = req?.user?.[0]?.id || 0;

    const {
      tsprj_project_type_id,
      tsprj_sub_project_type_name,
      tsprj_sub_desc,
    } = req.body;

    // 🔴 Validation
    if (!tsprj_sub_project_type_name) {
      return next(
        CustomErrorHandler.validationError(
          "Sub project type name is required."
        )
      );
    }

    if (!tsprj_project_type_id) {
      return next(
        CustomErrorHandler.validationError(
          "Project type is required."
        )
      );
    }

    /* ===========================
       UPDATE
    ============================ */
    if (id) {
      const existingSubProject = await SubProjectTypeModel.findOne({
        where: { tsprj_id: id },
      });

      if (!existingSubProject) {
        return next(
          CustomErrorHandler.validationError(
            "No Sub Project Type found."
          )
        );
      }

      // 🔁 Duplicate check (same project type)
      const duplicate = await SubProjectTypeModel.findOne({
        where: {
          tsprj_project_type_id,
          tsprj_sub_project_type_name: {
            [Op.iLike]: tsprj_sub_project_type_name,
          },
        },
      });

      if (duplicate && duplicate.tsprj_id !== id) {
        return res.status(409).json({
          status: 0,
          message: "Sub project type name already exists.",
        });
      }

      await SubProjectTypeModel.update(
        {
          tsprj_project_type_id,
          tsprj_sub_project_type_name,
          tsprj_sub_desc: tsprj_sub_desc,
          tsprj_updated_at: new Date(),
            tsprj_updated_by: userId


        },
        { where: { tsprj_id: id } }
      );

      return res.json({
        status: 1,
        message: "Sub project type updated successfully.",
      });
    }

    /* ===========================
       CREATE
    ============================ */
    const existingSubProject = await SubProjectTypeModel.findOne({
      where: {
        tsprj_project_type_id,
        tsprj_sub_project_type_name: {
          [Op.iLike]: tsprj_sub_project_type_name,
        },
      },
    });

    if (existingSubProject) {
      return res.status(409).json({
        status: 0,
        message: "Sub project type name already exists.",
      });
    }

    const newSubProjectType = await SubProjectTypeModel.create({
      tsprj_project_type_id,
      tsprj_sub_project_type_name,
      tsprj_sub_desc: tsprj_sub_desc,

       tsprj_created_by: userId,
  tsprj_updated_by: userId
    });

    return res.json({
      status: 1,
      message: "Sub project type created successfully.",
      data: newSubProjectType,
    });

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

module.exports.getExcelExportSubProjectTypeList = async (req, res, next) => {
  try {
    var sql = `select * from t_sub_project_type`;
    var where = `t_sub_project_type.tsprj_is_active = 'true' `;

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



    console.log('all project type' + response);
    return res.status(200).json({
      status: true,
      message: "Project Type Fetch successfully",
      data: response,
    });
  } catch (err) {
    next(CustomErrorHandler.internalServerError(err.message));
  }
};



module.exports.getAllSubprojectTypeListByprojectId = async (req, res, next) => {
  try {
    let { project_id } = req.params;

    // ✅ Trim spaces if project_id exists
    if (project_id) {
      project_id = project_id.trim();
    }

    const whereCondition = {
      tsprj_is_active: true,
    };

    // Filter by project type if provided
    if (project_id) {
      whereCondition.tsprj_project_type_id = project_id;
    }

    const subProjectTypes = await SubProjectTypeModel.findAll({
      where: whereCondition,
      attributes: [
        "tsprj_id",
        "tsprj_sub_project_type_name"
      ],
      order: [["tsprj_sub_project_type_name", "ASC"]],
    });

    // Format response as label-value pairs
    const response = subProjectTypes.map((item) => ({
      value: item?.tsprj_id,
      label: item?.tsprj_sub_project_type_name,
    }));

    return res.status(200).json({
      status: true,
      message: "Sub project types fetched successfully",
      data: response,
    });

  } catch (err) {
    next(err);
  }
};





