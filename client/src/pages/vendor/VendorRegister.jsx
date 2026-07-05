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

import { getAllStateApi } from "../../services/State-service";
import { fetchDistrictsByStateIds } from "../../services/Master-service";
import { blocks_by_district_id_api } from "../../services/Block-service";
import { vendorCreateApi } from "../../services/Vendor-service";

import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { FaFilePdf, FaUniversity, FaUser } from "react-icons/fa";
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

export default function VendorRegister() {
  const navigate = useNavigate();
  const [registerOptions, setRegisterOptions] = useState([]);
  const [statusOptions, setstatusOptions] = useState([
    { value: "Company", label: "Company" },
    { value: "Firm", label: "Firm" },
    { value: "LLP", label: "LLP" },
    { value: "HUF", label: "HUF" },
    { value: "Individual", label: "Individual" },
    { value: "AOP", label: "AOP" },
    { value: "BOI", label: "BOI" },
    { value: "Trust", label: "Trust" },
    { value: "Local Authority", label: "Local Authority" },
  ]);

  const [msmeOptions, setmsmeOptions] = useState([
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ]);

  /* ============== MASTER DATA ============== */

  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
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
    tvendor_prospect_name: "",
    tvendor_preferred_location: "",
    tvendor_additional_location: "",
    tvendor_state_id: "",
    tvendor_district_id: "",
    tvendor_block_id: "",
    tvendor_pin_code: "",
    tvendor_gst: "",
    tvendor_description_goods: "",
    tvendor_hsn_codes: "",
    tvendor_pan: "",
    tvendor_adhar: "",
    tvendor_msme: "",
    tvendor_statues: "",
    tvendor_msme_udyam: "",
    tvendor_cin: "",
    tvendor_office_phone1: "",
    tvendor_office_phone2: "",
    tvendor_work_phone1: "",
    tvendor_work_phone2: "",
    tvendor_office_fax1: "",
    tvendor_office_fax2: "",
    tvendor_work_fax_1: "",
    tvendor_work_fax_2: "",
    tvendor_email_1: "",
    tvendor_email_2: "",
    tvendor_contact_person_name: "",
    tvendor_contact_person_no: "",
    tvendor_relative_working: "",
    tvendor_relative_designation: "",
    tvendor_relative_location: "",
    tvendor_relative_mobile: "",
    tvendor_bank_name: "",
    tvendor_bank_branch: "",
    tvendor_bank_account_no: "",
    tvendor_bank_ifsc_code: "",
    tvendor_declaration: "",
    tvendor_bank_address: "",
    tvendor_vendor_regn_doc: null,
    tvendor_pan_doc: null,
    tvendor_gst_doc: null,
    tvendor_aadhar_doc: null,
    tvendor_msme_doc: null,
    tvendor_cancelled_cheque_doc: null,
    tvendor_cin_doc: null,
    tvendor_tax_residence_doc: null,
    tvendor_pan_doc: null,
    tvendor_form_10_f_doc: null,
    tvendor_address_proof_doc: null,
    tvendor_notes: "",
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
    if (name === "tvendor_state_id") {
      fetchDistrictsByStateIds(value).then((res) =>
        setDistricts(res?.data || [])
      );
    }

    if (name === "tvendor_district_id") {
      blocks_by_district_id_api(value).then((res) =>
        setBlocks(res?.data || [])
      );
    }
  };

  const handleSubmit = async () => {
    const dataToValidate = {
      ...formData,
    };

    // const isValid = await handleValidation(dataToValidate);
    // if (!isValid) return;
    // console.log('formData', formData);return

    const payload = new FormData();

    // Append all fields to FormData
    for (const key in dataToValidate) {
      // console.log('key', key);
      if (dataToValidate[key] !== null) {
        // If it's a file object, make sure it's a File not just uid
        if (key === "tvendor_vendor_regn_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_pan_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_pan_card_org_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_gst_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_aadhar_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_msme_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_cancelled_cheque_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_cin_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_tax_residence_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_no_pe_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_form_10_f_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tvendor_address_proof_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else {
          payload.append(key, dataToValidate[key]);
        }
      }
    }

    const response = await vendorCreateApi(payload); // Your API must accept dataToValidate

    if (!response.success) {
      toast.error("Failed to submit Vendor details. Please try again.");
      return;
    }

    toast.success("Vendor details submitted successfully!");

    onClose();
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
        className="register-container ngo-registration-section"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div class="curve"></div>

        <div className="register-box">
          <div className="ngo-registration-title">
            <h2>Vendor Registration</h2>
          </div>
          <div
            className="register-body"
            style={{
              maxHeight: "80vh",
              padding: "20px",
            }}
          >
            {/* <div className="login-logo">
                <img className="img-responsive" src={logo} alt="" />
              </div> */}
            <div className="register-content">
            <Form layout="vertical" form={form}>
              <div className="card shadow-sm h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">
                    <FaUser />   Basic Information</span>
                </div>
                <div className="card-body">
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item label="Prospect`s Name" required>
                        <Input
                          value={formData.tvendor_prospect_name}
                          onChange={(e) =>
                            handleChange("tvendor_prospect_name", e.target.value)
                          }
                        />
                        {errors.tvendor_prospect_name && (
                          <div className="text-danger">
                            {errors.tvendor_prospect_name}
                          </div>
                        )}
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <label htmlFor="tvendor_statues" className="form-label">
                        <span className="text-danger">*</span>Statues
                      </label>
                      <Select
                        placeholder="Select Statues"
                        id="tvendor_statues"
                        name="tvendor_statues"
                        value={statusOptions.find(
                          ({ value }) => value == formData?.tvendor_statues
                        )}
                        onChange={(value) => handleChange("tvendor_statues", value)}
                        style={{ width: "100%" }}
                        options={statusOptions}
                      />
                      {errors?.tvendor_statues && (
                        <div className="error text-danger">
                          {errors.tvendor_statues}
                        </div>
                      )}
                    </Col>
                  </Row>
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item label="Preferred Location" required>
                        <Input
                          value={formData.tvendor_preferred_location}
                          onChange={(e) =>
                            handleChange(
                              "tvendor_preferred_location",
                              e.target.value
                            )
                          }
                        />
                        {errors.tvendor_preferred_location && (
                          <div className="text-danger">
                            {errors.tvendor_preferred_location}
                          </div>
                        )}
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Additional Location" required>
                        <Input
                          value={formData.tvendor_additional_location}
                          onChange={(e) =>
                            handleChange(
                              "tvendor_additional_location",
                              e.target.value
                            )
                          }
                        />
                        {errors.tvendor_additional_location && (
                          <div className="text-danger">
                            {errors.tvendor_additional_location}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* CSR 1 registration document of the organization */}

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="State" required>
                        <Select
                          placeholder="Select State"
                          value={formData.tvendor_state_id}
                          options={stateOptions}
                          onChange={(val) => handleChange("tvendor_state_id", val)}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="District" required>
                        <Select
                          placeholder="Select District"
                          value={formData.tvendor_district_id}
                          options={districts}
                          onChange={(val) =>
                            handleChange("tvendor_district_id", val)
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="Sub-District" required>
                        <Select
                          placeholder="Sub-District"
                          value={formData.tvendor_block_id}
                          options={blocks}
                          onChange={(val) => handleChange("tvendor_block_id", val)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* Registration certificate of the organization */}
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item label="Pin Code" required>
                        <InputNumber
                          style={{ width: "100%" }}
                          value={formData.tvendor_pin_code}
                          onChange={(value) =>
                            handleChange("tvendor_pin_code", value)
                          }
                          placeholder="Enter Pin Code"
                        />

                        {errors.tvendor_pin_code && (
                          <div className="text-danger">
                            {errors.tvendor_pin_code}
                          </div>
                        )}
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="GSTIN (GST Registration Number)" required>
                        <Input
                          value={formData.tvendor_gst}
                          onChange={(e) =>
                            handleChange("tvendor_gst", e.target.value)
                          }
                        />
                        {errors.tvendor_gst && (
                          <div className="text-danger">{errors.tvendor_gst}</div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[12, 12]}>
                    <Col span={24}>
                      <Form.Item
                        label="Description of GOODS / SERVICES under GST"
                        required
                      >
                        <TextArea
                          value={formData.tvendor_description_goods}
                          onChange={(e) =>
                            handleChange(
                              "tvendor_description_goods",
                              e.target.value
                            )
                          }
                          rows={4}
                          placeholder="Enter description of goods or services"
                        />

                        {errors.tvendor_description_goods && (
                          <div className="text-danger">
                            {errors.tvendor_description_goods}
                          </div>
                        )}
                      </Form.Item>
                    </Col>


                  </Row>
                  {/* PAN card of the organization */}
                  <Row gutter={[12, 2]}>
                    <Col span={8}>
                      <Form.Item label="HSN Codes for Goods" required>
                        <Input
                          value={formData.tvendor_hsn_codes}
                          onChange={(e) =>
                            handleChange("tvendor_hsn_codes", e.target.value)
                          }
                        />
                        {errors.tvendor_hsn_codes && (
                          <div className="text-danger">
                            {errors.tvendor_hsn_codes}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="PAN Number" required>
                        <Input
                          value={formData.tvendor_pan}
                          onChange={(e) =>
                            handleChange("tvendor_pan", e.target.value)
                          }
                        />
                        {errors.tvendor_pan && (
                          <div className="text-danger">{errors.tvendor_pan}</div>
                        )}
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="AADHAAR Number" required>
                        <Input
                          value={formData.tvendor_adhar}
                          onChange={(e) =>
                            handleChange("tvendor_adhar", e.target.value)
                          }
                        />
                        {errors.tvendor_adhar && (
                          <div className="text-danger">{errors.tvendor_adhar}</div>
                        )}
                      </Form.Item>
                    </Col>

                  </Row>
                  {/* 12AA certificate (renewed) */}
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <label htmlFor="tvendor_msme" className="form-label">
                        <span className="text-danger">*</span> MSME
                      </label>

                      <Select
                        placeholder="Select MSME"
                        id="tvendor_msme"
                        name="tvendor_msme"
                        value={formData?.tvendor_msme}
                        onChange={(value) => handleChange("tvendor_msme", value)}
                        style={{ width: "100%" }}
                        options={msmeOptions}
                      />

                      {errors?.tvendor_msme && (
                        <div className="error text-danger">
                          {errors.tvendor_msme}
                        </div>
                      )}
                    </Col>

                    {/* 👇 Show only if MSME = Yes */}
                    {formData?.tvendor_msme === "yes" && (
                      <Col span={12}>
                        <label htmlFor="tvendor_msme_udyam" className="form-label">
                          <span className="text-danger">*</span> MSME UDYAM
                          Certificate Number Number
                        </label>

                        <Input
                          id="tvendor_msme_udyam"
                          name="tvendor_msme_udyam"
                          placeholder="Enter UDYAM Certificate Number"
                          value={formData?.tvendor_msme_udyam}
                          onChange={(e) =>
                            handleChange("tvendor_msme_udyam", e.target.value)
                          }
                        />

                        {errors?.tvendor_msme_udyam && (
                          <div className="error text-danger">
                            {errors.tvendor_msme_udyam}
                          </div>
                        )}
                      </Col>
                    )}
                  </Row>
                  {/* 80G certificate of the organization (renewed) */}
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item label="CIN" required>
                        <Input
                          value={formData.tvendor_cin}
                          onChange={(e) =>
                            handleChange("tvendor_cin", e.target.value)
                          }
                        />
                        {errors.tvendor_cin && (
                          <div className="text-danger">{errors.tvendor_cin}</div>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Office Phone 1" required>
                        <Input
                          style={{ width: "100%" }}
                          value={formData.tvendor_office_phone1}
                          placeholder="Enter phone number"
                          maxLength={15}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, "");
                            handleChange("tvendor_office_phone1", onlyNumbers);
                          }}
                        />
                        {errors.tvendor_office_phone1 && (
                          <div className="text-danger">
                            {errors.tvendor_office_phone1}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* Bye laws of the organization */}
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item label="Office Phone 2" required>
                        <Input
                          style={{ width: "100%" }}
                          value={formData.tvendor_office_phone2}
                          placeholder="Enter phone number"
                          maxLength={15}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, "");
                            handleChange("tvendor_office_phone2", onlyNumbers);
                          }}
                        />
                        {errors.tvendor_office_phone2 && (
                          <div className="text-danger">
                            {errors.tvendor_office_phone2}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Work Phone 1" required>
                        <Input
                          style={{ width: "100%" }}
                          value={formData.tvendor_work_phone1}
                          placeholder="Enter phone number"
                          maxLength={15}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, "");
                            handleChange("tvendor_work_phone1", onlyNumbers);
                          }}
                        />
                        {errors.tvendor_work_phone1 && (
                          <div className="text-danger">
                            {errors.tvendor_work_phone1}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item label="Work Phone 2" required>
                        <Input
                          style={{ width: "100%" }}
                          value={formData.tvendor_work_phone2}
                          placeholder="Enter phone number"
                          maxLength={15}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, "");
                            handleChange("tvendor_work_phone2", onlyNumbers);
                          }}
                        />
                        {errors.tvendor_work_phone2 && (
                          <div className="text-danger">
                            {errors.tvendor_work_phone2}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Office Fax 1" required>
                        <Input
                          value={formData.tvendor_office_fax1}
                          onChange={(e) =>
                            handleChange("tvendor_office_fax1", e.target.value)
                          }
                        />
                        {errors.tvendor_office_fax1 && (
                          <div className="text-danger">
                            {errors.tvendor_office_fax1}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[12, 2]}>
                    {/* ================= CONTACT DETAILS ================= */}
                    <Col span={12}>
                      <Form.Item label="Office Fax 2">
                        <Input
                          value={formData.tvendor_office_fax_2}
                          onChange={(e) =>
                            handleChange("tvendor_office_fax_2", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Work Fax 1">
                        <Input
                          value={formData.tvendor_work_fax_1}
                          onChange={(e) =>
                            handleChange("tvendor_work_fax_1", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item label="Work Fax 2">
                        <Input
                          value={formData.tvendor_work_fax_2}
                          onChange={(e) =>
                            handleChange("tvendor_work_fax_2", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Official E-Mail Id 1" required>
                        <Input
                          value={formData.tvendor_email_1}
                          onChange={(e) =>
                            handleChange("tvendor_email_1", e.target.value)
                          }
                        />
                        {errors.email_1 && (
                          <div className="text-danger">
                            {errors.tvendor_email_1}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[12, 2]}>
                    <Col span={8}>
                      <Form.Item label="E-Mail Id 2">
                        <Input
                          value={formData.tvendor_email_2}
                          onChange={(e) =>
                            handleChange("tvendor_email_2", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="Contact Person Name" required>
                        <Input
                          value={formData.tvendor_contact_person_name}
                          onChange={(e) =>
                            handleChange(
                              "tvendor_contact_person_name",
                              e.target.value
                            )
                          }
                        />
                        {errors.contact_person_name && (
                          <div className="text-danger">
                            {errors.tvendor_contact_person_name}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Contact Person No." required>
                        <Input
                          style={{ width: "100%" }}
                          value={formData.tvendor_contact_person_no}
                          placeholder="Enter phone number"
                          maxLength={15}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, "");
                            handleChange("tvendor_contact_person_no", onlyNumbers);
                          }}
                        />
                        {errors.contact_person_no && (
                          <div className="text-danger">
                            {errors.tvendor_contact_person_no}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <label className="form-label">
                        Any relatives working in Coromandel
                      </label>
                      <Select
                        placeholder="Select"
                        value={formData.tvendor_relative_working}
                        onChange={(value) =>
                          handleChange("tvendor_relative_working", value)
                        }
                        options={[
                          { label: "Yes", value: "yes" },
                          { label: "No", value: "no" },
                        ]}
                        style={{ width: "100%" }}
                      />
                    </Col>

                    {formData.tvendor_relative_working === "yes" && (
                      <>
                        <Col span={12}>
                          <Form.Item label="Relative Name" required>
                            <Input
                              value={formData.tvendor_relative_name}
                              onChange={(e) =>
                                handleChange(
                                  "tvendor_relative_name",
                                  e.target.value
                                )
                              }
                            />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item label="Designation">
                            <Input
                              value={formData.tvendor_relative_designation}
                              onChange={(e) =>
                                handleChange(
                                  "tvendor_relative_designation",
                                  e.target.value
                                )
                              }
                            />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item label="Location">
                            <Input
                              value={formData.tvendor_relative_location}
                              onChange={(e) =>
                                handleChange(
                                  "tvendor_relative_location",
                                  e.target.value
                                )
                              }
                            />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item label="Mobile No.">
                            <Input
                              style={{ width: "100%" }}
                              value={formData.tvendor_relative_mobile}
                              placeholder="Enter phone number"
                              maxLength={15}
                              onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                handleChange(
                                  "tvendor_relative_mobile",
                                  onlyNumbers
                                );
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                  </Row>
                </div>
              </div>

              <div className="card shadow-sm mt-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">
                    <FaUniversity /> Bank Details</span>
                </div>
                <div className="card-body">
                  {/* ================= BANK DETAILS ================= */}
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item label="Bank" required>
                        <Input
                          value={formData.tvendor_bank_name}
                          onChange={(e) =>
                            handleChange("tvendor_bank_name", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Bank Branch">
                        <Input
                          value={formData.tvendor_bank_branch}
                          onChange={(e) =>
                            handleChange("tvendor_bank_branch", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item label="Bank A/C No." required>
                        <Input
                          value={formData.tvendor_bank_account_no}
                          onChange={(e) =>
                            handleChange("tvendor_bank_account_no", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="IFSC No." required>
                        <Input
                          value={formData.tvendor_bank_ifsc_code}
                          onChange={(e) =>
                            handleChange("tvendor_bank_ifsc_code", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* ================= DECLARATION ================= */}
                  <Row gutter={[12, 2]}>
                    <Col span={24}>
                      <Form.Item label="Declaration" required>
                        <Input.TextArea
                          rows={3}
                          value={formData.tvendor_declaration}
                          onChange={(e) =>
                            handleChange("tvendor_declaration", e.target.value)
                          }
                          placeholder="It is hereby solemnified that the data furnished herein is true..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              <div className="card shadow-sm mt-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">
                    <FaFilePdf /> Mandatory documents</span>
                </div>
                <div className="card-body">
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            Vendor Regn form duly signed/seal
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
                          errors?.tvendor_vendor_regn_doc ? "error" : ""
                        }
                        help={errors?.tvendor_vendor_regn_doc}
                      >
                        <Upload
                          fileList={fileLists?.["tvendor_vendor_regn_doc"] || []}
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_vendor_regn_doc: latestFile,
                            }));
                            handleChange(
                              "tvendor_vendor_regn_doc",
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

                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            PAN
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
                        validateStatus={errors?.tvendor_pan_doc ? "error" : ""}
                        help={errors?.tvendor_pan_doc}
                      >
                        <Upload
                          fileList={fileLists?.["tvendor_pan_doc"] || []}
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_pan_doc: latestFile,
                            }));
                            handleChange("tvendor_pan_doc", latestFile?.[0]);
                          }}
                          showUploadList={{
                            showRemoveIcon: true, // ✅ allow removal directly
                          }}
                        >
                          <Button icon={<UploadOutlined />}>Choose File</Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            GST Certificate
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
                        validateStatus={errors?.tvendor_gst_doc ? "error" : ""}
                        help={errors?.tvendor_gst_doc}
                      >
                        <Upload
                          fileList={fileLists?.["tvendor_gst_doc"] || []}
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_gst_doc: latestFile,
                            }));
                            handleChange("tvendor_gst_doc", latestFile?.[0]);
                          }}
                          showUploadList={{
                            showRemoveIcon: true, // ✅ allow removal directly
                          }}
                        >
                          <Button icon={<UploadOutlined />}>Choose File</Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            Aadhaar
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
                        validateStatus={errors?.tvendor_aadhar_doc ? "error" : ""}
                        help={errors?.tvendor_aadhar_doc}
                      >
                        <Upload
                          fileList={fileLists?.["tvendor_aadhar_doc"] || []}
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_aadhar_doc: latestFile,
                            }));
                            handleChange("tvendor_aadhar_doc", latestFile?.[0]);
                          }}
                          showUploadList={{
                            showRemoveIcon: true, // ✅ allow removal directly
                          }}
                        >
                          <Button icon={<UploadOutlined />}>Choose File</Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            MSME UDYAM Certificate
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
                        validateStatus={errors?.tvendor_msme_doc ? "error" : ""}
                        help={errors?.tvendor_msme_doc}
                      >
                        <Upload
                          fileList={fileLists?.["tvendor_msme_doc"] || []}
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_msme_doc: latestFile,
                            }));
                            handleChange("tvendor_msme_doc", latestFile?.[0]);
                          }}
                          showUploadList={{
                            showRemoveIcon: true, // ✅ allow removal directly
                          }}
                        >
                          <Button icon={<UploadOutlined />}>Choose File</Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            Cancelled cheque
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
                          errors?.tvendor_cancelled_cheque_doc ? "error" : ""
                        }
                        help={errors?.tvendor_cancelled_cheque_doc}
                      >
                        <Upload
                          fileList={
                            fileLists?.["tvendor_cancelled_cheque_doc"] || []
                          }
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_cancelled_cheque_doc: latestFile,
                            }));
                            handleChange(
                              "tvendor_cancelled_cheque_doc",
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

                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            Certificate of Incorporation (CIN)
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
                        validateStatus={errors?.tvendor_cin_doc ? "error" : ""}
                        help={errors?.tvendor_cin_doc}
                      >
                        <Upload
                          fileList={fileLists?.["tvendor_cin_doc"] || []}
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_cin_doc: latestFile,
                            }));
                            handleChange("tvendor_cin_doc", latestFile?.[0]);
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
                </div>
              </div>
              <div className="card shadow-sm mt-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">
                    <FaFilePdf />  Import Vendors (Foreign Entity)</span>
                </div>
                <div className="card-body">
                  <Row gutter={[12, 2]}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            Tax Residence Certificate (TRC)
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
                          errors?.tvendor_tax_residence_doc ? "error" : ""
                        }
                        help={errors?.tvendor_tax_residence_doc}
                      >
                        <Upload
                          fileList={
                            fileLists?.["tvendor_tax_residence_doc"] || []
                          }
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_tax_residence_doc: latestFile,
                            }));
                            handleChange(
                              "tvendor_tax_residence_doc",
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

                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            No Permanent Establishment in India 
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
                        validateStatus={errors?.tvendor_no_pe_doc ? "error" : ""}
                        help={errors?.tvendor_no_pe_doc}
                      >
                        <Upload
                          fileList={fileLists?.["tvendor_no_pe_doc"] || []}
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_no_pe_doc: latestFile,
                            }));
                            handleChange("tvendor_no_pe_doc", latestFile?.[0]);
                          }}
                          showUploadList={{
                            showRemoveIcon: true, // ✅ allow removal directly
                          }}
                        >
                          <Button icon={<UploadOutlined />}>Choose File</Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            Form 10F
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
                          errors?.tvendor_form_10_f_doc ? "error" : ""
                        }
                        help={errors?.tvendor_form_10_f_doc}
                      >
                        <Upload
                          fileList={fileLists?.["tvendor_form_10_f_doc"] || []}
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_form_10_f_doc: latestFile,
                            }));
                            handleChange(
                              "tvendor_form_10_f_doc",
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

                    <Col span={12}>
                      <Form.Item
                        label={
                          <span>
                            Address Proof of the Company
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
                          errors?.tvendor_address_proof_doc ? "error" : ""
                        }
                        help={errors?.tvendor_address_proof_doc}
                      >
                        <Upload
                          fileList={
                            fileLists?.["tvendor_address_proof_doc"] || []
                          }
                          beforeUpload={() => false}
                          multiple={false} // ✅ Single file upload only
                          accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({
                              ...prev,
                              tvendor_address_proof_doc: latestFile,
                            }));
                            handleChange(
                              "tvendor_address_proof_doc",
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

                  <Row gutter={[12, 2]}>
                    <Col span={24}>
                      <Form.Item label="Note" required>
                        <TextArea
                          value={formData.tvendor_notes}
                          onChange={(e) =>
                            handleChange("tvendor_notes", e.target.value)
                          }
                          rows={3}
                          placeholder="Enter description of goods or services"
                        />

                        {errors.tvendor_notes && (
                          <div className="text-danger">
                            {errors.tvendor_notes}
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>









              {/* ================= RELATIVES SECTION ================= */}

              <Row gutter={[12, 2]} className="mb-1 mt-3 justify-content-center">
                <Col span={5}>
                  <Button key="cancel" className="btn-cancel btn-danger">Cancel</Button>
                </Col>
                <Col span={5}>
                  <Button  className="btn-submit" key="submit" type="primary"loading={loading} onClick={handleSubmit} >
                    Submit
                  </Button>
                </Col>
              </Row>
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
