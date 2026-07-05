import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import toast from 'react-hot-toast';
import {
  fetchDistrictsListByStateIds,
  getUnitList,
} from '../../services/Master-service';
import { allRoles } from '../../services/Role-service';
import { getAllStateApi } from '../../services/State-service';
import { createUser, getUserDetails } from '../../services/User-service';
import useFy from '../../hooks/useFy';

const { Option } = Select;

export default function UserAddModel({ show, onClose, details, initListDatatable }) {
  const [form] = Form.useForm();

  const [rolesOptions, setRolesOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [districtsOptions, setDistrictsOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);

  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedFy, setSelectedFy] = useState([]);

  const fyOptions = useFy();

  /* -------------------- LOAD MASTER DATA -------------------- */
  useEffect(() => {
    if (show) {
      loadMasterData();
    }
  }, [show]);

  const loadMasterData = async () => {
    try {
      const [rolesRes, statesRes, unitsRes] = await Promise.all([
        allRoles('users'),
        getAllStateApi(),
        getUnitList(),
      ]);

      setRolesOptions(
        rolesRes.data?.map(r => ({ label: r.trl_role_name, value: r.trl_role_id })) || []
      );
      setStateOptions(statesRes?.data || []);
      setUnitOptions(unitsRes?.data || []);
    } catch (error) {
      console.error('Error loading master data:', error);
      toast.error('Failed to load form data');
    }
  };

  /* -------------------- EDIT MODE -------------------- */
  useEffect(() => {
    if (!show || !details?.id) {
      if (!show) {
        resetForm();
      }
      return;
    }

    loadUserDetails();
  }, [show, details]);

  const loadUserDetails = async () => {
    try {
      const res = await getUserDetails(details.id);
      const user = res.data[0];

      // Basic fields
      form.setFieldsValue({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role_id: user.role_id,
        status: user.status || 'active',
        password: '',
      });

      /* -------- FY -------- */
      if (user.fy && fyOptions.length > 0) {
        const fyValues = user.fy.split(',');
        const fySel = fyOptions.filter(fy => fyValues.includes(fy.value));
        setSelectedFy(fySel);
        form.setFieldValue('fy', fyValues);
      }

      /* -------- STATES -------- */
      if (user.states && user.states.length > 0) {
        const stateIds = user.states.map(s => s.state_id);
        setSelectedStates(stateIds);
        form.setFieldValue('states', stateIds);
        await fetchDistricts(stateIds);
      }

      /* -------- DISTRICTS -------- */
      if (user.districts && user.districts.length > 0) {
        const districtIds = user.districts.map(d => d.district_id);
        setSelectedDistricts(districtIds);
        form.setFieldValue('districts', districtIds);
      }

      /* -------- UNITS -------- */
      if (user.unit_ids && unitOptions.length > 0) {
        const unitIds = user.unit_ids.split(',').map(id => parseInt(id));
        setSelectedUnits(unitIds);
        form.setFieldValue('unit_ids', unitIds);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Failed to load user details');
    }
  };

  /* -------------------- FETCHERS -------------------- */
  const fetchDistricts = async (stateIds) => {
    if (!stateIds || stateIds.length === 0) {
      setDistrictsOptions([]);
      setSelectedDistricts([]);
      form.setFieldValue('districts', []);
      return;
    }

    try {
      const res = await fetchDistrictsListByStateIds({ state_ids: stateIds });
      if (res.status === 1 && res.data) {
        setDistrictsOptions(
          res.data.map(d => ({
            label: d.tdl_district_name,
            value: d.tdl_district_id,
            stateId: d.tdl_state_id,
          }))
        );
      } else {
        setDistrictsOptions([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistrictsOptions([]);
    }
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const state_district_blocks = selectedStates.map(stateId => {
        const districtsForState = selectedDistricts.filter(districtId => {
          const district = districtsOptions.find(d => d.value === districtId);
          return district && district.stateId === stateId;
        });

        return {
          state_id: stateId,
          districts: districtsForState.map(districtId => ({
            district_id: districtId,
          })),
        };
      });

      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role_id: values.role_id,
        status: values.status,
        state_district_blocks,
        unit_ids: selectedUnits,
        fy: selectedFy.map(fy => fy.value).join(','),
        id: details?.id,
      };

      // Add password only if provided
      if (values.password) {
        payload.password = values.password;
      }

      const res = await createUser(payload);

      if (res.status === 1) {
        toast.success(res.message);
        initListDatatable(
          `${import.meta.env.VITE_API_URL}/admin/users/datatable/list`
        );
        handleClose();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    form.resetFields();
    setSelectedStates([]);
    setSelectedDistricts([]);
    setSelectedUnits([]);
    setSelectedFy([]);
    setDistrictsOptions([]);
  };

  /* -------------------- HANDLERS -------------------- */
  const handleStateChange = (values) => {
    setSelectedStates(values || []);
    form.setFieldValue('states', values || []);
    fetchDistricts(values || []);
    // Reset districts when states change
    setSelectedDistricts([]);
    form.setFieldValue('districts', []);
  };

  const handleDistrictChange = (values) => {
    setSelectedDistricts(values || []);
    form.setFieldValue('districts', values || []);
  };

  const handleUnitChange = (values) => {
    setSelectedUnits(values || []);
    form.setFieldValue('unit_ids', values || []);
  };

  const handleFyChange = (values) => {
    const selectedFyOptions = fyOptions.filter(fy => values.includes(fy.value));
    setSelectedFy(selectedFyOptions);
    form.setFieldValue('fy', values);
  };

  /* -------------------- RENDER -------------------- */
  return (
    <Modal
      open={show}
      onCancel={handleClose}
      onOk={handleSubmit}
      title={details?.id ? 'Update User' : 'Create User'}
      width={800}
      destroyOnHidden
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{ status: 'active' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: 'Name is required' },
                {
                  validator: (_, value) => {
                    if (value && value.trim().length === 0) {
                      return Promise.reject('Name cannot be only spaces');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Invalid email' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Role"
              name="role_id"
              rules={[{ required: true, message: 'Role is required' }]}
            >
              <Select placeholder="Select role" allowClear>
                {rolesOptions.map(role => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={
                !details?.id
                  ? [{ required: true, message: 'Password is required' }]
                  : []
              }
            >
              <Input.Password
                placeholder={details?.id ? "Leave blank to keep current" : "Enter password"}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[
                { required: true, message: 'Phone is required' },
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Phone number must be exactly 10 digits',
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Financial Year" name="fy">
              <Select
                mode="multiple"
                placeholder="Select financial years"
                onChange={handleFyChange}
                allowClear
              >
                {fyOptions.map(fy => (
                  <Option key={fy.value} value={fy.value}>
                    {fy.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="State"
              name="states"
              rules={[{ required: true, message: 'Please select at least one state' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select states"
                onChange={handleStateChange}
                allowClear
              >
                {stateOptions.map(state => (
                  <Option key={state.value} value={state.value}>
                    {state.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="District"
              name="districts"
              rules={[
                {
                  validator: (_, value) => {
                    if (selectedStates.length > 0 && (!value || value.length === 0)) {
                      return Promise.reject('Please select at least one district');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder={selectedStates.length > 0 ? "Select districts" : "Select states first"}
                onChange={handleDistrictChange}
                disabled={selectedStates.length === 0}
                allowClear
              >
                {districtsOptions.map(district => (
                  <Option key={district.value} value={district.value}>
                    {district.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Unit" name="unit_ids">
              <Select
                mode="multiple"
                placeholder="Select units"
                onChange={handleUnitChange}
                allowClear
              >
                {unitOptions.map(unit => (
                  <Option key={unit.value} value={unit.value}>
                    {unit.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}