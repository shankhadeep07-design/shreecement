import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { createEmpVolunteerApi, updateEmpVolunteerApi } from "../../services/EmpVolunteer-service";

const { Text } = Typography;

const Schema = Yup.object({
  tevol_name: Yup.string().trim().required("Name is required"),
  tevol_department: Yup.string().trim().required("Department is required"),
  tevol_another_mem_no: Yup.string().required("Member No is required"),
  tevol_another_mem_name: Yup.string().trim().required("Member Name is required"),
  tevol_description: Yup.string().trim().required("Description is required"),
});

const EmployeeVolunteerUpsert = (props) => {
  const { visible, onClose, data,fetchData } = props;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    tevol_name: '',
    tevol_department: '',
    tevol_another_mem_no: '',
    tevol_another_mem_name: '',
    tevol_description: '',
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidation = async (data) => {
    try {
      await Schema.validate(data, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Error && "inner" in err) {
        const formattedErrors = err.inner.reduce((acc, curr) => {
          acc[curr.path] = curr.message;
          return acc;
        }, {});
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  // const handleSubmit = async () => {
  //   const isValid = await handleValidation(formData);
  //   if (!isValid) return;

  //   if(data?.tevol_id){
  //       updateEmpVolunteerApi(formData, data?.tevol_id)
  //       .then((res) => {
  //           if (res.status == true) {
  //               toast.success(res.message);
  //                onClose();
  //           } else {
  //               toast.error(res.message);
  //           }
  //       })
  //   }else{
  //     createEmpVolunteerApi(formData)
  //       .then((res) => {
  //       if (res.status == true) {
  //         toast.success(res.message);
  //         onClose();
  //       } else {
  //         toast.error(res.message);
  //       }
  //     })
  //   }

  //   setLoading(true);
  // };

  const handleSubmit = async () => {
  const isValid = await handleValidation(formData);
  if (!isValid) return;

  setLoading(true);

  const apiCall = data?.tevol_id
    ? updateEmpVolunteerApi(formData, data.tevol_id)
    : createEmpVolunteerApi(formData);

  apiCall
    .then((res) => {
      if (res.status === true) {
        fetchData();
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
      }
    })
    .catch((err) => {
      // Try to get a useful error message from the server
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    })
    .finally(() => {
      setLoading(false);
    });
};

  useEffect(() => {
    setErrors({});
    if (data && Object.keys(data).length > 0) {
      setFormData({
        tevol_name: data?.tevol_name || '',
        tevol_department: data?.tevol_department || '',
        tevol_another_mem_no: data?.tevol_another_mem_no || '',
        tevol_another_mem_name: data?.tevol_another_mem_name || '',
        tevol_description: data?.tevol_description || '',
      });
    } else {
      setFormData({
        tevol_name: '',
        tevol_department: '',
        tevol_another_mem_no: '',
        tevol_another_mem_name: '',
        tevol_description: '',
      });
    }
  }, [data]);

  return (
    <Modal
      title={
        <>
          {`${data?.tev_id ? "Update" : "Add"} Volunteer`}
          <br />
          <Text
            type="secondary"
            style={{ fontSize: "12px", fontWeight: "bold", color: "#1890ff" }}
          >
            Please fill in all required fields.
          </Text>
        </>
      }
      style={{ top: 40 }}
      open={visible}
      onOk={handleSubmit}
      confirmLoading={loading}
      onCancel={onClose}
      maskClosable={false}
      footer={[
        <>
          <Divider key="divider" style={{ margin: "0 0 10px 0", borderColor: "lightGrey" }} />
          <Button key="back" onClick={onClose}>Cancel</Button>
          <Button key="submit" disabled={loading} type="primary" loading={loading} onClick={handleSubmit}>
            Submit
          </Button>
        </>
      ]}
    >
      <Form layout="vertical" style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <Row gutter={[8, 16]}>
          <Col span={24}>
            <label htmlFor="tevol_name" className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="Enter Name"
              name="tevol_name"
              value={formData.tevol_name}
              onChange={(e) => handleChange("tevol_name", e.target.value)}
            />
            {errors?.tevol_name && <div className="error text-danger">{errors?.tevol_name}</div>}
          </Col>

          <Col span={24}>
            <label htmlFor="tevol_department" className="form-label">
              Department <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="Enter Department"
              name="tevol_department"
              value={formData.tevol_department}
              onChange={(e) => handleChange("tevol_department", e.target.value)}
            />
            {errors?.tevol_department && <div className="error text-danger">{errors?.tevol_department}</div>}
          </Col>

          <Col span={24}>
            <label htmlFor="tevol_another_mem_no" className="form-label">
              Member No <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="Enter Member No"
              name="tevol_another_mem_no"
              value={formData.tevol_another_mem_no}
              onChange={(e) => handleChange("tevol_another_mem_no", e.target.value)}
            />
            {errors?.tevol_another_mem_no && <div className="error text-danger">{errors?.tevol_another_mem_no}</div>}
          </Col>

          <Col span={24}>
            <label htmlFor="tevol_another_mem_name" className="form-label">
              Member Name <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="Enter Member Name"
              name="tevol_another_mem_name"
              value={formData.tevol_another_mem_name}
              onChange={(e) => handleChange("tevol_another_mem_name", e.target.value)}
            />
            {errors?.tevol_another_mem_name && <div className="error text-danger">{errors?.tevol_another_mem_name}</div>}
          </Col>

          <Col span={24}>
            <label htmlFor="tevol_description" className="form-label">
              Description <span className="text-danger">*</span>
            </label>
            <TextArea
              placeholder="Enter Description"
              name="tevol_description"
              value={formData.tevol_description}
              onChange={(e) => handleChange("tevol_description", e.target.value)}
            />
            {errors?.tevol_description && <div className="error text-danger">{errors?.tevol_description}</div>}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EmployeeVolunteerUpsert;
