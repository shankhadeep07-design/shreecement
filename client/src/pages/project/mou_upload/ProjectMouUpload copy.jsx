import {
    EditOutlined,
    InfoCircleOutlined,
    PlusOutlined,
    UploadOutlined
} from "@ant-design/icons";
import {
    Button,
    Col,
    Form,
    Input,
    Modal,
    Row,
    Tooltip,
    Typography,
    Upload,
    Select
} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    projectMouUploadCreateUpdateApi,
    projectMouUploadDetailsApi,
} from "../../../services/Project-service";

const { Text } = Typography;

const yesNoOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
];

const ProjectMouUpload = () => {
    const { tproj_id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [poUploadsDetails, setPoUploadsDetails] = useState([]);
    const [editData, setEditData] = useState(null);
    const [isApplicable, setIsApplicable] = useState(null);

    /* ===================== SUBMIT ===================== */
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = new FormData();

            /* ===================== BASIC ===================== */
            payload.append("tdoc_tproj_id", tproj_id);

            payload.append("is_applicable", values.is_applicable);

            /* ===================== EDIT MODE ===================== */
            if (editData?.tpmou_id) {
                payload.append("tpmou_id", editData.tpmou_id);
            }

            /* ===================== CONDITIONAL ===================== */
            if (values.is_applicable === "yes") {
                payload.append("draft_mou", values.draft_mou);
                payload.append("vetted_ngo", values.vetted_ngo);
                payload.append("vetted_legal", values.vetted_legal);
                payload.append("print_mou", values.print_mou);
                payload.append("signed_by_parties", values.signed_by_parties);
                payload.append("amendment", values.amendment || "");

                /* ===================== DOCUMENTS ===================== */
                values?.poUploads?.forEach((item) => {
                    payload.append("tdoc_mou_docs_title[]", item.tdoc_mou_docs_title);

                    /* Send document ID ONLY if editing that document */
                    if (item?.tdoc_id) {
                        payload.append("tdoc_id[]", item.tdoc_id);
                    }

                    const file = item?.tdoc_mou_docs?.[0];
                    if (file?.originFileObj) {
                        payload.append("tdoc_mou_docs[]", file.originFileObj);
                    }
                });
            }

            setLoading(true);
            const response = await projectMouUploadCreateUpdateApi(payload);

            if (!response?.success) {
                toast.error("Failed to save MOU details");
                return;
            }

            toast.success(editData ? "MOU updated successfully!" : "MOU added successfully!");
            handleCancel();
            fetchProjectPoUploadFun();

        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    /* ===================== FETCH ===================== */
    const fetchProjectPoUploadFun = () => {
        projectMouUploadDetailsApi({ tproj_id })
            .then(({ data }) => setPoUploadsDetails(data))
            .catch(() => toast.error("Something went wrong"));
    };

    useEffect(() => {
        fetchProjectPoUploadFun();
    }, [tproj_id]);

    /* ===================== EDIT ===================== */
    const handleEdit = (doc) => {
        setEditData(doc);
        setIsApplicable("yes");
        setIsModalVisible(true);

        form.setFieldsValue({
            is_applicable: "yes",
            draft_mou: doc?.draft_mou,
            vetted_ngo: doc?.vetted_ngo,
            vetted_legal: doc?.vetted_legal,
            print_mou: doc?.print_mou,
            signed_by_parties: doc?.signed_by_parties,
            amendment: doc?.amendment,
            poUploads: [
                {
                    tdoc_mou_docs_title: doc.doc_title,
                    tdoc_mou_docs: doc.doc_name
                        ? [
                            {
                                uid: "-1",
                                name: doc.doc_name,
                                status: "done",
                                url: doc.full_url,
                            },
                        ]
                        : [],
                },
            ],
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditData(null);
        setIsApplicable(null);
        form.resetFields();
    };

    /* ===================== UI ===================== */
    return (
        <div className="home-content">
            <div className="card pb-3">
                <div className="card-header fw-bold py-2 px-3">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h5 className="mb-0">MOU List</h5>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditData(null);
                                setIsApplicable(null);
                                form.resetFields();
                                setIsModalVisible(true);
                            }}
                        >
                            Add
                        </Button>
                    </div>
                </div>

                {/* ===================== MODAL ===================== */}
                <Modal
                    title={editData ? "Edit MOU" : "Add MOU"}
                    open={isModalVisible}
                    onCancel={handleCancel}
                    width={1000}
                    footer={[
                        <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                            {editData ? "Update" : "Submit"}
                        </Button>,
                    ]}
                >
                    <Form form={form} layout="vertical">
                        {/* Applicable */}
                        <Form.Item
                            label="Wheather MOU Applicable or Not?"
                            name="is_applicable"
                            rules={[{ required: true, message: "Please select Applicable" }]}
                        >
                            <Select
                                options={yesNoOptions}
                                onChange={(val) => setIsApplicable(val)}
                            />
                        </Form.Item>

                        {/* Conditional Section */}
                        {isApplicable === "yes" && (
                            <>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item
                                            label="Draft MoU uploaded in legal portal"
                                            name="draft_mou"
                                            rules={[
                                                { required: true, message: "Please select Draft MoU status" }
                                            ]}
                                        >
                                            <Select options={yesNoOptions} placeholder="Select Yes / No" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}><Form.Item label="Vetted by NGO Partner" name="vetted_ngo"><Select options={yesNoOptions} /></Form.Item></Col>
                                    <Col span={8}><Form.Item label="Vetted by Legal Team" name="vetted_legal"><Select options={yesNoOptions} /></Form.Item></Col>
                                    <Col span={8}><Form.Item label="Print of MoU" name="print_mou"><Select options={yesNoOptions} /></Form.Item></Col>
                                    <Col span={8}><Form.Item label="Signed by Parties" name="signed_by_parties"><Select options={yesNoOptions} /></Form.Item></Col>
                                    <Col span={8}><Form.Item label="Amendment" name="amendment"><Input /></Form.Item></Col>
                                </Row>

                                {/* ===================== EXISTING UPLOAD (UNCHANGED) ===================== */}
                                <Form.List name="poUploads" initialValue={[{}]}>
                                    {(fields, { add, remove }) => (
                                        <>
                                            {!editData && (
                                                <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()} style={{ float: "right", marginBottom: 12 }}>

                                                </Button>
                                            )}

                                            {fields.map(({ key, name, ...rest }) => (
                                                <Row gutter={12} key={key}>
                                                    <Col span={10}>
                                                        <Form.Item
                                                            {...rest}
                                                            label="Title"
                                                            name={[name, "tdoc_mou_docs_title"]}
                                                            rules={[{ required: true, message: "Enter title" }]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col span={12}>
                                                        <Form.Item
                                                            {...rest}
                                                            label="Upload"
                                                            name={[name, "tdoc_mou_docs"]}
                                                            valuePropName="fileList"
                                                            getValueFromEvent={(e) => e?.fileList?.slice(-1) || []}
                                                            rules={[{ required: !editData, message: "Upload file" }]}
                                                        >
                                                            <Upload beforeUpload={() => false}>
                                                                <Button icon={<UploadOutlined />}>Choose File</Button>
                                                            </Upload>
                                                        </Form.Item>
                                                    </Col>

                                                    {!editData && fields.length > 1 && (
                                                        <Col span={2}>
                                                            <Button danger onClick={() => remove(name)}>Remove</Button>
                                                        </Col>
                                                    )}
                                                </Row>
                                            ))}
                                        </>
                                    )}
                                </Form.List>
                            </>
                        )}
                    </Form>
                </Modal>

                {/* ===================== TABLE ===================== */}
                <div className="p-4">
                    <h4 className="mb-3">Project MOU Documents</h4>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>File</th>
                                <th>Uploaded By</th>
                                <th>Uploaded At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {poUploadsDetails?.length ? poUploadsDetails.map((doc) => (
                                <tr key={doc.tdoc_id}>
                                    <td>{doc.doc_title}</td>
                                    <td><a href={doc.full_url} target="_blank" rel="noreferrer">{doc.doc_name}</a></td>
                                    <td>{doc.created_by_name}</td>
                                    <td>{new Date(doc.created_at).toLocaleString()}</td>
                                    <td>
                                        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(doc)}>Edit</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="text-center">No documents found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProjectMouUpload;
