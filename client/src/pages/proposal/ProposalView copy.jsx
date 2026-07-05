import {
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Select,
  Table,
  Tag,
  Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { proposalDetailsApi, sendProposalForApprovalApi } from '../../services/Proposal-service';
import { approveNotificationApi, getApprovalTrackApi, getNotificationDetailsApi } from '../../services/Notification-service';
import { userDetails } from '../../auth/auth';
import { FileDoneOutlined } from "@ant-design/icons";

export default function ProposalView() {
  const proposal_id = useParams()?.proposal_id;
  const [proposalData, setProposalData] = useState(null);
  const [notification, setNotification] = useState([]);
  const [approvalTrack, setApprovalTrack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proposalSendData, setPropodalSendData] = useState({
    approval_remarks: '',
    proposal_id: proposal_id,
    approval_type: 'proposal',
  });

  const userDetail = userDetails();
  const [approvalData, setApprovalData] = useState({
    approval_type: 'proposal',
    approval_status: '',
    approval_remarks: '',
    approval_item_id: proposal_id,
  });
  const user = { id: 1 }; // replace with auth user
  const id = proposal_id;

  const fetchDetails = () => {
    proposalDetailsApi({ proposal_id })
      .then(({ data }) => {
        if (!data) return;
        setProposalData(data);
      })
      .catch((error) =>
        toast.error(
          error?.response?.data?.originalError ||
          error?.response?.data?.message
        )
      );
  };
  const notificationFun = () => {
    const data = {
      user_id: user.id,
      item_id: id,
      not_action_taken: 'N',
    };
    getNotificationDetailsApi(data)
      .then((res) => setNotification(res.data || []))
      .catch(() => { });
  };
  const approvalTrackFun = () => {
    const data = { item_id: id };
    getApprovalTrackApi(data)
      .then((res) => setApprovalTrack(res.data || []))
      .catch(() => { });
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await approveNotificationApi(approvalData);
      if (response.status === 1) {
        toast.success(response.message);
        approvalTrackFun();
        notificationFun();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  const handleSendForApprovalSubmit = async () => {
    setLoading(true);
    try {

      const sendData = {
        approval_type: 'proposal',
        approval_status: 'draft',
        approval_item_id: proposal_id,
        approval_remarks: proposalSendData.approval_remarks.trim(),
      }

      const response = await sendProposalForApprovalApi(sendData);
      if (response.status) {
        toast.success(response.message);
        // initiatedDatatable(); // if you have a refresh table function
        fetchDetails();
        notificationFun();
        approvalTrackFun();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
    setLoading(false);
  };


  useEffect(() => {
    if (proposal_id) {
      fetchDetails();
      notificationFun();
      approvalTrackFun();
    }
  }, [proposal_id]);


  if (!proposalData) {
    return <p style={{ padding: 20 }}>Loading Proposal Details...</p>;
  }


  return (
    <div style={{ padding: '10px 10px', background: '#f5f6fa', minHeight: '100vh' }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Typography.Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#1890ff' }} />
          Proposal Details
        </Typography.Title>

        <Divider />

        <Descriptions
          column={2}
          size="middle"
          labelStyle={{ fontWeight: 500 }}
          contentStyle={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}
        >
          {/* ================= Proposal Details ================= */}
          <Descriptions.Item label="Financial Year">
            {proposalData?.tfy_year_label || 'N/A'}
          </Descriptions.Item>

          <Descriptions.Item label="Proposal Name">
            {proposalData?.tpros_proposal_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Current Date">
            {proposalData?.tpros_current_date || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Nature of the Project">
            {proposalData?.tpros_nature_of_the_project || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Project Type">
            {proposalData?.projectType?.tprj_project_type_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="NGO Engagement">
            {proposalData?.tpros_ngo_engagement || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {proposalData?.tpros_description || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Base Project Year">
            {proposalData?.tpros_base_project_year || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Project Value">
            {proposalData?.tpros_project_value || 'N/A'}
          </Descriptions.Item>

          {/* ================= Dates ================= */}
          <Descriptions.Item label="Program Date">
            {proposalData?.tpros_date_of_the_program || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Start Date">
            {proposalData?.tpros_start_date || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="End Date">
            {proposalData?.tpros_end_date || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Frequency">
            {proposalData?.tpros_frequency || 'N/A'}
          </Descriptions.Item>

          {/* ================= Location ================= */}
          <Descriptions.Item label="State">
            {proposalData?.tsl_state_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="District">
            {proposalData?.tdl_district_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Sub District">
            {proposalData?.tbl_block_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            {proposalData?.tloc_location_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="GPS Latitude">
            {proposalData?.tpros_gps_latitude || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="GPS Longitude">
            {proposalData?.tpros_gps_longitude || 'N/A'}
          </Descriptions.Item>

          {/* ================= New Fields ================= */}
          <Descriptions.Item label="Aspirational District">
            {proposalData?.tpros_is_aspirational_district || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Gromor Village">
            {proposalData?.tpros_is_gromor_village || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Schedule Seven">
            {proposalData?.tpros_schedule_seven || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="SDG">
            {proposalData?.tpros_sdg || 'N/A'}
          </Descriptions.Item>

          {/* ================= Organization ================= */}
          <Descriptions.Item label="Org Unit">
            {proposalData?.tpros_org_unit || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="BU">
            {proposalData?.tpros_bu || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Thematic Area">
            {proposalData?.tpros_thematic_area || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="GL Code">
            {proposalData?.tpros_gl_code || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Profit Center">
            {proposalData?.tpros_profit_center || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Cost Center">
            {proposalData?.tpros_cost_center || 'N/A'}
          </Descriptions.Item>

          {/* ================= Beneficiaries ================= */}
          <Descriptions.Item label="Target Beneficiaries">
            {proposalData?.tpros_target_beneficiaries || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Male Beneficiaries">
            {proposalData?.tpros_male_beneficiaries || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Female Beneficiaries">
            {proposalData?.tpros_female_beneficiaries || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Mix Group Beneficiaries">
            {proposalData?.tpros_mix_group_beneficiaries || 'N/A'}
          </Descriptions.Item>

          {/* ================= Status ================= */}
          <Descriptions.Item label="Status">
            {proposalData?.tpros_status || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {proposalData?.tpros_created_at || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {proposalData?.tpros_updated_at || 'N/A'}
          </Descriptions.Item>
        </Descriptions>



        {/* ================= Proposal Documents ================= */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginLeft: 8, marginBottom: 12 }}> All Documents</h3>

          {(proposalData?.documents || []).length > 0 ? (
            <Descriptions
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 500 }}
              contentStyle={{
                background: "#fafafa",
                padding: "8px 12px",
                borderRadius: 6,
              }}
            >
              {proposalData.documents.map((doc, index) => (
                <Descriptions.Item
                  key={doc.tdoc_id}
                  // label={`📂 Document ${index + 1} (${doc.doc_purpose || "General"})`}
                  label={`📂 Document ${index + 1}`}


                >
                  {doc.doc_path ? (
                    <a
                      href={doc.full_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#bc7e56", fontWeight: 500 }}
                    >
                      <FileDoneOutlined /> Download (
                      {doc.doc_ext?.replace(".", "").toUpperCase() || "File"})
                    </a>
                  ) : (
                    "Not available"
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>
          ) : (
            <p style={{ marginLeft: 16 }}>No documents uploaded.</p>
          )}
        </div>




        {/* ✅ Notification Approval */}
        {/* {proposalData.tpros_status != 'draft' && proposalData.tpros_created_by != userDetail?.id && notification.length > 0 && (
          <Form onFinish={handleSubmit} layout="vertical" className="mt-4">
            <Form.Item label="Status" name="approval_status" rules={[{ required: true }]}>
              <Select
                value={approvalData.approval_status}
                onChange={(val) =>
                  setApprovalData({ ...approvalData, approval_status: val })
                }
              >
                <Select.Option value="approved">Approved</Select.Option>
                <Select.Option value="resend">Resend</Select.Option>
                <Select.Option value="reject">Reject</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Remarks"
              name="approval_remarks"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                value={approvalData.approval_remarks}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, approval_remarks: e.target.value })
                }
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form>
        )} */}

        {/* ✅ Budgeting Approval */}
        {proposalData?.tpros_status === 'draft' && (
          <Form onFinish={handleSendForApprovalSubmit} layout="vertical" className="mt-4">
            <Form.Item
              label="Remarks"
              name="approval_remarks"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                value={proposalSendData.approval_remarks}
                onChange={(e) =>
                  setPropodalSendData({ ...proposalSendData, approval_remarks: e.target.value })
                }
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Send for Approval
            </Button>
          </Form>
        )}

        {/* ✅ Approval Track */}
        <Divider orientation="left">Approval Track</Divider>
        <Table
          bordered
          dataSource={approvalTrack}
          rowKey={(rec, i) => i}
          pagination={false}
          columns={[
            {
              title: 'Step',
              render: (data) => {
                if (data.apt_accept_step === 'initial')
                  return <Button size="small">Initial</Button>;
                if (data.apt_accept_step === 'reviewed')
                  return <Button size="small">Reviewed</Button>;
                if (data.apt_accept_step === 'approved')
                  return <Button size="small" type="primary">Approved</Button>;
                return <Button size="small">{data.apt_accept_step}</Button>;
              },
            },
            { title: 'User', dataIndex: 'name' },
            {
              title: 'Date',
              dataIndex: 'apt_created_at',
              render: (d) => new Date(d).toLocaleString(),
            },
            {
              title: 'Status',
              dataIndex: 'apt_accept_status',
              render: (status) =>
                status === 'reject' ? (
                  <Tag color="red">Rejected</Tag>
                ) : (
                  <Tag color="green">Approved</Tag>
                ),
            },
            { title: 'Remarks', dataIndex: 'apt_remarks' },
          ]}
        />


      </Card>
    </div>
  );
}
