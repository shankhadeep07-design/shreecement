import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authUtils from "../auth/authUtils";

export default function GuestRouteMiddleware() {
  return !authUtils.getToken() ? <Outlet /> : <Navigate to="/" />;
}
