const User = require('../../../models/users/user.model');

const getAllUsers = async () => {
  return await User.findAll({
    attributes: ['id', 'name', 'email', 'role'],
  });
};

const getUserById = async (id) => {
  return await User.findByPk(id, {
    attributes: ['id', 'name', 'email', 'role'],
  });
};

module.exports = { getAllUsers, getUserById };
