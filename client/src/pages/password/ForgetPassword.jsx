import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Typography } from "antd";
import { useState } from "react";
import * as Yup from "yup";
import { myAxios } from "../../services/Helper";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import "../../assets/css/login-style.css";

const { Title } = Typography;

/* =========================
   Validation Schema
========================= */
const getSchema = (type) => {
  if (type === "email_verify") {
    return Yup.object().shape({
      email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),
      captcha: Yup.string().required("Captcha is required"),
    });
  }

  if (type === "otp_verify") {
    return Yup.object().shape({
      otp: Yup.string()
        .required("OTP is required")
        .matches(/^\d{6}$/, "Enter a valid 6-digit OTP"),
    });
  }

  if (type === "reset_password") {
    return Yup.object().shape({
      password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .matches(/[a-z]/, "Must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Must contain at least one uppercase letter")
        .matches(/\d/, "Must contain at least one number")
        .matches(
          /[@$!%*?&]/,
          "Must contain at least one special character (@$!%*?&)"
        ),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
    });
  }

  return Yup.object();
};

/* =========================
   Captcha Generator
========================= */
const generateCaptcha = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

const ForgetPassword = () => {
     const [type, setType] = useState("email_verify");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    captcha: "",
    otp: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* =========================
     Validation
  ========================= */
  const validateForm = async () => {
    try {
      const schema = getSchema(type);
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const formatted = {};
      err.inner.forEach((e) => (formatted[e.path] = e.message));
      setErrors(formatted);
      return false;
    }
  };

  /* =========================
     Submit Handler
  ========================= */
  const handleSubmit = async (resend = false) => {
    if (!resend) {
      const isValid = await validateForm();
      if (!isValid) return;

      if (type === "email_verify" && formData.captcha !== captcha) {
        setErrors({ captcha: "Invalid Captcha" });
        setCaptcha(generateCaptcha());
        setFormData((prev) => ({ ...prev, captcha: "" }));
        return;
      }
    }

    resend ? setResendLoading(true) : setLoading(true);

    try {
      let payload = { type, email: formData.email };

      if (resend) {
        payload = { ...payload, type: "email_verify" };
      } else {
        if (type === "otp_verify") {
          payload = { ...payload, otp: formData.otp, token };
        } else if (type === "reset_password") {
          payload = {
            ...payload,
            token,
            password: formData.password,
            confirm_password: formData.confirm_password,
          };
        }
      }

      const res = await myAxios.post(
        "auth/web/forgot-password",
        payload
      );

      const resData = res?.data;

      if (resData?.type === "otp_verify") {
        setToken(resData?.token);
        setType("otp_verify");
      } else if (resData?.type === "reset_password") {
        setToken(resData?.token);
        setType("reset_password");
      } else if (type === "reset_password") {
        message.success("Password reset successfully!");
        setType("email_verify");
        setToken(null);
        navigate("/"); // Redirect to login page after successful password reset
      }

      setFormData((prev) => ({
        ...prev,
        captcha: "",
        otp: "",
        password: "",
        confirm_password: "",
      }));

      setCaptcha(generateCaptcha());

      
    } catch (err) {
      const { status, data } = err.response || {};
      if (status === 400 && data?.errors) setErrors(data.errors);
      else message.error(data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setResendLoading(false);
    }
  };

    return (
        <div className="login-page-bg">
          <div className="modern-login-container">
            {/* Left Side: Branding */}
            <div className="modern-login-left">
              <img src={logo} alt="Shree Cement Logo" className="brand-logo" />
              <h1>CSR Portal</h1>
              <p>
                Reset your password to regain access to your dashboard and manage projects, budgets, and community impact.
              </p>
            </div>

            {/* Right Side: Forget Password Form */}
            <div className="modern-login-right">
              <h2>Forgot Password</h2>
              <p className="subtitle">Secure account recovery</p>
              
              <div style={{ marginTop: 20 }}>
                {/* Email */}
                <div className="modern-login-form-group">
                  <label>Email Address</label>
                  <Input
                    value={formData.email}
                    disabled={type !== "email_verify"}
                    placeholder="Enter your email"
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="modern-login-input"
                  />
                  {errors.email && (
                    <div className="text-danger mt-1">{errors.email}</div>
                  )}
                </div>

                {/* CAPTCHA */}
                {type === "email_verify" && (
                  <div className="modern-login-form-group">
                    <label>Verification Code</label>
                    <div className="modern-captcha-container">
                      <div className="modern-captcha-display">
                        {captcha}
                      </div>

                      <button
                        type="button"
                        className="modern-captcha-refresh"
                        onClick={() => setCaptcha(generateCaptcha())}
                        title="Refresh Captcha"
                      >
                        <ReloadOutlined />
                      </button>

                      <Input
                        style={{ flex: 1 }}
                        className="modern-login-input"
                        placeholder="Enter CAPTCHA"
                        value={formData.captcha}
                        onChange={(e) => handleChange("captcha", e.target.value)}
                      />
                    </div>
                    {errors.captcha && (
                      <div className="text-danger mt-1">{errors.captcha}</div>
                    )}
                  </div>
                )}

                {/* OTP */}
                {type === "otp_verify" && (
                  <div className="modern-login-form-group">
                    <label>Enter 6-digit OTP</label>
                    <Input.OTP
                      length={6}
                      size="large"
                      value={formData.otp}
                      onChange={(val) => handleChange("otp", val)}
                      style={{ marginTop: 5 }}
                    />
                    {errors.otp && (
                      <div className="text-danger mt-1">{errors.otp}</div>
                    )}

                    <div style={{ marginTop: 15, textAlign: "right" }}>
                      <Button
                        size="small"
                        type="dashed"
                        loading={resendLoading}
                        onClick={() => handleSubmit(true)}
                        style={{ borderColor: "#E31E24", color: "#E31E24" }}
                      >
                        Resend OTP
                      </Button>
                    </div>
                  </div>
                )}

                {/* RESET PASSWORD */}
                {type === "reset_password" && (
                  <>
                    <div className="modern-login-form-group">
                      <label>New Password</label>
                      <Input.Password
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className="modern-login-input"
                        style={{ padding: '0px' }} /* antd Input.Password wrapper fix */
                      />
                      {errors.password && (
                        <div className="text-danger mt-1">{errors.password}</div>
                      )}
                    </div>

                    <div className="modern-login-form-group">
                      <label>Confirm Password</label>
                      <Input.Password
                        value={formData.confirm_password}
                        onChange={(e) =>
                          handleChange("confirm_password", e.target.value)
                        }
                        className="modern-login-input"
                        style={{ padding: '0px' }}
                      />
                      {errors.confirm_password && (
                        <div className="text-danger mt-1">
                          {errors.confirm_password}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  className="modern-login-button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (
                    type === "email_verify"
                      ? "Send OTP"
                      : type === "otp_verify"
                      ? "Verify OTP"
                      : "Reset Password"
                  )}
                </button>
                
                <Link to="/" className="forgot-password-link" style={{ textAlign: "center", display: "block", marginTop: 25 }}>
                  Back to Login
                </Link>

              </div>
            </div>
          </div>
        </div>
    );
};


export default ForgetPassword;
