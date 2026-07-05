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
import { CheckCircleOutlined, CheckOutlined, CloseOutlined, IdcardOutlined, SafetyCertificateOutlined, SaveOutlined } from "@ant-design/icons";
import { FaUser, FaUserCircle, FaInfoCircle } from "react-icons/fa";
import { FaUserTie, FaAddressBook, FaListAlt, FaUniversity } from "react-icons/fa";
import dayjs from "dayjs";

import {
  Popconfirm,
  Typography,
  Select,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Upload,
  Tooltip,
  DatePicker,
  InputNumber,
} from "antd";
import { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { createVolunteerUser } from "../../services/EmpVolunteer-service";
import {
  fetchPublicDistrictsListByStateIds,
  getSubMasterListByMasterSlugApiForUser,
} from "../../services/Master-service";
import { getAllPublicStateApi } from "../../services/State-service";
import { createNgoRegisterUser } from "../../services/Ngo-service";
import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const phoneRegExp = /^[6-9]\d{9}$/; // Indian mobile format

const Schema = Yup.object().shape({
  // company_sub_maser_id: Yup.string()
  //   .required("Company selection is required."),

  name: Yup.string()
    .trim()
    .required("Name is required.")
    .matches(
      /^[A-Za-z\s.'-]+$/,
      "Name must contain only letters and valid characters."
    ),

  email: Yup.string()
    .trim()
    .email("Invalid email format.")
    .matches(
      /^[A-Za-z0-9._%+-]+@coromandelindia\.com$/i,
      "Email must be from @coromandelindia.com domain."
    )
    .required("Email is required."),

  password: Yup.string().when("id", {
    is: (val) => !val, // Only required if ID doesn't exist (create mode)
    then: (schema) =>
      schema
        .required("Password is required.")
        .min(12, "Password must be at least 12 characters.")
        .matches(
          /[A-Z]/,
          "Password must contain at least one uppercase letter."
        )
        .matches(
          /[a-z]/,
          "Password must contain at least one lowercase letter."
        )
        .matches(/\d/, "Password must contain at least one digit.")
        .matches(
          /[@$!%*?&]/,
          "Password must contain at least one special character."
        ),
    otherwise: (schema) => schema.notRequired(),
  }),

  phone: Yup.string()
    .matches(phoneRegExp, "Enter a valid 10-digit phone number.")
    .required("Phone number is required."),

  state_district_blocks: Yup.array()
    .min(1, "At least one state and district entry is required.")
    .of(
      Yup.object().shape({
        state_id: Yup.string().trim().required("State is required."),
        district_id: Yup.string().trim().required("District is required."),
      })
    ),
});

export default function NgoRegister() {
  const navigate = useNavigate();
  const [registerOptions, setRegisterOptions] = useState([]);
  const [statusEntityOptions, setstatusEntityOptions] = useState([
    { value: 1, label: "Pub ltd" },
    { value: 2, label: "Pvt Ltd" },
    { value: 3, label: "firm" },
    { value: 4, label: "individual & HUF" },
  ]);

  const [nameGroupOptions, setnameGroupOptions] = useState([
    { value: 1, label: "Holding company" },
    { value: 2, label: "Subsidiary Company" },
    { value: 3, label: "Associated Company" },
  ]);
  const [form] = Form.useForm();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // id: '',
    // name: '',
    // // company_sub_maser_id: '',
    // email: '',
    // password: '',
    // status: 'active',
    // phone: '',
    // // region_id: '',
    // role_id: '',
    // vertical_id: '',

    status: "active",
    id: "",
    tngo_name: "",
    tngo_data: "",
    tngo_csr_one_res_org: "",
    tngo_csr_one_res_org_doc: null,
    tngo_res_certificate_org: "",
    tngo_amount_received: "",
    tngo_amount_spent: "",
    tngo_res_certificate_org_doc: null,
    tngo_register_id: "",
    tngo_pan_card_org: "",
    tngo_pan_card_org_doc: null,
    tngo_twelve_aa_certificate: "",
    tngo_twelve_aa_certificate_doc: null,
    tngo_eighty_g_certificate_org: "",
    tngo_eighty_g_certificate_org_doc: null,
    tngo_by_law_org_doc: null,
    tngo_memorandum_association_org_doc: null,
    tngo_list_of_exist_gov_body_members: "",
    tngo_list_of_exist_gov_body_members_doc: null,
    tngo_details_of_office_bearers: "",
    tngo_audit_report_org_with_income_tax_return: "",
    tngo_audit_report_org_with_income_tax_return_doc: null,
    tngo_key_uploaded_documents: null,

    // Bank Details
    tngo_bank_account_no: "",
    tngo_bank_account_name: "",
    tngo_bank_name: "",
    tngo_bank_ifsc_code: "",
    tngo_bank_address_of_the_bank: "",
    tngo_cancelled_cheque_doc: null,

    // FCRA Registration
    tngo_fcra_reg_certificate: "",
    tngo_fcra_reg_certificate_doc: null,

    // NITI Aayog DARPAN Registration
    tngo_niti_aayog_darpan_reg: "",
    tngo_niti_aayog_darpan_reg_doc: null,

    // Complete Address (with proof)
    tngo_complete_address_reg_doc_org: "",
    tngo_complete_address_reg_doc_org_doc: null,
    tngo_financial_statements: null,
    tngo_tax_exemption_report: null,
    tngo_third_party_assessment_report: null,

    // ✅ Point of contact details
    tngo_contact_name: "",
    tngo_contact_phone_no: "",
    tngo_contact_email: "",
    tngo_contact_office_address: "",
    tngo_registered_off_address: "",
    tngo_corporate_off_address: null,
    tngo_branches: null,
    tngo_pan: "",

    // ✅ Key person details
    tngo_key_person_name: "",
    tngo_key_person_phone_no: "",
    tngo_key_person_email: "",
    tngo_key_person_office_address: "",
    password: "",
    tngo_name_of_entity: "",
    tngo_status_of_entity_id: "",
    tngo_name_of_group: "",
    tngo_website: "",
  });

  const [fileLists, setFileLists] = useState([]);

  const [loading, setLoading] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [districtsOptions, setDistrictsOptions] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);

  const fetchRegisterSubMasterListByMasterSlug = () => {
    getSubMasterListByMasterSlugApiForUser({ master_slug: "registered" })
      .then((data) => {
        const formattedData = data?.data?.map((item) => ({
          value: item?.tsml_id,
          label: item?.tsml_sub_master_list_name,
        }));

        setRegisterOptions(formattedData || []);
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.originalError || error?.response?.data?.message
        );
      });
  };

  useEffect(() => {
    fetchRegisterSubMasterListByMasterSlug();
  }, []);

  const fetchAllData = async () => {
    try {
      const [stateRes] = await Promise.all([
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
      const res = await fetchPublicDistrictsListByStateIds({
        state_ids: stateIds,
      });
      if (res.status === 1) {
        setDistrictsOptions(
          res.data.map((d) => ({
            label: d.tdl_district_name,
            value: d.tdl_district_id,
            stateId: d.tdl_state_id,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // const handleChange = (selectedOption, { name }) => {

  //   console.log(selectedOption, name);

  //   setFormData({ ...formData, [name]: selectedOption ? selectedOption : '' });
  // };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "state_district_blocks") {
      setSelectedStates(value); // update state multiselect
      fetchDistricts(value.map((s) => s.value)); // load districts
    }

    if (name === "districts") {
      setSelectedDistricts(value); // update district multiselect
    }
  };

  const handleSubmit = async () => {
    const state_district_blocks = selectedDistricts.map((d) => {
      const state = selectedStates.find((s) => s.value === d.stateId);
      return { state_id: state?.value, district_id: d.value };
    });

    const dataToValidate = {
      ...formData,
      state_district_blocks,
      id: formData.id,
    };
    console.log("dataToValidate----- ", dataToValidate);

    const payload = new FormData();

    // Append all fields to FormData
    for (const key in dataToValidate) {
      // console.log('key', key);
      if (dataToValidate[key] !== null) {
        // If it's a file object, make sure it's a File not just uid
        if (key === "tngo_csr_one_res_org_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_res_certificate_org_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_pan_card_org_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_twelve_aa_certificate_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_eighty_g_certificate_org_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_memorandum_association_org_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_list_of_exist_gov_body_members_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_cancelled_cheque_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_fcra_reg_certificate_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_niti_aayog_darpan_reg_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_complete_address_reg_doc_org_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_audit_report_org_with_income_tax_return_doc") {
          if (Array.isArray(dataToValidate[key])) {
            dataToValidate[key].forEach((file) => {
              if (file?.originFileObj) {
                payload.append(
                  "tngo_audit_report_org_with_income_tax_return_doc",
                  file.originFileObj
                );
              }
            });
          }
        } else if (key === "tngo_key_uploaded_documents") {
          if (Array.isArray(dataToValidate[key])) {
            dataToValidate[key].forEach((file) => {
              if (file?.originFileObj) {
                payload.append(
                  "tngo_key_uploaded_documents",
                  file.originFileObj
                );
              }
            });
          }
        } else if (key === "state_district_blocks") {
          payload.append(key, JSON.stringify(dataToValidate[key]));
        } else {
          payload.append(key, dataToValidate[key]);
        }
      }
    }

    try {
      // await Schema.validate(dataToValidate, { abortEarly: false });
      const res = await createNgoRegisterUser(payload);
      if (res.status === 1) {
        toast.success(res.message);

        // ✅ Reset form and states
        form.resetFields();
        setFormData({
          id: "",
          name: "",
          // company_sub_maser_id: '',
          email: "",
          password: "",
          status: "active",
          phone: "",
          role_id: "",
          // region_id: '',
          vertical_id: "",
        });
        setSelectedStates([]);
        setSelectedDistricts([]);
        setErrors({});
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.log("err----------- ", err);

      if (err.name === "ValidationError") {
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

      <div
        className="register-container ngo-registration-section" id="ngo-registration-section"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div class="curve"></div>

        <div className="register-box ">
          <div className="ngo-registration-title">
            <div className="left-icon">
              <img src="src/assets/images/ngo-img.png" alt="" />
            </div>
            <div>
              <h6>Welcome to</h6>
              <h2>NGO Registration</h2>
            </div>
          </div>
          <div className="register-body"
            style={{
              maxHeight: "65vh",
              padding: "20px",
            }}
          >
            <div className="register-content">
              <Form layout="vertical" form={form}>

                <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">

                  <li className="nav-item" role="presentation">
                    <button className="nav-link key-pill active"
                      id="basic-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#basic"
                      type="button"
                      role="tab">
                      <span className="icon-circle"><i className="fa-solid fa-user"></i></span>
                      <span className="text">Basic Information</span>
                    </button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button className="nav-link key-pill"
                      id="bank-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#bank"
                      type="button"
                      role="tab">
                      <span className="icon-circle"><i className="fa-solid fa-building-columns"></i></span>
                      <span className="text">Bank Details</span>
                    </button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button className="nav-link key-pill"
                      id="fcra-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#fcra"
                      type="button"
                      role="tab">
                      <span className="icon-circle"><i className="fa-solid fa-file-shield"></i></span>
                      <span className="text">FCRA Details</span>
                    </button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button className="nav-link key-pill"
                      id="contact-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#contact"
                      type="button"
                      role="tab">
                      <span className="icon-circle"><i className="fa-solid fa-phone"></i></span>
                      <span className="text">Contact Details</span>
                    </button>
                  </li>

                  <li className="nav-item" role="presentation">
                    <button className="nav-link key-pill"
                      id="keyperson-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#keyperson"
                      type="button"
                      role="tab">
                      <span className="icon-circle"><i className="fa-solid fa-users"></i></span>
                      <span className="text">Key Person Details</span>
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link key-pill"
                      id="kyc-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#kyc"
                      type="button"
                      role="tab"
                    >
                      <span className="icon-circle">
                        <i className="fa-solid fa-users"></i>
                      </span>
                      <span className="text">KYC</span>
                    </button>
                  </li>

                </ul>


                <div className="tab-content" id="pills-tabContent">

                  <div className="tab-pane fade show active" id="basic" role="tabpanel">
                    <Row gutter={[12, 2]} className="neg-rows">
                      <Col span={8}>
                        <Form.Item
                          label="Name of the NGO"
                          required >
                          <Input placeholder="Name of the NGO"
                            value={formData.tngo_name}
                            onChange={(e) =>
                              handleChange("tngo_name", e.target.value)
                            }
                          />
                          {errors.tngo_name && (
                            <div className="text-danger">{errors.tngo_name}</div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label="Date Of Registration"
                          required
                          validateStatus={errors.tngo_date ? "error" : ""}
                          help={errors.tngo_date}
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            value={
                              formData.tngo_date
                                ? dayjs(formData.tngo_date, "YYYY-MM-DD")
                                : null
                            }
                            onChange={(date, dateString) =>
                              handleChange("tngo_date", dateString)
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="CSR 1 registration document of the Org"
                          required
                        >
                          <Input placeholder="CSR 1 registration document of the organization"
                            value={formData.tngo_csr_one_res_org}
                            onChange={(e) =>
                              handleChange("tngo_csr_one_res_org", e.target.value)
                            }
                          />
                          {errors.tngo_csr_one_res_org && (
                            <div className="text-danger">
                              {errors.tngo_csr_one_res_org}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label={
                            <span>
                              Upload CSR 1 registration document of the Org
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 4,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          validateStatus={
                            errors?.tngo_csr_one_res_org_doc ? "error" : ""
                          }
                          help={errors?.tngo_csr_one_res_org_doc}
                        >
                          <Upload
                            fileList={fileLists?.["tngo_csr_one_res_org_doc"] || []}
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_csr_one_res_org_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_csr_one_res_org_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="Registration certificate of the Org"
                          className="label-two"
                          required
                        >
                          <Input placeholder="Registration certificate of the organization"
                            value={formData.tngo_res_certificate_org}
                            onChange={(e) =>
                              handleChange("tngo_res_certificate_org", e.target.value)
                            }
                          />
                          {errors.tngo_res_certificate_org && (
                            <div className="text-danger">
                              {errors.tngo_res_certificate_org}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label={
                            <span>
                              Upload Registration certificate of the Org
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 4,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          validateStatus={
                            errors?.tngo_res_certificate_org_doc ? "error" : ""
                          }
                          help={errors?.tngo_res_certificate_org_doc}
                        >
                          <Upload
                            fileList={
                              fileLists?.["tngo_res_certificate_org_doc"] || []
                            }
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_res_certificate_org_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_res_certificate_org_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="Amount received in last three years (₹ L)"
                          required
                        >
                          <InputNumber placeholder="Amount received in last three years (In Rs. Lacs)"
                            style={{ width: "100%" }}
                            value={formData.tngo_amount_received}
                            onChange={(e) =>
                              handleChange("tngo_amount_received", e.target.value)
                            }
                          />
                          {errors.tngo_amount_received && (
                            <div className="text-danger">
                              {errors.tngo_amount_received}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label="Amount spent in last three years (₹ L)"
                          required
                        >
                          <InputNumber placeholder="Amount spent in last three years (In Rs. Lacs)"
                            style={{ width: "100%" }}
                            value={formData.tngo_amount_spent}
                            onChange={(e) =>
                              handleChange("tngo_amount_spent", e.target.value)
                            }
                          />
                          {errors.tngo_amount_spent && (
                            <div className="text-danger">
                              {errors.tngo_amount_spent}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>

                        <label htmlFor="tngo_register_id" className="form-label">
                          <span className="text-danger">*</span> Register
                        </label>
                        <Select
                          placeholder="Select Register"
                          id="tngo_register_id"
                          name="tngo_register_id"
                          value={registerOptions.find(
                            ({ value }) => value == formData?.tngo_register_id
                          )}
                          onChange={(value) =>
                            handleChange("tngo_register_id", value)
                          }
                          style={{ width: "100%" }}
                          options={registerOptions}
                        />
                        {errors?.tngo_register_id && (
                          <div className="error text-danger">
                            {errors.tngo_register_id}
                          </div>
                        )}
                      </Col>
                      <Col span={8}>
                        <Form.Item label="PAN card of the Org" required>
                          <Input placeholder="PAN card of the organization"
                            value={formData.tngo_pan_card_org}
                            onChange={(e) =>
                              handleChange("tngo_pan_card_org", e.target.value)
                            }
                          />
                          {errors.tngo_pan_card_org && (
                            <div className="text-danger">
                              {errors.tngo_pan_card_org}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label={
                            <span>
                              Upload PAN card of the Org
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 4,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          validateStatus={
                            errors?.tngo_pan_card_org_doc ? "error" : ""
                          }
                          help={errors?.tngo_pan_card_org_doc}
                        >
                          <Upload
                            fileList={fileLists?.["tngo_pan_card_org_doc"] || []}
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_pan_card_org_doc: latestFile,
                              }));
                              handleChange("tngo_pan_card_org_doc", latestFile?.[0]);
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="12AA certificate (renewed)" required>
                          <Input placeholder="12AA certificate (renewed)"
                            value={formData.tngo_twelve_aa_certificate}
                            onChange={(e) =>
                              handleChange(
                                "tngo_twelve_aa_certificate",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_twelve_aa_certificate && (
                            <div className="text-danger">
                              {errors.tngo_twelve_aa_certificate}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label={
                            <span>
                              Upload 12AA certificate (renewed)
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 4,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          className="label-two"
                          required
                          validateStatus={
                            errors?.tngo_twelve_aa_certificate_doc ? "error" : ""
                          }
                          help={errors?.tngo_twelve_aa_certificate_doc}
                        >
                          <Upload
                            fileList={
                              fileLists?.["tngo_twelve_aa_certificate_doc"] || []
                            }
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_twelve_aa_certificate_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_twelve_aa_certificate_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="80G certificate of the Org (renewed)"
                          className="label-two"
                          required
                        >
                          <Input placeholder="80G certificate of the organization (renewed)"
                            value={formData.tngo_eighty_g_certificate_org}
                            onChange={(e) =>
                              handleChange(
                                "tngo_eighty_g_certificate_org",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_eighty_g_certificate_org && (
                            <div className="text-danger">
                              {errors.tngo_eighty_g_certificate_org}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label={
                            <span>
                              Upload 80G certificate of the Org (renewed)
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 4,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          validateStatus={
                            errors?.tngo_eighty_g_certificate_org_doc ? "error" : ""
                          }
                          help={errors?.tngo_eighty_g_certificate_org_doc}
                        >
                          <Upload
                            fileList={
                              fileLists?.["tngo_eighty_g_certificate_org_doc"] || []
                            }
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_eighty_g_certificate_org_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_eighty_g_certificate_org_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label={
                            <span>
                              Upload Bye laws of the Org
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 4,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          className="label-two"
                          validateStatus={errors?.tngo_by_law_org_doc ? "error" : ""}
                          help={errors?.tngo_by_law_org_doc}
                        >
                          <Upload
                            fileList={fileLists?.["tngo_by_law_org_doc"] || []}
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_by_law_org_doc: latestFile,
                              }));
                              handleChange("tngo_by_law_org_doc", latestFile?.[0]);
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label={
                            <span>
                              Upload Memorandum of Association of the Org
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 4,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          validateStatus={
                            errors?.tngo_memorandum_association_org_doc ? "error" : ""
                          }
                          help={errors?.tngo_memorandum_association_org_doc}
                        >
                          <Upload
                            fileList={
                              fileLists?.["tngo_memorandum_association_org_doc"] || []
                            }
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_memorandum_association_org_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_memorandum_association_org_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="List of existing Governing Body Members / trusteers with PAN card details"
                          required
                        >
                          <Input placeholder="List of existing Governing Body Members / trusteers with PAN card details"
                            value={formData.tngo_list_of_exist_gov_body_members}
                            onChange={(e) =>
                              handleChange(
                                "tngo_list_of_exist_gov_body_members",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_list_of_exist_gov_body_members && (
                            <div className="text-danger">
                              {errors.tngo_list_of_exist_gov_body_members}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label={
                            <span>
                              Upload List of existing Governing Body Members /
                              trusteers with PAN card details
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 4,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required className="label-height"
                          validateStatus={
                            errors?.tngo_list_of_exist_gov_body_members_doc
                              ? "error"
                              : ""
                          }
                          help={errors?.tngo_list_of_exist_gov_body_members_doc}
                        >
                          <Upload
                            fileList={
                              fileLists?.[
                              "tngo_list_of_exist_gov_body_members_doc"
                              ] || []
                            }
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_list_of_exist_gov_body_members_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_list_of_exist_gov_body_members_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="Details of office bearers / responsible person of the Org" className="label-three"
                          required
                        >
                          <Input placeholder="Details of office bearers / responsible person of the organization"
                            value={formData.tngo_details_of_office_bearers}
                            onChange={(e) =>
                              handleChange(
                                "tngo_details_of_office_bearers",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_details_of_office_bearers && (
                            <div className="text-danger">
                              {errors.tngo_details_of_office_bearers}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <Form.Item
                          label="Audit Report of the Org with income tax returns for three immediate financial years" className="label-height"
                          required
                        >
                          <Input placeholder="Audit Report of the organization with income tax returns for three immediate financial years"
                            value={
                              formData.tngo_audit_report_org_with_income_tax_return
                            }
                            onChange={(e) =>
                              handleChange(
                                "tngo_audit_report_org_with_income_tax_return",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_audit_report_org_with_income_tax_return && (
                            <div className="text-danger">
                              {errors.tngo_audit_report_org_with_income_tax_return}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={8}>
                        <label
                          htmlFor="tngo_audit_report_org_with_income_tax_return_doc"
                          className="form-label text-left"
                        >
                          Upload Audit Report of the Org with income tax
                          returns for three immediate financial years
                          {/* <span className="text-danger"> *</span> */}
                          <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                            <InfoCircleOutlined
                              style={{
                                color: "#1890ff",
                                marginLeft: 3,
                                cursor: "pointer",
                              }}
                            />
                          </Tooltip>{" "}
                        </label>


                        <div>
                          <Upload
                            fileList={
                              fileLists?.[
                              "tngo_audit_report_org_with_income_tax_return_doc"
                              ] || []
                            }
                            multiple
                            beforeUpload={() => false}
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_audit_report_org_with_income_tax_return_doc:
                                  fileList,
                              }));
                              handleChange(
                                "tngo_audit_report_org_with_income_tax_return_doc",
                                fileList
                              );
                            }}
                            showUploadList={{ showRemoveIcon: false }}
                            itemRender={(originNode, file, currFileList) => {
                              return (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    marginBottom: 6,
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 6,
                                    backgroundColor: "#fff",
                                    transition: "background-color 0.2s",
                                    cursor: "default",
                                  }}
                                  onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f5f5f5")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#fff")
                                  }
                                >
                                  <div style={{ flex: 1, fontSize: 14 }}>
                                    {originNode}
                                  </div>
                                  <Popconfirm
                                    title="Are you sure to delete this?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={async () => {
                                      const isDeleted = await deleteFile(file);
                                      if (isDeleted) {
                                        const updatedList = (
                                          currFileList || []
                                        ).filter((f) => f.uid !== file.uid);
                                        const latestFile = updatedList?.slice(-1);
                                        setFileLists((prev) => ({
                                          ...prev,
                                          tngo_audit_report_org_with_income_tax_return_doc:
                                            updatedList,
                                        }));
                                        handleChange(
                                          "tngo_audit_report_org_with_income_tax_return_doc",
                                          latestFile?.[0]
                                        );
                                      }
                                    }}
                                  >
                                    {/* <DeleteOutlined
                            style={{
                              color: "red",
                              marginLeft: 8,
                              cursor: "pointer",
                            }}
                          /> */}
                                  </Popconfirm>
                                </div>
                              );
                            }}
                          >
                            <Button
                              style={{ marginBottom: 0 }}
                              icon={<UploadOutlined />}
                            >
                              Choose File
                            </Button>
                          </Upload>
                        </div>

                        {errors?.tngo_audit_report_org_with_income_tax_return_doc && (
                          <div className="error text-danger">
                            {errors?.tngo_audit_report_org_with_income_tax_return_doc}
                          </div>
                        )}
                      </Col>

                    </Row>
                    <Row gutter={[12, 2]} className="">
                      <Col span={4} className="ms-auto">
                        <button
                          className="next-btn"
                          type="button"
                          onClick={() => {
                            const tab = document.querySelector('#bank-tab');
                            if (tab) tab.click();
                          }}
                        >
                          Next <i className="fa-solid fa-arrow-right"></i>
                        </button>


                      </Col>
                    </Row>
                  </div>

                  <div className="tab-pane fade" id="bank" role="tabpanel">
                    <Row gutter={[12, 2]}>
                      <Col span={8}>
                        <Form.Item label="Account number" required>
                          <Input
                            value={formData.tngo_bank_account_no}
                            onChange={(e) =>
                              handleChange("tngo_bank_account_no", e.target.value)
                            }
                          />
                          {errors.tngo_bank_account_no && (
                            <div className="text-danger">
                              {errors.tngo_bank_account_no}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Account name" required>
                          <Input
                            value={formData.tngo_bank_account_name}
                            onChange={(e) =>
                              handleChange("tngo_bank_account_name", e.target.value)
                            }
                          />
                          {errors.tngo_bank_account_name && (
                            <div className="text-danger">
                              {errors.tngo_bank_account_name}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Bank Name" required>
                          <Input
                            value={formData.tngo_bank_name}
                            onChange={(e) =>
                              handleChange("tngo_bank_name", e.target.value)
                            }
                          />
                          {errors.tngo_bank_name && (
                            <div className="text-danger">
                              {errors.tngo_bank_name}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="IFSC Code" required>
                          <Input
                            value={formData.tngo_bank_ifsc_code}
                            onChange={(e) =>
                              handleChange("tngo_bank_ifsc_code", e.target.value)
                            }
                          />
                          {errors.tngo_bank_ifsc_code && (
                            <div className="text-danger">
                              {errors.tngo_bank_ifsc_code}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="Address of the bank" required>
                          <Input.TextArea
                            rows={1} // you can increase/decrease rows
                            value={formData.tngo_bank_address_of_the_bank}
                            onChange={(e) =>
                              handleChange(
                                "tngo_bank_address_of_the_bank",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_bank_address_of_the_bank && (
                            <div className="text-danger">
                              {errors.tngo_bank_address_of_the_bank}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label={
                            <span>
                              Upload Cancelled Cheque
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 8,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          validateStatus={
                            errors?.tngo_cancelled_cheque_doc ? "error" : ""
                          }
                          help={errors?.tngo_cancelled_cheque_doc}
                        >
                          <Upload
                            fileList={
                              fileLists?.["tngo_cancelled_cheque_doc"] || []
                            }
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_cancelled_cheque_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_cancelled_cheque_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={[12, 2]} className="">
                      <Col span={3}>
                        <div className="text-left">
                          <button
                            className="next-btn"
                            type="button"
                            onClick={() => {
                              const tab = document.querySelector('#basic-tab');
                              if (tab) tab.click();
                            }}
                          >
                            <i className="fa-solid fa-arrow-left"></i> Back
                          </button>
                        </div>
                      </Col>
                      <Col span={3} className="ms-auto">
                        <button
                          className="next-btn"
                          type="button"
                          onClick={() => {
                            const tab = document.querySelector('#fcra-tab');
                            if (tab) tab.click();
                          }}
                        >
                          Next <i className="fa-solid fa-arrow-right"></i>
                        </button>


                      </Col>
                    </Row>
                  </div>

                  <div className="tab-pane fade" id="fcra" role="tabpanel">
                    {/* FCRA registration certificate */}
                    <Row gutter={[12, 2]}>
                      <Col span={12}>
                        <Form.Item label="FCRA registration certificate" required>
                          <Input
                            value={formData.tngo_fcra_reg_certificate}
                            onChange={(e) =>
                              handleChange(
                                "tngo_fcra_reg_certificate",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_fcra_reg_certificate && (
                            <div className="text-danger">
                              {errors.tngo_fcra_reg_certificate}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              Upload FCRA registration certificate
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 1,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          validateStatus={
                            errors?.tngo_fcra_reg_certificate_doc ? "error" : ""
                          }
                          help={errors?.tngo_fcra_reg_certificate_doc}
                        >
                          <Upload
                            fileList={
                              fileLists?.["tngo_fcra_reg_certificate_doc"] || []
                            }
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_fcra_reg_certificate_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_fcra_reg_certificate_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                    {/* NITI Aayog DARPAN portal registration */}
                    <Row gutter={[12, 2]}>
                      <Col span={12}>
                        <Form.Item
                          label="NITI Aayog DARPAN portal registration"
                          required
                        >
                          <Input
                            value={formData.tngo_niti_aayog_darpan_reg}
                            onChange={(e) =>
                              handleChange(
                                "tngo_niti_aayog_darpan_reg",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_niti_aayog_darpan_reg && (
                            <div className="text-danger">
                              {errors.tngo_niti_aayog_darpan_reg}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              Upload NITI Aayog DARPAN portal registration
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 8,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          validateStatus={
                            errors?.tngo_niti_aayog_darpan_reg_doc ? "error" : ""
                          }
                          help={errors?.tngo_niti_aayog_darpan_reg_doc}
                        >
                          <Upload
                            fileList={
                              fileLists?.["tngo_niti_aayog_darpan_reg_doc"] || []
                            }
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_niti_aayog_darpan_reg_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_niti_aayog_darpan_reg_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                    {/* Complete address as per registration document of the organization / in case of any change in the address please provide the valid address with documentary proof. */}
                    <Row gutter={[12, 2]}>
                      <Col span={12}>
                        <Form.Item
                          label="Complete address as per registration document of the organization / in case of any change in the address please provide the valid address with documentary proof."
                          required
                        >
                          <Input
                            value={formData.tngo_complete_address_reg_doc_org}
                            onChange={(e) =>
                              handleChange(
                                "tngo_complete_address_reg_doc_org",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_complete_address_reg_doc_org && (
                            <div className="text-danger">
                              {errors.tngo_complete_address_reg_doc_org}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label={
                            <span>
                              Upload Complete address as per registration document of
                              the organization / in case of any change in the address
                              please provide the valid address with documentary proof.
                              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                <InfoCircleOutlined
                                  style={{
                                    color: "#1890ff",
                                    marginLeft: 8,
                                    cursor: "pointer",
                                  }}
                                />
                              </Tooltip>
                            </span>
                          }
                          required
                          validateStatus={
                            errors?.tngo_complete_address_reg_doc_org_doc
                              ? "error"
                              : ""
                          }
                          help={errors?.tngo_complete_address_reg_doc_org_doc}
                        >
                          <Upload
                            fileList={
                              fileLists?.["tngo_complete_address_reg_doc_org_doc"] ||
                              []
                            }
                            beforeUpload={() => false}
                            multiple={false} // ✅ Single file upload only
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              const latestFile = fileList?.slice(-1);
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_complete_address_reg_doc_org_doc: latestFile,
                              }));
                              handleChange(
                                "tngo_complete_address_reg_doc_org_doc",
                                latestFile?.[0]
                              );
                            }}
                            showUploadList={{
                              showRemoveIcon: true, // ✅ allow removal directly
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Choose File</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[12, 2]} className="">
                         <Col span={3}>
                        <div className="text-left">
                          <button
                            className="next-btn"
                            type="button"
                            onClick={() => {
                              const tab = document.querySelector('#bank-tab');
                              if (tab) tab.click();
                            }}
                          >
                            <i className="fa-solid fa-arrow-left"></i> Back
                          </button>
                        </div>
                      </Col>
                      <Col span={3} className="ms-auto">
                        <button
                          className="next-btn"
                          type="button"
                          onClick={() => {
                            const tab = document.querySelector('#contact-tab');
                            if (tab) tab.click();
                          }}
                        >
                          Next <i className="fa-solid fa-arrow-right"></i>
                        </button>


                      </Col>
                    </Row>
                  </div>

                  <div className="tab-pane fade" id="contact" role="tabpanel">
                    <Row gutter={[12, 2]}>
                      <Col span={12}>
                        <Form.Item label="Name" required>
                          <Input
                            value={formData.tngo_contact_name}
                            onChange={(e) =>
                              handleChange("tngo_contact_name", e.target.value)
                            }
                          />
                          {errors.tngo_contact_name && (
                            <div className="text-danger">
                              {errors.tngo_contact_name}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item label="E-mail" required>
                          <Input
                            value={formData.tngo_contact_email}
                            onChange={(e) =>
                              handleChange("tngo_contact_email", e.target.value)
                            }
                          />
                          {errors.tngo_contact_email && (
                            <div className="text-danger">
                              {errors.tngo_contact_email}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Phone Number" required>
                          <Input
                            value={formData.tngo_contact_phone_no}
                            onChange={(e) =>
                              handleChange("tngo_contact_phone_no", e.target.value)
                            }
                          />
                          {errors.tngo_contact_phone_no && (
                            <div className="text-danger">
                              {errors.tngo_contact_phone_no}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item label="Office Address" required>
                          <Input
                            value={formData.tngo_contact_office_address}
                            onChange={(e) =>
                              handleChange(
                                "tngo_contact_office_address",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_contact_office_address && (
                            <div className="text-danger">
                              {errors.tngo_contact_office_address}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={[12, 2]} className="">
                       <Col span={3}>
                        <div className="text-left">
                          <button
                            className="next-btn"
                            type="button"
                            onClick={() => {
                              const tab = document.querySelector('#fcra-tab');
                              if (tab) tab.click();
                            }}
                          >
                            <i className="fa-solid fa-arrow-left"></i> Back
                          </button>
                        </div>
                      </Col>
                      <Col span={3} className="ms-auto">
                        <button
                          className="next-btn"
                          type="button"
                          onClick={() => {
                            const tab = document.querySelector('#keyperson-tab');
                            if (tab) tab.click();
                          }}
                        >
                          Next <i className="fa-solid fa-arrow-right"></i>
                        </button>


                      </Col>
                    </Row>
                  </div>

                  <div className="tab-pane fade" id="keyperson" role="tabpanel">
                    <Row gutter={[12, 2]}>
                      <Col span={12}>
                        <Form.Item label="Name" required>
                          <Input
                            value={formData.tngo_key_person_name}
                            onChange={(e) =>
                              handleChange("tngo_key_person_name", e.target.value)
                            }
                          />
                          {errors.tngo_key_person_name && (
                            <div className="text-danger">
                              {errors.tngo_key_person_name}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Phone Number" required>
                          <Input
                            value={formData.tngo_key_person_phone_no}
                            onChange={(e) =>
                              handleChange(
                                "tngo_key_person_phone_no",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_key_person_phone_no && (
                            <div className="text-danger">
                              {errors.tngo_key_person_phone_no}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="E-mail" required>
                          <Input
                            value={formData.tngo_key_person_email}
                            onChange={(e) =>
                              handleChange("tngo_key_person_email", e.target.value)
                            }
                          />
                          {errors.tngo_key_person_email && (
                            <div className="text-danger">
                              {errors.tngo_key_person_email}
                            </div>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Office Address" required>
                          <Input
                            value={formData.tngo_key_person_office_address}
                            onChange={(e) =>
                              handleChange(
                                "tngo_key_person_office_address",
                                e.target.value
                              )
                            }
                          />
                          {errors.tngo_key_person_office_address && (
                            <div className="text-danger">
                              {errors.tngo_key_person_office_address}
                            </div>
                          )}
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <label
                          htmlFor="tngo_key_uploaded_documents"
                          className="form-label"
                        >
                          Upload Key Person Documents
                          {/* <span className="text-danger"> *</span> */}
                          <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                            <InfoCircleOutlined
                              style={{
                                color: "#1890ff",
                                marginLeft: 4,
                                cursor: "pointer",
                              }}
                            />
                          </Tooltip>{" "}
                        </label>


                        <div
                        >
                          <Upload
                            fileList={
                              fileLists?.["tngo_key_uploaded_documents"] || []
                            }
                            multiple
                            beforeUpload={() => false}
                            accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                            onChange={({ fileList }) => {
                              setFileLists((prev) => ({
                                ...prev,
                                tngo_key_uploaded_documents: fileList,
                              }));
                              handleChange("tngo_key_uploaded_documents", fileList);
                            }}
                            showUploadList={{ showRemoveIcon: false }}
                            itemRender={(originNode, file, currFileList) => {
                              return (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    marginBottom: 0,
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 6,
                                    backgroundColor: "#fff",
                                    transition: "background-color 0.2s",
                                    cursor: "default",
                                  }}
                                  onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f5f5f5")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#fff")
                                  }
                                >
                                  <div style={{ flex: 1, fontSize: 14 }}>
                                    {originNode}
                                  </div>
                                  <Popconfirm
                                    title="Are you sure to delete this?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={async () => {
                                      const isDeleted = await deleteFile(file);
                                      if (isDeleted) {
                                        const updatedList = (
                                          currFileList || []
                                        ).filter((f) => f.uid !== file.uid);
                                        const latestFile = updatedList?.slice(-1);
                                        setFileLists((prev) => ({
                                          ...prev,
                                          tngo_key_uploaded_documents: updatedList,
                                        }));
                                        handleChange(
                                          "tngo_key_uploaded_documents",
                                          latestFile?.[0]
                                        );
                                      }
                                    }}
                                  >
                                    {/* <DeleteOutlined
                            style={{
                              color: "red",
                              marginLeft: 8,
                              cursor: "pointer",
                            }}
                          /> */}
                                  </Popconfirm>
                                </div>
                              );
                            }}
                          >
                            <Button
                              style={{ marginBottom: 4 }}
                              icon={<UploadOutlined />}
                            >
                              Choose File
                            </Button>
                          </Upload>
                        </div>

                        {errors?.tngo_key_uploaded_documents && (
                          <div className="error text-danger">
                            {errors?.tngo_key_uploaded_documents}
                          </div>
                        )}
                      </Col>
                    </Row>
                    <Row gutter={[12, 2]} className="mt-3">
                      <Col span={3}>
                        <div className="text-left">
                          <button
                            className="next-btn"
                            type="button"
                            onClick={() => {
                              const tab = document.querySelector('#contact-tab');
                              if (tab) tab.click();
                            }}
                          >
                            <i className="fa-solid fa-arrow-left"></i> Back
                          </button>
                        </div>
                      </Col>
                      <Col span={3} className="ms-auto">
                        <button
                          className="next-btn"
                          type="button"
                          onClick={() => {
                            const tab = document.querySelector('#kyc-tab');
                            if (tab) tab.click();
                          }}
                        >
                          Next <i className="fa-solid fa-arrow-right"></i>
                        </button>


                      </Col>
                    </Row>
                  </div>
                  <div className="tab-pane fade" id="kyc" role="tabpanel">
                    <div className="card-body">
                      <Row gutter={[12, 2]}>
                        <Col span={8}>
                          <Form.Item label="Name of the entity/individual" required>
                            <Input
                              value={formData.tngo_name_of_entity}
                              onChange={(e) =>
                                handleChange("tngo_name_of_entity", e.target.value)
                              }
                            />
                            {errors.tngo_name_of_entity && (
                              <div className="text-danger">
                                {errors.tngo_name_of_entity}
                              </div>
                            )}
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <label
                            htmlFor="tngo_status_of_entity_id"
                            className="form-label"
                          >
                            <span className="text-danger">*</span> Status of Entity
                          </label>
                          <Select
                            placeholder="Select Status of Entity"
                            id="tngo_status_of_entity_id"
                            name="tngo_status_of_entity_id"
                            value={statusEntityOptions.find(
                              ({ value }) =>
                                value == formData?.tngo_status_of_entity_id
                            )}
                            onChange={(value) =>
                              handleChange("tngo_status_of_entity_id", value)
                            }
                            style={{ width: "100%" }}
                            options={statusEntityOptions}
                          />
                          {errors?.tngo_status_of_entity_id && (
                            <div className="error text-danger">
                              {errors.tngo_status_of_entity_id}
                            </div>
                          )}
                        </Col>

                        <Col span={8}>
                          <Form.Item label="Registered Office Address" required>
                            <Input
                              value={formData.tngo_registered_off_address}
                              onChange={(e) =>
                                handleChange(
                                  "tngo_registered_off_address",
                                  e.target.value
                                )
                              }
                            />
                            {errors.tngo_registered_off_address && (
                              <div className="text-danger">
                                {errors.tngo_registered_off_address}
                              </div>
                            )}
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item label="Corporate Office Address" required>
                            <Input
                              value={formData.tngo_corporate_off_address}
                              onChange={(e) =>
                                handleChange(
                                  "tngo_corporate_off_address",
                                  e.target.value
                                )
                              }
                            />
                            {errors.tngo_corporate_off_address && (
                              <div className="text-danger">
                                {errors.tngo_corporate_off_address}
                              </div>
                            )}
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item label="Branches" required>
                            <Input
                              value={formData.tngo_branches}
                              onChange={(e) =>
                                handleChange("tngo_branches", e.target.value)
                              }
                            />
                            {errors.tngo_branches && (
                              <div className="text-danger">
                                {errors.tngo_branches}
                              </div>
                            )}
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item
                            label={
                              <span>
                                Financial statements for the last 3years<Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                  <InfoCircleOutlined
                                    style={{
                                      color: "#1890ff",
                                      marginLeft: 1,
                                      cursor: "pointer",
                                    }}
                                  />
                                </Tooltip>
                              </span>
                            }
                            required
                            validateStatus={
                              errors?.tngo_financial_statements ? "error" : ""
                            }
                            help={errors?.tngo_financial_statements}
                          >
                            <Upload
                              fileList={
                                fileLists?.["tngo_financial_statements"] || []
                              }
                              beforeUpload={() => false}
                              multiple={false} // ✅ Single file upload only
                              accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                              onChange={({ fileList }) => {
                                const latestFile = fileList?.slice(-1);
                                setFileLists((prev) => ({
                                  ...prev,
                                  tngo_financial_statements: latestFile,
                                }));
                                handleChange(
                                  "tngo_financial_statements",
                                  latestFile?.[0]
                                );
                              }}
                              showUploadList={{
                                showRemoveIcon: true, // ✅ allow removal directly
                              }}
                            >
                              <Button icon={<UploadOutlined />}>Choose File</Button>
                            </Upload>
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <label htmlFor="tngo_name_of_group" className="form-label">
                            <span className="text-danger">*</span>Name of the group
                          </label>
                          <Select
                            placeholder="Select Name of the group"
                            id="tngo_name_of_group"
                            name="tngo_name_of_group"
                            value={nameGroupOptions.find(
                              ({ value }) => value == formData?.tngo_name_of_group
                            )}
                            onChange={(value) =>
                              handleChange("tngo_name_of_group", value)
                            }
                            style={{ width: "100%" }}
                            options={nameGroupOptions}
                          />
                          {errors?.tngo_name_of_group && (
                            <div className="error text-danger">
                              {errors.tngo_name_of_group}
                            </div>
                          )}
                        </Col>
                        <Col span={8}>
                          <Form.Item label="PAN" required>
                            <Input
                              value={formData.tngo_pan}
                              onChange={(e) =>
                                handleChange("tngo_pan", e.target.value)
                              }
                            />
                            {errors.tngo_pan && (
                              <div className="text-danger">{errors.tngo_pan}</div>
                            )}
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item label="GST Number" required>
                            <Input
                              value={formData.tngo_gst}
                              onChange={(e) =>
                                handleChange("tngo_gst", e.target.value)
                              }
                            />
                            {errors.tngo_gst && (
                              <div className="text-danger">{errors.tngo_gst}</div>
                            )}
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item
                            label={
                              <span>
                                Tax exemption report (if any)
                                <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                  <InfoCircleOutlined
                                    style={{
                                      color: "#1890ff",
                                      marginLeft: 8,
                                      cursor: "pointer",
                                    }}
                                  />
                                </Tooltip>
                              </span>
                            }
                            required
                            validateStatus={
                              errors?.tngo_tax_exemption_report ? "error" : ""
                            }
                            help={errors?.tngo_tax_exemption_report}
                          >
                            <Upload
                              fileList={
                                fileLists?.["tngo_tax_exemption_report"] || []
                              }
                              beforeUpload={() => false}
                              multiple={false} // ✅ Single file upload only
                              accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                              onChange={({ fileList }) => {
                                const latestFile = fileList?.slice(-1);
                                setFileLists((prev) => ({
                                  ...prev,
                                  tngo_tax_exemption_report: latestFile,
                                }));
                                handleChange(
                                  "tngo_tax_exemption_report",
                                  latestFile?.[0]
                                );
                              }}
                              showUploadList={{
                                showRemoveIcon: true, // ✅ allow removal directly
                              }}
                            >
                              <Button icon={<UploadOutlined />}>Choose File</Button>
                            </Upload>
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item
                            label={
                              <span>
                                Third Party Assessment Report (If any)
                                <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                                  <InfoCircleOutlined
                                    style={{
                                      color: "#1890ff",
                                      marginLeft: 3,
                                      cursor: "pointer",
                                    }}
                                  />
                                </Tooltip>
                              </span>
                            }
                            required
                            validateStatus={
                              errors?.tngo_third_party_assessment_report ? "error" : ""
                            }
                            help={errors?.tngo_third_party_assessment_report}
                          >
                            <Upload
                              fileList={
                                fileLists?.["tngo_third_party_assessment_report"] || []
                              }
                              beforeUpload={() => false}
                              multiple={false} // ✅ Single file upload only
                              accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                              onChange={({ fileList }) => {
                                const latestFile = fileList?.slice(-1);
                                setFileLists((prev) => ({
                                  ...prev,
                                  tngo_third_party_assessment_report: latestFile,
                                }));
                                handleChange(
                                  "tngo_third_party_assessment_report",
                                  latestFile?.[0]
                                );
                              }}
                              showUploadList={{
                                showRemoveIcon: true, // ✅ allow removal directly
                              }}
                            >
                              <Button icon={<UploadOutlined />}>Choose File</Button>
                            </Upload>
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item label="Website Details" required>
                            <Input
                              value={formData.tngo_pan}
                              onChange={(e) =>
                                handleChange("tngo_website", e.target.value)
                              }
                            />
                            {errors.tngo_website && (
                              <div className="text-danger">{errors.tngo_website}</div>
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[12, 2]} className="justify-content-between">
                        <Col span={3}>
                          <div className="text-left">
                            <button
                              className="next-btn"
                              type="button"
                              onClick={() => {
                                const tab = document.querySelector('#keyperson-tab');
                                if (tab) tab.click();
                              }}
                            >
                              <i className="fa-solid fa-arrow-left"></i> Back
                            </button>
                          </div>
                        </Col>
                        <Col span={3}>
                          <Button className="btn-cancel btn-danger" key="cancel"><CloseOutlined />Cancel</Button>
                        </Col>
                        <Col span={3}>
                          <Button className="btn-submit" key="submit" type="primary" loading={loading} onClick={handleSubmit} >
                            <CheckOutlined /> Submit
                          </Button>
                        </Col>

                      </Row>
                    </div>
                  </div>

                </div>



              </Form>
            </div>
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
