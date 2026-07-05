import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { isLoggedIn } from "./auth";
// import { useIsAuthenticated } from "@azure/msal-react";

import { useLoading } from "../context/LoadingContext";

// import { SocketProvider } from "../context/SocketContext";


const Redirect = ({ to }) => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to);
  }, [])
}

export const PrivateRoute = () => {
  let { loading, setLoading } = useLoading();
  let [loginState, setLoginState] = useState(isLoggedIn());
  const navigate = useNavigate()

  

  return (
    <>
      {
        (loginState) ?
            <Outlet />

          :
          <Redirect to="/" />
      }

    </>
  );

};