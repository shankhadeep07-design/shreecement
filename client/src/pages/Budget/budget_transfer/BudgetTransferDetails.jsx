import {
  Descriptions,
  Divider,
  Typography,
  Card,
  Tag,
  Table,
  Space,
  Form,
  Select,
  Input,
  Button,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  AimOutlined,
  NumberOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import {
  budgetingDetailsApi,
  sendBudgetingForApprovalApi,
} from '../../../services/Budget-service';
import {
  approveNotificationApi,
  getApprovalTrackApi,
  getNotificationDetailsApi,
} from '../../../services/Notification-service';

// ✅ Status renderer
const renderStatus = (value) => {
  const val = value?.trim()?.toLowerCase();
  if (val === 'pending')
    return (
      <Tag color="orange" icon={<CalendarOutlined />}>
        Pending
      </Tag>
    );
  if (val === 'approved')
    return (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Approved
      </Tag>
    );
  if (val === 'rejected')
    return (
      <Tag color="red" icon={<CheckCircleOutlined />}>
        Rejected
      </Tag>
    );
  return <Tag color="default">{value || 'N/A'}</Tag>;
};

export default function BudgetingDetails() {
  const { budgeting_id } = useParams();
  const [budgetData, setBudgetData] = useState(null);
  const [notification, setNotification] = useState([]);
  const [approvalTrack, setApprovalTrack] = useState([]);
  const [loading, setLoading] = useState(false);

  // Example states (replace with your actual logic)
  const [approvalData, setApprovalData] = useState({
    approval_type: 'budgeting',
    approval_status: '',
    approval_remarks: '',
    approval_item_id: budgeting_id,
  });
  const user = { id: 1 }; // replace with auth user
  const id = budgeting_id;

  useEffect(() => {
    if (budgeting_id){
      fetchBudgetDetails();
      notificationFun();
      approvalTrackFun();
    } 
  }, [budgeting_id]);

  const fetchBudgetDetails = () => {
    budgetingDetailsApi({ budgeting_id })
      .then(({ data }) => {
        if (!data) return;
        setBudgetData(data);
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
      .catch(() => {});
  };

  const approvalTrackFun = () => {
    const data = { item_id: id };
    getApprovalTrackApi(data)
      .then((res) => setApprovalTrack(res.data || []))
      .catch(() => {});
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

  const handleBudgetingsSubmit = async () => {
    setLoading(true);
    try {
      const response = await sendBudgetingForApprovalApi(budgetData);
      if (response.status) {
        toast.success(response.message);
        // initiatedDatatable(); // if you have a refresh table function
        fetchBudgetDetails();
        notificationFun();
        approvalTrackFun();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: (
        <Space>
          <AppstoreOutlined /> Activity
        </Space>
      ),
      dataIndex: 'tactm_activity_name',
      key: 'tactm_activity_name',
    },
    {
      title: (
        <Space>
          <AimOutlined /> Focus Area
        </Space>
      ),
      dataIndex: 'tfam_focus_area_name',
      key: 'tfam_focus_area_name',
    },
    {
      title: (
        <Space>
          <NumberOutlined /> Schedule VII
        </Space>
      ),
      dataIndex: 'tschm_schedule_name',
      key: 'tschm_schedule_name',
    },
    {
      title: (
        <Space>
          <TeamOutlined /> Target Beneficiary
        </Space>
      ),
      dataIndex: 'tbad_target_beneficiary',
      key: 'tbad_target_beneficiary',
    },
    {
      title: (
        <Space>
          <DollarCircleOutlined /> Amount
        </Space>
      ),
      dataIndex: 'tbad_amount',
      key: 'tbad_amount',
      render: (amt) => amt?.toLocaleString() || '0',
    },
    {
      title: (
        <Space>
          <CommentOutlined /> Remarks
        </Space>
      ),
      dataIndex: 'tbad_remarks',
      key: 'tbad_remarks',
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined /> Status
        </Space>
      ),
      dataIndex: 'tbad_status',
      key: 'tbad_status',
      render: renderStatus,
    },
  ];

  if (!budgetData) {
    return <p style={{ padding: 20 }}>Loading budget details...</p>;
  }

  return (
    <div
      style={{
        padding: '10px 10px',
        background: '#f5f6fa',
        minHeight: '100vh',
      }}
    >
      <Card
        style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
      >
        <Typography.Title
          level={3}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <UserOutlined style={{ color: '#1890ff' }} />
          Budgeting Details
        </Typography.Title>
        <Typography.Text type="secondary">
          Overview of budget and allocations for the selected fiscal year
        </Typography.Text>

        <Divider />

        <Descriptions
          column={2}
          size="middle"
          labelStyle={{ fontWeight: 500 }}
          contentStyle={{
            background: '#fafafa',
            padding: '8px 12px',
            borderRadius: 6,
          }}
        >
          <Descriptions.Item label="Fiscal Year">
            {budgetData.tfy_year_label}
          </Descriptions.Item>
          <Descriptions.Item label="Total Budget Amount">
            ₹ {budgetData.tbm_total_budget_amount?.toLocaleString() || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {renderStatus(budgetData.tbm_status)}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {budgetData.name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(budgetData.tbm_created_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ fontWeight: 'bold', color: '#444' }}>
          <FileTextOutlined /> Budget Allocations
        </Divider>

        <Table
          dataSource={budgetData.tbm_budget_list || []}
          columns={columns}
          rowKey="tbad_id"
          pagination={false}
          bordered
          style={{ marginTop: 16 }}
          size="small"
          scroll={{ x: 'max-content' }}
        />

        {/* ✅ Notification Approval */}
        {notification.length > 0 && (
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
        )}

        {/* ✅ Budgeting Approval */}
        {budgetData?.tbm_status === 'draft' && (
          <Form onFinish={handleBudgetingsSubmit} layout="vertical" className="mt-4">
            <Form.Item
              label="Remarks"
              name="approval_remarks"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                value={budgetData.approval_remarks}
                onChange={(e) =>
                  setBudgetData({ ...budgetData, approval_remarks: e.target.value })
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
