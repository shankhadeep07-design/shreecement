import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import toast from 'react-hot-toast';
import { MultiSelect } from 'react-multi-select-component';

import {
  fetchDistrictsListByStateIds,
  fetchSubdistrictListByDistrictIds,
  fetchFactoriesBySubDistrictIds,
} from '../../services/Master-service';
import { allRoles } from '../../services/Role-service';
import { getAllStateApi } from '../../services/State-service';
import { createUser, getUserDetails } from '../../services/User-service';

export default function UserAddModel({ show, onClose, details, initListDatatable }) {
  const [form] = Form.useForm();

  const [rolesOptions, setRolesOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [districtsOptions, setDistrictsOptions] = useState([]);
  const [subDistrictsOptions, setSubDistrictsOptions] = useState([]);
  const [factoriesOptions, setFactoriesOptions] = useState([]);

  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedSubDistricts, setSelectedSubDistricts] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState([]);

  /* -------------------- LOAD MASTER DATA -------------------- */
  useEffect(() => {
    (async () => {
      const [rolesRes, statesRes] = await Promise.all([
        allRoles('users'),
        getAllStateApi(),
      ]);

      setRolesOptions(
        rolesRes.data.map(r => ({ label: r.trl_role_name, value: r.trl_role_id }))
      );
      setStateOptions(statesRes.data || []);
    })();
  }, []);

  /* -------------------- EDIT MODE -------------------- */
  useEffect(() => {
    if (!details?.id) return;

    (async () => {
      const res = await getUserDetails(details.id);
      const user = res.data[0];

      // Basic fields
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        status: user.status,
        password: '',
      });

      /* -------- STATES -------- */
      const stateSel = user.states.map(s => ({
        value: s.state_id,
        label: s.state_name,
      }));
      setSelectedStates(stateSel);
      form.setFieldValue('states', stateSel);

      await fetchDistricts(stateSel.map(s => s.value));

      /* -------- DISTRICTS -------- */
      const districtSel = user.districts.map(d => ({
        value: d.district_id,
        label: d.district_name,
        stateId: d.stateId,
      }));
      setSelectedDistricts(districtSel);
      form.setFieldValue('districts', districtSel);

      await fetchSubDistricts(districtSel.map(d => d.value));

      /* -------- SUB DISTRICTS -------- */
      const subDistrictSel = user.sub_districts.map(sd => ({
        value: sd.sub_district_id,
        label: sd.sub_district_name,
      }));
      setSelectedSubDistricts(subDistrictSel);
      form.setFieldValue('sub_districts', subDistrictSel);

      await fetchFactories(subDistrictSel.map(sd => sd.value));

      /* -------- FACTORIES -------- */
      const factorySel = user.factory_id
        ? user.factory_id.split(',').map(id => ({
          value: id,
          label: id,
        }))
        : [];

      setSelectedFactory(factorySel);
      form.setFieldValue('factories', factorySel);
    })();
  }, [details]);


  /* -------------------- FETCHERS -------------------- */
  const fetchDistricts = async (stateIds) => {
    const res = await fetchDistrictsListByStateIds({ state_ids: stateIds });
    if (res.status === 1) {
      setDistrictsOptions(
        res.data.map(d => ({
          label: d.tdl_district_name,
          value: d.tdl_district_id,
          stateId: d.tdl_state_id,
        }))
      );
    }
  };

  const fetchSubDistricts = async (districtIds) => {
    const res = await fetchSubdistrictListByDistrictIds(districtIds);
    setSubDistrictsOptions(
      res.data.map(d => ({ label: d.label, value: d.value }))
    );
  };

  const fetchFactories = async (subDistrictIds) => {
    const res = await fetchFactoriesBySubDistrictIds(subDistrictIds);
    if (res.status === true) {
      setFactoriesOptions(
        res.data.map(f => ({
          label: f.tfact_factory_name,
          value: f.tfact_factory_id,
        }))
      );
    }
  };




  /* -------------------- SUBMIT -------------------- */
 const handleSubmit = async () => {
  try {
    const values = await form.validateFields();

    const state_district_blocks = selectedStates.map(state => {
      const districts = selectedDistricts
        .filter(d => d.stateId === state.value)
        .map(district => ({
          district_id: district.value,
          sub_district_ids: selectedSubDistricts
            .filter(sd => sd.districtId === district.value)
            .map(sd => sd.value),
        }));

      return {
        state_id: state.value,
        districts,
      };
    });

    const payload = {
      ...values,
      state_district_blocks,
      factory_ids: selectedFactory.map(f => f.value),
      id: details?.id,
    };

    const res = await createUser(payload);

    if (res.status === 1) {
      toast.success(res.message);
      initListDatatable(
        `${import.meta.env.VITE_API_URL}/admin/users/datatable/list`
      );
      onClose();
    } else {
      toast.error(res.message);
    }
  } catch {
    // AntD handles validation UI
  }
};

  /* -------------------- RENDER -------------------- */
  return (
    <Modal
      open={show}
      onCancel={onClose}
      onOk={handleSubmit}
      title={details?.id ? 'Update User' : 'Create User'}
      width={800}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Name is required' }]}
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
              <Select options={rolesOptions} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Password" name="password">
              <Input.Password />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: 'Phone is required' }]}
            >
              <Input />
            </Form.Item>
          </Col>

          {/* STATE */}

          <Col span={12}>
            <Form.Item
              label="State"
              required
              validateStatus={
                form.getFieldError('states').length ? 'error' : ''
              }
              help={null}   // 🔥 disables AntD auto error text
            >
              {/* Hidden validator */}
              <Form.Item
                name="states"
                noStyle
                rules={[
                  {
                    validator: () =>
                      selectedStates?.length
                        ? Promise.resolve()
                        : Promise.reject(new Error('Select at least one state')),
                  },
                ]}
              />

              <MultiSelect
                options={stateOptions}
                value={selectedStates || []}
                onChange={(val) => {
                  setSelectedStates(val || []);
                  form.setFieldValue('states', val || []);
                  form.validateFields(['states']);
                  fetchDistricts((val || []).map(v => v.value));
                }}
              />

              {/* Manual error message */}
              {form.getFieldError('states').length > 0 && (
                <div style={{ color: '#ff4d4f', marginTop: 4 }}>
                  {form.getFieldError('states')[0]}
                </div>
              )}
            </Form.Item>
          </Col>




          {/* DISTRICT */}
          <Col span={12}>
            <Form.Item label="District" required>
              {/* Hidden field for validation */}
              <Form.Item
                name="districts"
                noStyle
                rules={[
                  {
                    validator: () => {
                      if (!selectedStates.length) return Promise.resolve();
                      return selectedDistricts.length
                        ? Promise.resolve()
                        : Promise.reject(new Error('Select at least one district'));
                    },
                  },
                ]}
              />

              <MultiSelect
                options={districtsOptions}
                value={selectedDistricts}
                onChange={(val) => {
                  setSelectedDistricts(val);
                  form.setFieldValue('districts', val);
                  form.validateFields(['districts']);
                  fetchSubDistricts(val.map(v => v.value));
                }}
              />

              {form.getFieldError('districts')[0] && (
                <div className="ant-form-item-explain-error">
                  {form.getFieldError('districts')[0]}
                </div>
              )}
            </Form.Item>
          </Col>


          {/* SUB DISTRICT */}
          <Col span={12}>
            <Form.Item label="Sub District" required>
              <Form.Item
                name="sub_districts"
                noStyle
                rules={[
                  {
                    validator: () => {
                      if (!selectedDistricts.length) return Promise.resolve();
                      return selectedSubDistricts.length
                        ? Promise.resolve()
                        : Promise.reject(new Error('Select at least one sub district'));
                    },
                  },
                ]}

              />

              <MultiSelect
                options={subDistrictsOptions}
                value={selectedSubDistricts}
                onChange={(val) => {
                  setSelectedSubDistricts(val);
                  form.setFieldValue('sub_districts', val);
                  form.validateFields(['sub_districts']);
                  fetchFactories(val.map(v => v.value));
                }}
              />

              {form.getFieldError('sub_districts')[0] && (
                <div className="ant-form-item-explain-error">
                  {form.getFieldError('sub_districts')[0]}
                </div>
              )}
            </Form.Item>
          </Col>


          {/* FACTORY */}
          <Col span={12}>
            <Form.Item label="Factory" required>
              <Form.Item
                name="factories"
                noStyle
                rules={[
                  {
                    validator: () => {
                      if (!selectedSubDistricts.length) return Promise.resolve();
                      return selectedFactory.length
                        ? Promise.resolve()
                        : Promise.reject(new Error('Select at least one factory'));
                    },
                  },
                ]}

              />

              <MultiSelect
                options={factoriesOptions}
                value={selectedFactory}
                onChange={(val) => {
                  setSelectedFactory(val);
                  form.setFieldValue('factories', val);
                  form.validateFields(['factories']);
                }}
              />

              {form.getFieldError('factories')[0] && (
                <div className="ant-form-item-explain-error">
                  {form.getFieldError('factories')[0]}
                </div>
              )}
            </Form.Item>
          </Col>


          <Col span={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}