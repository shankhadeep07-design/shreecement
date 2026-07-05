import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../auth/auth";

import { useLoading } from "../context/LoadingContext";

const Redirect = ({ to }) => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to);
  }, [])
}

export default function PrivateRouteMiddleware() {
  let { loading, setLoading } = useLoading();
  let [loginState, setLoginState] = useState(isLoggedIn());

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
}
