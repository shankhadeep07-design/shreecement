import { AppstoreOutlined, CalendarOutlined, CheckCircleOutlined, CheckOutlined, CloseCircleOutlined, 
  CloseOutlined, DownloadOutlined, EnvironmentOutlined, FieldTimeOutlined, FileAddOutlined, GlobalOutlined,
   HomeOutlined, HourglassOutlined, IdcardOutlined, PhoneOutlined, TeamOutlined, UploadOutlined, UserOutlined ,
   FileOutlined , LinkOutlined, TagsOutlined, ApartmentOutlined
  } from '@ant-design/icons';

import {
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Upload
} from 'antd';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import {
  event_certificate_sendApi,
  event_review_form_approveApi,
  event_review_form_listApi,
  eventAcceptRejectStatusApi,
  excelUploadUserEventNotificationSendApi,
  fetchEventDetailsApi
} from '../../services/Event-service';
import { getPendingFromUsersEventsNotificationApi, getPendingNotificationDetailsApi } from '../../Services/Notification-service';
import EventFormSubmit from './EventFormSubmit';

dayjs.extend(utc);
dayjs.extend(timezone);

import userListExcelFile from "../../../src/assets/excel/demo_event_user_upload.xlsx";
import { userDetails } from '../../auth/auth';
import EventCsrDetailsApproval from './EventCsrDetailsApproval';
import FormNotSubmitUpload from './FormNotSubmitUpload';
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EventDetails() {
  const { event_id } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [pendingNotification, setPendingNotification] = useState([]);
  const [eventReviewForms, setEventReviewForms] = useState([]);
  const [formData, setFormData] = useState({ tea_remarks: '', tea_status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userDetail = userDetails();
  const [uploadedData, setUploadedData] = useState([]);
  const [isModalOpenExcelUser, setIsModalOpenExcelUser] = useState(false);
  // console.log(userDetail);
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [pendingFromUser, setPendingFromUser] = useState([]);
  

  const Label = ({ icon, text }) => (
    <>
      {icon} <span className="label-text">{text}</span>
    </>
  );


  // Handle Excel Upload
  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      setUploadedData(jsonData);
      setIsModalOpenExcelUser(true); // open modal after upload
      message.success(`${file.name} uploaded successfully`);
    };
    reader.readAsArrayBuffer(file);
    return false; // prevent auto-upload
  };

  // Handle submit after confirmation
  const handleConfirmSubmit = () => {
    if (uploadedData.length === 0) {
      message.error("No Excel data found!");
      return;
    }

    // Try to detect "email" column (case-insensitive)
    const emails = uploadedData
      .map((row) => {
        const emailKey = Object.keys(row).find(
          (key) => key.toLowerCase() === "user email"
        );
        return emailKey ? row[emailKey] : null;
      })
      .filter((email) => email); // remove null/empty

    // console.log("📧 Emails from Excel:", emails);

    const dataUser = {
      event_id: event_id,
      emails: emails,
    }
    // console.log("dataUser---------------- ", dataUser);

    try {
      excelUploadUserEventNotificationSendApi(dataUser)
        .then((res) => {
          if (res.status === true) {
            fetchEventDetailsApi(event_id)
              .then((res) => setEventDetails(res?.data || {}))
              .catch((error) => {
                toast.error(error?.response?.data?.originalError || error?.response?.data?.message);
              });
            toast.success(res.message);
            setIsModalOpenExcelUser(false);

          }
        })
        .catch((error) => {
          console.error("API Error:", error);
          toast.error("An error occurred while uploading.");
        });
    } catch (error) {
      console.error("Unexpected Error:", error);
      toast.error("Unexpected error occurred.");
    }



  };

  useEffect(() => {
    if (event_id) {
      fetchEventDetailsFunApi();
      fetchPendingNotificationFunApi();
      getEventReviewForms();
      handleFetchPendingUser();
    }
  }, [event_id]);


  const handleFetchPendingUser = async () => {

      const body = {
        item_id: event_id
      };
 
      getPendingFromUsersEventsNotificationApi(body)
        .then((data) => {
          setPendingFromUser(data?.data || "");
        })
        .catch((error) => {
          toast.error(
            error?.response?.data?.originalError ||
              error?.response?.data?.message,
          );
        });
      
    
  };

  const fetchEventDetailsFunApi = () => {
    fetchEventDetailsApi(event_id)
      .then((res) => setEventDetails(res?.data || {}))
      .catch((error) => {
        toast.error(error?.response?.data?.originalError || error?.response?.data?.message);
      });
  };

  const fetchPendingNotificationFunApi = () => {
    getPendingNotificationDetailsApi({ item_id: event_id })
      .then((res) => setPendingNotification(res?.data || []))
      .catch((error) => {
        toast.error(error?.response?.data?.originalError || error?.response?.data?.message);
      });
  };

  const getEventReviewForms = () => {
    event_review_form_listApi({ event_id: event_id })
      .then((res) => {
        // console.log(res, "Event Review Forms");
        if (res.status === true) {
          setEventReviewForms(res?.data || []);
        }

      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.originalError || error?.response?.data?.message
        );
      });
  };

  const handleAction = (status) => {

    if (status === 'accepted' && !formData.tea_remarks) {
      toast.error('Please add remarks before proceeding');
      return;
    }

    Modal.confirm({
      title: `Are you sure you want to ${status} this event?`,
      content: 'This action cannot be undone.',
      onOk() {

        eventAcceptRejectStatusApi({
          tea_event_id: event_id,
          tea_remarks: formData.tea_remarks,
          tea_status: status,
        }).then((res) => {
          if (res.status) {
            toast.success(`Event ${status}ed successfully`);
            fetchPendingNotificationFunApi();
            fetchEventDetailsFunApi();
            setFormData({ tea_remarks: '', tea_status: '' });
          } else {
            toast.error(`Failed to ${status} event`);
          }
        });
      },
      onCancel() {
        toast.info('Action cancelled');
      },
      okText: 'Yes, ' + status,
      cancelText: 'Cancel',
    });
  };

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

    const sendCertificateFun = (form_data) => {

    // console.log(form_data, "form_data");return
    
    const event_id = form_data.terf_event_id;
    const event_form_id = form_data.terf_id;
    const send_user_id = form_data.terf_created_by;

    Modal.confirm({
      title: `Are you sure you want to send this certificate?`,
      content: 'This action cannot be undone.',
      onOk() {
        // console.log(event_id, event_form_id, send_user_id);
        
        event_certificate_sendApi({
          event_id: event_id,
          event_form_id: event_form_id,
          send_user_id: send_user_id
        }).then((res) => {
          if (res.status) {
            toast.success(`Event certificate sent successfully`);
            
          } else {
            toast.error(`Failed to send event certificate`);
          }
        });
      },
      onCancel() {
        toast.info('Action cancelled');
      },
      okText: 'Yes, Send Certificate',
      cancelText: 'Cancel',
    });
  };

 const columns = [
  { title: 'Sl.', render: (_, __, index) => index + 1 },
  { title: 'Name', dataIndex: 'name' },
  { title: 'Join Date', dataIndex: 'terf_event_join_date' },
  { title: 'Join Time', dataIndex: 'terf_event_join_time' },
  { title: 'End Date', dataIndex: 'terf_event_end_date' },
  { title: 'End Time', dataIndex: 'terf_event_end_time' },
  { title: 'Remarks', dataIndex: 'terf_remarks' },
  { title: 'Status', dataIndex: 'terf_status' },
  { title: 'Approved Remarks', dataIndex: 'terf_approved_remarks' },
  {
    title: 'Action',
    render: (_, record) => (
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          type="primary"
          onClick={() => {
            setSelectedRecord(record);
            setIsFormModalOpen(true);
          }}
        >
          View
        </Button>

        {/* ✅ Show only if approved */}
        {record?.terf_status === "approved" && (
          <Button
            type="default"
            onClick={() => sendCertificateFun(record)}
          >
            Send Certificate
          </Button>
        )}
      </div>
    ),
  },
];




  const columns2 = [
    {
      title: 'Sl.',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Assign User',
      dataIndex: 'name'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        let color = '#d9d9d9'; // default grey
        if (status === 'accepted') {
          color = 'blue';
        }
        else if (status === 'rejected') {
          color = '#ff4d4f';
        }
        else if (status === null) {
          status = 'Not Responded';
          color = 'red';
        }
        // orange

        return <Tag color={color}>{status}</Tag>;
      }

    },
    {
      title: 'Booked',
      dataIndex: 'booked',
      render: (booked) => {
        let booked_status = '';
        if (booked == true) booked_status = 'Booked';
        else booked_status = '';

        return <Tag color="green">{booked_status}</Tag>;
      }

    },
    {
      title: 'Waiting Number',
      dataIndex: 'waiting_number'
    },
    {
      title: 'Response Date',
      dataIndex: 'responded_at',
      render: (date) =>
        date ? dayjs.utc(date).tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm A') : '--'
    },
    {
      title: 'Request Send Date',
      dataIndex: 'created_at',
      render: (date) =>
        date ? dayjs.utc(date).tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm A') : '--'
    }
  ];

  const handleExportUsers = () => {
  if (!eventDetails?.assign_event_list?.length) {
    message.warning("No data available to export");
    return;
  }

  const exportData = eventDetails.assign_event_list.map((item, index) => ({
    Sl: index + 1,
    Name: item.name || "",
    Status:
      item.status === null
        ? "Not Responded"
        : item.status || "",
    Booked: item.booked ? "Booked" : "",
    "Waiting Number": item.waiting_number || "",
    "Response Date": item.responded_at
      ? dayjs.utc(item.responded_at).tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A")
      : "",
    "Request Send Date": item.created_at
      ? dayjs.utc(item.created_at).tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A")
      : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users_List");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(file, "Users_List.xlsx");
};


  console.log("eventDetails------------------- ", eventDetails);

  const getFileType = (url = "") => {
    const ext = url.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    if (["mp3", "wav", "aac", "ogg"].includes(ext)) return "audio";

    return "unknown";
  };

  const handleApproval = async (status) => {
  if (!approvalRemarks) {
    message.error("Please enter remarks");
    return;
  }

  try {
    setApprovalLoading(true);

    const payload = {
      terf_id: selectedRecord.terf_id,
      terf_status: status, // approved / rejected
      terf_approved_remarks: approvalRemarks,
    };

    const res = await event_review_form_approveApi(payload);

    if (res?.status) {
      message.success(res.message);
      setIsFormModalOpen(false);
      setApprovalRemarks("");
    } else {
      message.error(res?.message);
    }

  } catch (err) {
    message.error(err.response?.data?.message || err.message);
  } finally {
    setApprovalLoading(false);
  }
};



  return (
    <div className='p-3'>
      <Card>

      {pendingFromUser?.length > 0 && (
        <div>
          {pendingFromUser.map((user, index) => (
            <div
              key={user.id || index}
              style={{
                padding: "7px",
                margin: "5px 0",
                borderRadius: "4px",
                border: "1px solid #ffecb5",
                fontSize: "14px",
                backgroundColor: "#fff3cd",
                borderColor: "#ffecb5",
                color: "#664d03",
              }}
            >
              <i
                className="bi bi-info-circle"
                style={{ marginRight: "5px" }}
              ></i>
              Pending with{" "}
              <b>{user?.user_type?.replace(/_/g, " ")?.toUpperCase()}</b> (
              {user?.name?.toUpperCase()})
            </div>
          ))}
        </div>
      )}


        {eventDetails ? (
          <>

            {/* Cover/Header */}
            <div className="project-view-card event-back-img" >
              <div className="cover-img">
                <div className="back-img">
                  {(() => {
                    const logoDoc = eventDetails?.documents?.find(
                      (doc) => doc?.doc_purpose === "tevent_flyer" && doc?.full_url
                    );

                    return logoDoc ? (
                      <img
                        src={logoDoc.full_url}
                        alt={logoDoc.doc_purpose || "tevent_flyer"}
                        className="shadow"
                      />
                    ) : (
                      <div>
                        <UserOutlined />
                      </div>
                    );
                  })()}
                </div>

                <div className="position-relative pb-4">
                  <div className="d-flex align-items-center profile-pic-details">
                    <div className="me-3">
                      {(() => {
                        const logoDoc = eventDetails?.documents?.find(
                          (doc) => doc?.doc_purpose === "tevent_profile_pic" && doc?.full_url
                        );

                        return logoDoc ? (
                          <img
                            src={logoDoc.full_url}
                            alt={logoDoc.doc_purpose || "tevent_profile_pic"}
                            className="profile-pic shadow"
                          />
                        ) : (
                          <div>

                          </div>
                        );
                      })()}
                    </div>
                    <div className="profile-title">
                      <div
                        className="mb-0 d-flex justify-content-between align-items-center"
                        style={{ fontWeight: "700" }}
                      >
                        <h2> {eventDetails.tevent_activity_title || '-'}</h2>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card title="Event CSR Details" className="custom-event-details">
              <Descriptions column={3} size="middle" labelStyle={{ fontWeight: 500 }}>

                <Descriptions.Item 
                  label={<Label icon={<GlobalOutlined />} text="Activity Title" />}
                >
                  {eventDetails.tevent_activity_title || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<FileOutlined />} text="Activity Description" />}
                >
                  {eventDetails.tevent_activity_description || "-"}
                </Descriptions.Item>

                {/* <Descriptions.Item
                  label={<Label icon={<CheckCircleOutlined />} text="Expected Impact" />}
                >
                  {eventDetails.tevent_expected_impact || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<TagsOutlined />} text="Domain" />}
                >
                  {eventDetails.tevent_domain || "-"}
                </Descriptions.Item> */}

                <Descriptions.Item
                  label={<Label icon={<EnvironmentOutlined />} text="State" />}
                >
                  {eventDetails.tsl_state_name || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<EnvironmentOutlined />} text="District" />}
                >
                  {eventDetails.tdl_district_name || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<EnvironmentOutlined />} text="Block" />}
                >
                  {eventDetails.tevent_location || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<EnvironmentOutlined />} text="Village" />}
                >
                  {eventDetails.tevent_village || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<LinkOutlined />} text="Map Location" />}
                >
                  {eventDetails.tevent_map_location || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<CalendarOutlined />} text="Start Date" />}
                >
                  <Tag color="purple">{eventDetails.tevent_start_date || "-"}</Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<CalendarOutlined />} text="End Date" />}
                >
                  <Tag color="purple">{eventDetails.tevent_end_date || "-"}</Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<FieldTimeOutlined />} text="Start Time" />}
                >
                  {eventDetails.tevent_start_time || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<FieldTimeOutlined />} text="End Time" />}
                >
                  {eventDetails.tevent_end_time || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<TeamOutlined />} text="Volunteers Needed" />}
                >
                  <Tag color="blue">{eventDetails.tevent_volunteers_needed || "-"}</Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<TeamOutlined />} text="Volunteer Roles" />}
                >
                  {eventDetails.tevent_volunteer_roles || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<TeamOutlined />} text="CSR Thematic Area" />}
                >
                  {eventDetails.tthm_theme_name || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<TeamOutlined />} text="Family Participation" />}
                >
                  <Tag color="blue">{eventDetails.tevent_family_participation || "-"}</Tag>
                </Descriptions.Item>

                {eventDetails.tevent_family_participation === "yes" && (
                  <Descriptions.Item
                    label={<Label icon={<TeamOutlined />} text="Family Members Count" />}
                  >
                    <Tag color="blue">{eventDetails.tevent_family_members_count}</Tag>
                  </Descriptions.Item>
                )}

                {/* <Descriptions.Item
                  label={<Label icon={<ApartmentOutlined />} text="Organization Type" />}
                >
                  {eventDetails.tevent_org_type || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<ApartmentOutlined />} text="Business Unit" />}
                >
                  {eventDetails.tevent_bu || "-"}
                </Descriptions.Item> */}

                <Descriptions.Item
                  label={<Label icon={<UserOutlined />} text="Event Mode" />}
                >
                  {eventDetails.tevent_mode
                      ? eventDetails.tevent_mode
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, char => char.toUpperCase())
                      : "-"}
                </Descriptions.Item>

                {
                  eventDetails.tevent_mode === "virtual" || eventDetails.tevent_mode === "hybrid" && (
                    <Descriptions.Item
                      label={<Label icon={<UserOutlined />} text="Event Link" />}
                    >
                      {eventDetails.tevent_event_link || "-"}
                    </Descriptions.Item>
                  )
                }


                <Descriptions.Item
                  label={<Label icon={<UserOutlined />} text="Contact Person" />}
                >
                  {eventDetails.tevent_contact_person || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<PhoneOutlined />} text="Contact Details" />}
                >
                  {eventDetails.tevent_contact_details || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<PhoneOutlined />} text="Partner Contact" />}
                >
                  {eventDetails.tevent_partner_contact || "-"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<TagsOutlined />} text="SDGs" />}
                >
                  <Tag color="blue">
                    {(eventDetails.sdgs || []).map(s => s.label).join(", ") || "-"}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={<Label icon={<CheckCircleOutlined />} text="Status" />}
                >
                  <Tag color="gold">
                    {eventDetails.tevent_status
                      ? eventDetails.tevent_status
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, char => char.toUpperCase())
                      : "-"}
                  </Tag>

                </Descriptions.Item>

              </Descriptions>
            </Card>

            {/* <Card className="mt-5">
              <h4 orientation="left">All Documents</h4>

              {(eventDetails?.documents || []).length > 0 ? (
                <Descriptions column={1} size="middle">
                  {eventDetails?.documents.map((doc, index) => (
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
                          style={{ color: "#1677ff" }}
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
                <p>No documents uploaded.</p>
              )}

            </Card> */}

            {/* <Card className="mt-5">
                <h4 orientation="left">Pending From</h4>

            </Card> */}


            {eventDetails?.tevent_status === "published" && pendingNotification.length > 0 ? (<>

              <Card className="mt-5">
                <h4 orientation="left">Accept / Reject Event</h4>
                <Form layout="vertical">
                  <Form.Item label="Remarks">
                    <TextArea
                      rows={3}
                      value={formData.tea_remarks}
                      onChange={(e) => setFormData({ ...formData, tea_remarks: e.target.value })}
                      placeholder="Add your remarks here..."
                    />
                  </Form.Item>
                  <Space>
                    <Button type="primary" icon={<CheckOutlined />} onClick={() => handleAction('accepted')}>
                      Accept
                    </Button>
                    <Button danger icon={<CloseOutlined />} onClick={() => handleAction('rejected')}>
                      Reject
                    </Button>
                  </Space>
                </Form>
              </Card>
            </>
            ) : (<></>)}

            {
              
              eventDetails?.access_of_event_number > 0 &&
                dayjs(`${eventDetails.tevent_start_date} ${eventDetails.tevent_start_time}`).isBefore(dayjs()) &&
                dayjs(eventDetails.tevent_end_date).isAfter(dayjs(), 'day') ? (
                <div style={{ marginBottom: 16 }}>



                  {
                    eventDetails?.assign_event_details.tea_form_submit != 'yes' && (
                      <>
                        <h4 orientation="left" className="mt-5">Event Review Form</h4>

                        <Button
                          icon={<FileAddOutlined />}
                          type="primary"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Submit Review Form
                        </Button>

                        <EventFormSubmit
                          isModalOpen={isModalOpen}
                          handleOk={() => setIsModalOpen(false)}
                          handleCancel={() => setIsModalOpen(false)}
                          event_id={event_id}
                          getEventReviewForms={getEventReviewForms}
                        />

                      </>
                    )
                  }

                </div>
              ) : (
                <Text type="secondary"></Text>
              )
            }

            {
              eventDetails?.access_of_event_number > 0 && dayjs().isBefore(dayjs(eventDetails.tevent_start_date), 'day')
                ? (
                  <div style={{ marginBottom: 16 }}>

                    <Button
                      icon={<FileAddOutlined />}
                      type="primary"
                      onClick={() => handleAction('rejected')}
                    >
                      Reject the Event
                    </Button>
                  </div>
                ) : (
                  <Text type="secondary"></Text>
                )
            }

            {
              eventDetails?.tevent_created_by === userDetail?.id && eventDetails?.tevent_status != "submitted" && (
                <>



               <Card title="Users Lists" className="custom-event-details mt-4" 
                  extra={
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExportUsers}
                      >
                        Export Excel
                      </Button>
                    }
               >
                    {/* <div className="d-flex justify-content-between align-items-center">
                    
                      <div className="flex gap-2">
                        
                        <a
                          href={userListExcelFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Button icon={<DownloadOutlined />}>Download Excel</Button>
                        </a>

                        <Upload
                          beforeUpload={handleExcelUpload}
                          showUploadList={false}
                          accept=".xlsx,.xls"
                        >
                          <Button icon={<UploadOutlined />}>Upload Excel</Button>
                        </Upload>


                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleExportUsers}
                          >
                            Export Excel
                          </Button>
                      </div>
                    </div> */}

                    {/* Modal for Uploaded Excel */}
                    <Modal
                      title="Uploaded Excel Data"
                      open={isModalOpenExcelUser}
                      onCancel={() => setIsModalOpenExcelUser(false)}
                      footer={[
                        <Button key="cancel" onClick={() => setIsModalOpenExcelUser(false)}>
                          Cancel
                        </Button>,
                        <Popconfirm
                          key="submit"
                          title="Are you sure you want to submit?"
                          okText="Yes"
                          cancelText="No"
                          onConfirm={handleConfirmSubmit}
                        >
                          <Button type="primary">Submit</Button>
                        </Popconfirm>,
                      ]}
                      width={800}
                    >
                      {uploadedData.length > 0 && (
                        <Table
                          bordered
                          size="middle"
                          rowKey={(record, index) => index}
                          columns={Object.keys(uploadedData[0]).map((key) => ({
                            title: key,
                            dataIndex: key,
                            key,
                          }))}
                          dataSource={uploadedData}
                          pagination={{ pageSize: 5 }}
                          scroll={{ x: true }}
                        />
                      )}
                    </Modal>
                    {
                      eventDetails?.assign_event_list && eventDetails?.assign_event_list.length > 0 && (
                        <Table
                          bordered
                          size="middle"
                          rowKey="terf_id"
                          columns={columns2}
                          dataSource={eventDetails.assign_event_list}
                          pagination={{ pageSize: 10 }}
                          scroll={{ x: true }}
                          rowClassName={(record) => (record.booked === true ? 'green-row' : '')}
                        />
                      )
                    }
                  </Card>

                        <Card title="Event Form Submitted Lists" className="custom-event-details mt-4"> 
                    <div className="d-flex justify-content-end align-items-center mb-3">
                   

                        <FormNotSubmitUpload event_id={event_id} eventDetails={eventDetails} fetchEventDetailsFunApi={fetchEventDetailsFunApi}/>
                      </div>

                    <Table
                      bordered
                      rowKey="terf_id"
                      columns={columns}
                      dataSource={eventReviewForms}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: true }}
                    />

                    <Modal
                      title="Event Review Form Details"
                      open={isFormModalOpen}
                      onCancel={() => setIsFormModalOpen(false)}
                      footer={null}
                      width={800}
                    >
                      {selectedRecord && (
                        <>
                          <Descriptions
                            bordered
                            column={2}
                            size="middle"
                            labelStyle={{ fontWeight: 'bold', background: '#fafafa' }}
                            contentStyle={{ background: '#fff' }}
                          >
                            <Descriptions.Item label="Name of the participant">{selectedRecord.name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Join Date">{selectedRecord.terf_event_join_date || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Join Time">{selectedRecord.terf_event_join_time || '-'}</Descriptions.Item>
                            <Descriptions.Item label="End Date">{selectedRecord.terf_event_end_date || '-'}</Descriptions.Item>
                            <Descriptions.Item label="End Time">{selectedRecord.terf_event_end_time || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Feedback">{selectedRecord.terf_remarks || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Event Attended">{selectedRecord.terf_attending_event || '-'}</Descriptions.Item>
                          </Descriptions>

                            <Divider orientation="left" style={{ fontWeight: "bold", marginTop: 20 }}>
                            Documents (Photo / Video / Audio)
                          </Divider>

                          {selectedRecord.documents && selectedRecord.documents.length > 0 ? (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                                gap: "12px",
                              }}
                            >
                              {selectedRecord.documents.map((doc, idx) => {
                                const type = getFileType(doc.full_url);

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      border: "1px solid #e0e0e0",
                                      borderRadius: "6px",
                                      padding: "8px",
                                      background: "#fff",
                                      textAlign: "center",
                                    }}
                                  >
                                    {/* IMAGE */}
                                    {type === "image" && (
                                      <Image
                                        src={doc.full_url}
                                        alt={doc.doc_name}
                                        height={120}
                                        style={{ objectFit: "cover", borderRadius: 4 }}
                                      />
                                    )}

                                    {/* VIDEO */}
                                    {type === "video" && (
                                      <video
                                        src={doc.full_url}
                                        controls
                                        style={{ width: "100%", height: 120, borderRadius: 4 }}
                                      />
                                    )}

                                    {/* AUDIO */}
                                    {type === "audio" && (
                                      <audio
                                        src={doc.full_url}
                                        controls
                                        style={{ width: "100%" }}
                                      />
                                    )}

                                    {/* UNKNOWN */}
                                    {type === "unknown" && (
                                      <a href={doc.full_url} target="_blank" rel="noreferrer">
                                        Download File
                                      </a>
                                    )}

                                    <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
                                      {doc.doc_name}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p style={{ color: "#999", fontStyle: "italic" }}>
                              No documents available
                            </p>
                          )}
                        </>

                      )}


                      {/* ================= APPROVAL SECTION ================= */}
                      {selectedRecord?.terf_status === "submitted" && (
                        <>
                          <Divider orientation="left" style={{ fontWeight: "bold", marginTop: 20 }}>
                            Approval Action
                          </Divider>

                          <div style={{ marginBottom: 12 }}>
                            <Input.TextArea
                              rows={3}
                              placeholder="Enter approval / rejection remarks"
                              value={approvalRemarks}
                              onChange={(e) => setApprovalRemarks(e.target.value)}
                            />
                          </div>

                          <div style={{ display: "flex", gap: 10 }}>
                            <Button
                              type="primary"
                              loading={approvalLoading}
                              onClick={() => handleApproval("approved")}
                            >
                              Approve
                            </Button>

                            <Button
                              danger
                              loading={approvalLoading}
                              onClick={() => handleApproval("rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        </>
                      )}

                    </Modal>
                  </Card>

                </>
              )
            }


            {/* Approval Part */}
            <EventCsrDetailsApproval eventDetails={eventDetails} event_id={event_id} fetchEventDetailsFunApi={fetchEventDetailsFunApi} handleFetchPendingUser={handleFetchPendingUser}/>
            

          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </Card>
    </div>
  );
}
