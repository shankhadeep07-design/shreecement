import {
    FileTextOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Card,
    Descriptions,
    Divider,
    Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userDetails } from '../../auth/auth';
import { approveNotificationApi, getApprovalTrackApi, getNotificationDetailsApi } from '../../services/Notification-service';
import { projectMonitoringDetailsApi } from '../../services/Project-service';
import { sendProposalForApprovalApi } from '../../services/Proposal-service';
// import { budgetingDetailsApi } from '../../../services/Budget-service';



export default function ViewProjectMonitoring() {
    const tpmon_id = useParams()?.tpmon_id;
    const [projectMonitoringData, setProjectMonitoringData] = useState([]);
    const [notification, setNotification] = useState([]);
    const [approvalTrack, setApprovalTrack] = useState([]);
    const [loading, setLoading] = useState(false);
    const [proposalSendData, setPropodalSendData] = useState({
        approval_remarks: '',
        tpmon_id: tpmon_id,
        approval_type: 'proposal',
    });

    const userDetail = userDetails();

    // Example states (replace with your actual logic)
    const [approvalData, setApprovalData] = useState({
        approval_type: 'proposal',
        approval_status: '',
        approval_remarks: '',
        approval_item_id: tpmon_id,
    });
    const user = { id: 1 }; // replace with auth user
    const id = tpmon_id;



    const fetchDetails = () => {
        projectMonitoringDetailsApi({ tpmon_id })
            .then(({ data }) => {
                if (!data) return;

                setProjectMonitoringData(data);
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
                approval_item_id: tpmon_id,
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
        if (tpmon_id) {
            fetchDetails();
            notificationFun();
            approvalTrackFun();
        }
    }, [tpmon_id]);


    if (!projectMonitoringData) {
        return <p style={{ padding: 20 }}>Loading project details...</p>;
    }


    const COMPLETION_OPTIONS = [
        { label: "0% - Not started", value: "0%" },
        { label: "25% - Initiated", value: "25%" },
        { label: "50% - Mid-way", value: "50%" },
        { label: "75% - Almost complete", value: "75%" },
        { label: "100% - Complete", value: "100%" },
    ];
    const getCompletionLabel = (value) => {
        return (
            COMPLETION_OPTIONS.find(opt => opt.value === value)?.label || 'N/A'
        );
    };



    return (
        <div style={{ padding: '10px 10px', background: '#f5f6fa', minHeight: '100vh' }}>
            <Card style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Typography.Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    Project Monitoring Details
                </Typography.Title>
                {/* <Typography.Text type="secondary">
          Overview of budget and allocations for the selected fiscal year
        </Typography.Text> */}

                <Divider />

                <Descriptions
                    column={2}
                    size="middle"
                    labelStyle={{ fontWeight: 500 }}
                    contentStyle={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}
                >

                    <Descriptions.Item label="Milestone name">{projectMonitoringData?.tpmon_title || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Start Date">
                        {projectMonitoringData?.tpmon_start_date || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="End Date">
                        {projectMonitoringData?.tpmon_end_date || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Actual Start Date">
                        {projectMonitoringData?.tpmon_actual_start_date || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Actual End Date">
                        {projectMonitoringData?.tpmon_actual_end_date || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Completion">
                        {getCompletionLabel(projectMonitoringData?.tpmon_project_completion_status)}
                    </Descriptions.Item>

                    <Descriptions.Item label="Status of the project">
                        {projectMonitoringData?.tpmon_status_of_the_project || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Process owner/partner">
                        {projectMonitoringData?.tpmon_process_owner_partner_name || 'N/A'}
                    </Descriptions.Item>






                    <Descriptions.Item label="Male Beneficiaries Count">
                        {projectMonitoringData?.tpmon_male_beneficiaries || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Female Beneficiaries Count">
                        {projectMonitoringData?.tpmon_female_beneficiaries || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Boys Beneficiaries Count">
                        {projectMonitoringData?.tpmon_boys_beneficiaries || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Girls Beneficiaries Count">
                        {projectMonitoringData?.tpmon_girls_beneficiaries || 'N/A'}
                    </Descriptions.Item>



                    <Descriptions.Item label="Mix Beneficiaries Count">
                        {projectMonitoringData?.tpmon_mix_beneficiaries || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Delay Reason">
                        {projectMonitoringData?.tpmon_delay_reasons || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Remarks">
                        {projectMonitoringData?.tpmon_remarks || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Latitude">
                        {projectMonitoringData?.tpmon_latitude || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Longitude">
                        {projectMonitoringData?.tpmon_longitude || 'N/A'}
                    </Descriptions.Item>




                </Descriptions>

                <div className="mt-3 border rounded  shadow-sm">
                    <div className="card-header px-3 py-2">
                        <h5 orientation="left mb-0">All Documents</h5>
                    </div>

                    <div className="card-body p-3 ">
                        {(projectMonitoringData?.documents || []).length > 0 ? (
                            <Descriptions column={1} size="middle">
                                {projectMonitoringData?.documents.map((doc, index) => (
                                    <Descriptions.Item
                                        key={doc?.tdoc_id}
                                        // label={`Document ${index + 1} (${doc?.doc_purpose || "General"
                                        //     })`}
                                        label={`Document ${index + 1} `}
                                    >
                                        {doc?.doc_path ? (
                                            <a
                                                href={doc?.full_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                style={{ color: "#bc7e56" }}
                                            >
                                                Download (
                                                {doc?.doc_ext?.replace(".", "").toUpperCase() || "File"})
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
                </div>
                {/* ✅ Notification Approval */}
                {/* { projectMonitoringData.tproj_status != 'draft' && projectMonitoringData.tproj_created_by != userDetail?.id  && notification.length > 0 && (
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
                {/* {projectMonitoringData?.tproj_status === 'draft' && (
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
        )} */}

                {/* ✅ Approval Track */}
                {/* <Divider orientation="left">Approval Track</Divider>
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
        /> */}


            </Card>
        </div>
    );
}
