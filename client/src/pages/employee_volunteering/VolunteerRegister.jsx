import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col } from "antd";
import { toast } from "react-toastify";
import { MultiSelect } from "react-multi-select-component";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

import "../../assets/css/volunteer-register.css";

import { fetchPublicDistrictsListByStateIds } from "../../services/Master-service";
import { getAllPublicStateApi } from "../../services/State-service";
import { createVolunteerUser } from "../../services/EmpVolunteer-service";

import logo from "../../assets/images/logo.jpg";
import csrImg1 from "../../assets/images/sidebar-bg-dark.png";
import csrImg2 from "../../assets/images/sidebar-optionB.png";

const phoneRegExp = /^[6-9]\d{9}$/;

const Schema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .matches(/^[A-Za-z\s.'-]+$/, "Name must contain only letters"),

  email: Yup.string()
    .trim()
    .email("Invalid email")
    .matches(
      /^[A-Za-z0-9._%+-]+@shreecement\.com$/i,
      "Email must be from @shreecement.com"
    )
    .required("Email required"),

  password: Yup.string()
    .required("Password required")
    .min(12, "Password must be at least 12 characters")
    .matches(/[A-Z]/, "Must contain uppercase")
    .matches(/[a-z]/, "Must contain lowercase")
    .matches(/\d/, "Must contain number")
    .matches(/[@$!%*?&]/, "Must contain special character"),

  phone: Yup.string()
    .matches(phoneRegExp, "Invalid phone")
    .required("Phone required"),

  states: Yup.array().min(1, "Select at least one state"),

  districts: Yup.array().min(1, "Select at least one district"),
});

export default function VolunteerRegister() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    status: "active",
  });

  const [stateOptions, setStateOptions] = useState([]);
  const [districtsOptions, setDistrictsOptions] = useState([]);

  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);

  /* Fetch States */

  const fetchStates = async () => {
    try {
      const res = await getAllPublicStateApi();

      if (res?.status === true) {
        const formatted = res.data.map((s) => ({
          label: s.label,
          value: s.value,
        }));

        setStateOptions(formatted);
      } else {
        setStateOptions([]);
      }
    } catch (error) {
      toast.error("Failed to load states");
      setStateOptions([]);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  /* Fetch Districts */

  const fetchDistricts = async (stateIds) => {
    try {
      if (!stateIds || stateIds.length === 0) {
        setDistrictsOptions([]);
        return;
      }

      const res = await fetchPublicDistrictsListByStateIds({
        state_ids: stateIds,
      });

      if (res?.status === 1) {
        const formatted = res.data.map((d) => ({
          label: d.tdl_district_name,
          value: d.tdl_district_id,
          stateId: d.tdl_state_id,
        }));

        setDistrictsOptions(formatted);
      } else {
        setDistrictsOptions([]);
      }
    } catch (error) {
      console.error(error);
      setDistrictsOptions([]);
    }
  };

  /* Submit */

  const handleSubmit = async () => {
    const state_district_blocks = selectedDistricts.map((d) => {
      const state = selectedStates.find((s) => s.value === d.stateId);

      return {
        state_id: state?.value,
        district_id: d.value,
      };
    });

    const payload = {
      ...formData,
      states: selectedStates,
      districts: selectedDistricts,
      state_district_blocks,
    };

    try {
      await Schema.validate(payload, { abortEarly: false });

      const res = await createVolunteerUser(payload);

      if (res.status === 1) {
        toast.success(res.message);

        form.resetFields();

        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          status: "active",
        });

        setSelectedStates([]);
        setSelectedDistricts([]);
        setErrors({});
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        const formatted = {};

        err.inner.forEach((e) => {
          formatted[e.path] = e.message;
        });

        setErrors(formatted);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const confirmSubmit = () => {
    Modal.confirm({
      title: "Confirm Submission",
      content: "Are you sure you want to register?",
      okText: "Yes",
      cancelText: "No",
      onOk() {
        handleSubmit();
      },
    });
  };

  return (
    <div className="volunteer-register-page">
      <div className="v-register-container">

        {/* Left Panel */}

        <div className="v-register-left">
          <img
            src={logo}
            alt="logo"
            style={{
              width: 140,
              marginBottom: 40,
              background: "white",
              padding: 10,
              borderRadius: 12,
            }}
          />

          <p className="lead-text">Join the Movement</p>

          <h1>
            Volunteer <br /> for Change
          </h1>

          <p className="description">
            Our CSR initiatives are powered by passionate individuals like you.
            By registering as a volunteer you contribute to projects that
            empower communities.
          </p>

          <div className="csr-image-collage">
            <div className="csr-img-card">
              <img src={csrImg1} alt="" />
            </div>

            <div className="csr-img-card">
              <img src={csrImg2} alt="" />
            </div>
          </div>
        </div>

        {/* Right Panel */}

        <div className="v-register-right">
          <h2>Register</h2>
          <p className="subtitle">Become an employee volunteer today</p>

          <Form layout="vertical" form={form} onFinish={confirmSubmit}>

            <Row gutter={24}>

              <Col span={24}>
                <Form.Item label="Full Name">
                  <Input
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  {errors.name && <div className="text-danger">{errors.name}</div>}
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="Email">
                  <Input
                    placeholder="user@shreecement.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {errors.email && <div className="text-danger">{errors.email}</div>}
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Password">
                  <Input.Password
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  {errors.password && (
                    <div className="text-danger">{errors.password}</div>
                  )}
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Phone">
                  <Input
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                  {errors.phone && <div className="text-danger">{errors.phone}</div>}
                </Form.Item>
              </Col>

              {/* STATE */}

              <Col span={12}>
                <Form.Item label="State(s)">
                  <MultiSelect
                    options={stateOptions || []}
                    value={selectedStates}
                    onChange={(states) => {
                      setSelectedStates(states);
                      setSelectedDistricts([]);
                      fetchDistricts(states.map((s) => s.value));
                    }}
                    labelledBy="Select State"
                  />
                  {errors.states && (
                    <div className="text-danger">{errors.states}</div>
                  )}
                </Form.Item>
              </Col>

              {/* DISTRICT */}

              <Col span={12}>
                <Form.Item label="District(s)">
                  <MultiSelect
                    options={districtsOptions || []}
                    value={selectedDistricts}
                    onChange={(districts) => setSelectedDistricts(districts)}
                    labelledBy="Select District"
                  />
                  {errors.districts && (
                    <div className="text-danger">{errors.districts}</div>
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Button type="primary" htmlType="submit" className="reg-btn">
              Register Me
            </Button>

            <div className="login-link-container">
              Already have an account?{" "}
              <span onClick={() => navigate("/")}>Login here</span>
            </div>

          </Form>
        </div>

      </div>
    </div>
  );
}