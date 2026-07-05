var { validationResult } = require("express-validator");
const CustomErrorHandler = require("../../../service/CustomErrorHandler");
const { sequelize } = require("../../../config/db");
const { QueryTypes } = require("sequelize");
const Datatables = require("../../../service/DatatableService");
var { validationResult } = require("express-validator");
const RolesModel = require("../../../models/role/roles.model");
const { Permission } = require("../../../models/permission/permission.model");
const { convertToSlug, isEmpty } = require("../../../helpers/common.helper");
const { Op } = require("sequelize");

module.exports.getRoles = async (req, res, next) => {
  try {
    const query = `
        SELECT t_roles.*, JSON_AGG(t_permissions.*) as permissions FROM t_roles
        LEFT JOIN t_permissions ON t_roles.trl_role_id = t_permissions.tpr_role_id 
        WHERE trl_deleted_at is null
        GROUP BY trl_role_id order by trl_role_name;
      `;

    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      status: 1,
      message: "Role fetched successfully",
      data: data,
    });
  } catch (error) {
    console.log(error);
    next(CustomErrorHandler.databaseError(error.message));
  }
};

module.exports.getAllRoles = async (req, res, next) => {
  try {
    const query = `
        SELECT * FROM t_roles;
      `;

    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      status: 1,
      message: "Roles fetched successfully",
      data: data,
    });
  } catch (error) {
    console.log(error);
    next(CustomErrorHandler.databaseError(error.message));
  }
};

module.exports.getRolesForSingleId = async (req, res, next) => {
  const { id } = req.params;

  try {
    const roleList = await RolesModel.findAll({
      where: {
        trl_role_id: id,
      },
      attributes: [
        "trl_role_name",
        "trl_role_id",
        "trl_tmd_module_id", // Keep this attribute to split later
        "trl_role_slug",
        "trl_created_by",
        "trl_updated_by",
      ],
    });

    // Split comma-separated ids into arrays for each role
    const rolesWithModuleIdsArray = roleList.map((role) => ({
      ...role.dataValues,
      trl_tmd_module_id: role.trl_tmd_module_id.split(","), // Splitting the comma-separated ids
    }));

    res.status(200).json({
      status: 1,
      message: "trl_tmd_module_id fetched successfully",
      data: rolesWithModuleIdsArray,
    });
  } catch (error) {
    next(CustomErrorHandler.databaseError(error.message));
  }
};

module.exports.updateRole = async (req, res, next) => {
  const { trl_role_id, trl_role_name } = req.body;
  const validation_errors = validationResult(req);
  if (!validation_errors.isEmpty()) {
    next(
      CustomErrorHandler.validationError(validation_errors.array()[0]["msg"]),
    );
  } else {
    if (trl_role_id && trl_role_name) {
      try {
        const updatedVillage = await RolesModel.update(
          { trl_role_name: trl_role_name },
          { where: { trl_role_id: trl_role_id } },
        );
        if (updatedVillage[0] === 1) {
          res.status(200).json({
            status: 1,
            message: "Role  updated successfully",
          });
        } else {
          res.status(404).json({
            status: 0,
            message: "Role not found",
          });
        }
      } catch (error) {
        next(CustomErrorHandler.databaseError(error.message));
      }
    } else {
      res.status(400).json({
        status: 0,
        message: "New Role name is required",
      });
    }
  }
};

module.exports.createRole = async (req, res, next) => {

  const transaction = await sequelize.transaction();

  try {

    const {
      trl_role_name,
      trl_role_id,
      trl_min_access_amount,
      trl_max_access_amount,
      trl_access_amount
    } = req.body.role;

    const permissions = req.body?.permissions || [];
    const trl_created_by = req.body?.payload?.id;

    if (isEmpty(trl_role_name)) {
      return next(CustomErrorHandler.validationError("Role name is required."));
    }

    /* ================= VALIDATIONS ================= */

    // if (Number(trl_min_access_amount) >= Number(trl_max_access_amount)) {
    //   return res.status(400).json({
    //     status: 0,
    //     message: "Min access amount cannot be greater than Max access amount"
    //   });
    // }

    // if (Number(trl_access_amount) <= Number(trl_max_access_amount)) {
    //   return res.status(400).json({
    //     status: 0,
    //     message: "Access amount must be greater than Max access amount"
    //   });
    // }

    /* ================= ROLE SLUG ================= */

    const role_slug = convertToSlug(trl_role_name);

    /* ================= CHECK DUPLICATE ================= */

    let alreadyRoleName;

    if (isEmpty(trl_role_id)) {

      alreadyRoleName = await RolesModel.findOne({
        where: { trl_role_slug: role_slug }
      });

    } else {

      alreadyRoleName = await RolesModel.findOne({
        where: {
          trl_role_slug: role_slug,
          trl_role_id: {
            [Op.ne]: trl_role_id
          }
        }
      });

    }

    if (alreadyRoleName) {

      await transaction.rollback();

      return res.status(200).json({
        status: 0,
        message: "Can't insert duplicate role"
      });

    }

    /* ================= CREATE OR UPDATE ROLE ================= */

    let role_id;

    if (!isEmpty(trl_role_id)) {

      await RolesModel.update(
        {
          trl_role_name: trl_role_name,
          trl_updated_at: new Date(),
          trl_updated_by: trl_created_by,
          trl_min_access_amount,
          trl_max_access_amount,
          trl_access_amount
        },
        {
          where: { trl_role_id },
          transaction
        }
      );

      role_id = trl_role_id;

    } else {

      const data = await RolesModel.create(
        {
          trl_role_name,
          trl_role_slug: role_slug,
          trl_created_at: new Date(),
          trl_updated_at: new Date(),
          trl_created_by,
          trl_updated_by,
          trl_min_access_amount,
          trl_max_access_amount,
          trl_access_amount
        },
        { transaction }
      );

      role_id = data.trl_role_id;

    }

    /* ================= DELETE OLD PERMISSIONS ================= */

    await Permission.destroy({
      where: { tpr_role_id: role_id },
      transaction
    });

    /* ================= INSERT NEW PERMISSIONS ================= */

    const permissionInsertArr = permissions.map(obj => ({
      tpr_role_id: role_id,
      tpr_module_id: obj.module_id,
      tpr_actions: obj.actions,
      tpr_updated_by: trl_created_by,
      tpr_created_by: trl_created_by
    }));

    if (permissionInsertArr.length > 0) {
      await Permission.bulkCreate(permissionInsertArr, { transaction });
    }

    /* ================= COMMIT TRANSACTION ================= */

    await transaction.commit();

    return res.status(200).json({
      status: 1,
      message: !isEmpty(trl_role_id)
        ? "Role Updated Successfully"
        : "Role Created Successfully"
    });

  } catch (error) {

    await transaction.rollback();

    console.log(error);

    next(CustomErrorHandler.databaseError(error.message));

  }

};

module.exports.deleteRole = async (req, res, next) => {
  const { id } = req.params;
  const validation_errors = validationResult(req);
  if (!validation_errors.isEmpty()) {
    next(
      CustomErrorHandler.validationError(validation_errors.array()[0]["msg"]),
    );
  } else {
    if (id) {
      try {
        const deleteVillage = await RolesModel.destroy({
          where: { trl_role_id: id },
        });

        Permission.destroy({
          where: {
            tpr_role_id: id,
          },
        });

        res.status(200).json({
          status: 1,
          message: "Role deleted successfully",
          data: deleteVillage,
        });
      } catch (error) {
        console.log(error);
        next(CustomErrorHandler.databaseError(error.message));
      }
    } else {
      res.status(400).json({
        status: 0,
        message: "Something went wrong",
      });
    }
  }
};

module.exports.getRoleWisePermissions = async (req, res, next) => {
  const payload = req.body.payload;
  try {
    var role_id = payload.role_id;
    const module = req.params.module;

    var existCacheData = await cacheService.client.json.get(`role:${role_id}`);

    if (existCacheData == null || existCacheData?.length == 0) {
      var sql = `SELECT 
                            trl_role_id,
                            trl_role_slug, 
                            trl_is_admin, 
                            CASE 
                                WHEN trl_is_admin = 'Y' THEN '*'::TEXT
                                ELSE JSON_AGG(JSON_BUILD_OBJECT(
                                    'module_id', tmd_id,
                                    'module_slug', tmd_slug_name,
                                    'actions', tpr_actions
                                ))::TEXT
                            END AS permissions
                        FROM t_roles 
                        LEFT JOIN t_permissions ON tpr_role_id = trl_role_id AND trl_deleted_at is null 
                        LEFT JOIN t_modules ON tpr_module_id = tmd_id AND tmd_fl_archive = 'N'
                        WHERE trl_role_id = '${role_id}' GROUP BY trl_role_id`;
      var data = await sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT,
      });

      if (data.length > 0) {
        data = data[0];
        var access_permissions = "*";
        if (data.trl_is_admin != "Y") {
          var permissions = JSON.parse(data.permissions);
          access_permissions = permissions?.map((obj) => {
            return {
              module_id: obj.module_id,
              module_slug: obj.module_slug,
              actions: obj.actions,
            };
          });
        }

        var tempArr = {
          role_id: data.trl_role_id,
          role_slug: data.trl_role_slug,
          access_permissions: access_permissions,
        };

        await cacheService.client.json.set(
          `role:${data.trl_role_id}`,
          "$",
          tempArr,
        );
        existCacheData = await cacheService.client.json.get(`role:${role_id}`);
      } else {
        res.json({
          message: "Invalid role",
          status: false,
        });
      }
    }

    if (existCacheData.access_permissions == "*") {
      res.json({
        message: "Permissions fetched successfully.",
        status: true,
        data: "*",
      });
    } else {
      var fileterData = existCacheData.access_permissions?.filter((obj) => {
        return obj.module_slug == module;
      });
      res.json({
        message: "Permissions fetched successfully.",
        status: true,
        data: fileterData[0]?.actions.split(","),
      });
    }
  } catch (error) {
    console.log(error);
    next(CustomErrorHandler.internalServerError(error.message));
  }
};

module.exports.getRoleWisePermissions = async (req, res, next) => {
  const payload = req.body.payload;
};

function buildPermissionArray(permissions) {
  if (permissions[0]["tpr_role_slug"] == "admin") {
    return {
      role_id: permissions[0]["tpr_role_id"],
      role_slug: permissions[0]["tpr_role_slug"],
      access_permissions: "*",
    };
  } else {
    return {
      role_id: permissions[0]["tpr_role_id"],
      role_slug: permissions[0]["tpr_role_slug"],
      access_permissions: permissions?.map((permission, index) => {
        return {
          module_id: permission?.tpr_module_id,
          module_slug: permission?.tpr_module_slug,
          actions: permission?.tpr_actions,
        };
      }),
    };
  }
}

module.exports.myRoleDetailsApi = async (req, res, next) => {
  // try {

  console.log(
    req.body,
    "------------------------------------------------------------------",
  );
  console.log(req.body);
  let role_id = req.body.payload.role_id;

  const query = `
        SELECT *  FROM t_roles
        WHERE trl_role_id = '${role_id}';
      `;

  const data = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  res.status(200).json({
    status: 1,
    message: "Role fetched successfully",
    data: data,
  });
  // } catch (error) {
  //     console.log(error);
  //     next(CustomErrorHandler.databaseError(error.message));
  // }
};
