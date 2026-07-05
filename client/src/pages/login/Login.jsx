import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../assets/css/login-style.css";
import { doLogin } from "../../auth/auth";
import {
  azureValidateProductKeyApi,
  userLogin,
} from "../../services/User-service";
import logo from "../../assets/images/logo.jpg";
import loginBg from "../../assets/images/login-form-bg.png";
// import { useMsal } from "@azure/msal-react";
// import "owl.carousel/dist/assets/owl.carousel.css";
// import "owl.carousel/dist/assets/owl.theme.default.css";
// import { ColorRing } from "react-loader-spinner";
import { useLoading } from "../../context/LoadingContext";
import { FaEye, FaEyeSlash, FaCog } from "react-icons/fa";
import { getMsalInstance } from "../../msalConfig";
import video from "../../assets/video/login-video.mp4";

const generateCaptcha = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};
export const Login = () => {
  const [captcha, setCaptcha] = useState(generateCaptcha());
  let navigate = useNavigate();
  const [responseData, setResponseData] = useState(null);
  const [loginDetails, setLoginDetail] = useState({
    email: "",
    password: "",
    captcha: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  let { loading, setLoading } = useLoading(true);
  let [initLoader, setInitLoader] = useState(false);
  let [color] = useState("#ffffff");
  const handelChange = (event, field) => {
    let actualValue = event.target.value;
    setLoginDetail({
      ...loginDetails,
      [field]: actualValue,
    });
  };

  const userFormSubmit = async (event) => {
    event.preventDefault();
    if (loginDetails.email === "") {
      toast.error("User name is required!!");
      return;
    }
    if (loginDetails.password === "") {
      toast.error("User password is required!!");
      return;
    }
    if (loginDetails.captcha !== captcha) {
      toast.error("Invalid Captcha!!");
      setCaptcha(generateCaptcha());
      setLoginDetail((prevtDetails) => ({
        ...prevtDetails,
        captcha: "",
      }));
      return;
    }

    // setLoading(true);
    userLogin(loginDetails)
      .then((response) => {
        if (response.status == 1) {
          doLogin(response.data, () => {});
          toast.success(response.message);
          navigate("admin/dashboard");
          // setLoading(false);
        } else {
          toast.error(response.message);
          // setLoading(false);
        }
      })
      .catch((error) => {
       
        setCaptcha(generateCaptcha());
        setLoginDetail((prevtDetails) => ({
          ...prevtDetails,
          captcha: "",
        }));
        const errorMessage = error?.response?.data?.message  || "Invalid Credential";
        const warningMessage = error?.response?.data?.warningMessage;

        if (errorMessage || warningMessage) {
          toast.error(
            <div>
              {errorMessage && <div>{errorMessage}</div>}
              {warningMessage && <div>{warningMessage}</div>}
            </div>
          );
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    // async function checkValidation() {
    //   var data = await validateProductKey();
    //   setResponseData(data);
    // }
    // checkValidation();
  }, []);

  useEffect(() => {
    if (responseData != null) {
      if (responseData?.status == true) {
        setInitLoader(false);
      } else {
        navigate("/validate");
      }
    }
  }, [responseData]);

  //----------------------  SSO LOGIN ---------------------------------
  const login = async () => {
    try {
      const msalInstance = getMsalInstance();

      if (!msalInstance) {
        console.warn(
          "MSAL could not be initialized (probably outside a browser)."
        );
        return;
      }

      await msalInstance.loginRedirect({
        scopes: ["User.Read"],
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Parse code from hash
  const location = useLocation();
  const query = new URLSearchParams(location.hash.replace("#", ""));
  const code = query.get("code");

  useEffect(() => {
    if (code) {
      azureValidateProductKeyApi({ code })
        .then((response) => {
          console.log(response);
          if (response.status == 1) {
            doLogin(response.data, () => {});
            navigate("admin/dashboard");
          } else {
            console.error("Validation failed:", response.message);
          }
        })
        .catch((err) => console.error("Login failed", err));
    }
  }, [code, navigate]);

  //----------------------  SSO LOGIN  END ---------------------------------

  return initLoader ? (
    <></>
  ) : (
    <div className="login-page-bg">
      <div className="modern-login-container">
        
        {/* Left Side: Branding & Welcome */}
        <div className="modern-login-left">
          <img src={logo} alt="Shree Cement Logo" className="brand-logo" />
          <h1>CSR Portal</h1>
          <p>
            Welcome to the centralized Corporate Social Responsibility dashboard. 
            Sign in to manage projects, budgets, and track community impact effortlessly.
          </p>
        </div>

        {/* Right Side: Login Form */}
        <div className="modern-login-right">
          <h2>Sign In</h2>
          <p className="subtitle">Secure access to your dashboard</p>

          <form onSubmit={userFormSubmit}>
            
            <div className="modern-login-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="modern-login-input"
                placeholder="Ex. user@shreecement.com"
                value={loginDetails.email}
                onChange={(e) => handelChange(e, "email")}
                required
                autoComplete="email"
              />
            </div>

            <div className="modern-login-form-group">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="modern-login-input"
                placeholder="Enter your password"
                value={loginDetails.password}
                onChange={(e) => handelChange(e, "password")}
                required
                autoComplete="current-password"
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="modern-login-form-group">
              <label>Security Check</label>
              <div className="modern-captcha-container">
                <div className="modern-captcha-display">{captcha}</div>
                <button
                  type="button"
                  className="modern-captcha-refresh"
                  onClick={() => setCaptcha(generateCaptcha())}
                  title="Refresh CAPTCHA"
                >
                  ↻
                </button>
                <input
                  type="text"
                  className="modern-login-input"
                  style={{ flex: 1 }}
                  placeholder="Enter CAPTCHA"
                  value={loginDetails.captcha}
                  onChange={(e) => handelChange(e, "captcha")}
                  required
                />
              </div>
            </div>

            <button type="submit" className="modern-login-button">
              Authenticate
            </button>

            <a
              href="#"
              className="forgot-password-link"
              onClick={(e) => {
                e.preventDefault();
                navigate("forget-password");
              }}
            >
              Forgot your password?
            </a>
            
          </form>
        </div>

      </div>
    </div>
  );
};
