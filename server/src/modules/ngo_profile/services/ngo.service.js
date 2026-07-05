const User = require('../models/user.model');

const getPermissionService = async () => {
  return await User.findAll({
    attributes: ['id', 'name', 'email', 'role'],
  });
};


module.exports = { getPermissionService };
