import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { msalInstance } from "../msalConfig";
import axios from 'axios';
import { doLogin } from "./auth";
import { azureValidateProductKeyApi } from "../Services/User-service";

function AuthCallback() {

  const location = useLocation();
  const navigate = useNavigate();

  // Parse code from hash
  const query = new URLSearchParams(location.hash.replace("#", ""));
  const code = query.get("code");

  console.log("Extracted Code:", code);

  useEffect(() => {
      if (code) {
        //   azureValidateProductKeyApi({ code })
        //   .then(response => {
        //       console.log(response);
        //       if (response.status == 1) {
        //           doLogin(response.data, () => {});
        //           navigate("admin/dashboard");
        //       } else {
        //           console.error("Validation failed:", response.message);
        //       }
        //   })
        //   .catch(err => console.error("Login failed", err));
      }
  }, [code, navigate]);

  return <div>Authenticating...</div>;
}

export default AuthCallback;
