import { Col, Form, Input, Modal, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { MultiSelect } from 'react-multi-select-component';
import * as Yup from 'yup';

import { createUpdateEmpVolunteerApi } from '../../services/EmpVolunteer-service';
import {
  fetchDistrictsListByStateIds
} from '../../services/Master-service';
import { allRoles } from '../../services/Role-service';
import { getAllStateApi } from '../../services/State-service';
import { getUserDetails } from '../../services/User-service';


const Schema = Yup.object({
  // company_sub_maser_id: Yup.string().required("Company is required"),
  // region_id: Yup.string().trim().required("Region is required"),
  name: Yup.string().trim().required("Name is required").matches(/^[A-Za-z].*$/, "Name must start with a letter"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
  .trim()
  .test(
    "password-validation",
    "Password must be at least 8 characters, contain uppercase, lowercase, number and special character (@$!%*?&)",
    function (value) {
      if (!value) return true; // ✅ If empty, skip validation

      const strongPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

      return strongPassword.test(value);
    }
  ),
  phone: Yup.string()
  .required("Phone is required")
  .matches(
    /^[6-9]\d{9}$/,
    "Enter a valid Indian mobile number"
  )
  .min(10, "Phone number must be 10 digits"),  
  status: Yup.string().required("Status is required"),
  state_district_blocks: Yup.array().min(1, "At least one state and district is required").of(
    Yup.object().shape({
      state_id: Yup.string().required(),
      district_id: Yup.string().required(),
    })
  ),
});


export default function EmployeeVolunteerAddUpdate({ show, onClose, details, initListDatatable }) {
  const [form] = Form.useForm();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    // company_sub_maser_id: '',
    email: '',
    password: '',
    status: 'active',
    phone: '',
    // vertical_id: '',
    // region_id: '',
  });

  const [rolesOptions, setRolesOptions] = useState([]);
  const [companyMasterList, setCompanyMasterList] = useState([]);
  const [verticalOptions, setVerticalOptions] = useState([]);
  const [ngoOptions, setNgoOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [districtsOptions, setDistrictsOptions] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [regionList, setRegionList] = useState([]);

  const fetchAllData = async () => {
    try {
      const [rolesRes, stateRes] = await Promise.all([
        allRoles(),
        // fetchAllCompanyApi(),
        // fetchAllVerticalApi(),
        getAllStateApi(),
        // getAllPublicRegionApi(),
      ]);
      // console.log("companyRes?.data---- ", companyRes?.data);

      setRolesOptions(rolesRes.data.map(r => ({ label: r.trl_role_name, value: r.trl_role_id })));
      // setCompanyMasterList(companyRes?.data);
      // setVerticalOptions(verticalRes.data);
      setStateOptions(stateRes.data || []);
      // setRegionList(regionRes?.data || []);
    } catch (err) {
      toast.error("Error loading master data");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // console.log("details0--------------- ", details);

  const handleFirstLetterValidation = (field, value) => {
    // Allow empty (for backspace)
    if (value === "") {
      setFormData(prev => ({ ...prev, [field]: "" }));
      return;
    }

    // First character must be a letter
    if (!/^[A-Za-z]/.test(value)) {
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };



  useEffect(() => {
    if (details?.id) {
      loadUserDetails(details?.id);
    }
  }, [details]);

  const loadUserDetails = async (userId) => {
    try {
      const res = await getUserDetails(userId);
      const user = res.data[0];
      const stateSel = (user.states || []).map(s => ({ value: s.state_id, label: s.state_name }));
      const districtSel = (user.districts || []).map(d => ({
        value: d.district_id,
        label: d.district_name,
        stateId: d.stateId,
      }));

      setFormData({
        ...user,
        id: user.id || user.user_id || '', // make sure id is set
        // vertical_id: user.tvm_id || '',
        // ngo_id: user.tngo_id || '',
      });

      setSelectedStates(stateSel);
      setSelectedDistricts(districtSel);
      fetchDistricts(stateSel.map(s => s.value));
    } catch (err) {
      toast.error("Failed to fetch user details");
    }
  };

  const fetchDistricts = async (stateIds) => {
    try {
      const res = await fetchDistrictsListByStateIds({ state_ids: stateIds });
      if (res.status === 1) {
        setDistrictsOptions(res.data.map(d => ({
          label: d.tdl_district_name,
          value: d.tdl_district_id,
          stateId: d.tdl_state_id
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };



  const handleSubmit = async () => {
    const state_district_blocks = selectedDistricts.map(d => {
      const state = selectedStates.find(s => s.value === d.stateId);
      return { state_id: state?.value, district_id: d.value };
    });

    const dataToValidate = {
      ...formData,
      state_district_blocks,
      id: formData.id, // include this so Yup knows whether it's update or create
    };


    // console.log("Data to formData:", formData);


    try {
      await Schema.validate(dataToValidate, { abortEarly: false });
      const res = await createUpdateEmpVolunteerApi(dataToValidate);
      if (res.status === 1) {
        toast.success(res.message);
        initListDatatable(`${import.meta.env.VITE_API_URL}/admin/employee-volunteering/employee_volunteer_list_datatable`);
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const formatted = err.inner.reduce((acc, e) => {
          acc[e.path] = e.message;
          return acc;
        }, {});
        setErrors(formatted);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <>
      <Modal
        open={show}
        onCancel={onClose}
        onOk={handleSubmit}
        title={formData?.id ? "Update Employee Volunteer" : "Create Employee Volunteer"}
        width={800}
        okText="Submit"
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            {/* <Col span={12}>
              <Form.Item label="Company" required>
                <Select
                  value={formData.company_sub_maser_id}
                  options={companyMasterList}
                  onChange={(val) => setFormData({ ...formData, company_sub_maser_id: val })}
                />
                {errors.company_sub_maser_id && <div className="text-danger">{errors.company_sub_maser_id}</div>}
              </Form.Item>
            </Col> */}
            <Col span={12}>
              <Form.Item label="Name" required>
                <Input
                  value={formData.name}
                    onChange={(e) =>
                      handleFirstLetterValidation("name", e.target.value)
                    }
                />
                {errors.name && <div className="text-danger">{errors.name}</div>}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email" required>
                <Input
                  value={formData.email}
                    onChange={(e) =>
                      handleFirstLetterValidation("email", e.target.value)
                    }
                />
                {errors.email && <div className="text-danger">{errors.email}</div>}
              </Form.Item>
            </Col>

            {/* <Col span={12}>
              <Form.Item label="Password">
                <Input.Password
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                {errors.password && <div className="text-danger">{errors.password}</div>}
              </Form.Item>
            </Col> */}
          
              <Col span={12}>
                <Form.Item label="Password" rules={
                      !formData?.id
                        ? [{ required: true, message: "Password is required" }]
                        : []
                    }>
                  <Input.Password
                    value={formData.password}
                     onChange={(e) =>
                      handleFirstLetterValidation("password", e.target.value)
                    }
                  />
                  {errors.password && <div className="text-danger">{errors.password}</div>}
                </Form.Item>
              </Col>
          

            <Col span={12}>
              <Form.Item label="Phone No" required>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    handleFirstLetterValidation("phone", e.target.value)
                  }
                />
                {errors.phone && <div className="text-danger">{errors.phone}</div>}
              </Form.Item>
            </Col>
            {/* <Col span={12}>
                <Form.Item label="Region" required>
                    <Select
                        name="region_id"
                        placeholder="Select Region"
                        value={formData.region_id}
                        onChange={(selectedOption) => handleChange(selectedOption, { name: "region_id" })
                                }
                        options={regionList}
                    />
                    {errors.region_id && (
                        <div className="text-danger">{errors.region_id}</div>
                    )}
                </Form.Item>
            </Col> */}
            <Col span={12}>
              <Form.Item label="State" required>
                <MultiSelect
                 
                  options={stateOptions}
                  value={selectedStates}
                  onChange={(states) => {
                    setSelectedStates(states);
                    fetchDistricts(states.map(s => s.value));
                  }}
                  labelledBy="Select State"
                />
                {errors.state_district_blocks && <div className="text-danger">{errors.state_district_blocks}</div>}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="District" required>
                <MultiSelect
                  options={districtsOptions}
                  value={selectedDistricts}
                  onChange={(districts) => setSelectedDistricts(districts)}
                  labelledBy="Select District"
                />
                {errors.state_district_blocks && <div className="text-danger">{errors.state_district_blocks}</div>}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status" required>
                <Select
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                />
                {errors.status && <div className="text-danger">{errors.status}</div>}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Toaster position="top-right" />
    </>
  );
}
