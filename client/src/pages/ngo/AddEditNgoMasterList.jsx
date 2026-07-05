import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Tooltip,
  Typography,
  Upload
} from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { fetchAllCategoryList, fetchAllThemeList, getAllEducation, getAllState } from "../../services/Master-service";
import { ngoCreateApi } from "../../services/Ngo-service";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const noLeadingSpace = /^(?!\s)/;
const noEmoji = /^(?!.*[\p{Extended_Pictographic}]).*$/u;
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

const AddEditNgoMasterList = ({ visible, onClose, data, fetchData }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [states, setStates] = useState([]);
  const [educationOptions, setEducationOptions] = useState([]);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]
  const [formData, setFormData] = useState({
    tngo_id: data?.tngo_id || "",
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

  });

  const [fileLists, setFileLists] = useState({});

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);



  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    const response = await ngoCreateApi(payload); // Your API must accept dataToValidate

    if (!response.success) {
      toast.error("Failed to submit NGO details. Please try again.");
      return;
    }
    fetchData();
    toast.success("NGO details submitted successfully!");

    onClose();
  };


  // useEffect(() => {
  //   if (data && data.tngo_id) {

  //     setFormData({
  //       tngo_id: data.tngo_id || "",
  //       tngo_name: data.tngo_name || "",
  //       tngo_area_of_expertise: data.tngo_area_of_expertise || "",
  //       tngo_category: data.tngo_category || "",
  //       tngo_contact_no: data.tngo_contact_no || "",
  //       tngo_email_id: data.tngo_email_id || "",
  //       tngo_website: data.tngo_website || "",
  //       tngo_ngo_darpan_no: data.tngo_ngo_darpan_no || "",
  //       tngo_reg_address_of_org: data.tngo_reg_address_of_org || "",
  //       tngo_present_address_of_org: data.tngo_present_address_of_org || "",
  //       tngo_state_id: data.tngo_state_id || "",
  //       tngo_csr_reg_no: data.tngo_csr_reg_no || "",
  //       tngo_pan_no: data.tngo_pan_no || "",
  //       tngo_bank_account_no: data.tngo_bank_account_no || "",
  //       tngo_bank_account_name: data.tngo_bank_account_name || "",
  //       tngo_bank_name: data.tngo_bank_name || "",
  //       tngo_bank_ifsc_code: data.tngo_bank_ifsc_code || "",
  //       tngo_address_of_the_bank: data.tngo_address_of_the_bank || "",
  //       tngo_remarks: data.tngo_remarks || "",
  //       tngo_niti_aayog_darpan_por_reg: data.tngo_niti_aayog_darpan_por_reg || "",

  //       tngo_user_name: data.tngo_user_name || "",
  //       tngo_user_contact_no: data.tngo_user_contact_no || "",
  //       tngo_user_email_id: data.tngo_user_email || "",
  //       tngo_user_education_id: data.tngo_user_education_id || "",
  //       tngo_user_status: data.tngo_user_status || "",

  //       // docs handled separately
  //       tngo_csr_one_res_org_doc: null,
  //       tngo_res_certificate_org_doc: null,
  //       tngo_pan_card_org_doc: null,
  //       tngo_twelve_aa_certificate_doc: null,
  //       tngo_eighty_g_certificate_org_doc: null,
  //       tngo_by_law_org_doc: null,
  //       tngo_memorandum_association_org_doc: null,
  //       tngo_list_of_exist_gov_body_members_doc: null,
  //       tngo_details_of_office_bearers_doc: null,
  //       tngo_audit_report_org_with_income_tax_return_doc: null,
  //       tngo_fcra_reg_certificate_doc: null,
  //     });

  //     // Map documents
  //     const fileMap = (data.documents || []).reduce((acc, doc) => {

  //       const fileObj = {
  //         uid: doc.tdoc_id,
  //         name: doc.doc_name,
  //         status: "done",
  //         url: doc.full_url,
  //         id: doc.tdoc_id,
  //       };

  //       if (!acc[doc.doc_purpose]) {
  //         acc[doc.doc_purpose] = [];
  //       }

  //       acc[doc.doc_purpose].push(fileObj);

  //       return acc;
  //     }, {});

  //     setFileLists(fileMap);

  //   } else {

  //     setFileLists({});
  //   }

  // }, [data]);

  useEffect(() => {
    if (data && data.tngo_id) {

      const newFormData = {
        tngo_id: data.tngo_id || "",
        tngo_name: data.tngo_name || "",
        tngo_area_of_expertise: data.tngo_area_of_expertise || "",
        tngo_category: data.tngo_category || "",
        tngo_contact_no: data.tngo_contact_no || "",
        tngo_email_id: data.tngo_email_id || "",
        tngo_website: data.tngo_website || "",
        tngo_ngo_darpan_no: data.tngo_ngo_darpan_no || "",
        tngo_reg_address_of_org: data.tngo_reg_address_of_org || "",
        tngo_present_address_of_org: data.tngo_present_address_of_org || "",
        tngo_state_id: data.tngo_state_id || "",
        tngo_csr_reg_no: data.tngo_csr_reg_no || "",
        tngo_pan_no: data.tngo_pan_no || "",
        tngo_bank_account_no: data.tngo_bank_account_no || "",
        tngo_bank_account_name: data.tngo_bank_account_name || "",
        tngo_bank_name: data.tngo_bank_name || "",
        tngo_bank_ifsc_code: data.tngo_bank_ifsc_code || "",
        tngo_address_of_the_bank: data.tngo_address_of_the_bank || "",
        tngo_remarks: data.tngo_remarks || "",
        tngo_niti_aayog_darpan_por_reg: data.tngo_niti_aayog_darpan_por_reg || "",

        tngo_user_name: data.tngo_user_name || "",
        tngo_user_contact_no: data.tngo_user_contact_no || "",
        tngo_user_email_id: data.tngo_user_email || "",
        tngo_user_education_id: data.tngo_user_education_id || "",
        tngo_user_status: data.tngo_user_status || "",
      };

      const fileMap = {};

      (data.documents || []).forEach((doc) => {

        const fileObj = {
          uid: doc.tdoc_id,
          name: doc.doc_name,
          status: "done",
          url: doc.full_url,
          id: doc.tdoc_id
        };

        if (!fileMap[doc.doc_purpose]) {
          fileMap[doc.doc_purpose] = [];
        }

        fileMap[doc.doc_purpose].push(fileObj);

        // ⭐ IMPORTANT: also set formData
        newFormData[doc.doc_purpose] = fileObj;
      });

      setFormData(newFormData);
      setFileLists(fileMap);

    } else {
      setFileLists({});
    }

  }, [data]);
  return (
    <Modal className="ngo-master-section"
      title={
        <>
          {`${data?.id ? "Update" : "Add"} NGO`}
          <br />
          <Text
            type="secondary"
            style={{ fontSize: "12px", fontWeight: "bold" }}
          >
            Please fill in all required fields.
          </Text>
        </>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={"80%"}
      style={{ top: 20 }}
      maskClosable={false}
      footer={[
        <Divider
          key="divider"
          style={{ margin: "0 0 10px 0", borderColor: "lightgrey" }}
        />,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Submit
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item label="Name of the NGO" required>
              <Input
                value={formData.tngo_name}
                onChange={(e) => handleChange("tngo_name", e.target.value)}
              />
              {errors.tngo_name && (
                <div className="text-danger">{errors.tngo_name}</div>
              )}
            </Form.Item>
          </Col>
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
          <Col span={12}>
            <Form.Item label="Contact No" required>
              <Input
                value={formData.tngo_contact_no}
                onChange={(e) => handleChange("tngo_contact_no", e.target.value)}
              />
              {errors.tngo_contact_no && (
                <div className="text-danger">{errors.tngo_contact_no}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Email ID" required>
              <Input
                value={formData.tngo_email_id}
                onChange={(e) => handleChange("tngo_email_id", e.target.value)}
              />
              {errors.tngo_email_id && (
                <div className="text-danger">{errors.tngo_email_id}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Website" required>
              <Input
                value={formData.tngo_website}
                onChange={(e) => handleChange("tngo_website", e.target.value)}
              />
              {errors.tngo_website && (
                <div className="text-danger">{errors.tngo_website}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="NGO Darpan No" required>
              <Input
                value={formData.tngo_ngo_darpan_no}
                onChange={(e) => handleChange("tngo_ngo_darpan_no", e.target.value)}
              />
              {errors.tngo_ngo_darpan_no && (
                <div className="text-danger">{errors.tngo_ngo_darpan_no}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Registered Address of the Organization" required>
              <Input
                value={formData.tngo_reg_address_of_org}
                onChange={(e) => handleChange("tngo_reg_address_of_org", e.target.value)}
              />
              {errors.tngo_reg_address_of_org && (
                <div className="text-danger">{errors.tngo_reg_address_of_org}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Present Address of the Organization" required>
              <Input
                value={formData.tngo_present_address_of_org}
                onChange={(e) => handleChange("tngo_present_address_of_org", e.target.value)}
              />
              {errors.tngo_present_address_of_org && (
                <div className="text-danger">{errors.tngo_present_address_of_org}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Geographical presence" required>

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
          <Col span={12}>
            <Form.Item label="CSR Registration No" required>
              <Input
                value={formData.tngo_csr_reg_no}
                onChange={(e) => handleChange("tngo_csr_reg_no", e.target.value)}
              />
              {errors.tngo_csr_reg_no && (
                <div className="text-danger">{errors.tngo_csr_reg_no}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="NITI Aayog DARPAN portal registration" required>
              <Input
                value={formData.tngo_niti_aayog_darpan_por_reg}
                onChange={(e) => handleChange("tngo_niti_aayog_darpan_por_reg", e.target.value)}
              />
              {errors.tngo_niti_aayog_darpan_por_reg && (
                <div className="text-danger">{errors.tngo_niti_aayog_darpan_por_reg}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="PAN No" required>
              <Input
                value={formData.tngo_pan_no}
                onChange={(e) => handleChange("tngo_pan_no", e.target.value)}
              />
              {errors.tngo_pan_no && (
                <div className="text-danger">{errors.tngo_pan_no}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Remarks" required>
              <Input
                value={formData.tngo_remarks}
                onChange={(e) => handleChange("tngo_remarks", e.target.value)}
              />
              {errors.tngo_remarks && (
                <div className="text-danger">{errors.tngo_remarks}</div>
              )}
            </Form.Item>
          </Col>

        </Row>


        {/* Bank Details */}
        <fieldset
          style={{
            border: "1px solid #d9d9d9",
            padding: "16px",
            borderRadius: "6px",
          }}
        >
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>
            Bank Details
          </legend>
          <Row gutter={[12, 2]}>
            <Col span={12}>
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
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item label="Bank Name" required>
                <Input
                  value={formData.tngo_bank_name}
                  onChange={(e) =>
                    handleChange("tngo_bank_name", e.target.value)
                  }
                />
                {errors.tngo_bank_name && (
                  <div className="text-danger">{errors.tngo_bank_name}</div>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item label="Address of the bank" required>
                <Input.TextArea
                  rows={3} // you can increase/decrease rows
                  value={formData.tngo_address_of_the_bank}
                  onChange={(e) =>
                    handleChange(
                      "tngo_address_of_the_bank",
                      e.target.value
                    )
                  }
                />
                {errors.tngo_address_of_the_bank && (
                  <div className="text-danger">
                    {errors.tngo_address_of_the_bank}
                  </div>
                )}
              </Form.Item>
            </Col>


          </Row>
        </fieldset>


        {/* User Details */}
        <fieldset
          style={{
            border: "1px solid #d9d9d9",
            padding: "16px",
            borderRadius: "6px",
          }}
        >
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>
            User Details
          </legend>
          <Row gutter={[12, 2]}>
            <Col span={12}>
              <Form.Item label="User Name" required>
                <Input
                  value={formData.tngo_user_name}
                  onChange={(e) =>
                    handleChange("tngo_user_name", e.target.value)
                  }
                />
                {errors.tngo_user_name && (
                  <div className="text-danger">
                    {errors.tngo_user_name}
                  </div>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="User Contact No" required>
                <Input
                  value={formData.tngo_user_contact_no}
                  onChange={(e) =>
                    handleChange("tngo_user_contact_no", e.target.value)
                  }
                />
                {errors.tngo_user_contact_no && (
                  <div className="text-danger">
                    {errors.tngo_user_contact_no}
                  </div>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="User Email" required>
                <Input
                  value={formData.tngo_user_email_id}
                  onChange={(e) =>
                    handleChange("tngo_user_email_id", e.target.value)
                  }
                />
                {errors.tngo_user_email_id && (
                  <div className="text-danger">{errors.tngo_user_email_id}</div>
                )}
              </Form.Item>
            </Col>

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
        </fieldset>

        {/* CSR 1 registration document of the organization */}
        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload CSR 1 registration document of the organization
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
              validateStatus={errors?.tngo_csr_one_res_org_doc ? "error" : ""}
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
                  handleChange("tngo_csr_one_res_org_doc", latestFile?.[0]);
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

        {/* Registration certificate of the organization */}
        <Row gutter={[12, 2]}>

          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload Registration certificate of the organization
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
                errors?.tngo_res_certificate_org_doc ? "error" : ""
              }
              help={errors?.tngo_res_certificate_org_doc}
            >
              <Upload
                fileList={fileLists?.["tngo_res_certificate_org_doc"] || []}
                beforeUpload={() => false}
                multiple={false} // ✅ Single file upload only
                accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                onChange={({ fileList }) => {
                  const latestFile = fileList?.slice(-1);
                  setFileLists((prev) => ({
                    ...prev,
                    tngo_res_certificate_org_doc: latestFile,
                  }));
                  handleChange("tngo_res_certificate_org_doc", latestFile?.[0]);
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

        {/* PAN card of the organization */}
        <Row gutter={[12, 2]}>

          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload PAN card of the organization
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
              validateStatus={errors?.tngo_pan_card_org_doc ? "error" : ""}
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
        </Row>

        {/* 12AA certificate (renewed) */}
        <Row gutter={[12, 2]}>

          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload 12AA certificate (renewed)
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
                errors?.tngo_twelve_aa_certificate_doc ? "error" : ""
              }
              help={errors?.tngo_twelve_aa_certificate_doc}
            >
              <Upload
                fileList={fileLists?.["tngo_twelve_aa_certificate_doc"] || []}
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
        </Row>

        {/* 80G certificate of the organization (renewed) */}
        <Row gutter={[12, 2]}>

          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload 80G certificate of the organization (renewed)
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
        </Row>


        {/* Bye laws of the organization */}
        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload Bye laws of the organization
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
        </Row>

        {/* Memorandum of Association of the organization */}
        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload Memorandum of Association of the organization
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
        </Row>

        {/* List of existing Governing Body Members / trusteers with PAN card details */}
        <Row gutter={[12, 2]}>

          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload List of existing Governing Body Members / trusteers
                  with PAN card details
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
                errors?.tngo_list_of_exist_gov_body_members_doc ? "error" : ""
              }
              help={errors?.tngo_list_of_exist_gov_body_members_doc}
            >
              <Upload
                fileList={
                  fileLists?.["tngo_list_of_exist_gov_body_members_doc"] || []
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
        </Row>

        {/* Details of office bearers / responsible person of the organization */}
        <Row gutter={[12, 2]}>

          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Details of office bearers / responsible person of the organization
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
                errors?.tngo_details_of_office_bearers_doc ? "error" : ""
              }
              help={errors?.tngo_details_of_office_bearers_doc}
            >
              <Upload
                fileList={
                  fileLists?.["tngo_details_of_office_bearers_doc"] || []
                }
                beforeUpload={() => false}
                multiple={false} // ✅ Single file upload only
                accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                onChange={({ fileList }) => {
                  const latestFile = fileList?.slice(-1);
                  setFileLists((prev) => ({
                    ...prev,
                    tngo_details_of_office_bearers_doc: latestFile,
                  }));
                  handleChange(
                    "tngo_details_of_office_bearers_doc",
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

        {/* Audit Report of the organization with income tax returns for three immediate financial years */}
        <Row gutter={[12, 2]}>



          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload Audit Report of the organization with income tax returns
                  for three immediate financial years
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
                errors?.tngo_audit_report_org_with_income_tax_return_doc ? "error" : ""
              }
              help={errors?.tngo_audit_report_org_with_income_tax_return_doc}
            >
              <Upload
                fileList={
                  fileLists?.["tngo_audit_report_org_with_income_tax_return_doc"] || []
                }
                beforeUpload={() => false}
                multiple={false} // ✅ Single file upload only
                accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                onChange={({ fileList }) => {
                  const latestFile = fileList?.slice(-1);
                  setFileLists((prev) => ({
                    ...prev,
                    tngo_audit_report_org_with_income_tax_return_doc: latestFile,
                  }));
                  handleChange(
                    "tngo_audit_report_org_with_income_tax_return_doc",
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

        {/* FCRA registration certificate */}
        <Row gutter={[12, 2]}>

          <Col span={12}>
            <Form.Item
              label={
                <span>
                  Upload FCRA registration certificate
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
                errors?.tngo_fcra_reg_certificate_doc ? "error" : ""
              }
              help={errors?.tngo_fcra_reg_certificate_doc}
            >
              <Upload
                fileList={fileLists?.["tngo_fcra_reg_certificate_doc"] || []}
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

      </Form>
    </Modal>
  );
};

export default AddEditNgoMasterList;
