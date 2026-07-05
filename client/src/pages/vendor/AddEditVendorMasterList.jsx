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
import { vendorCreateApi, fetchVendorDetailsApi } from "../../services/Vendor-service";

import { getAllStateApi } from "../../services/State-service";
import { fetchDistrictsByStateIds } from "../../services/Master-service";
import { blocks_by_district_id_api } from "../../services/Block-service";
import TypedInputNumber from "antd/es/input-number";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddEditVendorMasterList = ({ visible, onClose, data, fetchData }) => {
  const [statusOptions, setstatusOptions] = useState([
    { value: 'Company', label: "Company" },
    { value: 'Firm', label: "Firm" },
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
  const [stateOptions, setStateOptions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [formData, setFormData] = useState({
    tvendor_id: data?.tvendor_id || "",
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

    tvendor_form_10_f_doc: null,
    tvendor_address_proof_doc: null,
    tvendor_notes: "",
  });

  const [fileLists, setFileLists] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ============== EDIT MODE ============== */
  useEffect(() => {
    if (!data?.tvendor_id) return;

    fetchVendorDetailsApi(data.tvendor_id).then((res) => {
      const d = res?.data;
      if (!d) return;

      const mapped = {
        ...d,



        // 🔥 Documents → AntD Upload format
        tevent_flyer: (d.documents || []).map((doc) => ({
          uid: doc.tdoc_id, // ✅ stable unique id
          name: doc.doc_name, // ✅ correct key
          status: "done",
          url: doc.full_url, // ✅ preview/download
          type: doc.doc_type,
        })),
      };

      setFormData(mapped);

      if (mapped.tvendor_state_id) {
        fetchDistrictsByStateIds(mapped.tvendor_state_id).then((res) =>
          setDistricts(res?.data || [])
        );
      }

      if (mapped.tvendor_district_id) {
        blocks_by_district_id_api(mapped.tvendor_district_id).then((res) =>
          setBlocks(res?.data || [])
        );
      }
    });
  }, [data?.tvendor_id]);

  /* ============== LOAD MASTERS ============== */
  useEffect(() => {
    getAllStateApi().then((res) => setStateOptions(res?.data || []));
  }, []);

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
    fetchData();
    toast.success("Vendor details submitted successfully!");

    onClose();
  };

  useEffect(() => {

    if (data && data.tvendor_id) {
      // ✅ Populate formData (ignore unwanted backend fields like created_at, updated_at etc.)
      setFormData({
        tvendor_id: data.tvendor_id || "",

        tvendor_prospect_name: data.tvendor_prospect_name || "",
        tvendor_preferred_location: data.tvendor_preferred_location || "",
        tvendor_additional_location: data.tvendor_additional_location || "",
        tvendor_state_id: data.tvendor_state_id || "",
        tvendor_district_id: data.tvendor_district_id || "",
        tvendor_block_id: data.tvendor_block_id || "",
        tvendor_pin_code: data.tvendor_pin_code || "",
        tvendor_gst: data.tvendor_gst || "",
        tvendor_description_goods: data.tvendor_description_goods || "",
        tvendor_hsn_codes: data.tvendor_hsn_codes || "",
        tvendor_pan: data.tvendor_pan || "",
        tvendor_adhar:
          data.tvendor_adhar || "",
        tvendor_msme:
          data.tvendor_msme || "",
        tvendor_statues:
          data.tvendor_statues || "",
        tvendor_msme_udyam: data.tvendor_msme_udyam || "",
        tvendor_cin: data.tvendor_cin || "",
        tvendor_office_phone1: data.tvendor_office_phone1 || "",
        tvendor_office_phone2: data.tvendor_office_phone2 || "",
        tvendor_work_phone1: data.tvendor_work_phone1 || "",
        tvendor_work_phone2: data.tvendor_work_phone2 || "",
        tvendor_office_fax1: data.tvendor_office_fax1 || "",
        tvendor_office_fax2:
          data.tvendor_office_fax2 || "",
        tvendor_work_fax_1: data.tvendor_work_fax_1 || "",
        tvendor_work_fax_2: data.tvendor_work_fax_2 || "",
        tvendor_email_1: data.tvendor_email_1 || "",
        tvendor_email_2: data.tvendor_email_2 || "",
        tvendor_contact_person_name: data.tvendor_contact_person_name || "",
        tvendor_contact_person_no: data.tvendor_contact_person_no || "",
        tvendor_relative_working: data.tvendor_relative_working || "",
        tvendor_relative_name: data.tvendor_relative_name || "",
        tvendor_relative_designation:
          data.tvendor_relative_designation || "",
        tvendor_relative_location: data.tvendor_relative_location || "",
        tvendor_relative_mobile: data.tvendor_relative_mobile || "",
        tvendor_bank_name: data.tvendor_bank_name || "",
        tvendor_bank_branch:
          data.tvendor_bank_branch || "",
        tvendor_bank_account_no: data.tvendor_bank_account_no || "",
        tvendor_bank_ifsc_code: data.tvendor_bank_ifsc_code || "",
        tvendor_declaration: data.tvendor_declaration || "",
        tvendor_notes: data.tvendor_notes || "",

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
        tvendor_id: "",
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
        tvendor_relative_name: "",
        tvendor_relative_designation: "",
        tvendor_relative_location: "",
        tvendor_relative_mobile: "",
        tvendor_bank_name: "",
        tvendor_bank_branch: "",
        tvendor_bank_account_no: "",
        tvendor_bank_ifsc_code: "",
        tvendor_declaration: "",
        tvendor_bank_address: "",

        tvendor_notes: "",
      });
      setFileLists({});
    }
  }, [data]);

  return (
    <Modal className="csr-volunteering-section"
      title={
        <>
          {`${data?.id ? "Update" : "Add"} Vendor`}
          <br />
          {/* <Text
            type="secondary" className="text-white"
            style={{ fontSize: "12px", fontWeight: "bold" }}
          >
            Please fill in all required fields.
          </Text> */}
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
        <Row gutter={[12, 0]}>
          <Col span={8}>
            <Form.Item label="Prospect`s Name" required>
              <Input
                value={formData.tvendor_prospect_name}
                onChange={(e) =>
                  handleChange("tvendor_prospect_name", e.target.value)
                }
              />
              {errors.tvendor_prospect_name && (
                <div className="text-danger">{errors.tvendor_prospect_name}</div>
              )}
            </Form.Item>
          </Col>

          <Col span={8}>
            {/* <label htmlFor="tvendor_statues" className="form-label">
              <span className="text-danger">*</span>Statues
            </label> */}
            <Form.Item label="Statues" required>
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
                <div className="error text-danger">{errors.tvendor_statues}</div>
              )}
            </Form.Item>

          </Col>
          <Col span={8}>
            <Form.Item label="Preferred Location" required>
              <Input
                value={formData.tvendor_preferred_location}
                onChange={(e) =>
                  handleChange("tvendor_preferred_location", e.target.value)
                }
              />
              {errors.tvendor_preferred_location && (
                <div className="text-danger">
                  {errors.tvendor_preferred_location}
                </div>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Additional Location" required>
              <Input
                value={formData.tvendor_additional_location}
                onChange={(e) =>
                  handleChange("tvendor_additional_location", e.target.value)
                }
              />
              {errors.tvendor_additional_location && (
                <div className="text-danger">
                  {errors.tvendor_additional_location}
                </div>
              )}
            </Form.Item>
          </Col>
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
                onChange={(val) => handleChange("tvendor_district_id", val)}
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
          <Col span={8}>
            <Form.Item label="Pin Code" required>
              <InputNumber
                style={{ width: "100%" }}
                value={formData.tvendor_pin_code}
                onChange={(value) => handleChange("tvendor_pin_code", value)}
                placeholder="Enter Pin Code"
              />

              {errors.tvendor_pin_code && (
                <div className="text-danger">{errors.tvendor_pin_code}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="GSTIN (GST Registration Number)" required>
              <Input
                value={formData.tvendor_gst}
                onChange={(e) => handleChange("tvendor_gst", e.target.value)}
              />
              {errors.tvendor_gst && (
                <div className="text-danger">{errors.tvendor_gst}</div>
              )}
            </Form.Item>
          </Col>
        </Row>





        <Row gutter={[12, 2]}>
          <Col span={24}>
            <Form.Item
              label="Description of GOODS / SERVICES under GST"
              required
            >
              <TextArea
                value={formData.tvendor_description_goods}
                onChange={(e) =>
                  handleChange("tvendor_description_goods", e.target.value)
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

          <Col span={8}>
            <Form.Item label="HSN Codes for Goods" required>
              <Input
                value={formData.tvendor_hsn_codes}
                onChange={(e) =>
                  handleChange("tvendor_hsn_codes", e.target.value)
                }
              />
              {errors.tvendor_hsn_codes && (
                <div className="text-danger">{errors.tvendor_hsn_codes}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="PAN Number" required>
              <Input
                value={formData.tvendor_pan}
                onChange={(e) => handleChange("tvendor_pan", e.target.value)}
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
                onChange={(e) => handleChange("tvendor_adhar", e.target.value)}
              />
              {errors.tvendor_adhar && (
                <div className="text-danger">{errors.tvendor_adhar}</div>
              )}
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="MSME" required>


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
                <div className="error text-danger">{errors.tvendor_msme}</div>
              )}
            </Form.Item>
          </Col>

          {/* 👇 Show only if MSME = Yes */}
          {formData?.tvendor_msme === "yes" && (
            <Col span={8}>
              <Form.Item label="MSME UDYAM Certificate
                    Number Number" required>
                {/* <label htmlFor="tvendor_msme_udyam" className="form-label">
                    <span className="text-danger">*</span> MSME UDYAM Certificate
                    Number Number
                  </label> */}

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
              </Form.Item>
            </Col>
          )}

          <Col span={8}>
            <Form.Item label="CIN" required>
              <Input
                value={formData.tvendor_cin}
                onChange={(e) => handleChange("tvendor_cin", e.target.value)}
              />
              {errors.tvendor_cin && (
                <div className="text-danger">{errors.tvendor_cin}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
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
          <Col span={8}>
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
          <Col span={8}>
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
                <div className="text-danger">{errors.tvendor_work_phone1}</div>
              )}
            </Form.Item>
          </Col>

          <Col span={8}>
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
                <div className="text-danger">{errors.tvendor_work_phone2}</div>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Office Fax 1" required>
              <Input
                value={formData.tvendor_office_fax1}
                onChange={(e) =>
                  handleChange("tvendor_office_fax1", e.target.value)
                }
              />
              {errors.tvendor_office_fax1 && (
                <div className="text-danger">{errors.tvendor_office_fax1}</div>
              )}
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Office Fax 2">
              <Input
                value={formData.tvendor_office_fax_2}
                onChange={(e) =>
                  handleChange("tvendor_office_fax_2", e.target.value)
                }
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Work Fax 1">
              <Input
                value={formData.tvendor_work_fax_1}
                onChange={(e) =>
                  handleChange("tvendor_work_fax_1", e.target.value)
                }
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Work Fax 2">
              <Input
                value={formData.tvendor_work_fax_2}
                onChange={(e) =>
                  handleChange("tvendor_work_fax_2", e.target.value)
                }
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Official E-Mail Id 1" required>
              <Input
                value={formData.tvendor_email_1}
                onChange={(e) =>
                  handleChange("tvendor_email_1", e.target.value)
                }
              />
              {errors.email_1 && (
                <div className="text-danger">{errors.tvendor_email_1}</div>
              )}
            </Form.Item>
          </Col>

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
                  handleChange("tvendor_contact_person_name", e.target.value)
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

          <Col span={8}>
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
              <Col span={8}>
                <Form.Item label="Relative Name" required>
                  <Input
                    value={formData.tvendor_relative_name}
                    onChange={(e) =>
                      handleChange("tvendor_relative_name", e.target.value)
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
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

              <Col span={8}>
                <Form.Item label="Location">
                  <Input
                    value={formData.tvendor_relative_location}
                    onChange={(e) =>
                      handleChange("tvendor_relative_location", e.target.value)
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Mobile No.">
                  <Input
                    style={{ width: "100%" }}
                    value={formData.tvendor_relative_mobile}
                    placeholder="Enter phone number"
                    maxLength={15}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      handleChange("tvendor_relative_mobile", onlyNumbers);
                    }}
                  />
                </Form.Item>
              </Col>
            </>
          )}

          <Col span={8}>
            <Form.Item label="Bank" required>
              <Input
                value={formData.tvendor_bank_name}
                onChange={(e) =>
                  handleChange("tvendor_bank_name", e.target.value)
                }
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Bank Branch">
              <Input
                value={formData.tvendor_bank_branch}
                onChange={(e) =>
                  handleChange("tvendor_bank_branch", e.target.value)
                }
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Bank A/C No." required>
              <Input
                value={formData.tvendor_bank_account_no}
                onChange={(e) =>
                  handleChange("tvendor_bank_account_no", e.target.value)
                }
              />
            </Form.Item>
          </Col>

          <Col span={8}>
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
        <div className="card m-1 mb-3">
          <div className="card-header header-bg">
            <h5 className="mb-0">Mandatory documents : -</h5>
          </div>
          <div className="card-body documents">
            <Row gutter={[12, 2]}>
              <Col span={8}>
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
                  validateStatus={errors?.tvendor_vendor_regn_doc ? "error" : ""}
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
                      handleChange("tvendor_vendor_regn_doc", latestFile?.[0]);
                    }}
                    showUploadList={{
                      showRemoveIcon: true, // ✅ allow removal directly
                    }}
                  >
                    <Button className="form-control" icon={<UploadOutlined />}>Choose File</Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={8}>
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

              <Col span={8}>
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

              <Col span={8}>
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

              <Col span={8}>
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

              <Col span={8}>
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
                    fileList={fileLists?.["tvendor_cancelled_cheque_doc"] || []}
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

              <Col span={8}>
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

        <div className="card m-1 mb-2">
          <div className="card-header header-bg">
            <h5 className="mb-0"> Import Vendors (Foreign Entity) : -</h5>
          </div>
          <div className="card-body documents">
            <Row gutter={[12, 2]}>
              <Col span={8}>
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
                    fileList={fileLists?.["tvendor_tax_residence_doc"] || []}
                    beforeUpload={() => false}
                    multiple={false} // ✅ Single file upload only
                    accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                    onChange={({ fileList }) => {
                      const latestFile = fileList?.slice(-1);
                      setFileLists((prev) => ({
                        ...prev,
                        tvendor_tax_residence_doc: latestFile,
                      }));
                      handleChange("tvendor_tax_residence_doc", latestFile?.[0]);
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
                      No Permanent Establishment in India (No PE)
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

              <Col span={8}>
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
                  validateStatus={errors?.tvendor_form_10_f_doc ? "error" : ""}
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
                      handleChange("tvendor_form_10_f_doc", latestFile?.[0]);
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
                    fileList={fileLists?.["tvendor_address_proof_doc"] || []}
                    beforeUpload={() => false}
                    multiple={false} // ✅ Single file upload only
                    accept=".pdf,.doc,.docx,.xls,.xlsx" // ✅ Restrict to PDF, Word, Excel
                    onChange={({ fileList }) => {
                      const latestFile = fileList?.slice(-1);
                      setFileLists((prev) => ({
                        ...prev,
                        tvendor_address_proof_doc: latestFile,
                      }));
                      handleChange("tvendor_address_proof_doc", latestFile?.[0]);
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
                <Form.Item label="Note" required>
                  <TextArea
                    value={formData.tvendor_notes}
                    onChange={(e) =>
                      handleChange("tvendor_notes", e.target.value)
                    }
                    rows={2}
                    placeholder="Enter description of goods or services"
                  />

                  {errors.tvendor_notes && (
                    <div className="text-danger">{errors.tvendor_notes}</div>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>


      </Form>
    </Modal>
  );
};

export default AddEditVendorMasterList;
