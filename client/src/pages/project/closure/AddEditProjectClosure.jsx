import { DeleteOutlined, InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import {
    Button,
    Col,
    Form,
    Input,
    Modal,
    Popconfirm,
    Row,
    Select,
    Tooltip,
    Upload,
    InputNumber
} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { projectClosureCreateUpdateApi } from "../../../services/Project-service";



import { PlusOutlined } from "@ant-design/icons";

import {
    projectDetailsApi,

} from "../../../services/Project-service";
const AddEditProjectClosure = ({ fetchData, visible, onClose, data }) => {

    const [projectData, setProjectData] = useState(null);

    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const tproj_id = useParams()?.tproj_id;

    const getMimeTypeFromExtension = (filename) => {
        const ext = filename?.split(".").pop()?.toLowerCase();
        const map = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            pdf: "application/pdf",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls: "application/vnd.ms-excel",
            xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };
        return map[ext] || "";
    };

    /* ================= EDIT MODE ================= */
    useEffect(() => {
        if (!data?.tpclsr_id) {
            form.resetFields();
            return;
        }

        /* =========================
           UTILIZATION CERTIFICATE
        ========================== */
        const utilizationFiles = (data.documents || [])
            .filter(doc => doc.doc_purpose === "tpclsr_docs")
            .map((doc, index) => ({
                uid: doc.tdoc_id || `util-${index}`,
                name: doc.doc_name,
                status: "done",
                url: doc.full_url,
                originFileObj: null, // prevents re-upload
            }));

        /* =========================
           EVIDENCE DOCUMENTS
        ========================== */
        const evidenceUploads = (data.documents || [])
            .filter(doc => doc.doc_purpose === "tdoc_closure_docs")
            .map((doc) => ({
                tdoc_id: doc.tdoc_id,
                tdoc_closure_docs_title: doc.doc_title,
                tdoc_closure_docs: [
                    {
                        uid: doc.tdoc_id,
                        name: doc.doc_name,
                        status: "done",
                        url: doc.full_url,
                        originFileObj: null,
                    },
                ],
            }));

        /* =========================
           SET FORM VALUES
        ========================== */
        form.setFieldsValue({
            tpclsr_total_milestone: Number(data.tpclsr_total_milestone) || 0,
            tpclsr_key_achievements: Number(data.tpclsr_key_achievements) || 0,

            tpclsr_total_allocate_budget: Number(data.tpclsr_total_allocate_budget) || 0,
            tpclsr_total_utilized_amount: Number(data.tpclsr_total_utilized_amount) || 0,
            tpclsr_unspent_remaining: Number(data.tpclsr_unspent_remaining) || 0,

            tpclsr_doc_verification: data.tpclsr_doc_verification,

            tpclsr_docs: utilizationFiles,
            closureUploads: evidenceUploads.length ? evidenceUploads : [{}],
        });
    }, [data, form]);







    const fetchProjectDetails = () => {
        projectDetailsApi({ tproj_id })
            .then(({ data }) => setProjectData(data))
            .catch(() => toast.error("Failed to load project details"));
    };


    useEffect(() => {
        if (tproj_id) fetchProjectDetails();
    }, [tproj_id]);


    useEffect(() => {
        if (projectData) {
            form.setFieldsValue({
                tpclsr_total_allocate_budget: projectData.tproj_allocate_budget_amount || 0,
                tpclsr_total_utilized_amount: projectData.tproj_allocate_budget_amount - projectData.remaining_balance || 0,

            });
        }
    }, [projectData]);


    /* ================= SUBMIT ================= */
    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            const payload = new FormData();

            if (tproj_id) payload.append("tpclsr_project_id", tproj_id);
            if (data?.tpclsr_id) payload.append("tpclsr_id", data.tpclsr_id);

            /* =====================
               NORMAL FORM FIELDS
            ====================== */
            Object.entries(values).forEach(([key, value]) => {
                if (key === "tpclsr_docs") {
                    value?.forEach((file) => {
                        if (file.originFileObj) {
                            payload.append("tpclsr_docs", file.originFileObj);
                        }
                    });
                }
                else if (key !== "closureUploads") {
                    payload.append(key, value);
                }
            });

            /* =====================
               EVIDENCE DOCUMENTS
               (CRITICAL FIX)
            ====================== */
            if (Array.isArray(values.closureUploads)) {
                values.closureUploads.forEach((item) => {
                    // title
                    payload.append(
                        "tdoc_closure_docs_title",
                        item?.tdoc_closure_docs_title || ""
                    );

                    // file
                    const fileObj = item?.tdoc_closure_docs?.[0]?.originFileObj;
                    if (fileObj) {
                        payload.append("tdoc_closure_docs", fileObj);
                    }

                    // doc id (edit case)
                    if (item?.tdoc_id) {
                        payload.append("tdoc_id", item.tdoc_id);
                    }
                });
            }

            const res = await projectClosureCreateUpdateApi(payload);

            if (res.status) {
                toast.success(res.message);
                fetchData();
                onClose();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal
            title={`${data?.tpclsr_id ? "Update" : "Add"} Project Closure`}
            open={visible}
            onOk={() => form.submit()}
            confirmLoading={loading}
            onCancel={onClose}
            width="90%"
            maskClosable={false}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* ================= BASIC DETAILS ================= */}
                <fieldset className="border p-3 rounded mb-3">
                    <legend>Basic Details</legend>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Total milestone"
                                name="tpclsr_total_milestone"
                                rules={[
                                    { required: true, message: "Required" },
                                    { type: "number", min: 1, message: "Must be greater than 0" },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    precision={0}
                                    style={{ width: "100%" }}
                                    placeholder="Enter total milestone"
                                />
                            </Form.Item>

                        </Col>

                        <Col span={8}>
                            <Form.Item
                                label="Achieved milestone"
                                name="tpclsr_key_achievements"
                                rules={[
                                    { required: true, message: "Required" },
                                    { type: "number", min: 1, message: "Must be greater than 0" },
                                ]}
                            >
                                <InputNumber min={1} precision={0} style={{ width: "100%" }} placeholder="Enter achieved milestone" />
                            </Form.Item>
                        </Col>
                    </Row>
                </fieldset>

                {/* ================= FINANCIAL DETAILS ================= */}
                <fieldset className="border p-3 rounded mb-3">
                    <legend>Financial Closure</legend>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Total Allocated Budget" name="tpclsr_total_allocate_budget">
                                <InputNumber style={{ width: "100%" }} disabled />
                            </Form.Item>




                        </Col>

                        <Col span={8}>
                            <Form.Item
                                label="Total amount utilized"
                                name="tpclsr_total_utilized_amount"
                            >
                                <InputNumber style={{ width: "100%" }} placeholder="Enter amount" disabled />
                            </Form.Item>

                        </Col>

                        <Col span={8}>
                            <Form.Item
                                label="Unspent remaining"
                                name="tpclsr_unspent_remaining"
                                rules={[
                                    { required: true, message: "Required" },
                                    { type: "number", min: 1, message: "Must be greater than 0" },
                                ]}                            >
                                <InputNumber min={1} precision={0} style={{ width: "100%" }} placeholder="Enter amount" />






                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                label="Document verification"
                                name="tpclsr_doc_verification"
                                rules={[{ required: true, message: "Required" }]}
                            >
                                <Select placeholder="Select">
                                    <Select.Option value="Yes">Yes</Select.Option>
                                    <Select.Option value="No">No</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </fieldset>

                {/* ================= DOCUMENT UPLOAD ================= */}
                <Form.Item
                    label={
                        <>
                            Utilization certificate                            <Tooltip title="JPG, PNG, PDF, DOCX, XLS supported">
                                <InfoCircleOutlined style={{ marginLeft: 6 }} />
                            </Tooltip>
                        </>
                    }
                    name="tpclsr_docs"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList}
                    rules={[{ required: true, message: "At least one document required" }]}
                >
                    <Upload multiple beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>Choose File</Button>
                    </Upload>
                </Form.Item>



                <Form.List name="closureUploads" initialValue={[{}]}>
                    {(fields, { add, remove }) => (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6>Evidence Documents</h6>
                                {!data?.tpclsr_id && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={() => add()}
                                    >
                                        Add More
                                    </Button>
                                )}
                            </div>

                            {fields.map(({ key, name, ...rest }) => (
                                <Row gutter={12} key={key}>
                                    <Col span={10}>
                                        <Form.Item
                                            {...rest}
                                            label="Document Title"
                                            name={[name, "tdoc_closure_docs_title"]}
                                            rules={[{ required: true, message: "Required" }]}
                                        >
                                            <Input placeholder="Enter document title" />
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item
                                            {...rest}
                                            label="Upload File"
                                            name={[name, "tdoc_closure_docs"]}
                                            valuePropName="fileList"
                                            getValueFromEvent={(e) => e?.fileList?.slice(-1)}
                                            rules={[{ required: true, message: "File required" }]}
                                        >
                                            <Upload beforeUpload={() => false}>
                                                <Button icon={<UploadOutlined />}>Choose File</Button>
                                            </Upload>
                                        </Form.Item>
                                    </Col>

                                    {fields.length > 1 && (
                                        <Col span={2}>
                                            <Button danger onClick={() => remove(name)}>
                                                Remove
                                            </Button>
                                        </Col>
                                    )}
                                </Row>
                            ))}
                        </>
                    )}
                </Form.List>

            </Form>
        </Modal>
    );
};

export default AddEditProjectClosure;
