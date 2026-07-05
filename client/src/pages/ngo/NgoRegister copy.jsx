// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../assets/css/register-style.css";
// import logo from "../../assets/images/SMFG-Logo.svg";
// import { useMsal } from "@azure/msal-react";
// import "owl.carousel/dist/assets/owl.carousel.css";
// import "owl.carousel/dist/assets/owl.theme.default.css";
// import { ColorRing } from "react-loader-spinner";
import video from "../../assets/video/login-video.mp4";


import { Button, Col, Form, Input, Modal, Row } from 'antd';
import { useEffect, useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import { toast } from "react-toastify";
import * as Yup from 'yup';

import { createVolunteerUser } from "../../services/EmpVolunteer-service";
import {
  fetchPublicDistrictsListByStateIds
} from '../../services/Master-service';
import { getAllPublicStateApi } from '../../services/State-service';
import { createNgoRegisterUser } from "../../services/Ngo-service";



const phoneRegExp = /^[6-9]\d{9}$/; // Indian mobile format

const Schema = Yup.object().shape({
  // company_sub_maser_id: Yup.string()
  //   .required("Company selection is required."),

  name: Yup.string()
    .trim()
    .required("Name is required.")
    .matches(/^[A-Za-z\s.'-]+$/, "Name must contain only letters and valid characters."),

  email: Yup.string()
    .trim()
    .email("Invalid email format.")
    .matches(/^[A-Za-z0-9._%+-]+@coromandelindia\.com$/i, "Email must be from @coromandelindia.com domain.")
    .required("Email is required."),



  password: Yup.string().when("id", {
    is: (val) => !val, // Only required if ID doesn't exist (create mode)
    then: (schema) =>
      schema
        .required("Password is required.")
        .min(12, "Password must be at least 12 characters.")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
        .matches(/\d/, "Password must contain at least one digit.")
        .matches(/[@$!%*?&]/, "Password must contain at least one special character."),
    otherwise: (schema) => schema.notRequired(),
  }),

  phone: Yup.string()
    .matches(phoneRegExp, "Enter a valid 10-digit phone number.")
    .required("Phone number is required."),

  state_district_blocks: Yup.array()
    .min(1, "At least one state and district entry is required.")
    .of(
      Yup.object().shape({
        state_id: Yup.string()
          .trim()
          .required("State is required."),
        district_id: Yup.string()
          .trim()
          .required("District is required."),
      })
    ),
});



export default function NgoRegister() {

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    // company_sub_maser_id: '',
    email: '',
    password: '',
    status: 'active',
    phone: '',
    // region_id: '',
    role_id: '',
    vertical_id: '',
    
  });

  const [regionList, setRegionList] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [companyMasterList, setCompanyMasterList] = useState([]);
  const [verticalOptions, setVerticalOptions] = useState([]);
  const [ngoOptions, setNgoOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [districtsOptions, setDistrictsOptions] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);

  const fetchAllData = async () => {
    try {
      const [ stateRes] = await Promise.all([
        // fetchAllPublicCompanyApi(),
        getAllPublicStateApi(),
        // getAllPublicRegionApi(),
      ]);
        
      // setCompanyMasterList(companyRes?.data);
      setStateOptions(stateRes?.data || []);
      // setRegionList(regionRes?.data || []);
    } catch (err) {
      toast.error("Error loading master data");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);


  const fetchDistricts = async (stateIds) => {
    try {
      const res = await fetchPublicDistrictsListByStateIds({ state_ids: stateIds });
      if (res.status === 1) {
        setDistrictsOptions(res.data.map(d => ({
          label: d.tdl_district_name,
          value: d.tdl_district_id,
          stateId: d.tdl_state_id
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleChange = (selectedOption, { name }) => {

    console.log(selectedOption, name);


    setFormData({ ...formData, [name]: selectedOption ? selectedOption : '' });
  };

  const handleSubmit = async () => {
    const state_district_blocks = selectedDistricts.map(d => {
      const state = selectedStates.find(s => s.value === d.stateId);
      return { state_id: state?.value, district_id: d.value };
    });

    const dataToValidate = {
      ...formData,
      state_district_blocks,
      id: formData.id,
    };

    try {
      await Schema.validate(dataToValidate, { abortEarly: false });
      const res = await createNgoRegisterUser(dataToValidate);
      if (res.status === 1) {
        toast.success(res.message);

        // ✅ Reset form and states
        form.resetFields();
        setFormData({
          id: '',
          name: '',
          // company_sub_maser_id: '',
          email: '',
          password: '',
          status: 'active',
          phone: '',
          role_id: '',
          // region_id: '',
          vertical_id: '',
        });
        setSelectedStates([]);
        setSelectedDistricts([]);
        setErrors({});

      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.log("err----------- ",err);
      
      if (err.name === 'ValidationError') {
        const formatted = err.inner.reduce((acc, e) => {
          acc[e.path] = e.message;
          return acc;
        }, {});
        setErrors(formatted);
      } else {
        toast.error("Something went wrong");
      }
    }
  };


  const confirmSubmit = () => {
    Modal.confirm({
      title: "Confirm Submission",
      content: "Are you sure you want to submit this user registration?",
      okText: "Yes",
      cancelText: "No",
      onOk() {
        handleSubmit(); // calls actual submit logic
      },
    });
  };


  return (

    <>
      <div className="register-container ">
        <div class="curve"></div>

        <div className="register-box">
          {/* <h2 className="login-title">
              Nand Ghar by <span className="vedanta">Vedanta</span>
            </h2> */}
          <div className="register-body">

            {/* <div className="login-logo">
                <img className="img-responsive" src={logo} alt="" />
              </div> */}




            <Form layout="vertical" form={form}>
              <Row gutter={16} >
                {/* <Col span={12}>
                  <Form.Item label="Company" required>
                    <Select
                      value={formData.company_sub_maser_id}
                      options={companyMasterList}
                      onChange={(val) => setFormData({ ...formData, company_sub_maser_id: val })}
                    />
                    {errors.company_sub_maser_id && <div className="text-danger">{errors.company_sub_maser_id}</div>}
                  </Form.Item>
                </Col> */}
                <Col span={12}>
                  <Form.Item label="User Name" required>
                    <Input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <div className="text-danger">{errors.name}</div>}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email" required>
                    <Input
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <div className="text-danger">{errors.email}</div>}
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Password">
                    <Input.Password
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    {errors.password && <div className="text-danger">{errors.password}</div>}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Phone No" required>
                    <Input
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                    {errors.phone && <div className="text-danger">{errors.phone}</div>}
                  </Form.Item>
                </Col>
                {/* <Col span={12}>
                  <Form.Item label="Region" required>
                    <Select
                      name="region_id"
                      placeholder="Select Region"
                      value={formData.region_id}
                      onChange={(selectedOption) => handleChange(selectedOption, { name: "region_id" })
                      }
                      options={regionList}
                    />
                    {errors.region_id && (
                      <div className="text-danger">{errors.region_id}</div>
                    )}
                  </Form.Item>
                </Col> */}




                <Col span={12}>
                  <Form.Item label="State" required>
                    <MultiSelect
                      options={stateOptions}
                      value={selectedStates}
                      onChange={(states) => {
                        setSelectedStates(states);
                        fetchDistricts(states.map(s => s.value));
                      }}
                      labelledBy="Select State"
                    />
                    {errors.state_district_blocks && <div className="text-danger">{errors.state_district_blocks}</div>}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Location" required>
                    <MultiSelect
                      options={districtsOptions}
                      value={selectedDistricts}
                      onChange={(districts) => setSelectedDistricts(districts)}
                      labelledBy="Select Location"
                    />
                    {errors.state_district_blocks && <div className="text-danger">{errors.state_district_blocks}</div>}
                  </Form.Item>
                </Col>
                <Button className="reg-btn blue" type="primary" onClick={confirmSubmit}>
                  Submit
                </Button>

                <div style={{ width: "100%", textAlign: "center", marginTop: "20px" }}>
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/")}
                    style={{ color: "#1890ff", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Login here
                  </span>
                </div>

              </Row>
            </Form>
          </div>
        </div>

        {/* <div class="video_wrap">
              <video
                autoplay="false"
                muted="muted"
                preload="none"
                loop=""
                id="video_0"
              >
                <source src={video} type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div> */}
        <video
          autoplay="false"
          muted="muted"
          preload="none"
          loop=""
          id="video_0"
        >
          <source src={video} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>

      </div>
    </>
  );
}
