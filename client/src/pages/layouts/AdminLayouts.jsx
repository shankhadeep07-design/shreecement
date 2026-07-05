import React, {useState} from "react";
import { Navigate, Outlet, useNavigate, redirect } from "react-router-dom";
import { Sidebar } from "../sidebar/Sidebar";
// import { isLoggedIn } from "../auth/auth";
import Header  from "../header/Header";
import InactivityHandler from "../../InactivityHandler";


export default function AdminLayouts() {
  const navigate = useNavigate()
    const [sidebarState, setSidebarState] = useState('full');
  
    return (
      <div className="modern-admin-layout">
        
        {/* Left Sidebar Pane */}
        <Sidebar sidebarState={sidebarState} />
        
        {/* Right Main Area */}
        <div className="modern-main-pane">
          
          {/* Top Header Pane */}
          <Header setSidebarState={setSidebarState} />
          
          {/* Scrollable Content Pane */}
          <div className="modern-content-pane">
            <div className="container-fluid p-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    );
}
