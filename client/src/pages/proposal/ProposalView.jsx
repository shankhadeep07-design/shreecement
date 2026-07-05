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

  // const fetchDetails = () => {
  //   proposalDetailsApi({ proposal_id })
  //     .then(({ data }) => {
  //       if (!data) return;
  //       setProposalData(data);
  //     })
  //     .catch((error) =>
  //       toast.error(
  //         error?.response?.data?.originalError ||
  //         error?.response?.data?.message
  //       )
  //     );
  // };


  const fetchDetails = () => {
    proposalDetailsApi({ proposal_id })
      .then(({ data }) => {
        if (!data) return;

        // ✅ map backend -> frontend keys
        const mappedBudgetRows = (data?.budgetRows || []).map((row) => ({
          tpros_particular: row.tpai_particular,
          tpros_unit: row.tpai_unit,
          tpros_no_of_units: Number(row.tpai_no_of_unit),
          tpros_unit_cost: Number(row.tpai_unit_cost),
          tpros_total_amount: Number(row.tpai_total),
          tpros_gst_amount: Number(row.tpai_gst_percentage),
          tpros_total_incl_gst: Number(row.tpai_total_including_gst),
        }));

        setProposalData({
          ...data,
          budgetRows: mappedBudgetRows, // 👈 use your actual API key
        });
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
    <div className='home-content'>
      <Card className='card proposal-details-card'>
        <div className="card-header">
          <h5 className='mb-0'> Proposal Details</h5>
        </div>
        <div className="card-body">
          <div className="card mb-3">
            <div className="card-header header-bg">
              <h5 className='mb-0'>Proposal Details</h5>
            </div>
            <div className="card-body">
              <Descriptions
                column={2}
                size="middle"
                labelStyle={{ fontWeight: 500 }}
                contentStyle={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}
              >
                {/* ================= Proposal Details ================= */}
                <Descriptions.Item label="Financial Year">
                  {proposalData?.financialYear.tfy_year_label || 'N/A'}
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
                <Descriptions.Item label="Project Value in Case of Ongoing Project">
                  {proposalData?.tpros_project_value || 'N/A'}
                </Descriptions.Item>

                {/* ================= Dates ================= */}
                <Descriptions.Item label="Program Date">
                  {proposalData?.tpros_date_of_the_program
                    ? new Date(proposalData.tpros_date_of_the_program).toLocaleDateString("en-GB")
                    : "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Start Date">
                  {proposalData?.tpros_start_date
                    ? new Date(proposalData.tpros_start_date).toLocaleDateString("en-GB")
                    : "N/A"}
                </Descriptions.Item>


                <Descriptions.Item label="End Date">

                  {proposalData?.tpros_end_date
                    ? new Date(proposalData.tpros_end_date).toLocaleDateString("en-GB")
                    : "N/A"}


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


                <Descriptions.Item label="Corporate / Plant / Division / Zone">
                  {proposalData?.tpros_org_unit || 'N/A'}
                </Descriptions.Item>



                {/* <Descriptions.Item label="BU">
                  {proposalData?.tpros_bu || 'N/A'}
                </Descriptions.Item> */}


                <Descriptions.Item label="Thematic Area">
                  {proposalData?.tsubshcm_sub_schedule_name || 'N/A'}
                </Descriptions.Item>




                <Descriptions.Item label="GL Code">
                  {/* {proposalData?.tpros_gl_code || 'N/A'} */}
                  {proposalData.glCodeMaster?.tprofc_gl_account || 'N/A'}

                </Descriptions.Item>
                <Descriptions.Item label="Profit Center">
                  {/* {proposalData?.tpros_profit_center || 'N/A'} */}

                  {proposalData.profitCenterMaster?.tprofc_profit_centre
                    || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Cost Center">

                  {/* {proposalData?.tpros_cost_center || 'N/A'} */}

                  {proposalData.costCenterMaster?.tprofc_cost_centre
                    || 'N/A'}

                </Descriptions.Item>



                {/* <Descriptions.Item label="Location">
            {proposalData?.tloc_location_name || 'N/A'}
          </Descriptions.Item> */}
                <Descriptions.Item label="GPS Latitude">
                  {proposalData?.tpros_gps_latitude || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="GPS Longitude">
                  {proposalData?.tpros_gps_longitude || 'N/A'}
                </Descriptions.Item>

                {/* ================= New Fields ================= */}



                {/* ================= Organization ================= */}
                {/* <Descriptions.Item label="Org Unit">
            {proposalData?.tpros_org_unit || 'N/A'}
          </Descriptions.Item> */}



                <Descriptions.Item label="Schedule Seven">
                  {proposalData?.tschm_schedule_name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="SDG">
                  {proposalData?.tsdg_name || 'N/A'}
                </Descriptions.Item>


                <Descriptions.Item label="Whether project falls under aspirational district">
                  {proposalData?.tpros_is_aspirational_district || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Whether project falls under Gromor village project">
                  {proposalData?.tpros_is_gromor_village || 'N/A'}
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


                <Descriptions.Item label="Project">
                  {proposalData?.tprj_project_type_name || 'N/A'}
                </Descriptions.Item>


                <Descriptions.Item label="Sub Project">
                  {proposalData?.tsprj_sub_project_type_name || 'N/A'}
                </Descriptions.Item>



                <Descriptions.Item label="Allocated budget for the approved line item from board">
                  {proposalData?.tpros_allocate_budget_for_approved_line_item || 'N/A'}
                </Descriptions.Item>


                <Descriptions.Item label="Utilized till date">
                  {proposalData?.tpros_utilized_till_date || 'N/A'}
                </Descriptions.Item>



                <Descriptions.Item label="Project Budget">
                  {proposalData?.tpros_project_budget || 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Implementation by">
                  {proposalData?.tpros_implementation_by || 'N/A'}
                </Descriptions.Item>


                <Descriptions.Item label="Name of the Implementation Partner">
                  {proposalData?.tpros_implementation_partner_name || 'N/A'}
                </Descriptions.Item>



                <Descriptions.Item label="NGO Compliance Check">
                  {proposalData?.tpros_ngo_compliance_check || 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Vendor Compliance Check">
                  {proposalData?.tpros_vendor_compliance_check || 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Background of the Program">
                  {proposalData?.tpros_program_background || 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Baseline Data Information">
                  {proposalData?.tpros_baseline_data_information || 'N/A'}
                </Descriptions.Item>


                <Descriptions.Item label="Proposal Details">
                  {proposalData?.tpros_proposal_details || 'N/A'}
                </Descriptions.Item>


                <Descriptions.Item label="Linkage / Association / Supplementation with any Government Scheme">
                  {proposalData?.tpros_govt_scheme_linkage || 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Stakeholder Request Level">
                  {proposalData?.tpros_stakeholder_request_level || 'N/A'}
                </Descriptions.Item>


                <Descriptions.Item label="Approval from Concerned Government Authorities">
                  {proposalData?.tpros_government_approval || 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Objective of the Program">
                  {proposalData?.tpros_program_objective
                    ? proposalData.tpros_program_objective
                      .replace(/^"|"$/g, '')   // remove wrapping quotes
                      .split(',')
                      .join(', ')
                    : ''}
                </Descriptions.Item>



                <Descriptions.Item label="Activities Planned">
                  {proposalData?.tpros_activities_planned || 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Expected Outcome of the Project">
                  {proposalData?.tpros_expected_outcome || 'N/A'}
                </Descriptions.Item>


                <Descriptions.Item label="Uniqueness of the Project / Best Practices">
                  {proposalData?.tpros_project_uniqueness || 'N/A'}
                </Descriptions.Item>



                <Descriptions.Item label="Branding and Communication">
                  {proposalData?.tpros_branding_communication || 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Scope for Midterm and End Term Monitoring">
                  {proposalData?.tpros_monitoring_scope || 'N/A'}
                </Descriptions.Item>


                <Descriptions.Item label="Budget Breakup">
                  {proposalData?.tpros_budget_breakup || 'N/A'}
                </Descriptions.Item>









                {/* ================= Status ================= */}
                <Descriptions.Item label="Status">
                  {proposalData?.tpros_status || 'N/A'}
                </Descriptions.Item>

              </Descriptions>
            </div>
          </div>




          <div className="card mb-3">
            <div className="card-header header-bg">
              <h5 className='mb-0'>Additional Information of Budget</h5>
            </div>

            <div className="card-body">

              {/* ================= TABLE HEADER ================= */}
              <div className="row fw-bold border-bottom pb-2 mb-2 text-center">
                <div className="col-md-2">Particular</div>
                <div className="col-md-2">Unit</div>
                <div className="col-md-1">No of Units</div>
                <div className="col-md-2">Unit Cost</div>
                <div className="col-md-2">Total</div>
                <div className="col-md-1">GST (%)</div>
                <div className="col-md-1">Total incl GST</div>
              </div>

              {/* ================= ROW DATA ================= */}
              {(proposalData?.budgetRows || []).map((row, index) => (
                <div className="row g-2 align-items-center mb-2 text-center" key={index}>

                  <div className="col-md-2">
                    {row.tpros_particular || "-"}
                  </div>

                  <div className="col-md-2">
                    {row.tpros_unit || "-"}
                  </div>

                  <div className="col-md-1">
                    {row.tpros_no_of_units || 0}
                  </div>

                  <div className="col-md-2">
                    {row.tpros_unit_cost || 0}
                  </div>

                  <div className="col-md-2">
                    {row.tpros_total_amount || 0}
                  </div>

                  <div className="col-md-1">
                    {row.tpros_gst_amount || 0}
                  </div>

                  <div className="col-md-1">
                    {row.tpros_total_incl_gst || 0}
                  </div>

                </div>
              ))}

              {/* ================= GRAND TOTAL ================= */}
              <div className="row mt-3 align-items-center">
                <div className="col-md-7"></div>
                <div className="col-md-2 text-end fw-bold">
                  Grand Total :
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control text-end fw-bold bg-light"
                    value={
                      (proposalData?.budgetRows || []).reduce(
                        (sum, row) => sum + Number(row.tpros_total_incl_gst || 0),
                        0
                      )
                    }
                    readOnly
                  />
                </div>
                <div className="col-md-1"></div>
              </div>

            </div>
          </div>



          <div className="card mb-3">
            <div className="card-header header-bg">
              <h5 className='mb-0'>Comparative Statement of Vendors</h5>
            </div>
            <div className="card-body">
              <Descriptions
                column={2}
                size="middle"
                labelStyle={{ fontWeight: 500 }}
                contentStyle={{
                  background: "#fafafa",
                  padding: "8px 12px",
                  borderRadius: 6,
                }}
              >
                <Descriptions.Item label="Capex Cost">
                  {proposalData?.tpros_capex_cost || ''}
                </Descriptions.Item>

                <Descriptions.Item label="Opex Cost">
                  {proposalData?.tpros_opex_cost || ''}
                </Descriptions.Item>

                <Descriptions.Item label="Service Charges (Management Cost)">
                  {proposalData?.tpros_service_charges || ''}
                </Descriptions.Item>

                <Descriptions.Item label="Tax if Any (GST or Other)">
                  {proposalData?.tpros_tax_details || ''}
                </Descriptions.Item>

                <Descriptions.Item label="Total Cost of Project">
                  {proposalData?.tpros_total_project_cost || ''}
                </Descriptions.Item>

                <Descriptions.Item label="L1 Party as per Budget">
                  {proposalData?.tpros_l1_party_budget || ''}
                </Descriptions.Item>

                <Descriptions.Item label="Recommended Party for Project Implementation (L1/L2/L3)">
                  {proposalData?.tpros_recommended_party || ''}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
          <div className="card mb-3">
            <div className="card-header header-bg">
              <h5 className='mb-0'>All Documents</h5>
            </div>
            <div className="card-body">
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
          <div className="card">
            <div className="card-header header-bg">
              <h5 className='mb-0'>Approval Track</h5>
            </div>
            <div className="card-body">
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
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
