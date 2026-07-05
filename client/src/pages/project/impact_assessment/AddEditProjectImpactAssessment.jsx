import {
    InfoCircleOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    Button,
    Col,
    Form,
    Input,
    Modal,
    Row,
    Tooltip,
    Upload,
} from "antd";
import { useEffect, useState } from "react";
import { Select } from "antd";
import { toast } from "react-toastify";
import { projectImpactAssessmentCreateUpdateApi, targetBeneficiariesApi } from "../../../services/Project-service";
import { useParams } from "react-router-dom";

const AddEditProjectImpactAssessment = ({
    visible,
    onClose,
    fetchData,
    data,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [targetBeneficiaries, setTargetBeneficiaries] = useState(0);

    const is80GApplicable = Form.useWatch("is_80g_applicable", form);

    const [fileLists, setFileLists] = useState({
        tpia_80g_certificate: [],
        tpia_csr1_documents: [],
    });
    const tproj_id = useParams()?.tproj_id;

    const [formData, setFormData] = useState({
        actual_beneficiary: "",
        before_after_comparison: "",
        is_80g_applicable: "",
        csr1_form_number: "",
    });

    /*         HANDLE FIELD CHANGE */
    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // This throws only for validation
            await form.validateFields();

            const payload = new FormData();
            if (tproj_id) payload.append("tpia_project_id", tproj_id);

            payload.append("actual_beneficiary", form.getFieldValue("actual_beneficiary"));
            payload.append(
                "before_after_comparison",
                form.getFieldValue("before_after_comparison")
            );
            payload.append(
                "is_80g_applicable",
                form.getFieldValue("is_80g_applicable")
            );
            payload.append(
                "csr1_form_number",
                form.getFieldValue("csr1_form_number")
            );

            if (fileLists.tpia_80g_certificate.length) {
                payload.append(
                    "tpia_80g_certificate",
                    fileLists.tpia_80g_certificate[0].originFileObj
                );
            }

            if (fileLists.tpia_csr1_documents.length) {
                payload.append(
                    "tpia_csr1_documents",
                    fileLists.tpia_csr1_documents[0].originFileObj
                );
            }

            if (data?.tpia_id) {
                payload.append("tpia_id", data.tpia_id);
            }

            const res = await projectImpactAssessmentCreateUpdateApi(payload);

            if (res?.status) {
                toast.success(res.message);
                fetchData();
                onClose();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            // ❗ Ignore validation errors
            if (!err?.errorFields) {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    /*         LOAD EDIT DATA */
    useEffect(() => {
        if (data?.tpia_id) {
            const values = {
                actual_beneficiary: data.tpia_actual_beneficiary || "",
                before_after_comparison: data.tpia_before_after_comparison || "",
                is_80g_applicable: data.tpia_is_80g_applicable || "",
                csr1_form_number: data.tpia_csr1_form_number || "",
            };

            // ✅ THIS updates AntD Form
            form.setFieldsValue(values);
            const eightyGFiles = (data.documents || [])
                .filter(doc => doc.doc_purpose === "tpia_80g_certificate")
                .map((doc, index) => ({
                    uid: doc.tdoc_id || `80g-${index}`,
                    name: doc.doc_name,
                    status: "done",
                    url: doc.full_url,
                    originFileObj: null, // ⛔ prevents re-upload
                }));
            const csr1Files = (data.documents || [])
                .filter(doc => doc.doc_purpose === "tpia_csr1_documents")
                .map((doc, index) => ({
                    uid: doc.tdoc_id || `csr1-${index}`,
                    name: doc.doc_name,
                    status: "done",
                    url: doc.full_url,
                    originFileObj: null,
                }));
            setFileLists({
                tpia_80g_certificate: eightyGFiles,
                tpia_csr1_documents: csr1Files,
            });




        } else {
            form.resetFields();
            setFormData({
                actual_beneficiary: "",
                before_after_comparison: "",
                is_80g_applicable: "",
                csr1_form_number: "",
            });
            setFileLists({
                tpia_80g_certificate: [],
                tpia_csr1_documents: [],
            });
        }
    }, [data?.tpia_id]);


    useEffect(() => {
        targetBeneficiariesApi({ tproj_id }).then(({ data }) => {
            if (!data) return;
            setTargetBeneficiaries(data?.target_beneficiaries);

        }).catch((error) =>
            toast.error(error?.response?.data?.originalError || error?.response?.data?.message)
        );


    }, [tproj_id]);

    return (
        <Modal
            title={`${data?.tpia_id ? "Update" : "Add"} Project Impact Assessment`}
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            width="90%"
            maskClosable={false}
            okText={data?.tpia_id ? "Update" : "Submit"}
        >
            <Form layout="vertical" form={form}>
                <fieldset className="border rounded-3 p-3">
                    <legend className="float-none w-auto px-3">
                        Introduction
                    </legend>
                    <Col span={24}>
                        <p className="fw-semibold mb-2" style={{ fontSize: "16px" }}>
                            Target Beneficiaries: {targetBeneficiaries}
                        </p>
                    </Col>



                    <Row gutter={[16, 16]}>
                        {/* Actual Beneficiary */}
                        <Col span={8}>
                            <Form.Item
                                name="actual_beneficiary"
                                label="Actual Beneficiary"
                                rules={[{ required: true, message: "Required" }]}
                            >
                                <Input type="text" placeholder="Enter actual beneficiary" />

                            </Form.Item>


                        </Col>

                        {/* Before & After Comparison */}
                        <Col span={8}>
                            <Form.Item
                                label="Before and After Comparison"
                                name="before_after_comparison"

                                rules={[
                                    { required: true, message: "Required" },
                                ]}
                            >
                                <Input.TextArea
                                    rows={2}
                                    value={
                                        formData.before_after_comparison
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "before_after_comparison",
                                            e.target.value
                                        )
                                    }
                                />
                            </Form.Item>
                        </Col>

                        {/* 80G Applicable */}

                        <Col span={8}>
                            <Form.Item
                                label="80G Certificate Applicable"
                                name="is_80g_applicable"
                                rules={[{ required: true, message: "Required" }]}
                            >
                                <Select placeholder="Select Yes or No">
                                    <Select.Option value="yes">Yes</Select.Option>
                                    <Select.Option value="no">No</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* 80G Upload */}
                        {is80GApplicable === "yes" && (<Col span={8}>
                            <label className="form-label">
                                Upload 80G Certificate
                                <Tooltip title="PDF / JPG / PNG">
                                    <InfoCircleOutlined
                                        style={{ marginLeft: 6 }}
                                    />
                                </Tooltip>
                            </label>

                            <Upload

                                beforeUpload={() => false}
                                fileList={
                                    fileLists.tpia_80g_certificate
                                }
                                onChange={({ fileList }) =>
                                    setFileLists((p) => ({
                                        ...p,
                                        tpia_80g_certificate: fileList,
                                    }))
                                }
                            >
                                <Button

                                    icon={<UploadOutlined />}
                                >
                                    Choose File
                                </Button>
                            </Upload>
                        </Col>)}





                        {/* CSR-1 Number */}
                        <Col span={8}>
                            <Form.Item
                                label="CSR-1 Form Number"
                                name="csr1_form_number"

                                rules={[
                                    { required: true, message: "Required" },
                                ]}
                            >
                                <Input
                                    value={formData.csr1_form_number}
                                    onChange={(e) =>
                                        handleChange(
                                            "csr1_form_number",
                                            e.target.value
                                        )
                                    }
                                />
                            </Form.Item>
                        </Col>

                        {/* CSR-1 Upload */}
                        <Col span={8}>
                            <label className="form-label">
                                Attach CSR-1 form of the organization
                            </label>

                            <Upload
                                beforeUpload={() => false}
                                fileList={
                                    fileLists.tpia_csr1_documents
                                }
                                onChange={({ fileList }) =>
                                    setFileLists((p) => ({
                                        ...p,
                                        tpia_csr1_documents: fileList,
                                    }))
                                }
                            >
                                <Button icon={<UploadOutlined />}>
                                    Choose File
                                </Button>
                            </Upload>
                        </Col>
                    </Row>
                </fieldset>
            </Form>
        </Modal>
    );
};

export default AddEditProjectImpactAssessment;
