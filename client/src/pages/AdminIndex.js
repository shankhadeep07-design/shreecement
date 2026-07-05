import React, {useState} from "react";
import { Navigate, Outlet, useNavigate, redirect } from "react-router-dom";
import { Sidebar } from "./sidebar/Sidebar";
import { isLoggedIn } from "../auth/auth";
import { Header } from "../Components/header/Header";



export const AdminIndex = () => {
  const navigate = useNavigate()
  const [sidebarState, setSidebarState] = useState('mini-sidebar');

  return (
    <>
        <div
          className="page-wrapper" 
          id="main-wrapper" 
          data-layout="vertical" 
          data-navbarbg="skin6" 
          data-sidebartype={sidebarState} 
          data-sidebar-position="absolute" 
          data-header-position="fixed">
          <Sidebar/>
          {/* <nav class="navbar fixed-top navbar-expand-lg bg-light">
            <div class="container-fluid">
              <a class="navbar-brand" href="#">Navbar</a>
            </div>
          </nav> */}
          <div className="glass">
            <Header setSidebarState = {setSidebarState} />
            <div className="body-wrapper">
              <div className="container-fluid">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
    </>
  );
};
