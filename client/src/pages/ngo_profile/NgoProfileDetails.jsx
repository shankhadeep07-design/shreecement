import { Descriptions, Divider, Typography, Card, Tag } from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchNgoDetailsApi } from "../../services/Ngo-service";
import { useNavigate, useParams } from "react-router-dom";

const renderYesNo = (value) => {
  const val = value?.toLowerCase();
  if (val === "yes") return <Tag color="green">Yes</Tag>;
  if (val === "no") return <Tag color="red">No</Tag>;
  return <Tag color="default">N/A</Tag>;
};

export default function NgoDetails() {
  const tngo_id = useParams().ngo_id;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tngo_id: "",
    tngo_name: "",
    tngo_mission_and_vision: "",
    tngo_area_of_expertise: "",
    tngo_csr_reg_no: "",
    tngo_category: "",
    tngo_email: "",
    tngo_contact_no: "",
    tngo_target_beneficiaries: "",
    tngo_gst_number: "",
    tngo_tan_number: "",
    tngo_pan_no: "",
    tngo_twelve_a_registration_number: "",
    tngo_ngo_registration_date: "",
    tngo_fcra_license_is_guaranteed: "",
    tngo_registered_address: "",
    tngo_present_address: "",
    tngo_website: "",
    tngo_litigation_against_org: "",
    tngo_blacklisted: "",
    tngo_associated_political_party: "",
    tngo_anyone_convicted: "",
    tngo_political_founders: "",
    tngo_certified_guidestar: "",
    tngo_certified_credibility_alliance: "",
    tngo_has_ca: "",
    tngo_has_auditor: "",
    tngo_budget_vs_actual: "",
    tngo_challenged_twelve_a: "",
    tngo_registered_darpan: "",
    tngo_file_return_charity: "",
    tngo_has_finance_team: "",
    tngo_user_id: "",
    tngo_status: "",
    tngo_logo: null,
    tngo_csr_certificate: null,
  });

  useEffect(() => {
    if (tngo_id) fetchNgoDetails();
  }, [tngo_id]);

  const fetchNgoDetails = () => {
    fetchNgoDetailsApi({ ngo_id: tngo_id })
      .then(({ data }) => {
        if (!data) return;
        setFormData({ ...formData, ...data });
      })
      .catch((error) =>
        toast.error(
          error?.response?.data?.originalError || error?.response?.data?.message
        )
      );
  };

  console.log("formData---------------- ", formData);

  return (
    <Card className="m-3">
      <div className="project-view-card">
        <div className="cover-img mb-3">
          <div className="back-img">
            {(() => {
              const logoDoc = formData?.documents?.find(
                (doc) =>
                  doc?.doc_purpose === "tngo_logo" && doc?.full_url
              );

              return logoDoc ? (
                <img
                  src={logoDoc.full_url}
                  alt={logoDoc.doc_purpose || "tngo_logo"}
                  className="shadow"
                />
              ) : (
                <div>
                  <UserOutlined />
                </div>
              );
            })()}
            {/* <img
              src="http://localhost:5007/api/v1/uploads/projects/form/tproj0000000008/1_1755147619663_Slide1-3.jpeg"
              alt="tproj_thumbnail"
              class="shadow"
            ></img> */}
          </div>
        </div>
      </div>


      <div className="border-bottom pb-2 mb-3 d-flex align-items-center justify-content-between">

        <div>
          <Typography.Title level={3}>
            <UserOutlined style={{ marginRight: 8 }} />
            NGO Profile
          </Typography.Title>
          <Typography.Text type="secondary">
            Basic details and compliance information
          </Typography.Text>
        </div>

        <button onClick={() => navigate("/admin/ngo/ngo-master-list")} className="btn btn-sm btn-dark" ><i className="fa-solid fa-left"></i> Back</button>

      </div>


      <Descriptions column={2} size="middle" labelStyle={{ fontWeight: 500 }}>

        <Descriptions.Item label="NGO Name">
          {formData?.tngo_name}
        </Descriptions.Item>
        <Descriptions.Item label="Objective">
          {formData?.tngo_objective}
        </Descriptions.Item>
        <Descriptions.Item label="Factory">
          {(formData?.factorys || []).length > 0
            ? formData?.factorys.map((s) => s.vertical_name).join(", ")
            : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="CSR Registration No">
          {formData?.tngo_csr_reg_no}
        </Descriptions.Item>
        <Descriptions.Item label="Registration Type">
          {formData?.tsml_sub_master_list_name}
        </Descriptions.Item>
        <Descriptions.Item label="Email ID">
          {formData?.tngo_email}
        </Descriptions.Item>
        <Descriptions.Item label="Contact Number">
          {formData?.tngo_contact_no}
        </Descriptions.Item>

        <Descriptions.Item label="Target Beneficiaries">
          {(formData?.target_beneficiaries || []).length > 0
            ? formData?.target_beneficiaries
              .map((s) => s.tsml_sub_master_list_name)
              .join(", ")
            : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="GST Number">
          {formData?.tngo_gst_number}
        </Descriptions.Item>
        <Descriptions.Item label="PAN No">
          {formData?.tngo_pan_no}
        </Descriptions.Item>
        <Descriptions.Item label="12A Registration Number">
          {formData?.tngo_twelve_a_registration_number}
        </Descriptions.Item>
        <Descriptions.Item label="NGO Registration Date">
          {formData?.tngo_ngo_registration_date
            ? new Date(formData.tngo_ngo_registration_date).getFullYear()
            : ""}
        </Descriptions.Item>
        <Descriptions.Item label="Status OF FCRA License">
          {formData?.tngo_fcra_license_is_guaranteed}
        </Descriptions.Item>
        <Descriptions.Item label="Complete Registered Address">
          {formData?.tngo_registered_address}
        </Descriptions.Item>
        <Descriptions.Item label="Website">
          {formData?.tngo_website}
        </Descriptions.Item>
        <Descriptions.Item label="Website">
          {formData?.tngo_website}
        </Descriptions.Item>

        <Descriptions.Item label="States">
          {(formData.states || []).length > 0
            ? formData.states.map((s) => s.state_name).join(", ")
            : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Districts">
          {(formData.districts || []).length > 0
            ? formData.districts.map((d) => d.district_name).join(", ")
            : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="CSR Partner Contact Person">
          {formData?.tngo_contact_person}
        </Descriptions.Item>
        <Descriptions.Item label="CSR Partner Contact Person Number">
          {formData?.tngo_contact_person_no}
        </Descriptions.Item>

      </Descriptions>

      

      <div className="mt-3 border rounded  shadow-sm">
        <div className="card-header px-3 py-2">
          <h5 orientation="left mb-0">All Documents</h5>
        </div>

        <div className="card-body p-3 ">
          {(formData.documents || []).length > 0 ? (
            <Descriptions column={1} size="middle">
              {formData.documents.map((doc, index) => (
                <Descriptions.Item
                  key={doc.tdoc_id}
                  label={`Document ${index + 1} (${doc.doc_purpose || "General"
                    })`}
                >
                  {doc.doc_path ? (
                    <a
                      href={doc?.full_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{ color: "#bc7e56" }}
                    >
                      Download (
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
    </Card>
  );
}
