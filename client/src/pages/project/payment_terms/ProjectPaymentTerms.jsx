import { UploadOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Upload,
  Select,
  Table,
  InputNumber,
} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  projectDetailsApi,
  projectPaymentCreateUpdateApi,
  projectPaymentDetailsApi,
  projectPaymentTermsCreateUpdateApi,
  projectPaymentTermsDetailsApi,
} from "../../../services/Project-service";

import { Descriptions } from "antd";

import { getAllSubScheduleSevenApi } from "../../../services/PriorityAlignment-service";

import { getSubMasterListByMasterSlugApi } from "../../../Services/Master-service";

import * as Yup from "yup";

// ===================== YUP SCHEMA =====================
const paymentTermSchema = Yup.object().shape({
  tppayt_short_name: Yup.string().required("Short name is required")
  .max(255, "Short name must be at most 255 characters"),
});

// ===================== INITIAL FORM DATA =====================

// const initialFormData = {
//   tppayt_short_name: "",
//   tppayt_description: "",
// };

const ProjectPaymentTerms = ({ isClosureApproved }) => {
  const { tproj_id } = useParams();

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [paymentDetails, setPaymentDetails] = useState([]);
  const [editData, setEditData] = useState(null);

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tppayt_short_name: null,
    tppayt_description: null,
  });

  // ===================== HANDLE CHANGE =====================
  const handleChange = (name, value) => {
    
     if (typeof value === "string") {
      value = value.replace(/^\s+/, "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const fetchPaymentDetails = () => {
    projectPaymentTermsDetailsApi({
      tproj_id,
      tbad_transfer_type: "purchase_payment",
    })
      .then(({ data }) => setPaymentDetails(data || []))
      .catch(() => toast.error("Failed to load payment details"));
  };

  useEffect(() => {
    if (tproj_id) {
      fetchPaymentDetails();
    }
  }, [tproj_id]);

  // ===================== SEPARATE EDIT USE EFFECT =====================
  useEffect(() => {
    if (editData) {
      // ✅ Populate formData when editData changes
      setFormData({
        tppayt_short_name: editData.tppayt_short_name || "",
        tppayt_description: editData.tppayt_description || "",
      });
      setErrors({});
    }
  }, [editData]);

  /* ===================== VALIDATE ===================== */
  const validateForm = async () => {
    try {
      await paymentTermSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const fieldErrors = {};
      err.inner.forEach((e) => {
        fieldErrors[e.path] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      const payload = new FormData();

      payload.append("tproj_id", tproj_id);
      payload.append("tppayt_short_name", formData.tppayt_short_name);
      payload.append("tppayt_description", formData.tppayt_description);

      if (editData?.tppayt_id) {
        payload.append("tppayt_id", editData.tppayt_id);
      }

      setLoading(true);
      const res = await projectPaymentTermsCreateUpdateApi(payload);

      if (!res?.success) {
        toast.error("Failed to save payment term");
        return;
      }

      toast.success(
        editData
          ? "Payment term updated successfully"
          : "Payment term added successfully",
      );

      handleCancel();
      fetchPaymentDetails();
      ///fetchProjectDetails();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================== EDIT ===================== */
  const handleEdit = (payment) => {
    setEditData(payment); // ✅ triggers the separate useEffect above
    setIsModalVisible(true);
  };

  /* ===================== CANCEL ===================== */
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditData(null);
    setErrors({});
    setFormData({
      tppayt_short_name: null,
      tppayt_description: null,
    }); // ✅ reset formData
  };

  /* ===================== UI ===================== */
  return (
    <>
      <div className="home-content">
        <div className="card pb-3">
          {/* ===== Card Header ===== */}
          <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="mb-0">Project Payment Terms</h5>
            {!isClosureApproved && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setFormData({
                    tppayt_short_name: null,
                    tppayt_description: null,
                  });
                  setEditData(null);
                  setErrors({});
                  setIsModalVisible(true);
                }}
              >
                Add
              </Button>
            )}
          </div>

          {/* ===== Modal ===== */}
          <Modal
            title={editData ? "Edit Payment Term" : "Add Payment Term"}
            open={isModalVisible}
            onCancel={handleCancel}
            width={800}
            footer={[
              <Button key="c" onClick={handleCancel}>
                Cancel
              </Button>,
              <Button
                key="s"
                type="primary"
                loading={loading}
                onClick={handleSubmit} // ✅ direct call, no form.submit()
              >
                {editData ? "Update" : "Submit"}
              </Button>,
            ]}
          >
            <Row gutter={12}>
              {/* Short Name */}
              <Col span={24}>
                <label>
                  Short Name <span style={{ color: "red" }}>*</span>
                </label>
                <Input
                  style={{ width: "100%" }}
                  placeholder="Enter short name"
                  value={formData.tppayt_short_name}
                  onChange={(e) =>
                    handleChange("tppayt_short_name", e.target.value)
                  }
                />
                {errors?.tppayt_short_name && (
                  <div className="text-danger">{errors.tppayt_short_name}</div>
                )}
              </Col>

              {/* Description */}
              <Col span={24}>
                <label>
                  Description <span style={{ color: "red" }}>*</span>
                </label>
                <Input.TextArea
                  rows={3}
                  style={{ width: "100%" }}
                  placeholder="Enter description"
                  value={formData.tppayt_description}
                  onChange={(e) =>
                    handleChange("tppayt_description", e.target.value)
                  }
                />
                {errors?.tppayt_description && (
                  <div className="text-danger">{errors.tppayt_description}</div>
                )}
              </Col>
            </Row>
          </Modal>

          {/* ===== Table ===== */}
          <div
            className="card-body at-elevation-z6 table-box"
            style={{ maxHeight: "calc(100vh - 23vh)", overflowX: "auto" }}
          >
            <table className="table table-bordered table-yellow dataTable">
              <thead className="table-warning">
                <tr>
                  <th>#</th>
                  <th>Short Name</th>
                  <th>Description</th>
                  <th style={{ width: "120px" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {paymentDetails.length ? (
                  paymentDetails.map((p, index) => (
                    <tr key={p.tbad_id}>
                      <td>{index + 1}</td>
                      <td>{p.tppayt_short_name || "--"}</td>
                      <td>{p.tppayt_description || "--"}</td>

                      {/* Action */}
                      <td>
                        {!isClosureApproved && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(p)}
                          >
                            <i className="fa-solid fa-pen"></i> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No payment term records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectPaymentTerms;
