const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const { connectDB } = require("./config");
const errorHandler = require("./middlewares/errorHandler");

// Route modules

const webAuthRoutes = require("./modules/auth/routes/web.routes");
// const appAuthRoutes = require("./modules/auth/routes/app.routes");
const appAuthRoutes = require('./modules/app/routes/app.routes');
const permissionRoutes = require("./modules/permission/routes/permission.routes");
const mastersRoutes = require("./modules/masters/routes/masters.routes");
const MasterManagementRoutes = require("./modules/master_management/routes/master_management.routes");
const priorityAlignmentRoutes = require("./modules/priority_alignment/routes/priority_alignment.routes");
const budgetMasterRoutes = require("./modules/budget/routes/budget.routes");
const projectsListRoutes = require("./modules/projects/routes/projects.routes");
const proposalsListRoutes = require("./modules/proposal/routes/proposal.routes");
const bestPracticesRoutes = require("./modules/best_practice/routes/best_practice.routes");
const caseStudyRoutes = require("./modules/case_study/routes/case_study.routes");
const galleryRoutes = require("./modules/gallery/routes/gallery.routes");
const NgoRoutes = require("./modules/ngo/routes/ngo.routes");
const VendorRoutes = require("./modules/vendor/routes/vendor.routes");
const NgoProfileRoutes = require("./modules/ngo_profile/routes/ngo_profile.routes");
const ModuleRoutes = require("./modules/module/routes/module.routes");
const RoleRoutes = require("./modules/role/routes/role.routes");
const UserRoutes = require("./modules/user/routes/user.routes");
const ApprovalRoutes = require("./modules/approvals/routes/approval.routes");
const NotificationRoutes = require("./modules/notification/routes/notification.routes");

const PublicRoutes = require("./modules/public/routes/public.routes");

const employeeVolunteeringRoutes = require("./modules/employee_volunteering/routes/employee_volunteering.routes");
const EventRoutes = require("./modules/event/routes/event.routes");
const AuditReportRoutes = require("./modules/audit_report/routes/audit_report.routes");
const dashboardRoutes = require("./modules/dashboard/routes/dashboard.routes");

const { authMiddleware } = require("./middlewares/authMiddleware");
const { permission } = require("process");

const app = express();
app.set('trust proxy', true); // ✅ Add here to get real client ip

// Connect to the database
connectDB();

// Middlewares
// app.use(cors());
// const corsOptions = {
//   origin: process.env.CLIENT_URL || "http://localhost:5173"|| "http://localhost:5174" || "http://localhost:3000", // React app URL
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// };

// app.use(cors(corsOptions));

app.use(cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static file handling
app.use(
  "/api/v1/uploads",
  express.static(path.join(__dirname, "../", "uploads"))
);

// Route mounting
app.use("/api/v1/auth/web", webAuthRoutes);
// app.use("/api/v1/auth/app", appAuthRoutes);
app.use('/api/v1/app', appAuthRoutes);
app.use("/api/v1/admin", authMiddleware);
app.use("/api/v1/admin/permission", permissionRoutes);
app.use("/api/v1/admin/masters", mastersRoutes);
app.use("/api/v1/admin/masters-management", MasterManagementRoutes);
app.use("/api/v1/admin/priority-alignment", priorityAlignmentRoutes);
app.use("/api/v1/admin/budget", budgetMasterRoutes);
app.use("/api/v1/admin/projects", projectsListRoutes);
app.use("/api/v1/admin/project-management", projectsListRoutes);
app.use("/api/v1/admin/proposals", proposalsListRoutes);
app.use("/api/v1/admin/best-practices", bestPracticesRoutes);
app.use("/api/v1/admin/case-studies", caseStudyRoutes);
app.use("/api/v1/admin/gallery", galleryRoutes);
app.use("/api/v1/admin/ngo", NgoRoutes);
app.use("/api/v1/admin/ngo-profile", NgoProfileRoutes);
app.use("/api/v1/admin/module", ModuleRoutes);
app.use("/api/v1/admin/role", RoleRoutes);
app.use("/api/v1/admin/users", UserRoutes);
app.use("/api/v1/admin/approvals", ApprovalRoutes);
app.use("/api/v1/admin/notification", NotificationRoutes);

app.use("/api/v1/admin/employee-volunteering", employeeVolunteeringRoutes);
app.use("/api/v1/admin/events", EventRoutes);
app.use("/api/v1/admin/vendor", VendorRoutes);

app.use("/api/v1/admin/audit-report", AuditReportRoutes);
app.use("/api/v1/admin/dashboard", dashboardRoutes);


app.use('/api/v1/public', PublicRoutes);
// 404 handler for unknown routes
app.use((req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
