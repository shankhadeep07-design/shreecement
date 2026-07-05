const jwt = require('jsonwebtoken');
const { getunAuthorisedUrl } = require('../helpers/web.helper');
const { verify } = require('../service/JwtServices');
const CustomErrorHandler = require('../service/CustomErrorHandler');
const { sequelize } = require('../config/db');

module.exports.appAuthMiddleware = async (req, res, next) => {

    const unAuthorizedUrl = getunAuthorisedUrl();
    const currentPath = req.path;

    if (unAuthorizedUrl.includes(currentPath)) return next();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(CustomErrorHandler.unAuthorizedError("Authorization header missing"));
    }

    try {
        const token = authHeader.split(" ")[1];
        const verify_data = await verify(token);
        console.log("Verified Data:", verify_data);
        req.auth = verify_data;

        // const user_id = verify_data.id;
        // const sql = `SELECT id,name,email,phone,role_id,name_slug,user_type FROM users WHERE id = ? AND status = 'active'`;

        // const user_details = await sequelize.query(sql, {
        //     replacements: [user_id],
        //     type: sequelize.QueryTypes.SELECT
        // });

        // if (!user_details || user_details.length === 0) {
        //     return next(CustomErrorHandler.unAuthorizedError("User not found or inactive"));
        // }

        // req.user = user_details;
        next();
    } catch (err) {
    next(CustomErrorHandler.unAuthorizedError("Invalid or expired token"));
    }

}

