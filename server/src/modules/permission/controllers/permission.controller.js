var { validationResult } = require("express-validator");
const { getPermissionService } = require('../services/permission.service');
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");



module.exports.fetch_parent_module_permission = async (req, res) => {
  try {
    const validation_errors = validationResult(req);
    console.log('----------------------------------------',req.body);
    
    if (!validation_errors.isEmpty()) {
      return next(
        CustomErrorHandler.validationError(validation_errors.array()[0]["msg"])
      );
    }

    const { role_id } = req.body.payload;
    const { module_slug } = req.body;

    if (!role_id || !module_slug) {
      return next(CustomErrorHandler.validationError("role_id and module_slug are required"));
    }

    const query = `
      SELECT tmd_slug_name
      FROM public.t_permissions as permissions
      LEFT JOIN t_modules ON tmd_id = permissions.tpr_module_id
      WHERE tpr_role_id = :role_id;
    `;

    const entries = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { role_id, module_slug }, // Use replacements to prevent SQL injection
    });

    if (!entries.length) {
      return res.status(200).json({
        status: 0,
        message: "No permissions found for the given role and module",
        data: [],
      });
    }

    const slugNames = entries.map(entry => entry.tmd_slug_name);

    
    return res.status(200).json({
      status: 1,
      message: "Permission fetched successfully",
      data: slugNames,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.fetch_my_module_permission = async function (req, res, next) {
  try {
    const validation_errors = validationResult(req);

    if (!validation_errors.isEmpty()) {
      return next(
        CustomErrorHandler.validationError(validation_errors.array()[0]["msg"])
      );
    }

    const { role_id } = req.body.payload;
    const { module_slug } = req.body;

    if (!role_id || !module_slug) {
      return next(CustomErrorHandler.validationError("role_id and module_slug are required"));
    }

    const query = `
      SELECT permissions.tpr_actions, tmd_slug_name
      FROM public.t_permissions as permissions
      LEFT JOIN t_modules ON tmd_id = permissions.tpr_module_id
      WHERE tpr_role_id = :role_id AND tmd_slug_name = :module_slug;
    `;

    const entries = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { role_id, module_slug }, // Use replacements to prevent SQL injection
    });

    if (!entries.length || !entries[0].tpr_actions) {
      return res.status(200).json({
        status: 0,
        message: "No permissions found for the given role and module",
        data: [],
      });
    }

    const actions = entries[0].tpr_actions.split(','); // Ensure tpr_actions exists
    

    return res.status(200).json({
      status: 1,
      message: "Permission fetched successfully",
      data: actions,
    });

  } catch (err) {
    console.error('Error in getMyModulePermissions:', err);
    next(CustomErrorHandler.databaseError(err.message));
  }
};

