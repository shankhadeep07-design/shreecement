import React, { useState } from "react";
import {
  Button,
  Upload,
  message,
  Modal,
  Table,
  Popconfirm,
} from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { event_review_form_excel_uploadApi } from "../../services/Event-service";

export default function FormNotSubmitUpload({ event_id, eventDetails ,fetchEventDetailsFunApi }) {

  const [uploadedData, setUploadedData] = useState([]);
  const [isModalOpenExcelUser, setIsModalOpenExcelUser] = useState(false);

  /* ==============================
     DOWNLOAD EXCEL
  ============================== */
  const handleDownload = () => {
    const notSubmittedUsers = eventDetails?.assign_event_list?.filter(
      (user) => user.form_submit !== "yes" && user.status == "accepted"
    );

    if (!notSubmittedUsers?.length) {
      message.warning("No users available to submitted the form.");
      return;
    }

    const demoRow = {
      Name: "Demo User",
      Email: "demo@demo.com",
      "Join Date": "2026-02-13",
      "Join Time": "11:00:00",
      "End Date": "2026-02-13",
      "End Time": "20:53:55",
      Remarks: "Demo remarks",
    };

    const excelData = [
      demoRow,
      ...notSubmittedUsers.map((user) => ({
        Name: user.name || "",
        Email: user.email || "",
        "Join Date": "",
        "Join Time": "",
        "End Date": "",
        "End Time": "",
        Remarks: "",
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Form_Not_Submitted");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "Form_Not_Submit_Users.xlsx");
  };

  /* ==============================
     HANDLE EXCEL UPLOAD
  ============================== */
  const handleExcelUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      if (!jsonData.length) {
        message.error("Excel file is empty!");
        return;
      }

      setUploadedData(jsonData);
      setIsModalOpenExcelUser(true);
      message.success(`${file.name} uploaded successfully`);
    };

    reader.readAsArrayBuffer(file);
    return false; // prevent auto upload
  };

  /* ==============================
     CONFIRM SUBMIT
  ============================== */
  const handleConfirmSubmit = async () => {
    if (!uploadedData.length) {
      message.error("No Excel data found!");
      return;
    }

    // Ignore demo row
    const filteredRows = uploadedData.filter(
      (row) => row.Email && row.Email !== "demo@demo.com"
    );

    if (!filteredRows.length) {
      message.error("No valid user data found!");
      return;
    }

    // Extract full data (not just emails)
    const formattedData = filteredRows.map((row) => ({
      email: row.Email,
      join_date: row["Join Date"],
      join_time: row["Join Time"],
      end_date: row["End Date"],
      end_time: row["End Time"],
      remarks: row.Remarks,
    }));

    const payload = {
      event_id: event_id,
      users: formattedData,
    };

    try {
      const res = await event_review_form_excel_uploadApi(payload);

      if (res?.status === true) {
        message.success(res.message || "Uploaded successfully");
        setIsModalOpenExcelUser(false);
        setUploadedData([]);
        fetchEventDetailsFunApi();
      } else {
        message.error(res?.message || "Upload failed");
      }
    } catch (error) {
      console.error("API Error:", error);
      message.error("An error occurred while uploading.");
    }
  };

  return (
    <div className="flex gap-2">
      <Button icon={<DownloadOutlined />} onClick={handleDownload}>
        Download Form Not Submit Users
      </Button>

      <Upload
        showUploadList={false}
        beforeUpload={handleExcelUpload}
        accept=".xlsx,.xls"
      >
        <Button icon={<UploadOutlined />}>
          Upload Event Form Excel
        </Button>
      </Upload>

      {/* ================= MODAL ================= */}
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
        width={900}
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
            pagination={{ pageSize: 15 }}
            scroll={{ x: true }}
          />
        )}
      </Modal>
    </div>
  );
}
