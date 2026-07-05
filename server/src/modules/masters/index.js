// src/modules/permission/index.js

const Permission = require('./models/permission.model');
const permissionController = require('./controllers/permission.controller');
const permissionService = require('./services/permission.service');
const permissionRoutes = require('./routes/permission.routes');

module.exports = {
  Permission,
  permissionController,
  permissionService,
  permissionRoutes,
};
