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
  BankOutlined,
  ContactsOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchVendorDetailsFunApi } from "../../services/Vendor-service";
import { useNavigate, useParams } from "react-router-dom";
import { CardHeader } from "react-bootstrap";
// import NgoDetailsApproval from "./NgoDetailsApproval";

const { Title, Text } = Typography;

const renderYesNo = (value) => {
  const val = value?.toLowerCase();
  if (val === "yes") return <Tag color="green">✅ Yes</Tag>;
  if (val === "no") return <Tag color="red">❌ No</Tag>;
  return <Tag color="default">⚪ N/A</Tag>;
};

export default function VendorDetails() {
  const tvendor_id = useParams().tvendor_id;
  const navigate = useNavigate();
  const [vendorDetails, setVendorDetails] = useState([]);

  useEffect(() => {
    if (tvendor_id) fetchVendorDetails();
  }, [tvendor_id]);

  const fetchVendorDetails = () => {

    fetchVendorDetailsFunApi({ tvendor_id: tvendor_id })
      .then(({ data }) => {
        console.log(data);
        if (!data) return;

        setVendorDetails(data);
      })
      .catch((error) =>
        toast.error(
          error?.response?.data?.originalError || error?.response?.data?.message
        )
      );
  };

  return (

    <div className="home-content">
      <Card className="card vendor-profile-card position-relative shadow-sm">
        {/* Header */}
        <div className="card-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h5 className="mb-0"> Vendor Profile </h5>
              {/* <Title level={} style={{ marginBottom: 0 }}>
        <UserOutlined style={{ marginRight: 8, color: "#000000" }} />
       
      </Title> */}
              {/* <Text type="secondary">Vendor details and compliance information </Text> */}
            </div>

            <Tooltip title="Back to Vendor list">
              <button
                onClick={() => navigate("/admin/vendor/vendor-master-list")}
                className="btn btn-sm btn-dark d-flex align-items-center"
              >
                <ArrowLeftOutlined style={{ marginRight: 6 }} />
                Back
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="card-body">
          <div className="card m-1 mb-3 mt-2">
            <div className="card-header header-bg">
              <h5 className="mb-0">Basic Info</h5>
            </div>
            <div className="card-body">
              <Descriptions column={2} size="middle">
                <Descriptions.Item label="Vendor Name">
                  <strong>{vendorDetails?.tvendor_prospect_name}</strong>
                </Descriptions.Item>

                <Descriptions.Item label="Preferred Location">
                  {vendorDetails?.tvendor_preferred_location}
                </Descriptions.Item>

                <Descriptions.Item label="Additional Location">
                  {vendorDetails?.tvendor_additional_location}
                </Descriptions.Item>

                <Descriptions.Item label="Pin Code">
                  {vendorDetails?.tvendor_pin_code}
                </Descriptions.Item>

                <Descriptions.Item label="PAN">
                  {vendorDetails?.tvendor_pan}
                </Descriptions.Item>

                <Descriptions.Item label="GST">
                  {vendorDetails?.tvendor_gst}
                </Descriptions.Item>

                <Descriptions.Item label="MSME">
                  {vendorDetails?.tvendor_msme}
                </Descriptions.Item>

                <Descriptions.Item label="CIN">
                  {vendorDetails?.tvendor_cin}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
          <div className="card m-1 mb-3">
            <div className="card-header header-bg">
              <h5 className="mb-0">Contact Details</h5>
            </div>
            <div className="card-body">
              <Descriptions column={2}>
                <Descriptions.Item label="Office Phone 1">
                  {vendorDetails?.tvendor_office_phone1}
                </Descriptions.Item>

                <Descriptions.Item label="Office Phone 2">
                  {vendorDetails?.tvendor_office_phone2}
                </Descriptions.Item>

                <Descriptions.Item label="Work Phone 1">
                  {vendorDetails?.tvendor_work_phone1}
                </Descriptions.Item>

                <Descriptions.Item label="Work Phone 2">
                  {vendorDetails?.tvendor_work_phone2}
                </Descriptions.Item>

                <Descriptions.Item label="Email 1">
                  {vendorDetails?.tvendor_email_1}
                </Descriptions.Item>

                <Descriptions.Item label="Email 2">
                  {vendorDetails?.tvendor_email_2}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
          <div className="card m-1 mb-3">
            <div className="card-header header-bg">
              <h5 className="mb-0"> Bank Details</h5>
            </div>
            <div className="card-body">
              <Descriptions column={2}>
                <Descriptions.Item label="Bank Name">
                  {vendorDetails?.tvendor_bank_name}
                </Descriptions.Item>

                <Descriptions.Item label="Branch">
                  {vendorDetails?.tvendor_bank_branch}
                </Descriptions.Item>

                <Descriptions.Item label="Account No">
                  {vendorDetails?.tvendor_bank_account_no}
                </Descriptions.Item>

                <Descriptions.Item label="IFSC Code">
                  {vendorDetails?.tvendor_bank_ifsc_code}
                </Descriptions.Item>

                <Descriptions.Item label="Bank Address">
                  {vendorDetails?.tvendor_bank_address}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
          <div className="card m-1 mb-3">
            <div className="card-header header-bg">
              <h5 className="mb-0">Contact Person</h5>
            </div>
            <div className="card-body">
              <Descriptions column={2}>
                <Descriptions.Item label="Name">
                  {vendorDetails?.tvendor_contact_person_name}
                </Descriptions.Item>

                <Descriptions.Item label="Phone">
                  {vendorDetails?.tvendor_contact_person_no}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
          <div className="card m-1 mb-3">
            <div className="card-header header-bg">
              <h5 className="mb-0">Relative Working Details</h5>
            </div>
            <div className="card-body">
              <Descriptions column={2}>
                <Descriptions.Item label="Working">
                  {vendorDetails?.tvendor_relative_working}
                </Descriptions.Item>

                <Descriptions.Item label="Name">
                  {vendorDetails?.tvendor_relative_name}
                </Descriptions.Item>

                <Descriptions.Item label="Designation">
                  {vendorDetails?.tvendor_relative_designation}
                </Descriptions.Item>

                <Descriptions.Item label="Location">
                  {vendorDetails?.tvendor_relative_location}
                </Descriptions.Item>

                <Descriptions.Item label="Mobile">
                  {vendorDetails?.tvendor_relative_mobile}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
          <div className="card m-1 mb-3">
            <div className="card-header header-bg">
              <h5 className="mb-0">Notes</h5>
            </div>
            <div className="card-body">
              <p className="mb-0">{vendorDetails?.tvendor_notes || "—"}</p>
            </div>
          </div>
          <div className="card m-1 mb-3">
            <div className="card-header header-bg">
              <h5 className="mb-0">Documents</h5>
            </div>
            <div className="card-body">
              {(vendorDetails?.documents || []).length > 0 ? (
                <Descriptions column={2}>
                  {vendorDetails.documents.map((doc, index) => (
                    <Descriptions.Item
                      key={doc.tdoc_id}
                      label={`Document ${index + 1}`}
                    >
                      <a href={doc.full_url} target="_blank" rel="noreferrer">
                        Download ({doc.doc_ext?.replace(".", "").toUpperCase()})
                      </a>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              ) : (
                <p>No documents uploaded.</p>
              )}
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
