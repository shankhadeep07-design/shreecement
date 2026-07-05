const jwt = require("jsonwebtoken");
const { getunAuthorisedUrl } = require("../helpers/web.helper");
const { verify } = require("../service/JwtServices");
const CustomErrorHandler = require("../service/CustomErrorHandler");
const { sequelize } = require("../config/db");

module.exports.authMiddleware = async (req, res, next) => {
  var unAuthorizedUrl = getunAuthorisedUrl();
  var currentPath = req.path;

  if (unAuthorizedUrl.indexOf(currentPath) > -1) {
    next();
  } else {
    if (req.headers.authorization) {
      try {
        const value = req.headers.authorization;
        const token = value.split(" ")[1];

        var verify_data = await verify(token);

        req.body = req.body || {};

        req.body.payload = verify_data;

        const user_id = verify_data["id"];

        try {
          const sql = `SELECT id,name,email,phone,unit_id_json FROM users WHERE id = ${user_id} AND status = 'active'`;

          const user_details = await sequelize.query(sql, {
            type: sequelize.QueryTypes.SELECT,
          });
          if (!user_details || user_details.length === 0) {
            return next(
              CustomErrorHandler.unAuthorizedError("Unauthorized user")
            );
          }

          req.user = user_details;
          next();
        } catch (err) {
          next(CustomErrorHandler.databaseError(err.message));
        }
      } catch (err) {
        next(CustomErrorHandler.unAuthorizedError("Token is expired"));
      }
    } else {
      next(CustomErrorHandler.unAuthorizedError("Unauthorized user"));
    }
  }
};
