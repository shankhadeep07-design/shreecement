
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/db');


module.exports.getunAuthorisedUrl = function () {
  return [
    "/api/v1/admin/login",
    "/api/v1/admin/map/plots",
    "/api/v1/admin/map/villageLayers",
    "/api/v1/admin/map/lease_boundary_layer",
    "/api/v1/admin/map/map_fetch_popover",
    "/api/v1/admin/users/submit-admin",
    "/api/v1/admin/users/is-validate-product-key",
  ];
};

module.exports.formatWebResponse = (data) => {
    // Format data specific to web clients
    return {
      status: 'success',
      data,
    };
};



module.exports.getModuleNameRoleWise = async (email) => {
  var sql = `SELECT
    u.id AS user_id,
    u.name AS user_name,
    r.trl_role_id AS role_id,
    r.trl_role_name AS role_name,
    m.tmd_id AS module_id,
    m.tmd_name AS module_name
FROM
    public.users u
JOIN
    public.t_roles r ON u.role_id = r.trl_role_id
JOIN
    public.t_modules m ON m.tmd_id IN (SELECT unnest(string_to_array(r.trl_tmd_module_id, ','))::varchar)
WHERE
    u.email = '${email}';

`;
  var data = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });
  return data;
};

///----------------------------- Approval --------------------------------

module.exports.ApprovalPathList = async (approval_path_slug = null, approval_order = null) => {
  // Start the base query
  let sql = `SELECT * FROM t_approval_path WHERE 1 = 1`;

  // Conditionally add the slug if provided
  if (approval_path_slug) {
    sql += ` AND tapp_tap_slug = '${approval_path_slug}'`;
  }

  // Conditionally add the approval order if provided
  if (approval_order) {
    sql += ` AND tapp_approval_order = '${approval_order}'`;
  }

  // Execute the query
  const data = await sequelize.query(sql, {
    type: sequelize.QueryTypes.SELECT,
  });

  return data;
}

module.exports.notificationStatusChange = async (approval_path_slug = null, item_id = null) => {
  // Start the base query
  let sql = `UPDATE t_notifications SET tnot_is_read = 'Y' WHERE tnot_type = '${approval_path_slug}' AND tnot_item_id = '${item_id}'`;

  // Execute the query
  const data = await sequelize.query(sql, {
    type: sequelize.QueryTypes.SELECT,
  });

  return data;
}



module.exports.getUserByRoleId = async function (id = null) {
  var where = id ? `AND role_id = '${id}'` : "";
  var sql = `SELECT * FROM users WHERE deleted_at is null ${where}`;
  var data = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });
  return data;
};


module.exports.generateTenDigitNumber = function generateTenDigitNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

module.exports.getRoleDetailsBySlug = async (slug) => {
  var sql = `SELECT *
  FROM
      public.t_roles
  WHERE
      trl_role_slug = '${slug}';

  `;
    var data = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    return data;
};

module.exports.getRoleDetails = async (role_id) => {
  var sql = `SELECT *
  FROM
      public.t_roles
  WHERE
      trl_role_id = '${role_id}';

  `;
    var data = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    return data;
};