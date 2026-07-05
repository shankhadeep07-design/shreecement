import {
    Col,
    DatePicker,
    Form,
    Input,
    Modal,
    Row,
    Select
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
    fetchBlocksByDistrictIds,
    fetchDistrictsByStateIds,
    fetchLocationsByBlockIds,
    getSubMasterListByMasterSlugApi
} from "../../../Services/Master-service";
import { projectBeneficiaryAllListApi, projectBeneficiaryCreateUpdateApi, projectDetailsApi } from "../../../services/Project-service";
import { getAllStateApi } from "../../../Services/State-service";
const { Option } = Select;

const { TextArea } = Input;

// ✅ Validation schema according to formData
const Schema = Yup.object({
    tben_state_id: Yup.string().required("State is required"),
    tben_district_id: Yup.string().required("District is required"),
    tben_block_id: Yup.string().required("Block is required"),
    tben_village_id: Yup.string().required("Location is required"),
    tben_type: Yup.string().required("Beneficiary Type is required"),

    // conditional validation
    tben_name: Yup.string().when("tben_type", {
        is: "new_beneficiary",
        then: (schema) => schema.required("Name is required"),
        otherwise: (schema) => schema.nullable(),
    }),
    tben_phone: Yup.string().when("tben_type", {
        is: "new_beneficiary",
        then: (schema) => schema.required("Phone No is required"),
        otherwise: (schema) => schema.nullable(),
    }),
    tben_gender: Yup.string().when("tben_type", {
        is: "new_beneficiary",
        then: (schema) => schema.required("Gender is required"),
        otherwise: (schema) => schema.nullable(),
    }),
    tben_dob: Yup.string().when("tben_type", {
        is: "new_beneficiary",
        then: (schema) => schema.required("DOB is required"),
        otherwise: (schema) => schema.nullable(),
    }),

    tben_description: Yup.string().when("tben_type", {
        is: "group",
        then: (schema) => schema.required("Description is required"),
        otherwise: (schema) => schema.nullable(),
    }),
    tben_cumulative: Yup.number().when("tben_type", {
        is: "group",
        then: (schema) => schema.typeError("Must be a number").required("Cumulative value is required"),
        otherwise: (schema) => schema.nullable(),
    }),
});

const AddEditProjectBeneficiary = ({ fetchData, visible, onClose, data }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [locations, setLocations] = useState([]);
    const [genderOptions, setGenderOptions] = useState([]);
    const [projectDetails, setProjectDetails] = useState([]);
    const [beneficiaryList, setBeneficiaryList] = useState([]);
    const tproj_id = useParams()?.tproj_id;

    const [formData, setFormData] = useState({
        tben_id: "",
        tben_name: "",
        tben_phone: "",
        tben_gender: "",
        tben_age: "",
        tben_unique_no: "",
        tben_created_by: "",
        tben_updated_by: "",
        tben_created_at: "",
        tben_updated_at: "",
        tben_deleted_at: "",
        tben_state_id: "",
        tben_district_id: "",
        tben_block_id: "",
        tben_village_id: "",
        tben_dob: "",
        tben_unique_key: "",
        tben_cumulative: "",
        tben_description: "",
        tben_type: "",
        tpben_project_id: tproj_id,
        tpben_fy_id: projectDetails?.tfy_year_label,
        tpben_beneficiary_id: "",
    });

    // const [form] = Form.useForm();

    const handleValidation = async (data) => {
        try {
            await Schema.validate(data, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            if (err.inner) {
                const formattedErrors = err.inner.reduce((acc, curr) => {
                    acc[curr.path] = curr.message;
                    return acc;
                }, {});
                setErrors(formattedErrors);
            }
            return false;
        }
    };



    const handleChange = (name, value) => {
        let updatedData;

        // dependent dropdowns
        if (name === "tben_state_id" && formData?.tben_state_id !== value) {
            setDistricts([]);
            setBlocks([]);
            setLocations([]);

            fetchDistrictsByStateIds(value)
                .then((data) => setDistricts(data?.data))
                .catch((error) => toast.error(error?.response?.data?.message));

            updatedData = { ...formData, [name]: value, tben_district_id: "", tben_block_id: "", tben_village_id: "" };
        }
        else if (name === "tben_district_id" && formData?.tben_district_id !== value) {
            setBlocks([]);
            setLocations([]);

            fetchBlocksByDistrictIds(value)
                .then((data) => setBlocks(data?.data))
                .catch((error) => toast.error(error?.response?.data?.message));

            updatedData = { ...formData, [name]: value, tben_block_id: "", tben_village_id: "" };
        }
        else if (name === "tben_block_id" && formData?.tben_block_id !== value) {
            setLocations([]);

            fetchLocationsByBlockIds(value)
                .then((data) => setLocations(data?.data))
                .catch((error) => toast.error(error?.response?.data?.message));

            updatedData = { ...formData, [name]: value, tben_village_id: "" };
        }
        else if (name === "tben_dob") {
            updatedData = {
                ...formData,
                [name]: value ? dayjs(value).format("YYYY-MM-DD") : null   // ✅ store in backend-safe format
            };
        }
        else if (name === "tben_type") {
            if (value === "new_beneficiary") {
                updatedData = {
                    ...formData,
                    tben_type: value,
                    tben_description: null,
                    tben_cumulative: null,
                    tpben_beneficiary_id: "", // reset in case user previously selected existing
                };
            } else if (value === "group") {
                updatedData = {
                    ...formData,
                    tben_type: value,
                    tben_name: null,
                    tben_phone: null,
                    tben_gender: null,
                    tben_dob: null,
                    tpben_beneficiary_id: "", // reset existing
                };
            } else if (value === "existing_beneficiary") {
                updatedData = {
                    ...formData,
                    tben_type: value,
                    tben_name: null,
                    tben_phone: null,
                    tben_gender: null,
                    tben_dob: null,
                    tben_description: null,
                    tben_cumulative: null,
                };
            } else {
                updatedData = { ...formData, [name]: value };
            }
        }

        else {
            updatedData = { ...formData, [name]: value };
        }

        setFormData(updatedData);
    };

    useEffect(() => {
        getAllStateApi()
            .then((data) => setStates(data?.data || []))
            .catch((error) => toast.error(error?.response?.data?.message));
    }, []);

    useEffect(() => {
        getSubMasterListByMasterSlugApi({ master_slug: "gender" })
            .then((data) => {
                const transformed = (data?.data || []).map((item) => ({
                    label: item.tsml_sub_master_list_name,
                    value: item.tsml_id,
                }));
                setGenderOptions(transformed);
            })
            .catch((error) => toast.error(error?.response?.data?.message));

        projectBeneficiaryAllListApi().then(({ data }) => {
            if (!data) return;
            setBeneficiaryList(data);
        }).catch((error) =>
            toast.error(error?.response?.data?.originalError || error?.response?.data?.message)
        );

    }, []);

    useEffect(() => {
        projectDetailsApi({ tproj_id }).then(({ data }) => {
            if (!data) return;
            setProjectDetails(data[0]);
        }).catch((error) =>
            toast.error(error?.response?.data?.originalError || error?.response?.data?.message)
        );
    }, [tproj_id])

    useEffect(() => {
        if (projectDetails?.tfy_year_label) {
            setFormData((prev) => ({
                ...prev,
                tpben_fy_id: projectDetails.tfy_year_label,
            }));
        }
    }, [projectDetails]);


    const handleSubmit = async () => {
        setLoading(true);
        try {
            // const isValid = await handleValidation(formData);
            // if (!isValid) return;
            // console.log("formData--------- ", formData);
            // return;
            // ✅ Create clean payload
            let payload = { ...formData };

            if (formData.tben_type === "new_beneficiary") {
                delete payload.tben_description;
                delete payload.tben_cumulative;
            } else if (formData.tben_type === "group") {
                delete payload.tben_name;
                delete payload.tben_phone;
                delete payload.tben_gender;
                delete payload.tben_dob;
            } else if (formData.tben_type === "existing_beneficiary") {
                // ✅ Only send minimal payload for existing beneficiary
                payload = {
                    tpben_project_id: formData.tpben_project_id,
                    tpben_beneficiary_id: formData.tpben_beneficiary_id,
                    tben_type: formData.tben_type,
                };
            }
            const res = await projectBeneficiaryCreateUpdateApi(payload);
            if (res.status) {
                toast.success(res.message);
                fetchData();
                onClose();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const beneficiaryType = [
        { label: "Existing Beneficiary", value: "existing_beneficiary" },
        { label: "New Beneficiary", value: "new_beneficiary" },
        { label: "Group", value: "group" },
    ];

    useEffect(() => {
        setErrors({});
        if (data) {
            // ✅ Load dependent dropdowns
            if (data?.tben_state_id) {
                fetchDistrictsByStateIds(data.tben_state_id)
                    .then((res) => setDistricts(res?.data || []))
                    .catch((error) =>
                        toast.error(error?.response?.data?.message || "Failed to load districts")
                    );
            }

            if (data?.tben_district_id) {
                fetchBlocksByDistrictIds(data.tben_district_id)
                    .then((res) => setBlocks(res?.data || []))
                    .catch((error) =>
                        toast.error(error?.response?.data?.message || "Failed to load blocks")
                    );
            }

            if (data?.tben_block_id) {
                fetchLocationsByBlockIds(data.tben_block_id)
                    .then((res) => setLocations(res?.data || []))
                    .catch((error) =>
                        toast.error(error?.response?.data?.message || "Failed to load locations")
                    );
            }

            // ✅ Set all beneficiary fields in formData
            setFormData({
                tben_id: data?.tben_id || "",
                tben_name: data?.tben_name || "",
                tben_phone: data?.tben_phone || "",
                tben_gender: data?.tben_gender || "",
                tben_age: data?.tben_age || "",
                tben_unique_no: data?.tben_unique_no || "",
                tben_state_id: data?.tben_state_id || "",
                tben_district_id: data?.tben_district_id || "",
                tben_block_id: data?.tben_block_id || "",
                tben_village_id: data?.tben_village_id || "",
                tben_dob: data?.tben_dob || "", // keep backend format (YYYY-MM-DD)
                tben_unique_key: data?.tben_unique_key || "",
                tben_cumulative: data?.tben_cumulative || "",
                tben_description: data?.tben_description || "",
                tben_type: data?.tben_type || "",
                tpben_project_id: data?.tpben_project_id || tproj_id, // fallback to current project
                tpben_fy_id: projectDetails?.tfy_year_label,
                tpben_beneficiary_id: data?.tpben_beneficiary_id,
            });
        } else {
            // ✅ Reset empty state
            setFormData({
                tben_id: "",
                tben_name: "",
                tben_phone: "",
                tben_gender: "",
                tben_age: "",
                tben_unique_no: "",
                tben_state_id: "",
                tben_district_id: "",
                tben_block_id: "",
                tben_village_id: "",
                tben_dob: "",
                tben_unique_key: "",
                tben_cumulative: "",
                tben_description: "",
                tben_type: "",
                tpben_project_id: tproj_id,
                tpben_fy_id: projectDetails?.tfy_year_label,
                tpben_beneficiary_id: "",
            });
        }
    }, [data, tproj_id]);

    const beneficiaryListArrayUnique = beneficiaryList.map(item => ({
        label: item?.tben_unique_key,
        value: item?.tben_id
    }));

    console.log(beneficiaryListArrayUnique);


    return (
        <Modal
            title={`${data?.tben_id ? "Update" : "Add"} Project Beneficiary`}
            style={{ top: 40 }}
            open={visible}
            onOk={handleSubmit}
            confirmLoading={loading}
            onCancel={onClose}
            maskClosable={false}
            width={'90%'}
            okText={data?.tben_id ? "Update" : "Submit"}
            cancelText="Close"
        >
            <Form layout="vertical">
                <Row gutter={[8, 16]}>
                    {/* State */}
                    <Col span={8}>
                        <Form.Item label="State" required>
                            <Select
                                placeholder="Select State"
                                value={formData?.tben_state_id || undefined}
                                onChange={(value) => handleChange("tben_state_id", value)}
                            >
                                {states.map((s) => (
                                    <Option key={s.value} value={s.value}>{s.label}</Option>
                                ))}
                            </Select>
                            {errors?.tben_state_id && <div className="text-danger">{errors.tben_state_id}</div>}
                        </Form.Item>
                    </Col>

                    {/* District */}
                    <Col span={8}>
                        <Form.Item label="District" required>
                            <Select
                                placeholder="Select District"
                                value={formData?.tben_district_id || undefined}
                                onChange={(value) => handleChange("tben_district_id", value)}
                            >
                                {districts.map((d) => (
                                    <Option key={d.value} value={d.value}>{d.label}</Option>
                                ))}
                            </Select>
                            {errors?.tben_district_id && <div className="text-danger">{errors.tben_district_id}</div>}
                        </Form.Item>
                    </Col>

                    {/* Block */}
                    <Col span={8}>
                        <Form.Item label="Block" required>
                            <Select
                                placeholder="Select Block"
                                value={formData?.tben_block_id || undefined}
                                onChange={(value) => handleChange("tben_block_id", value)}
                            >
                                {blocks.map((b) => (
                                    <Option key={b.value} value={b.value}>{b.label}</Option>
                                ))}
                            </Select>
                            {errors?.tben_block_id && <div className="text-danger">{errors.tben_block_id}</div>}
                        </Form.Item>
                    </Col>

                    {/* Location */}
                    <Col span={8}>
                        <Form.Item label="Location" required>
                            <Select
                                placeholder="Select Location"
                                value={formData?.tben_village_id || undefined}
                                onChange={(value) => handleChange("tben_village_id", value)}
                            >
                                {locations.map((l) => (
                                    <Option key={l.value} value={l.value}>{l.label}</Option>
                                ))}
                            </Select>
                            {errors?.tben_village_id && <div className="text-danger">{errors.tben_village_id}</div>}
                        </Form.Item>
                    </Col>

                    {/* Beneficiary Type */}
                    <Col span={8}>
                        <Form.Item label="Beneficiary Type" required>
                            <Select
                                placeholder="Select Beneficiary Type"
                                value={formData?.tben_type || undefined}
                                onChange={(value) => handleChange("tben_type", value)}
                            >
                                {beneficiaryType.map((b) => (
                                    <Option key={b.value} value={b.value}>{b.label}</Option>
                                ))}
                            </Select>
                            {errors?.tben_type && <div className="text-danger">{errors.tben_type}</div>}
                        </Form.Item>
                    </Col>

                    {/* Existing Beneficiary  */}
                    {formData?.tben_type === "existing_beneficiary" && (
                        <Col span={8}>
                            <Form.Item label="Existing Beneficiary" required>
                                <Select
                                    placeholder="Select Existing Beneficiary"
                                    value={formData?.tpben_beneficiary_id || undefined}
                                    onChange={(value) => handleChange("tpben_beneficiary_id", value)}
                                >
                                    {beneficiaryListArrayUnique.map((l) => (
                                        <Option key={l.value} value={l.value}>{l.label}</Option>
                                    ))}
                                </Select>
                                {errors?.tpben_beneficiary_id && <div className="text-danger">{errors.tpben_beneficiary_id}</div>}
                            </Form.Item>
                        </Col>
                    )}

                    {/* New Beneficiary Fields */}
                    {formData?.tben_type === "new_beneficiary" && (
                        <Row gutter={16} style={{ width: "100%" }}>
                            <Col span={24}>
                                <fieldset style={{ border: "1px solid #d9d9d9", borderRadius: "6px", padding: "16px" }}>
                                    <legend style={{ fontWeight: "bold" }}>New Beneficiary Details</legend>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Name" required>
                                                <Input
                                                    value={formData?.tben_name || ""}
                                                    onChange={(e) => handleChange("tben_name", e.target.value)}
                                                />
                                                {errors?.tben_name && <div className="text-danger">{errors.tben_name}</div>}
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item label="Phone No" required>
                                                <Input
                                                    value={formData?.tben_phone || ""}
                                                    onChange={(e) => handleChange("tben_phone", e.target.value)}
                                                />
                                                {errors?.tben_phone && <div className="text-danger">{errors.tben_phone}</div>}
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item label="Gender" required>
                                                <Select
                                                    value={formData?.tben_gender || undefined}
                                                    onChange={(value) => handleChange("tben_gender", value)}
                                                >
                                                    {genderOptions.map((g) => (
                                                        <Option key={g.value} value={g.value}>{g.label}</Option>
                                                    ))}
                                                </Select>
                                                {errors?.tben_gender && <div className="text-danger">{errors.tben_gender}</div>}
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item label="DOB" required>
                                                <DatePicker
                                                    format="DD-MM-YYYY"
                                                    style={{ width: "100%" }}
                                                    value={formData?.tben_dob ? dayjs(formData.tben_dob, "YYYY-MM-DD") : null}
                                                    onChange={(date) => handleChange("tben_dob", date)}
                                                />
                                                {errors?.tben_dob && <div className="text-danger">{errors.tben_dob}</div>}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </fieldset>
                            </Col>
                        </Row>
                    )}

                    {/* Group Fields */}
                    {formData?.tben_type === "group" && (
                        <Row gutter={16} style={{ width: "100%" }}>
                            <Col span={24}>
                                <fieldset style={{ border: "1px solid #d9d9d9", borderRadius: "6px", padding: "16px" }}>
                                    <legend style={{ fontWeight: "bold" }}>Group Details</legend>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Description" required>
                                                <TextArea
                                                    rows={4}
                                                    value={formData?.tben_description || ""}
                                                    onChange={(e) => handleChange("tben_description", e.target.value)}
                                                />
                                                {errors?.tben_description && <div className="text-danger">{errors.tben_description}</div>}
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Cumulative Value" required>
                                                <Input
                                                    value={formData?.tben_cumulative || ""}
                                                    onChange={(e) => handleChange("tben_cumulative", e.target.value)}
                                                />
                                                {errors?.tben_cumulative && <div className="text-danger">{errors.tben_cumulative}</div>}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </fieldset>
                            </Col>
                        </Row>
                    )}
                </Row>
            </Form>
        </Modal>
    );
};
export default AddEditProjectBeneficiary;
