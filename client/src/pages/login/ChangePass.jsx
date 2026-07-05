import React, { useState, useEffect, lazy } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { userLogin, validateProductKey, otpCheck } from "../../Services/User-service";
import toast, { Toaster } from "react-hot-toast";
import { doTokenLogin, doLogin } from "../../auth/auth";
import ScaleLoader from "react-spinners/ScaleLoader";
import "../../assets/css/login-style.css";

import logo from "../../assets/images/shree-logo.png";
import logo2 from "../../assets/images/LAMS-Logo2.png";
import logo_page from "../../assets/images/login-bg2.jpg";
// import { useMsal } from "@azure/msal-react";
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';


import { ColorRing } from 'react-loader-spinner'


import { useLoading } from "../../context/LoadingContext";

export const ChangePass = ({loginState}) => {
  let navigate = useNavigate();
  let location = useLocation();
  const [responseData, setResponseData] = useState(null);
  const [loginDetails, setLoginDetail] = useState({
    email: "",
    otp: "",
    newpass: "",
    confpass: ""
  });

  let { loading, setLoading } = useLoading(true);
  let [ initLoader, setInitLoader ] = useState(true);
  const handelChange = (event, field) => {
    let actualValue = event.target.value;
    setLoginDetail({
      ...loginDetails,
      [field]: actualValue,
    });
  };

  const userFormSubmit = async (event) => {
    event.preventDefault();
    if (loginDetails.otp === "") {
      toast.error("Please enter valid otp!!");
      return;
    }
    if (loginDetails.newpass === "") {
        toast.error("Please enter valid password!!");
        return;
    }
    if (loginDetails.confpass !== loginDetails.newpass) {
    toast.error("Confirm Password should be same!!");
    return;
    }

    try {
      setLoading(true);
      otpCheck(loginDetails).then((response) => {
        if (response.status === 1) {
          toast.success(response.message);
          navigate("/");
          setLoading(false);
        } else {
          toast.error(response.message);
          setLoading(false);
        }
      });
    } catch (error) {
      setLoading(false);
    }
  };


  useEffect(() => {
    if(location.state?.email){
        setLoginDetail({
            ...loginDetails,
            email: location.state.email
        })
    }else{
        navigate('/')
    }
    if(loginState){
        navigate(`../admin/dashboard`);
    }
    async function checkValidation(){
      var data = await validateProductKey()
      setResponseData(data);
    }
    checkValidation();
  },[])


  useEffect(() => {
    if(responseData != null){
      if(responseData?.status == true){
        setInitLoader(false);
      }else{
        navigate('/validate')
      }
    }
  },[responseData])

  return (

    

    initLoader ?
    <>
    <div style={{width: "100%", height: "100vh", display : "flex", justifyContent: "center", alignItems : "center"}}>
      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="color-ring-loading"
        wrapperStyle={{}}
        wrapperClass="color-ring-wrapper"
        colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
        />
    </div>
      
    </>
  :
    <>
      <Toaster
        position="top-center"
        toastOptions={{ duration: 1000 }}
        reverseOrder={false}
      ></Toaster>


      <div
      className="page-wrapper login-wrapper"
      id="main-wrapper"
      data-layout="vertical"
      data-navbarbg="skin6"
      data-sidebartype="full"
      data-sidebar-position="fixed"
      data-header-position="fixed"
    >


<section class="wrap">
        <div class="video-bg">
          <iframe
            src="https://www.youtube.com/embed/3sqagRNk5HA?autoplay=1&amp;mute=1&amp;playsinline=1&amp;loop=1&amp;playlist=3sqagRNk5HA&amp;controls=0&amp;disablekb=1"
            title="Sustainable is Attainable | Embrace Mother Earth"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </section>
      <div className="login-body">
        <main>
          <div className="row">
            <div className="col-lg-6 p-0">
              <div class="left-side">
                <h2>Please change your password!</h2>
                {/* <p>Hello Dear, I am Robin Gautam. How it is?</p> */}
              </div>
            </div>
            <div className="col-lg-6">
              <div class="right-side">
                <form onSubmit={userFormSubmit}>
                  <div className="login-logo">
                    <img
                      className="img-responsive"
                      src="https://upload.wikimedia.org/wikipedia/commons/3/32/Tata_Power_Logo.png"
                      alt=""
                    />
                  </div>
                  <div className="clearfix"></div>

                  <label for="email"> Old Password</label>
                  <input
                      type="password"
                      value={loginDetails.otp}
                      onChange={(e) => handelChange(e, "otp")}
                      name="otp"
                      required
                      className="form-control"
                      id="email"
                      aria-describedby="emailHelp"
                    />

                    <div className="clearfix"></div>

                    <label for="email"> New Password</label>
                    <input
                        type="password"
                        value={loginDetails.newpass}
                      onChange={(e) => handelChange(e, "newpass")}
                      name="newpass"
                        required
                        className="form-control"
                        id="email"
                        aria-describedby="emailHelp"
                      />

                      <div className="clearfix"></div>

                      <label for="text"> Confirm Password</label>
                      <input
                          type="password"
                          value={loginDetails.confpass}
                      onChange={(e) => handelChange(e, "confpass")}
                      name="confpass"
                          required
                          className="form-control"
                          id="email"
                          aria-describedby="emailHelp"
                        />

                
                  <button type="submit" class="login-btn mb-1" id="submit_btn">
                    Save Password
                  </button>

                  
                  <button
                    className="login-btn"
                    id="forget_btn"
                    onClick={(e)=> {
                      e.preventDefault();
                      navigate("/");
                    }}
                  >
                    Back To Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>  



      <div
        className="page-wrapper login-wrapper"
        id="main-wrapper"
        data-layout="vertical"
        data-navbarbg="skin6"
        data-sidebartype="full"
        data-sidebar-position="fixed"
        data-header-position="fixed"
      >

        <div className="position-relative overflow-hidden radial-gradient min-vh-100">
          <div className="position-relative z-index-5">
            <div className="login-section login_page_box_7">
              <a
                href="#"
                className="text-nowrap logo-img d-block px-4 py-9 w-100"
              >
                <img src={logo2} width="180" alt="" />
              </a>
            </div>
            <div className="authentication-login min-vh-100 bg-body row justify-content-center align-items-center p-4">
              <div>
                <a
                  href="#"
                  className="text-nowrap logo-img d-block px-4 py-9 w-100 text-center"
                >
                  <img src={logo} width="180" alt="" />
                </a>
                <h3 className="mb-5 fs-6 fw-bolder text-center ">
                  Welcome to LAMS
                </h3>

                <form onSubmit={userFormSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Registered Username/Email Address
                    </label>
                    <input
                      type="email"
                      value={loginDetails.email}
                      onChange={(e) => handelChange(e, "email")}
                      name="email"
                      required
                      className="form-control"
                      id="email"
                      aria-describedby="emailHelp"
                    />
                  </div>
                  {/* <div className="d-flex align-items-center justify-content-between mb-4">
                    <a className="text-danger fw-medium" href="#">Forgot Password ?</a>
                  </div> */}
                  <button
                    className="btn btn-danger w-100 py-8 mb-4 rounded-2"
                    id="submit_btn"
                    type="submit"
                  >
                    Send OTP
                  </button>
                  {/* <button
                        className="btn btn-dark w-100 py-8 mb-4 rounded-2"
                        id="submit_btn"
                        onClick={handleLoginUsingAzure}>
                        Login With Microsoft
                      </button> */}

                  <button
                    className="btn btn-dark w-100 py-10 mb-4 rounded-2"
                    id="forget_btn"
                    onClick={(e)=> {
                      e.preventDefault();
                      navigate("/");
                    }}
                  >
                    Back To Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
      
  );
};
