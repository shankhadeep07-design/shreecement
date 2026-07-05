// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
import "../../assets/css/register-style.css";
import "../../assets/css/ngo-register-modern.css";
import shreeLogo  from "../../assets/images/logo.jpg";
import promoIllustration from "../../assets/images/ngo-sidebar-promo.png";
// import logo from "../../assets/images/SMFG-Logo.svg";
// import { useMsal } from "@azure/msal-react";
// import "owl.carousel/dist/assets/owl.carousel.css";
// import "owl.carousel/dist/assets/owl.theme.default.css";
// import { ColorRing } from "react-loader-spinner";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import video from "../../assets/video/login-video.mp4";

import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Tooltip,
  Typography,
  Upload
} from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { fetchAllCategoryList, fetchAllThemeList, getAllEducation, getAllState, ngoCreatePublicApi } from "../../services/Ngo-service";
const { Text } = Typography;
const { Option } = Select;
const noLeadingSpace = /^(?!\s)/;
const noEmoji = /^[^\p{Emoji}]*$/u;
const noSpecialStart = /^[a-zA-Z0-9]/;
const phoneRegex = /^[0-9]{10}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const allowedFileTypes = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/xlsx"
];
const trimmedString = () =>
  Yup.string().transform((value) => (value ? value.trim() : ""));
const Schema = Yup.object().shape({

  tngo_name: trimmedString()
    .required("NGO name is required")
    .matches(noLeadingSpace, {
      message: "Cannot start with space",
      excludeEmptyString: true
    })
    .matches(noSpecialStart, {
      message: "Cannot start with special character",
      excludeEmptyString: true
    })
    .matches(noEmoji, {
      message: "Emoji not allowed",
      excludeEmptyString: true
    }),

  tngo_area_of_expertise: trimmedString()
    .required("Area of expertise is required"),

  tngo_category: trimmedString()
    .required("Category is required"),

  tngo_contact_no: trimmedString()
    .required("Contact number is required")
    .matches(phoneRegex, "Enter valid 10 digit number"),

  tngo_email_id: trimmedString()
    .required("Email is required")
    .email("Invalid email format"),

  tngo_website: trimmedString()
    .required("Website is required")
    .matches(noLeadingSpace, {
      message: "Cannot start with space",
      excludeEmptyString: true
    }),

  tngo_ngo_darpan_no: trimmedString()
    .required("NGO darpan number required"),

  tngo_reg_address_of_org: trimmedString()
    .required("Registered address required")
    .matches(noLeadingSpace, "Cannot start with space"),

  tngo_present_address_of_org: trimmedString()
    .required("Present address required"),

  tngo_state_id: trimmedString()
    .required("Geographical presence is required"),

  tngo_csr_reg_no: trimmedString()
    .required("CSR registration number required"),

  tngo_niti_aayog_darpan_por_reg: trimmedString()
    .required("NITI Aayog DARPAN number required"),

  tngo_pan_no: trimmedString()
    .required("PAN number required")
    .matches(panRegex, "Invalid PAN number"),


  tngo_bank_account_no: Yup.number()
    .typeError("Account number must be numeric")
    .positive("Cannot be negative")
    .required("Bank account number required"),

  tngo_bank_account_name: trimmedString()
    .required("Account name required")
    .matches(noLeadingSpace, "Cannot start with space"),

  tngo_bank_name: trimmedString()
    .required("Bank name required"),

  tngo_bank_ifsc_code: trimmedString()
    .required("IFSC code required")
    .matches(ifscRegex, "Invalid IFSC code"),

  tngo_address_of_the_bank: trimmedString()
    .required("Bank address required"),

  tngo_user_name: trimmedString()
    .required("User name required")
    .matches(noLeadingSpace, "Cannot start with space")
    .matches(noEmoji, "Emoji not allowed"),

  tngo_user_contact_no: trimmedString()
    .required("User contact required")
    .matches(phoneRegex, "Enter valid 10 digit number"),

  tngo_user_email_id: trimmedString()
    .required("User email required")
    .email("Invalid email format"),

  tngo_user_education_id: trimmedString()
    .required("Education required"),

  tngo_user_status: trimmedString()
    .required("Status required"),

  tngo_remarks: trimmedString()
    .required("Remarks required"),


  tngo_csr_one_res_org_doc: Yup.mixed()
    .required("CSR document required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),

  tngo_res_certificate_org_doc: Yup.mixed()
    .required("Registration certificate required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),

  tngo_pan_card_org_doc: Yup.mixed()
    .required("PAN document required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),

  tngo_twelve_aa_certificate_doc: Yup.mixed()
    .required("12AA certificate required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),

  tngo_eighty_g_certificate_org_doc: Yup.mixed()
    .required("80G certificate required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),
  tngo_by_law_org_doc: Yup.mixed()
    .required("By-laws document required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),
  tngo_memorandum_association_org_doc: Yup.mixed()
    .required("Memorandum of Association required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),
  tngo_list_of_exist_gov_body_members_doc: Yup.mixed()
    .required("List of existing government body members docs required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),
  tngo_details_of_office_bearers_doc: Yup.mixed()
    .required("Details of office bearers docs required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),
  tngo_audit_report_org_with_income_tax_return_doc: Yup.mixed()
    .required("Audit report docs required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),
  tngo_fcra_reg_certificate_doc: Yup.mixed()
    .required("FCRA registration certificate docs required")
    .test("fileType", "Only PDF/DOC/XLS allowed", (value) => {
      if (!value) return false;
      if (value.url) return true;
      return allowedFileTypes.includes(value?.type);
    }),

});

export default function NgoRegister() {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [states, setStates] = useState([]);
  const [educationOptions, setEducationOptions] = useState([]);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]

  const initialFormState = {
    tngo_id: "",
    tngo_name: "",
    tngo_area_of_expertise: "",
    tngo_category: "",
    tngo_contact_no: "",
    tngo_email_id: "",
    tngo_website: "",
    tngo_ngo_darpan_no: "",
    tngo_reg_address_of_org: "",
    tngo_present_address_of_org: "",
    tngo_state_id: "",
    tngo_csr_reg_no: "",
    tngo_pan_no: "",
    tngo_bank_account_no: "",
    tngo_bank_account_name: "",
    tngo_bank_name: "",
    tngo_bank_ifsc_code: "",
    tngo_address_of_the_bank: "",
    tngo_remarks: "",
    tngo_niti_aayog_darpan_por_reg: "",

    tngo_user_name: "",
    tngo_user_contact_no: "",
    tngo_user_email_id: "",
    tngo_user_education_id: "",
    tngo_user_status: "",

    tngo_csr_one_res_org_doc: null,
    tngo_res_certificate_org_doc: null,
    tngo_pan_card_org_doc: null,
    tngo_twelve_aa_certificate_doc: null,
    tngo_eighty_g_certificate_org_doc: null,
    tngo_by_law_org_doc: null,
    tngo_memorandum_association_org_doc: null,
    tngo_list_of_exist_gov_body_members_doc: null,
    tngo_details_of_office_bearers_doc: null,
    tngo_audit_report_org_with_income_tax_return_doc: null,
    tngo_fcra_reg_certificate_doc: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <i className="fa-solid fa-user"></i> },
    { id: "bank", label: "Bank Details", icon: <i className="fa-solid fa-building-columns"></i> },
    { id: "keyperson", label: "User Details", icon: <i className="fa-solid fa-users"></i> },
    { id: "kyc", label: "Documents", icon: <i className="fa-solid fa-file-arrow-up"></i> },
  ];

  const [fileLists, setFileLists] = useState({});

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);



  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = async (stepIndex) => {
    const stepFields = [
      // Step 0: Basic Info
      ["tngo_name", "tngo_area_of_expertise", "tngo_category", "tngo_contact_no", "tngo_email_id", "tngo_website", "tngo_ngo_darpan_no", "tngo_reg_address_of_org", "tngo_present_address_of_org", "tngo_state_id", "tngo_csr_reg_no", "tngo_niti_aayog_darpan_por_reg", "tngo_pan_no", "tngo_remarks"],
      // Step 1: Bank Details
      ["tngo_bank_account_no", "tngo_bank_account_name", "tngo_bank_name", "tngo_bank_ifsc_code", "tngo_address_of_the_bank"],
      // Step 2: User Details
      ["tngo_user_name", "tngo_user_contact_no", "tngo_user_email_id", "tngo_user_education_id", "tngo_user_status"],
      // Step 3: Documents (all file fields)
      ["tngo_csr_one_res_org_doc", "tngo_res_certificate_org_doc", "tngo_pan_card_org_doc", "tngo_twelve_aa_certificate_doc", "tngo_eighty_g_certificate_org_doc", "tngo_by_law_org_doc", "tngo_memorandum_association_org_doc", "tngo_list_of_exist_gov_body_members_doc", "tngo_details_of_office_bearers_doc", "tngo_audit_report_org_with_income_tax_return_doc", "tngo_fcra_reg_certificate_doc"]
    ];

    const currentFields = stepFields[stepIndex];
    const stepSchema = Yup.object().shape(
      currentFields.reduce((acc, field) => {
        acc[field] = Schema.fields[field];
        return acc;
      }, {})
    );

    try {
      await stepSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const formattedErrors = {};
      err.inner.forEach((error) => {
        formattedErrors[error.path] = error.message;
      });
      setErrors(formattedErrors);
      toast.error("Please fill all required fields correctly.");
      return false;
    }
  };

  const handleNextStep = async () => {
    const isValid = await validateStep(activeTab);
    if (isValid) {
      setActiveTab((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };


  const handleValidation = async (data) => {
    try {
      const validatedData = await Schema.validate(data, { abortEarly: false });
      setErrors({});
      return true;

    } catch (err) {
      const formattedErrors = {};

      err.inner.forEach((error) => {
        formattedErrors[error.path] = error.message;
      });

      setErrors(formattedErrors);

      return false;
    }
  };

  const fetchCategoryList = () => {
    fetchAllCategoryList()
      .then((data) => {
        setCategoryOptions(data?.data);

      }).catch((error) => {
        toast.error(
          error?.response?.data?.originalError || error?.response?.data?.message
        );
      });
  };

  const fetchThemeList = () => {
    fetchAllThemeList()
      .then((data) => {
        setThemeOptions(data?.data);

      }).catch((error) => {
        toast.error(
          error?.response?.data?.originalError || error?.response?.data?.message
        );
      });
  };
  const fetchStateList = () => {
    getAllState()
      .then((data) => {
        setStates(data?.data);

      }).catch((error) => {
        toast.error(
          error?.response?.data?.originalError || error?.response?.data?.message
        );
      });
  };

  const fetchEducationList = () => {
    getAllEducation()
      .then((data) => {
        setEducationOptions(data?.data);

      }).catch((error) => {
        toast.error(
          error?.response?.data?.originalError || error?.response?.data?.message
        );
      });
  };

  useEffect(() => {
    fetchEducationList();
    fetchStateList();
    fetchThemeList();
    fetchCategoryList();
  }, []);

  const handleSubmit = async () => {
    const dataToValidate = {
      ...formData,
    };

    const isValid = await handleValidation(dataToValidate);

    if (!isValid) return;

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
        }
        else if (key === "tngo_list_of_exist_gov_body_members_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        }
        else if (key === "tngo_by_law_org_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        }
        else if (key === "tngo_details_of_office_bearers_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        }
        else if (key === "tngo_fcra_reg_certificate_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        }
        else if (key === "tngo_audit_report_org_with_income_tax_return_doc") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        }

        else {
          payload.append(key, dataToValidate[key]);
        }
      }
    }

    const response = await ngoCreatePublicApi(payload); // Your API must accept dataToValidate

    if (!response.success) {
      toast.error("Failed to submit NGO details. Please try again.");
      return;
    }

    toast.success("NGO details submitted successfully!");
    // Reset form fields
    setFormData(initialFormState);
    setErrors({});
    setFileLists({});
  };


  return (
    <div className="ngo-registration-modern">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="header-left">
          <img src={shreeLogo} alt="LAMS" className="header-logo" />
          <div className="header-divider"></div>
          <span className="header-title">NGO Registration Portal</span>
        </div>
        <div className="header-right">
          <a href="http://localhost:5173/shreecement/" className="back-to-login">
            <i className="fa-solid fa-arrow-left"></i> Back to Login
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="modern-hero">
        <div className="hero-glass-card">
          <h1>Partner for <span>Social Impact</span></h1>
          <p>Join our network of transformative organizations — register your NGO today for community-driven agricultural and industrial excellence across India.</p>
          <div className="hero-badges">
            <div className="hero-badge"><i className="fa-solid fa-heart"></i> Empowering Communities</div>
            <div className="hero-badge"><i className="fa-solid fa-recycle"></i> Sustainable Change</div>
            <div className="hero-badge"><i className="fa-solid fa-chart-line"></i> Measurable Impact</div>
          </div>
        </div>
      </section>

      <div className="registration-container">
        {/* Top Horizontal Stepper */}
        <div className="modern-stepper">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`stepper-item ${activeTab === index ? 'active' : ''} ${activeTab > index ? 'completed' : ''
                }`}
              onClick={async () => {
                if (index < activeTab) {
                  setActiveTab(index);
                } else if (index > activeTab) {
                  // Only allow jumping forward if current step is valid
                  if (await validateStep(activeTab)) {
                    setActiveTab(index);
                  }
                }
              }}
            >
              <div className="step-icon">{tab.icon}</div>
              <span className="step-label">{tab.label}</span>
            </div>
          ))}
        </div>

        <div className="registration-content-grid">
          {/* Main Form Pane */}
          <div className="modern-form-pane">
            <div className="form-header">
              <div className="header-info">
                <h6>Step {activeTab + 1} of {tabs.length}</h6>
                <h2>{tabs[activeTab].label} Information</h2>
                <p>NGO name, date, and core details for registration.</p>
              </div>
              <div className="brand-logo">
                <img src={shreeLogo} alt="Shree Cement" />
              </div>
            </div>

            <Form layout="vertical">
              {activeTab === 0 && (
                <Row gutter={[16, 0]}>
                  {/* NGO Name */}
                  <Col span={12}>
                    <Form.Item label="Name of the NGO" required>
                      <Input
                        value={formData.tngo_name}
                        onChange={(e) => handleChange("tngo_name", e.target.value)}
                        placeholder="Enter NGO name"
                      />
                      {errors.tngo_name && (
                        <div className="text-danger">{errors.tngo_name}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Area of Expertise */}
                  <Col span={12}>
                    <Form.Item label="Organization Area of Expertise" required>
                      <Select
                        placeholder="Select Area of Expertise"
                        value={formData.tngo_area_of_expertise}
                        options={themeOptions}
                        onChange={(value) => handleChange("tngo_area_of_expertise", value)}
                        style={{ width: "100%" }}
                      />
                      {errors.tngo_area_of_expertise && (
                        <div className="text-danger">{errors.tngo_area_of_expertise}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Category */}
                  <Col span={12}>
                    <Form.Item label="Category" required>
                      <Select
                        placeholder="Select Category"
                        options={categoryOptions}
                        value={formData.tngo_category}
                        onChange={(value) => handleChange("tngo_category", value)}
                        style={{ width: "100%" }}
                      />
                      {errors.tngo_category && (
                        <div className="text-danger">{errors.tngo_category}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Contact Number */}
                  <Col span={12}>
                    <Form.Item label="Contact No" required>
                      <Input
                        value={formData.tngo_contact_no}
                        onChange={(e) => handleChange("tngo_contact_no", e.target.value)}
                        placeholder="10 digit number"
                      />
                      {errors.tngo_contact_no && (
                        <div className="text-danger">{errors.tngo_contact_no}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Email ID */}
                  <Col span={12}>
                    <Form.Item label="Email ID" required>
                      <Input
                        value={formData.tngo_email_id}
                        onChange={(e) => handleChange("tngo_email_id", e.target.value)}
                        placeholder="email@example.com"
                      />
                      {errors.tngo_email_id && (
                        <div className="text-danger">{errors.tngo_email_id}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Website */}
                  <Col span={12}>
                    <Form.Item label="Website" required>
                      <Input
                        value={formData.tngo_website}
                        onChange={(e) => handleChange("tngo_website", e.target.value)}
                        placeholder="https://www.example.com"
                      />
                      {errors.tngo_website && (
                        <div className="text-danger">{errors.tngo_website}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* NGO Darpan No */}
                  <Col span={12}>
                    <Form.Item label="Ngo Darpan No" required>
                      <Input
                        value={formData.tngo_ngo_darpan_no}
                        onChange={(e) => handleChange("tngo_ngo_darpan_no", e.target.value)}
                        placeholder="Enter Darpan No"
                      />
                      {errors.tngo_ngo_darpan_no && (
                        <div className="text-danger">{errors.tngo_ngo_darpan_no}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Registered Address */}
                  <Col span={12}>
                    <Form.Item label="Registered Address" required>
                      <Input
                        value={formData.tngo_reg_address_of_org}
                        onChange={(e) => handleChange("tngo_reg_address_of_org", e.target.value)}
                        placeholder="Registered address"
                      />
                      {errors.tngo_reg_address_of_org && (
                        <div className="text-danger">{errors.tngo_reg_address_of_org}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Present Address */}
                  <Col span={12}>
                    <Form.Item label="Present Address" required>
                      <Input
                        value={formData.tngo_present_address_of_org}
                        onChange={(e) => handleChange("tngo_present_address_of_org", e.target.value)}
                        placeholder="Present address"
                      />
                      {errors.tngo_present_address_of_org && (
                        <div className="text-danger">{errors.tngo_present_address_of_org}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Geographical presence */}
                  <Col span={12}>
                    <Form.Item label="Geographical Presence" required>
                      <Select
                        placeholder="Select Geographical presence"
                        options={states}
                        value={formData.tngo_state_id}
                        onChange={(value) => handleChange("tngo_state_id", value)}
                        style={{ width: "100%" }}
                      />
                      {errors.tngo_state_id && (
                        <div className="text-danger">{errors.tngo_state_id}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* CSR Registration No */}
                  <Col span={12}>
                    <Form.Item label="CSR Registration No" required>
                      <Input
                        value={formData.tngo_csr_reg_no}
                        onChange={(e) => handleChange("tngo_csr_reg_no", e.target.value)}
                        placeholder="CSR Reg No"
                      />
                      {errors.tngo_csr_reg_no && (
                        <div className="text-danger">{errors.tngo_csr_reg_no}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* NITI Aayog DARPAN portal registration */}
                  <Col span={12}>
                    <Form.Item label="NITI Aayog DARPAN Portal Registration" required>
                      <Input
                        value={formData.tngo_niti_aayog_darpan_por_reg}
                        onChange={(e) => handleChange("tngo_niti_aayog_darpan_por_reg", e.target.value)}
                        placeholder="NITI Aayog Reg"
                      />
                      {errors.tngo_niti_aayog_darpan_por_reg && (
                        <div className="text-danger">{errors.tngo_niti_aayog_darpan_por_reg}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* PAN No */}
                  <Col span={12}>
                    <Form.Item label="PAN No" required>
                      <Input
                        value={formData.tngo_pan_no}
                        onChange={(e) => handleChange("tngo_pan_no", e.target.value)}
                        placeholder="ABCDE1234F"
                      />
                      {errors.tngo_pan_no && (
                        <div className="text-danger">{errors.tngo_pan_no}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Remarks */}
                  <Col span={12}>
                    <Form.Item label="Remarks" required>
                      <Input
                        value={formData.tngo_remarks}
                        onChange={(e) => handleChange("tngo_remarks", e.target.value)}
                        placeholder="Any remarks"
                      />
                      {errors.tngo_remarks && (
                        <div className="text-danger">{errors.tngo_remarks}</div>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {activeTab === 1 && (
                <Row gutter={[16, 0]}>
                  {/* Account number */}
                  <Col span={12}>
                    <Form.Item label="Account number" required>
                      <Input
                        value={formData.tngo_bank_account_no}
                        onChange={(e) => handleChange("tngo_bank_account_no", e.target.value)}
                        placeholder="Enter account number"
                      />
                      {errors.tngo_bank_account_no && (
                        <div className="text-danger">{errors.tngo_bank_account_no}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Account name */}
                  <Col span={12}>
                    <Form.Item label="Account name" required>
                      <Input
                        value={formData.tngo_bank_account_name}
                        onChange={(e) => handleChange("tngo_bank_account_name", e.target.value)}
                        placeholder="Enter account name"
                      />
                      {errors.tngo_bank_account_name && (
                        <div className="text-danger">{errors.tngo_bank_account_name}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Bank Name */}
                  <Col span={12}>
                    <Form.Item label="Bank Name" required>
                      <Input
                        value={formData.tngo_bank_name}
                        onChange={(e) => handleChange("tngo_bank_name", e.target.value)}
                        placeholder="Enter bank name"
                      />
                      {errors.tngo_bank_name && (
                        <div className="text-danger">{errors.tngo_bank_name}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* IFSC Code */}
                  <Col span={12}>
                    <Form.Item label="IFSC Code" required>
                      <Input
                        value={formData.tngo_bank_ifsc_code}
                        onChange={(e) => handleChange("tngo_bank_ifsc_code", e.target.value)}
                        placeholder="IFSC Code"
                      />
                      {errors.tngo_bank_ifsc_code && (
                        <div className="text-danger">{errors.tngo_bank_ifsc_code}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Address of the bank */}
                  <Col span={24}>
                    <Form.Item label="Address of the bank" required>
                      <Input.TextArea
                        rows={3}
                        value={formData.tngo_address_of_the_bank}
                        onChange={(e) => handleChange("tngo_address_of_the_bank", e.target.value)}
                        placeholder="Bank address details"
                      />
                      {errors.tngo_address_of_the_bank && (
                        <div className="text-danger">{errors.tngo_address_of_the_bank}</div>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {activeTab === 2 && (
                <Row gutter={[16, 0]}>
                  {/* User Name */}
                  <Col span={12}>
                    <Form.Item label="User Name" required>
                      <Input
                        value={formData.tngo_user_name}
                        onChange={(e) => handleChange("tngo_user_name", e.target.value)}
                        placeholder="Enter user name"
                      />
                      {errors.tngo_user_name && (
                        <div className="text-danger">{errors.tngo_user_name}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* User Contact No */}
                  <Col span={12}>
                    <Form.Item label="User Contact No" required>
                      <Input
                        value={formData.tngo_user_contact_no}
                        onChange={(e) => handleChange("tngo_user_contact_no", e.target.value)}
                        placeholder="Contact number"
                      />
                      {errors.tngo_user_contact_no && (
                        <div className="text-danger">{errors.tngo_user_contact_no}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* User Email */}
                  <Col span={12}>
                    <Form.Item label="User Email" required>
                      <Input
                        value={formData.tngo_user_email_id}
                        onChange={(e) => handleChange("tngo_user_email_id", e.target.value)}
                        placeholder="Email ID"
                      />
                      {errors.tngo_user_email_id && (
                        <div className="text-danger">{errors.tngo_user_email_id}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Education */}
                  <Col span={12}>
                    <Form.Item label="Education" required>
                      <Select
                        placeholder="Select Education"
                        value={formData.tngo_user_education_id}
                        options={educationOptions}
                        onChange={(value) => handleChange("tngo_user_education_id", value)}
                        style={{ width: "100%" }}
                      />
                      {errors.tngo_user_education_id && (
                        <div className="text-danger">{errors.tngo_user_education_id}</div>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Status */}
                  <Col span={12}>
                    <Form.Item label="Status" required>
                      <Select
                        placeholder="Select Status"
                        value={formData.tngo_user_status}
                        options={statusOptions}
                        onChange={(value) => handleChange("tngo_user_status", value)}
                        style={{ width: "100%" }}
                      />
                      {errors.tngo_user_status && (
                        <div className="text-danger">{errors.tngo_user_status}</div>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {activeTab === 3 && (
                <Row gutter={[16, 16]}>
                  {[
                    { label: "CSR 1 registration document", name: "tngo_csr_one_res_org_doc" },
                    { label: "Registration certificate", name: "tngo_res_certificate_org_doc" },
                    { label: "PAN card of organization", name: "tngo_pan_card_org_doc" },
                    { label: "12AA certificate (renewed)", name: "tngo_twelve_aa_certificate_doc" },
                    { label: "80G certificate (renewed)", name: "tngo_eighty_g_certificate_org_doc" },
                    { label: "Bye laws of organization", name: "tngo_by_law_org_doc" },
                    { label: "Memorandum of Association", name: "tngo_memorandum_association_org_doc" },
                    { label: "Governing Body Members / trustees", name: "tngo_list_of_exist_gov_body_members_doc" },
                    { label: "Details of office bearers", name: "tngo_details_of_office_bearers_doc" },
                    { label: "Audit Report with ITR", name: "tngo_audit_report_org_with_income_tax_return_doc" },
                    { label: "FCRA registration certificate", name: "tngo_fcra_reg_certificate_doc" }
                  ].map((field) => (
                    <Col span={12} key={field.name}>
                      <Form.Item
                        label={
                          <span>
                            {field.label}
                            <Tooltip title="Supported: PDF, DOC, XLS. Max 5MB.">
                              <InfoCircleOutlined style={{ color: "#f37021", marginLeft: 8 }} />
                            </Tooltip>
                          </span>
                        }
                        required
                        validateStatus={errors?.[field.name] ? "error" : ""}
                        help={errors?.[field.name]}
                      >
                        <Upload
                          fileList={fileLists?.[field.name] || []}
                          beforeUpload={() => false}
                          multiple={false}
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={({ fileList }) => {
                            const latestFile = fileList?.slice(-1);
                            setFileLists((prev) => ({ ...prev, [field.name]: latestFile }));
                            handleChange(field.name, latestFile?.[0]);
                          }}
                        >
                          <Button block icon={<UploadOutlined />} style={{ height: '42px', borderRadius: '10px' }}>Choose File</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              )}

              <div className="btn-actions">
                {activeTab > 0 && (
                  <button
                    type="button"
                    className="next-button"
                    onClick={() => setActiveTab(activeTab - 1)}
                    style={{ marginRight: 'auto', background: '#f1f5f9', color: '#475569', boxShadow: 'none' }}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Previous
                  </button>
                )}
                {activeTab < tabs.length - 1 ? (
                  <button
                    type="button"
                    className="next-button"
                    onClick={handleNextStep}
                  >
                    Next Step <i className="fa-solid fa-arrow-right"></i>
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button
                      className="btn-cancel"
                      style={{ height: '48px', borderRadius: '12px', padding: '0 2rem', border: '1px solid #ef4444', color: '#ef4444' }}
                      onClick={() => window.location.reload()}
                    >
                      <CloseOutlined /> Cancel
                    </Button>
                    <Button
                      className="next-button"
                      type="primary"
                      loading={loading}
                      onClick={handleSubmit}
                      style={{ height: '48px' }}
                    >
                      <CheckOutlined /> Submit Registration
                    </Button>
                  </div>
                )}
              </div>
            </Form>
          </div>

          {/* Sidebar */}
          <div className="modern-sidebar">
            {/* Registration Steps Card */}
            <div className="sidebar-card">
              <h3 className="card-title">Registration Steps</h3>
              <div className="vertical-steps">
                {tabs.map((tab, index) => (
                  <div key={tab.id} className={`v-step ${activeTab === index ? 'active' : ''}`}>
                    <div className="v-icon">{tab.icon}</div>
                    <div className="v-info">
                      <span className="v-label">{tab.label}</span>
                      <span className="v-status">
                        {activeTab === index ? 'In Progress' : (activeTab > index ? 'Completed' : 'Pending')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Card */}
            <div className="sidebar-card promo-card">
              <img src={promoIllustration} alt="Social Transformation" className="promo-illustration" />
              <div className="promo-content">
                <h4 className="promo-tagline">Why Partner With Us?</h4>
                <ul className="promo-benefits">
                  <li><i className="fa-solid fa-circle-check"></i> Social Transformation</li>
                  <li><i className="fa-solid fa-circle-check"></i> End-to-End Transparency</li>
                  <li><i className="fa-solid fa-circle-check"></i> Local Community Focus</li>
                  <li><i className="fa-solid fa-circle-check"></i> Funding and Scale</li>
                </ul>
              </div>
            </div>

            {/* Help Card */}
            <div className="sidebar-card help-card">
              <h4 className="help-title">Need Help?</h4>
              <p className="help-text">Our NGO relations team is here to assist you.</p>
              <a href="mailto:ngosupport@shreecement.com" className="contact-item">
                <i className="fa-solid fa-envelope"></i> ngosupport@shreecement.com
              </a>
              <a href="tel:+914066716367" className="contact-item">
                <i className="fa-solid fa-phone"></i> +91 (40) 6671 6367
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="modern-footer">
        <div className="footer-copyright">
          © 2026 Shree Cement Limited. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
