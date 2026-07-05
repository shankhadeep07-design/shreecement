import $ from "jquery";
import { useEffect, useState } from "react";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { useLoading } from "../../context/LoadingContext";

import { Descriptions } from "antd";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getMyModulePermissionFun, getTableShimmer } from "../../helper/common";
import { getAuthToken } from "../../services/Helper.js";
import { projectDetailsApi } from "../../services/Project-service.js";
import AddEditProjectMonitoring from "./AddEditProjectMonitoring.jsx";

export const GanttChart = () => {
  
};
