import {
  Descriptions,
  Typography,
  Card,
  Tag,
  Divider,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  SyncOutlined,
  SolutionOutlined,
  BankOutlined,
  AimOutlined,
  NumberOutlined,
  AppstoreOutlined,
  IdcardOutlined,
  HeartOutlined,
  ContactsOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  FileDoneOutlined,
  GlobalOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchNgoDetailsApi } from "../../services/Ngo-service";
import { useNavigate, useParams } from "react-router-dom";
// import NgoDetailsApproval from "./NgoDetailsApproval";

const { Title, Text } = Typography;

const renderYesNo = (value) => {
  const val = value?.toLowerCase();
  if (val === "yes") return <Tag color="green">✅ Yes</Tag>;
  if (val === "no") return <Tag color="red">❌ No</Tag>;
  return <Tag color="default">⚪ N/A</Tag>;
};

export default function NgoDetails() {
  const tngo_id = useParams().ngo_id;
  const navigate = useNavigate();
  const [ngoDetails, setNgoDetails] = useState([]);

  useEffect(() => {
    if (tngo_id) fetchNgoDetails();
  }, [tngo_id]);

  const fetchNgoDetails = () => {
    fetchNgoDetailsApi({ ngo_id: tngo_id })
      .then(({ data }) => {
        if (!data) return;
        setNgoDetails(data);
      })
      .catch((error) =>
        toast.error(
          error?.response?.data?.originalError || error?.response?.data?.message
        )
      );
  };

  console.log("ngoDetails----------- ", ngoDetails);
  const Label = ({ icon, text }) => (
    <>
      {icon} <span className="label-text">{text}</span>
    </>
  );

  return (
    <Card
      className="m-3 shadow-sm custom-event-details"
      style={{ borderRadius: 12, background: "#fffaf5" }}
    >
      {/* Header */}
      <div className="border-bottom pb-3 mb-3 d-flex align-items-center justify-content-between">
        <div>
          <Title level={3} style={{ marginBottom: 0 }}>
            <UserOutlined style={{ marginRight: 8, color: "#bc7e56" }} />
            NGO Profile 🏢
          </Title>
          <Text type="secondary">
            Basic details and compliance information 
          </Text>
        </div>

        <Tooltip title="Back to NGO list">
          <button
            onClick={() => navigate("/admin/ngo/ngo-master-list")}
            className="btn btn-sm btn-dark d-flex align-items-center"
          >
            <ArrowLeftOutlined style={{ marginRight: 6 }} />
            Back
          </button>
        </Tooltip>
      </div>

      {/* NGO Info */}
      <Descriptions
        column={3}
        size="middle"
        labelStyle={{ fontWeight: 500, color: "#444" }}
        contentStyle={{ color: "#333" }}
      >
        {/* <Descriptions.Item label="🏷️ NGO Name" >
          {ngoDetails?.tngo_name}
        </Descriptions.Item> */}
        <Descriptions.Item 
         label={<Label icon={<EditOutlined />}  text="Activity Title" />}
         >
          {ngoDetails?.tngo_name}
        </Descriptions.Item>

        <Descriptions.Item 
          label={<Label icon={<AimOutlined />}  text="Organization Area of Expertise" />}
        >
          {ngoDetails?.tthm_theme_name}
        </Descriptions.Item>

        <Descriptions.Item 
        label={<Label icon={<AppstoreOutlined />} text="Category" />}
        >
          {ngoDetails?.tcat_category_type}
        </Descriptions.Item>

        <Descriptions.Item 
         label={<Label icon={<ContactsOutlined />} text="Contact No" />}
        >
          {ngoDetails?.tngo_contact_no}
        </Descriptions.Item>

        <Descriptions.Item 
         label={<Label icon={<MailOutlined />} text="Email ID" />}
        >
          {ngoDetails?.tngo_email_id}
        </Descriptions.Item>

        <Descriptions.Item 
         label={<Label icon={<GlobalOutlined />} text="Website" />}
         >
          {ngoDetails?.tngo_website}
        </Descriptions.Item>

        <Descriptions.Item 
          label={<Label icon={<BankOutlined />} text="NGO Darpan No" />}
        >
          {ngoDetails?.tngo_ngo_darpan_no}
        </Descriptions.Item>

        <Descriptions.Item 
                  label={<Label icon={<EnvironmentOutlined />} text="Registered Address of the Organization" />}
        >
          {ngoDetails?.tngo_reg_address_of_org}
        </Descriptions.Item>

        <Descriptions.Item 
          label={<Label icon={<EnvironmentOutlined />} text="Present Address of the Organization" />}
        >
          {ngoDetails?.tngo_present_address_of_org}
        </Descriptions.Item>

        <Descriptions.Item 
         label={<Label icon={<GlobalOutlined />} text="Geographical Presence (State)" />}
        >
          {ngoDetails?.tsl_state_name}
        </Descriptions.Item>

        <Descriptions.Item 
          label={<Label icon={<HeartOutlined />} text="CSR Registration No" />}
        >
          {ngoDetails?.tngo_csr_reg_no}
        </Descriptions.Item>

        <Descriptions.Item 
          label={<Label icon={<BankOutlined />} text="NITI Aayog DARPAN Portal Registration" />}
        >
          {ngoDetails?.tngo_niti_aayog_darpan_por_reg}
        </Descriptions.Item>

        <Descriptions.Item 
         label={<Label icon={<IdcardOutlined />} text="PAN No" />}
        >
          {ngoDetails?.tngo_pan_no}
        </Descriptions.Item>
      </Descriptions>

      {/* <Divider /> */}

      {/* Bank Details */}
      <Card 
        title={
          <span>
               <BankOutlined style={{ color: "#ffffff" }} />   Bank Details 
        
          </span>
        }
        bordered={false}
        className="mb-3 mt-3"
      >
        <Descriptions column={2}>
          <Descriptions.Item 
           label={<Label icon={<BankOutlined />} text="Account Number" />}
          >
            {ngoDetails?.tngo_bank_account_no}
          </Descriptions.Item>

          <Descriptions.Item 
            label={<Label icon={<UserOutlined />} text="Account Name" />}
          >
            {ngoDetails?.tngo_bank_account_name}
          </Descriptions.Item>

          <Descriptions.Item 
            label={<Label icon={<BankOutlined />} text="Bank Name" />}>
            {ngoDetails?.tngo_bank_name}
          </Descriptions.Item>

          <Descriptions.Item 
           label={<Label icon={<NumberOutlined />} text="IFSC Code" />}>
            {ngoDetails?.tngo_bank_ifsc_code}
          </Descriptions.Item>

          <Descriptions.Item 
              label={<Label icon={<EnvironmentOutlined />} text="Address of the Bank" />}>
            {ngoDetails?.tngo_address_of_the_bank}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* User Details */}
      <Card
        title={
          <span>
            <UserOutlined style={{ color: "#ffffff" }} /> User Details 
          </span>
        }
        bordered={false}
        className="mb-3"
      >
       <Descriptions column={2}>

  <Descriptions.Item 
   label={<Label icon={<UserOutlined />} text="Name" />}
  >
    {ngoDetails?.tngo_user_name}
  </Descriptions.Item>

  <Descriptions.Item 
     label={<Label icon={< PhoneOutlined/>} text="Contact No" />}
  >
    {ngoDetails?.tngo_user_contact_no}
  </Descriptions.Item>

  <Descriptions.Item 
   label={<Label icon={< MailOutlined/>} text="Email ID" />}
  >
    {ngoDetails?.tngo_user_email}
  </Descriptions.Item>

  <Descriptions.Item
    label={<Label icon={< SolutionOutlined/>} text="Education" />} 
  >
    {ngoDetails?.tthm_theme_name}
  </Descriptions.Item>

  <Descriptions.Item  
   label={<Label icon={< SyncOutlined/>} text="Status" />} >
    {ngoDetails?.tngo_user_status}
  </Descriptions.Item>


</Descriptions>
      </Card>
      {/* All Documents */}
      <Card
        title={
          <span>
            <FileTextOutlined style={{ color: "#ffffff" }} /> All Documents 
          </span>
        }
        bordered={false}
      >
        {(ngoDetails.documents || []).length > 0 ? (
          <Descriptions column={1} size="middle">
            {ngoDetails.documents.map((doc, index) => (
              <Descriptions.Item
                key={doc.tdoc_id}
                label={`📂 Document ${index + 1} (${doc.doc_purpose || "General"})`}
              >
                {doc.doc_path ? (
                  <a
                    href={doc?.full_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#bc7e56", fontWeight: 500 }}
                  >
                    <FileDoneOutlined /> Download (
                    {doc.doc_ext?.replace(".", "").toUpperCase() || "File"})
                  </a>
                ) : (
                  "❌ Not available"
                )}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : (
          <p style={{ marginLeft: 16 }}>🚫 No documents uploaded.</p>
        )}
      </Card>

      {/* NGO Approval */}
      {/* <NgoDetailsApproval ngoDetails={ngoDetails} ngo_id={tngo_id} /> */}
    </Card>
  );
}
