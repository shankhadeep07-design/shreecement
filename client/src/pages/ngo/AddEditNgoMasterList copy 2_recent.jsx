import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Tooltip,
  Typography,
  Upload,
  DatePicker,
  InputNumber,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { getSubMasterListByMasterSlugApi } from "../../services/Master-service";
import { ngoCreateApi } from "../../services/Ngo-service";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// const Schema = Yup.object({
//     tngo_name: Yup.string().required("Name is required"),
//     tngo_objective: Yup.string().required("Mission and Vision is required"),
//     // tngo_factorys: Yup.array().min(1, "At least one area of factory is required"),
//     tngo_csr_reg_no: Yup.string().required("CSR Registration Number is required"),
//     tngo_category: Yup.string().required("Registration type is required"),
//     tngo_email: Yup.string().email("Invalid email").required("Email is required"),
//     tngo_contact_no: Yup.string().required("Contact number is required"),
//     tngo_target_beneficiaries: Yup.array()
//         .min(1, "At least one Target Beneficiary is required")
//         .required("Target Beneficiary is required"),

//     tngo_pan_no: Yup.string().required("PAN number is required"),
//     tngo_twelve_a_registration_number: Yup.string().required("12A Registration Number is required"),

//     tngo_fcra_license_is_guaranteed: Yup.string().required("FCRA License Purpose is required"),
//     tngo_registered_address: Yup.string().required("Registered Address is required"),
//     // tngo_user_id: Yup.string().required("NGO User is required"),
//     tngo_logo: Yup.mixed()
//         .required("Logo is required"),

//     // For state and district (custom validated)
//     state_district_blocks: Yup.array()
//         .min(1, "At least one state district must be selected")
//         .required("State District selection is required"),
// });

const AddEditNgoMasterList = ({ visible, onClose, data, fetchData }) => {
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
  const [formData, setFormData] = useState({
    tngo_id: data?.tngo_id || "",
    tngo_name: "",
    tngo_date: null,
    tngo_csr_one_res_org: "",
    tngo_csr_one_res_org_doc: null,
    tngo_res_certificate_org: "",
    tngo_res_certificate_org_doc: null,
    tngo_amount_received: "",
    tngo_amount_spent: "",
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

    // ✅ Point of contact details
    tngo_contact_name: "",
    tngo_contact_phone_no: "",
    tngo_contact_email: "",
    tngo_contact_office_address: "",

    // ✅ Key person details
    tngo_key_person_name: "",
    tngo_key_person_phone_no: "",
    tngo_key_person_email: "",
    tngo_key_person_office_address: "",
    password: "",
    tngo_name_of_entity: "",
    tngo_status_of_entity_id: "",
    tngo_name_of_group: "",
    tngo_pan: "",
    tngo_gst: "",
    tngo_website: "",
  });

  const [fileLists, setFileLists] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchRegisterSubMasterListByMasterSlug = () => {
    getSubMasterListByMasterSlugApi({ master_slug: "registered" })
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

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleValidation = async (data) => {
  //     try {
  //         await Schema.validate(data, { abortEarly: false });
  //         setErrors({});
  //         return true;
  //     } catch (err) {

  //         // console.log("Validation error:", err);

  //         const formatted = err.inner?.reduce((acc, curr) => {
  //             acc[curr.path] = curr.message;
  //             return acc;
  //         }, {});
  //         setErrors(formatted || {});
  //         return false;
  //     }
  // };

  useEffect(() => {
    fetchRegisterSubMasterListByMasterSlug();
  }, []);

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
        } else if (key === "tngo_financial_statements") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_tax_exemption_report") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else if (key === "tngo_third_party_assessment_report") {
          if (dataToValidate[key]?.originFileObj) {
            payload.append(key, dataToValidate[key].originFileObj);
          }
        } else {
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

  useEffect(() => {
    if (data && data.tngo_id) {
      // ✅ Populate formData (ignore unwanted backend fields like created_at, updated_at etc.)
      setFormData({
        tngo_id: data.tngo_id || "",

        tngo_name: data.tngo_name || "",
        tngo_date: data.tngo_date || "",
        tngo_csr_one_res_org: data.tngo_csr_one_res_org || "",
        tngo_res_certificate_org: data.tngo_res_certificate_org || "",
        tngo_amount_received: data.tngo_amount_received || "",
        tngo_amount_spent: data.tngo_amount_spent || "",
        tngo_register_id: data.tngo_register_id || "",
        tngo_pan_card_org: data.tngo_pan_card_org || "",
        tngo_twelve_aa_certificate: data.tngo_twelve_aa_certificate || "",
        tngo_eighty_g_certificate_org: data.tngo_eighty_g_certificate_org || "",
        tngo_list_of_exist_gov_body_members:
          data.tngo_list_of_exist_gov_body_members || "",
        tngo_details_of_office_bearers:
          data.tngo_details_of_office_bearers || "",
        tngo_audit_report_org_with_income_tax_return:
          data.tngo_audit_report_org_with_income_tax_return || "",
        tngo_bank_account_no: data.tngo_bank_account_no || "",
        tngo_bank_account_name: data.tngo_bank_account_name || "",
        tngo_bank_name: data.tngo_bank_name || "",
        tngo_bank_ifsc_code: data.tngo_bank_ifsc_code || "",
        tngo_bank_address_of_the_bank: data.tngo_bank_address_of_the_bank || "",
        tngo_fcra_reg_certificate: data.tngo_fcra_reg_certificate || "",
        tngo_niti_aayog_darpan_reg: data.tngo_niti_aayog_darpan_reg || "",
        tngo_complete_address_reg_doc_org:
          data.tngo_complete_address_reg_doc_org || "",
        tngo_contact_name: data.tngo_contact_name || "",
        tngo_contact_phone_no: data.tngo_contact_phone_no || "",
        tngo_contact_email: data.tngo_contact_email || "",
        tngo_contact_office_address: data.tngo_contact_office_address || "",
        tngo_key_person_name: data.tngo_key_person_name || "",
        tngo_key_person_phone_no: data.tngo_key_person_phone_no || "",
        tngo_key_person_email: data.tngo_key_person_email || "",
        tngo_key_person_office_address:
          data.tngo_key_person_office_address || "",
        // ✅ Key person details
     
      
      
        
        password: data.password || "",
        tngo_name_of_entity: data.tngo_name_of_entity || "",
        tngo_status_of_entity_id: data.tngo_status_of_entity_id || "",
        tngo_registered_off_address: data.tngo_registered_off_address || "",
        tngo_corporate_off_address: data.tngo_corporate_off_address || "",
        tngo_branches: data.tngo_branches || "",
        tngo_name_of_group: data.tngo_name_of_group || "",
        tngo_pan: data.tngo_pan || "",
        tngo_gst: data.tngo_gst || "",
        tngo_website: data.tngo_website || "",
      });

      // ✅ Map documents array into fileLists
      const fileMap = (data.documents || []).reduce((acc, doc) => {
        const fileObj = {
          uid: doc.tdoc_id,
          name: doc.doc_name || "Uploaded Document",
          status: "done",
          url: doc.full_url,
          id: doc.tdoc_id,
        };

        if (!acc[doc.doc_purpose]) {
          acc[doc.doc_purpose] = [];
        }
        acc[doc.doc_purpose].push(fileObj);
        return acc;
      }, {});

      setFileLists(fileMap);
    } else {
      // ✅ Reset empty form
      setFormData({
        tngo_id: "",
        tngo_name: "",
        tngo_date: "",
        tngo_csr_one_res_org: "",
        tngo_res_certificate_org: "",
        tngo_register_id: "",
        tngo_amount_received: "",
        tngo_amount_spent: "",
        tngo_pan_card_org: "",
        tngo_twelve_aa_certificate: "",
        tngo_eighty_g_certificate_org: "",
        tngo_list_of_exist_gov_body_members: "",
        tngo_details_of_office_bearers: "",
        tngo_audit_report_org_with_income_tax_return: "",
        tngo_bank_account_no: "",
        tngo_bank_account_name: "",
        tngo_bank_name: "",
        tngo_bank_ifsc_code: "",
        tngo_bank_address_of_the_bank: "",
        tngo_fcra_reg_certificate: "",
        tngo_niti_aayog_darpan_reg: "",
        tngo_complete_address_reg_doc_org: "",
        tngo_contact_name: "",
        tngo_contact_phone_no: "",
        tngo_contact_email: "",
        tngo_contact_office_address: "",
        tngo_key_person_name: "",
        tngo_key_person_phone_no: "",
        tngo_key_person_email: "",
        tngo_key_person_office_address: "",

       
      
        password: "",
        tngo_name_of_entity: "",
        tngo_status_of_entity_id: "",
        tngo_registered_off_address: "",
        tngo_corporate_off_address: "",
        tngo_branches: "",
        tngo_name_of_group: "",
        tngo_website: "",
      });
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
        </Row>

        {/* CSR 1 registration document of the organization */}
        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item
              label="CSR 1 registration document of the organization"
              required
            >
              <Input
                value={formData.tngo_csr_one_res_org}
                onChange={(e) =>
                  handleChange("tngo_csr_one_res_org", e.target.value)
                }
              />
              {errors.tngo_csr_one_res_org && (
                <div className="text-danger">{errors.tngo_csr_one_res_org}</div>
              )}
            </Form.Item>
          </Col>

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
              label="Registration certificate of the organization"
              required
            >
              <Input
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

        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item
              label="Amount received in last three years (In Rs. Lacs)"
              required
            >
              <InputNumber
                style={{ width: "100%" }}
                value={formData.tngo_amount_received}
                onChange={(e) =>
                  handleChange("tngo_amount_received", e.target.value)
                }
              />
              {errors.tngo_amount_received && (
                <div className="text-danger">{errors.tngo_amount_received}</div>
              )}
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Amount spent in last three years (In Rs. Lacs)"
              required
            >
              <InputNumber
                style={{ width: "100%" }}
                value={formData.tngo_amount_spent}
                onChange={(e) =>
                  handleChange("tngo_amount_spent", e.target.value)
                }
              />
              {errors.tngo_amount_spent && (
                <div className="text-danger">{errors.tngo_amount_spent}</div>
              )}
            </Form.Item>
          </Col>
        </Row>

        {/* Registered */}
        <Row gutter={[12, 2]}>
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
              onChange={(value) => handleChange("tngo_register_id", value)}
              style={{ width: "100%" }}
              options={registerOptions}
            />
            {errors?.tngo_register_id && (
              <div className="error text-danger">{errors.tngo_register_id}</div>
            )}
          </Col>
        </Row>

        {/* PAN card of the organization */}
        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item label="PAN card of the organization" required>
              <Input
                value={formData.tngo_pan_card_org}
                onChange={(e) =>
                  handleChange("tngo_pan_card_org", e.target.value)
                }
              />
              {errors.tngo_pan_card_org && (
                <div className="text-danger">{errors.tngo_pan_card_org}</div>
              )}
            </Form.Item>
          </Col>

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
            <Form.Item label="12AA certificate (renewed)" required>
              <Input
                value={formData.tngo_twelve_aa_certificate}
                onChange={(e) =>
                  handleChange("tngo_twelve_aa_certificate", e.target.value)
                }
              />
              {errors.tngo_twelve_aa_certificate && (
                <div className="text-danger">
                  {errors.tngo_twelve_aa_certificate}
                </div>
              )}
            </Form.Item>
          </Col>

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
              label="80G certificate of the organization (renewed)"
              required
            >
              <Input
                value={formData.tngo_eighty_g_certificate_org}
                onChange={(e) =>
                  handleChange("tngo_eighty_g_certificate_org", e.target.value)
                }
              />
              {errors.tngo_eighty_g_certificate_org && (
                <div className="text-danger">
                  {errors.tngo_eighty_g_certificate_org}
                </div>
              )}
            </Form.Item>
          </Col>

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
          <Col span={12}></Col>
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
          <Col span={12}></Col>
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
              label="List of existing Governing Body Members / trusteers with PAN card details"
              required
            >
              <Input
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
              label="Details of office bearers / responsible person of the organization"
              required
            >
              <Input
                value={formData.tngo_details_of_office_bearers}
                onChange={(e) =>
                  handleChange("tngo_details_of_office_bearers", e.target.value)
                }
              />
              {errors.tngo_details_of_office_bearers && (
                <div className="text-danger">
                  {errors.tngo_details_of_office_bearers}
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>

        {/* Audit Report of the organization with income tax returns for three immediate financial years */}
        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item
              label="Audit Report of the organization with income tax returns for three immediate financial years"
              required
            >
              <Input
                value={formData.tngo_audit_report_org_with_income_tax_return}
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

          <Col span={12}>
            <label
              htmlFor="tngo_audit_report_org_with_income_tax_return_doc"
              className="form-label"
            >
              Upload Audit Report of the organization with income tax returns
              for three immediate financial years
              {/* <span className="text-danger"> *</span> */}
              <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX.">
                <InfoCircleOutlined
                  style={{
                    color: "#1890ff",
                    marginLeft: 8,
                    cursor: "pointer",
                  }}
                />
              </Tooltip>{" "}
            </label>
            <br />

            <div
              style={{
                width: "100%",
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #d9d9d9",
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "#fff",
              }}
            >
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
                    tngo_audit_report_org_with_income_tax_return_doc: fileList,
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
                        (e.currentTarget.style.backgroundColor = "#f5f5f5")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#fff")
                      }
                    >
                      <div style={{ flex: 1, fontSize: 14 }}>{originNode}</div>
                      <Popconfirm
                        title="Are you sure to delete this?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={async () => {
                          const isDeleted = await deleteFile(file);
                          if (isDeleted) {
                            const updatedList = (currFileList || []).filter(
                              (f) => f.uid !== file.uid
                            );
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
                <Button style={{ marginBottom: 4 }} icon={<UploadOutlined />}>
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

            <Col span={12}>
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
                  fileList={fileLists?.["tngo_cancelled_cheque_doc"] || []}
                  beforeUpload={() => false}
                  multiple={false} // ✅ Single file upload only
                  accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                  onChange={({ fileList }) => {
                    const latestFile = fileList?.slice(-1);
                    setFileLists((prev) => ({
                      ...prev,
                      tngo_cancelled_cheque_doc: latestFile,
                    }));
                    handleChange("tngo_cancelled_cheque_doc", latestFile?.[0]);
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
        </fieldset>

        {/* FCRA registration certificate */}
        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item label="FCRA registration certificate" required>
              <Input
                value={formData.tngo_fcra_reg_certificate}
                onChange={(e) =>
                  handleChange("tngo_fcra_reg_certificate", e.target.value)
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

        {/* NITI Aayog DARPAN portal registration */}
        <Row gutter={[12, 2]}>
          <Col span={12}>
            <Form.Item label="NITI Aayog DARPAN portal registration" required>
              <Input
                value={formData.tngo_niti_aayog_darpan_reg}
                onChange={(e) =>
                  handleChange("tngo_niti_aayog_darpan_reg", e.target.value)
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
                fileList={fileLists?.["tngo_niti_aayog_darpan_reg_doc"] || []}
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
                  Upload Complete address as per registration document of the
                  organization / in case of any change in the address please
                  provide the valid address with documentary proof.
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
                errors?.tngo_complete_address_reg_doc_org_doc ? "error" : ""
              }
              help={errors?.tngo_complete_address_reg_doc_org_doc}
            >
              <Upload
                fileList={
                  fileLists?.["tngo_complete_address_reg_doc_org_doc"] || []
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

        {/* Point of contact details */}
        <fieldset
          style={{
            border: "1px solid #d9d9d9",
            padding: "16px",
            borderRadius: "6px",
          }}
        >
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>
            Point of contact details
          </legend>
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
                  <div className="text-danger">{errors.tngo_contact_name}</div>
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
              <Form.Item label="E-mail" required>
                <Input
                  value={formData.tngo_contact_email}
                  onChange={(e) =>
                    handleChange("tngo_contact_email", e.target.value)
                  }
                />
                {errors.tngo_contact_email && (
                  <div className="text-danger">{errors.tngo_contact_email}</div>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Office Address" required>
                <Input
                  value={formData.tngo_contact_office_address}
                  onChange={(e) =>
                    handleChange("tngo_contact_office_address", e.target.value)
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
        </fieldset>

        {/* Key person details */}
        <fieldset
          style={{
            border: "1px solid #d9d9d9",
            padding: "16px",
            borderRadius: "6px",
          }}
        >
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>
            Key person details
          </legend>
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
                    handleChange("tngo_key_person_phone_no", e.target.value)
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
          </Row>
        </fieldset>

        {/* Key person details */}
        <fieldset
          style={{
            border: "1px solid #d9d9d9",
            padding: "16px",
            borderRadius: "6px",
          }}
        >
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>
            Key person details
          </legend>
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
                    handleChange("tngo_key_person_phone_no", e.target.value)
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
                      marginLeft: 8,
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>{" "}
              </label>
              <br />

              <div
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid #d9d9d9",
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                }}
              >
                <Upload
                  fileList={fileLists?.["tngo_key_uploaded_documents"] || []}
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
                          marginBottom: 6,
                          border: "1px solid #d9d9d9",
                          borderRadius: 6,
                          backgroundColor: "#fff",
                          transition: "background-color 0.2s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f5f5f5")
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
                              const updatedList = (currFileList || []).filter(
                                (f) => f.uid !== file.uid
                              );
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
                  <Button style={{ marginBottom: 4 }} icon={<UploadOutlined />}>
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

          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>KYC</legend>
          <Row gutter={[12, 2]}>
            <Col span={12}>
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

            <Col span={12}>
              <label htmlFor="tngo_status_of_entity_id" className="form-label">
                <span className="text-danger">*</span> Status of Entity
              </label>
              <Select
                placeholder="Select Status of Entity"
                id="tngo_status_of_entity_id"
                name="tngo_status_of_entity_id"
                value={statusEntityOptions.find(
                  ({ value }) => value == formData?.tngo_status_of_entity_id
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

            <Col span={12}>
              <Form.Item label="Registered Office Address" required>
                <Input
                  value={formData.tngo_registered_off_address}
                  onChange={(e) =>
                    handleChange("tngo_registered_off_address", e.target.value)
                  }
                />
                {errors.tngo_registered_off_address && (
                  <div className="text-danger">
                    {errors.tngo_registered_off_address}
                  </div>
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Corporate Office Address" required>
                <Input
                  value={formData.tngo_corporate_off_address}
                  onChange={(e) =>
                    handleChange("tngo_corporate_off_address", e.target.value)
                  }
                />
                {errors.tngo_corporate_off_address && (
                  <div className="text-danger">
                    {errors.tngo_corporate_off_address}
                  </div>
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Branches" required>
                <Input
                  value={formData.tngo_branches}
                  onChange={(e) =>
                    handleChange("tngo_branches", e.target.value)
                  }
                />
                {errors.tngo_branches && (
                  <div className="text-danger">{errors.tngo_branches}</div>
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    Financial statements for the last 3 years
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
                  errors?.tngo_financial_statements ? "error" : ""
                }
                help={errors?.tngo_financial_statements}
              >
                <Upload
                  fileList={fileLists?.["tngo_financial_statements"] || []}
                  beforeUpload={() => false}
                  multiple={false} // ✅ Single file upload only
                  accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                  onChange={({ fileList }) => {
                    const latestFile = fileList?.slice(-1);
                    setFileLists((prev) => ({
                      ...prev,
                      tngo_financial_statements: latestFile,
                    }));
                    handleChange("tngo_financial_statements", latestFile?.[0]);
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
                onChange={(value) => handleChange("tngo_name_of_group", value)}
                style={{ width: "100%" }}
                options={nameGroupOptions}
              />
              {errors?.tngo_name_of_group && (
                <div className="error text-danger">
                  {errors.tngo_name_of_group}
                </div>
              )}
            </Col>
            <Col span={12}>
              <Form.Item label="PAN" required>
                <Input
                  value={formData.tngo_pan}
                  onChange={(e) => handleChange("tngo_pan", e.target.value)}
                />
                {errors.tngo_pan && (
                  <div className="text-danger">{errors.tngo_pan}</div>
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="GST Number" required>
                <Input
                  value={formData.tngo_gst}
                  onChange={(e) => handleChange("tngo_gst", e.target.value)}
                />
                {errors.tngo_gst && (
                  <div className="text-danger">{errors.tngo_gst}</div>
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
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
                  fileList={fileLists?.["tngo_tax_exemption_report"] || []}
                  beforeUpload={() => false}
                  multiple={false} // ✅ Single file upload only
                  accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                  onChange={({ fileList }) => {
                    const latestFile = fileList?.slice(-1);
                    setFileLists((prev) => ({
                      ...prev,
                      tngo_tax_exemption_report: latestFile,
                    }));
                    handleChange("tngo_tax_exemption_report", latestFile?.[0]);
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
                    Third Party Assessment Report (If any)
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

            <Col span={12}>
              <Form.Item label="Website Details" required>
                <Input
                  value={formData.tngo_website}
                  onChange={(e) => handleChange("tngo_website", e.target.value)}
                />
                {errors.tngo_website && (
                  <div className="text-danger">{errors.tngo_website}</div>
                )}
              </Form.Item>
            </Col>
          </Row>
        </fieldset>
      </Form>
    </Modal>
  );
};

export default AddEditNgoMasterList;
