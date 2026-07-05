// src/modules/user/index.js

const User = require('./models/user.model');
const userController = require('./controllers/user.controller');
const userService = require('./services/user.service');
const userRoutes = require('./routes/user.routes');

module.exports = {
  User,
  userController,
  userService,
  userRoutes,
};
