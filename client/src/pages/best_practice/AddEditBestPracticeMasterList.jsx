import React, { useEffect, useState } from "react";
import { Form, Input, Button, Upload, Tooltip, Popconfirm, Select } from "antd";
import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { toast, Toaster } from "react-hot-toast";

import { getAllThemeApi, getAllSubScheduleSevenApi } from "../../services/PriorityAlignment-service";
import { getAllProjectApi } from "../../services/Project-service";

const { TextArea } = Input;



import {
    createBestPracticeApi,
    updateBestPracticeApi,
} from "../../services/BestPractice-service";


export const AddEditBestPracticeMasterList = ({
    changeModalStatus,
    editList,
    initiatedDistrictDatatable,
    datatable_url
}) => {

    const [form] = Form.useForm();
    const [fileLists, setFileLists] = useState([]);
    const [projects, setProjects] = useState([]);
    const [themes, setThemes] = useState([]);
    const [focusareas, setFocusareas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllThemeApi()
            .then((res) => {
                setThemes(res?.data);
            })
            .catch((error) => toast.error(error?.response?.data?.message));
        getAllProjectApi()
            .then((res) => {
                setProjects(res?.data);
            })
            .catch((error) => toast.error(error?.response?.data?.message));
        getAllSubScheduleSevenApi()
            .then((res) => {
                setFocusareas(res?.data);
            })
            .catch((error) => toast.error(error?.response?.data?.message));
    }, []);





    /* ================= EDIT MODE ================= */
    // useEffect(() => {
    //     if (editList) {
    //         form.setFieldsValue({
    //             tbp_project_id: editList?.tbp_project_id,
    //             tbp_theme_id: editList?.tbp_theme_id,
    //             tbp_focus_area_id: editList?.tbp_focus_area_id,
    //             tbp_problem: editList?.tbp_problem,
    //             tbp_solution: editList?.tbp_solution,
    //             tbp_benefit: editList?.tbp_benefit,
    //         });
    //         if (editList?.tbp_picture_documents) {
    //             setFileLists(editList.tbp_picture_documents);
    //         }
    //     }
    // }, [editList]);


    useEffect(() => {
        if (editList) {
            form.setFieldsValue({
                tbp_project_id: editList?.tbp_project_id,
                tbp_theme_id: editList?.tbp_theme_id,
                tbp_focus_area_id: editList?.tbp_focus_area_id,
                tbp_problem: editList?.tbp_problem,
                tbp_solution: editList?.tbp_solution,
                tbp_benefit: editList?.tbp_benefit,
            });

            // ✅ map existing documents
            if (editList?.documents?.length) {
                const mappedFiles = editList.documents.map((doc) => ({
                    uid: doc.tdoc_id,
                    name: doc.file_name,
                    status: "done",
                    url: doc.full_url,
                    tdoc_id: doc.tdoc_id, // keep id for backend if needed
                }));

                setFileLists(mappedFiles);
            }
        }
    }, [editList]);



    /* ================= SUBMIT ================= */
    const handleSubmit = async (values) => {

        const formDataObj = new FormData();

        // append normal fields
        Object.keys(values).forEach((key) => {
            formDataObj.append(key, values[key]);
        });

        // append files
        if (fileLists && fileLists.length > 0) {
            fileLists.forEach((file) => {
                formDataObj.append(
                    "tbp_picture_documents",
                    file.originFileObj
                );
            });
        }


        setLoading(true);

        try {
            let res;

            if (editList?.tbp_id) {
                res = await updateBestPracticeApi(formDataObj, editList.tbp_id);
            } else {
                res = await createBestPracticeApi(formDataObj);
            }

            if (res.status) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }

            changeModalStatus("user_update_modal", false);
            initiatedDistrictDatatable(datatable_url);

        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ================= FILE HANDLER ================= */
    const handleFileChange = (fileList) => {
        setFileLists(fileList);
    };


    return (
        <>
            <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <div className="row">

                    {/* ================= PROJECT ================= */}
                    <div className="col-md-6">
                        <Form.Item
                            label="Project"
                            name="tbp_project_id"
                            rules={[{ required: true, message: "Project is required" }]}
                        >
                            <Select
                                placeholder="Select Project"
                                options={projects}
                                showSearch
                                optionFilterProp="label"
                                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                                filterOption={(input, option) =>
                                    option?.label?.toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </div>

                    {/* ================= THEME ================= */}



                    <div className="col-md-6">
                        <Form.Item
                            label="Theme"
                            name="tbp_theme_id"
                            rules={[{ required: true, message: "Theme is required" }]}
                        >
                            <Select
                                placeholder="Select Theme"
                                showSearch
                                options={themes}
                                getPopupContainer={(triggerNode) => triggerNode.parentNode}

                                filterOption={(input, option) =>
                                    option?.label?.toLowerCase().includes(input.toLowerCase())
                                }
                            />




                        </Form.Item>
                    </div>


                    {/* ================= FOCUS AREA ================= */}
                    <div className="col-md-6">
                        <Form.Item
                            label="Focus Area"
                            name="tbp_focus_area_id"
                            rules={[{ required: true, message: "Focus Area is required" }]}
                        >
                            <Select
                                placeholder="Select Focus Area"
                                options={focusareas}
                                showSearch
                                getPopupContainer={(triggerNode) => triggerNode.parentNode}

                                filterOption={(input, option) =>
                                    option?.label?.toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </div>

                    {/* ================= PROBLEM ================= */}
                    <div className="col-md-6">
                        {/* <Form.Item
                            label="Problem"
                            name="tbp_problem"
                            rules={[{ required: true, message: "Problem is required" }]}
                        >
                            <TextArea rows={2} />
                        </Form.Item> */}
                        <Form.Item
                            label="Problem"
                            name="tbp_problem"
                            rules={[
                                {
                                    required: true,
                                    message: "Problem is required",
                                },
                                {
                                    validator: (_, value) => {
                                        if (value && value.trim().length === 0) {
                                            return Promise.reject("Problem cannot be only spaces");
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <TextArea
                                rows={2}
                                placeholder="Enter problem description"
                                onKeyDown={(e) => {
                                    if (e.key === " " && e.target.selectionStart === 0) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Form.Item>



                    </div>

                    {/* ================= SOLUTION ================= */}
                    <div className="col-md-6">


                        {/* <Form.Item
                            label="Solution"
                            name="tbp_solution"
                            rules={[{ required: true, message: "Solution is required" }]}
                        >
                            <TextArea rows={2} />
                        </Form.Item> */}


                        <Form.Item
                            label="Solution"
                            name="tbp_solution"
                            rules={[
                                {
                                    required: true,
                                    message: "Solution is required",
                                },
                                {
                                    validator: (_, value) => {
                                        if (value && value.trim().length === 0) {
                                            return Promise.reject("Solution cannot be only spaces");
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <TextArea
                                rows={2}
                                placeholder="Enter solution description"
                                onKeyDown={(e) => {
                                    if (e.key === " " && e.target.selectionStart === 0) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Form.Item>




                    </div>

                    {/* ================= BENEFIT ================= */}
                    <div className="col-md-6">

                        {/* <Form.Item
                            label="Benefit"
                            name="tbp_benefit"
                            rules={[{ required: true, message: "Benefit is required" }]}
                        >
                            <TextArea rows={2} />
                        </Form.Item> */}




                        <Form.Item
                            label="Benefit"
                            name="tbp_benefit"
                            rules={[
                                {
                                    required: true,
                                    message: "Benefit is required",
                                },
                                {
                                    validator: (_, value) => {
                                        if (value && value.trim().length === 0) {
                                            return Promise.reject("Benefit cannot be only spaces");
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <TextArea
                                rows={2}
                                placeholder="Enter benefit description"
                                onKeyDown={(e) => {
                                    if (e.key === " " && e.target.selectionStart === 0) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </Form.Item>


                    </div>

                    {/* ================= FILE UPLOAD ================= */}


                    {/* <div className="col-md-6">
                        <Form.Item
                            label={
                                <>
                                    Attachment Documents
                                    <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX">
                                        <InfoCircleOutlined style={{ marginLeft: 6 }} />
                                    </Tooltip>
                                </>
                            }
                        >
                            <Upload
                                multiple
                                beforeUpload={() => false}
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                fileList={fileLists}
                                onChange={({ fileList }) => handleFileChange(fileList)}
                                showUploadList={{ showRemoveIcon: false }}
                                itemRender={(originNode, file, currFileList) => (
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
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>{originNode}</div>

                                        <Popconfirm
                                            title="Are you sure to delete this file?"
                                            okText="Yes"
                                            cancelText="No"
                                            onConfirm={() => {
                                                const updatedList = currFileList.filter(
                                                    (f) => f.uid !== file.uid
                                                );

                                                setFileLists((prev) => ({
                                                    ...prev,
                                                    tbp_picture_documents: updatedList,
                                                }));

                                                handleFileChange(
                                                    "tbp_picture_documents",
                                                    updatedList
                                                );
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "red",
                                                    cursor: "pointer",
                                                    marginLeft: 8,
                                                }}
                                            >
                                                Delete
                                            </span>
                                        </Popconfirm>
                                    </div>
                                )}

                            >

                                <Button icon={<UploadOutlined />}>Choose File</Button>




                            </Upload>
                        </Form.Item>
                    </div> */}



                    <div className="col-md-6">
                        <Form.Item
                            label={
                                <>
                                    Attachment Documents
                                    <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Max size: 15MB)">
                                        <InfoCircleOutlined style={{ marginLeft: 6 }} />
                                    </Tooltip>
                                </>
                            }
                        >
                            <Upload
                                multiple
                                beforeUpload={(file) => {
                                    const allowedTypes = [
                                        "application/pdf",
                                        "application/msword",
                                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                        "application/vnd.ms-excel",
                                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                        "image/jpeg",
                                        "image/jpg",
                                        "image/png"
                                    ];

                                    const isValidType = allowedTypes.includes(file.type);

                                    if (!isValidType) {
                                        toast.error("Invalid file format");
                                        return Upload.LIST_IGNORE;
                                    }

                                    const isLt15MB = file.size / 1024 / 1024 < 15;

                                    if (!isLt15MB) {
                                        toast.error("File must be smaller than 15MB");
                                        return Upload.LIST_IGNORE;
                                    }

                                    return false; // prevent auto upload
                                }}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                fileList={fileLists}
                                onChange={({ fileList }) => handleFileChange(fileList)}
                                showUploadList={{ showRemoveIcon: false }}
                                itemRender={(originNode, file, currFileList) => (
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
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>{originNode}</div>

                                        <Popconfirm
                                            title="Are you sure to delete this file?"
                                            okText="Yes"
                                            cancelText="No"
                                            onConfirm={() => {
                                                const updatedList = currFileList.filter(
                                                    (f) => f.uid !== file.uid
                                                );
                                                setFileLists(updatedList);
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "red",
                                                    cursor: "pointer",
                                                    marginLeft: 8,
                                                }}
                                            >
                                                Delete
                                            </span>
                                        </Popconfirm>
                                    </div>
                                )}
                            >
                                <Button icon={<UploadOutlined />}>Choose File</Button>
                            </Upload>
                        </Form.Item>
                    </div>


                </div>



                <div className="row">
                    <div className="col-md-12 float-right">

                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>

                    </div>
                </div>
            </Form>
        </>
    );
};
