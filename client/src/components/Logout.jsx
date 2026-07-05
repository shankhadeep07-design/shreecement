import React, {useState, useEffect } from "react";
import {NavLink, Navigate, useNavigate} from "react-router-dom";

import {Button} from "antd"
import logo from "../../assets/images/shree-logo3.png";
import avatar from "../../assets/images/user-1.jpg";
import secureLocalStorage from "react-secure-storage";
import {
  AuthenticatedTemplate,
    UnauthenticatedTemplate,
  useMsal
} from "@azure/msal-react";
import { isLoggedIn } from "../../auth/auth";

export const Header = ({setSidebarState}) => {
    const { instance, accounts } = useMsal();
    const navigate = useNavigate();
    const doLogout = async () => {
    if (process.env.REACT_APP_ENVIRONMENT === "production") {
      await instance.logoutRedirect();
    
    }else{
      navigate('/');
      localStorage.clear();
    }
  }
    
    return (
        <a
        className="nav-link nav-icon-hover"
        href="javascript:void(0)"
        onClick={doLogout}>
            <i className="ti ti-logout"></i>
        </a>
    );
}