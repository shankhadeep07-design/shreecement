import {
  EditOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row, Select, Table } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  projectTaskSubTaskCreateUpdatetApi,
  projectTaskSubTaskListApi,
  projectTaskSubTaskOrderChangedtApi,
} from "../../../services/Project-service";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export default function TaskSubTask({ isClosureApproved }) {
  const { tproj_id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [flatData, setFlatData] = useState([]); // for dropdown list
  const [editData, setEditData] = useState(null);

  const navigate = useNavigate();

  /** 🔹 Recursive function to build tree */
  const buildTree = (data, parentId = null) =>
    data
      .filter((item) => item.atim_parent_id === parentId)
      .sort((a, b) => (a.atim_order || 0) - (b.atim_order || 0))
      .map((item) => ({
        ...item,
        children: buildTree(data, item.atim_id),
      }));

  /** 🔹 Submit Task / Subtask */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = new FormData();
      payload.append("atim_project_id", tproj_id);
      payload.append("atim_activities", values.title);
      payload.append("atim_parent_id", values.parentId || "");
      payload.append("atim_wightage", values.atim_wightage || "");

      if (values.plannedDate && values.plannedDate.length === 2) {
        payload.append(
          "atim_planned_start_dt",
          values.plannedDate[0].format("YYYY-MM-DD"),
        );
        payload.append(
          "atim_planned_end_dt",
          values.plannedDate[1].format("YYYY-MM-DD"),
        );
      }

      if (editData?.atim_id) {
        payload.append("atim_id", editData.atim_id);
        payload.append("atim_order", editData.atim_order || "");
      }

      setLoading(true);
      const response = await projectTaskSubTaskCreateUpdatetApi(payload);

      if (!response.success) {
        toast.error("Failed to save details. Please try again.");
        return;
      }

      toast.success(editData ? "Updated successfully!" : "Added successfully!");
      setIsModalVisible(false);
      form.resetFields();
      setEditData(null);
      fetchProjectPoUploadFun();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Fetch tasks + subtasks */
  const fetchProjectPoUploadFun = async () => {
    try {
      const { data } = await projectTaskSubTaskListApi(tproj_id);

      setFlatData(data); // for dropdown
      setTasks(buildTree(data)); // build nested tree
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    fetchProjectPoUploadFun();
  }, [tproj_id]);

  /** 🔹 Edit existing */
  const handleEdit = (record) => {
    setEditData(record);
    setIsModalVisible(true);

    form.setFieldsValue({
      title: record.atim_activities,
      parentId: record.atim_parent_id || null,
      plannedDate:
        record.atim_planned_start_dt && record.atim_planned_end_dt
          ? [
              dayjs(record.atim_planned_start_dt),
              dayjs(record.atim_planned_end_dt),
            ]
          : null,
      atim_wightage: record.atim_wightage || "",
    });
  };

  /** 🔹 Add new */
  const handleAdd = () => {
    setEditData(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditData(null);
  };

  /** 🔹 Change order (up/down) */
  const changeOrder = async (record, direction) => {
    const siblings = flatData.filter(
      (t) => t.atim_parent_id === record.atim_parent_id,
    );

    const index = siblings.findIndex((t) => t.atim_id === record.atim_id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === siblings.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;

    // Swap orders locally
    const updatedSiblings = [...siblings];
    const temp = updatedSiblings[index].atim_order;
    updatedSiblings[index].atim_order = updatedSiblings[swapIndex].atim_order;
    updatedSiblings[swapIndex].atim_order = temp;

    try {
      // Update both in DB
      await projectTaskSubTaskOrderChangedtApi({
        atim_id: updatedSiblings[index].atim_id,
        atim_order: updatedSiblings[index].atim_order,
        atim_project_id: tproj_id,
      });

      await projectTaskSubTaskOrderChangedtApi({
        atim_id: updatedSiblings[swapIndex].atim_id,
        atim_order: updatedSiblings[swapIndex].atim_order,
        atim_project_id: tproj_id,
      });

      toast.success("Order updated successfully!");
      fetchProjectPoUploadFun();
    } catch (err) {
      toast.error("Failed to update order!");
    }
  };

  /** 🔹 Table Columns */
  const columns = [
    {
      title: "Title",
      dataIndex: "atim_activities",
      key: "title",
    },
    {
      title: "Planned start dt",
      dataIndex: "atim_planned_start_dt",
      key: "title",
    },
    {
      title: "Planned end dt",
      dataIndex: "atim_planned_end_dt",
      key: "title",
    },
    {
      title: "Wightage",
      dataIndex: "atim_wightage",
      key: "title",
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
    },
    {
      title: "Created At",
      dataIndex: "atim_created_at",
      key: "atim_created_at",
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          {!isClosureApproved && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            ></Button>
          )}
          {!isClosureApproved && (
            <Button
              type="link"
              icon={<ArrowUpOutlined />}
              onClick={() => changeOrder(record, "up")}
            />
          )}
          {!isClosureApproved && (
            <Button
              type="link"
              icon={<ArrowDownOutlined />}
              onClick={() => changeOrder(record, "down")}
            />
          )}
        </>
      ),
    },
  ];

  return (
    <div className="home-content">
      <div className="card pb-3">
        <div className="card-header fw-bold py-2 px-3">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h5 className="mb-0">Task / Sub Task List</h5>

            {/* ✅ Button Wrapper */}
            <div style={{ display: "flex", gap: "8px" }}>
              {!isClosureApproved && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  Add Task / Subtask
                </Button>
              )}

              <Button
                onClick={() =>
                  navigate(`/admin/project/gantt_details/${tproj_id}`)
                }
              >
                View Details
              </Button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal
          title={editData ? "Edit Task / Sub Task" : "Add Task / Sub Task"}
          open={isModalVisible}
          onCancel={handleCancel}
          width={600}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleSubmit}
            >
              {editData ? "Update" : "Submit"}
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[{ required: true, message: "Please enter title" }]}
                >
                  <Input placeholder="Enter task/subtask title" />
                </Form.Item>
              </Col>

              {/* Planned Start - End Date */}
              <Col span={24}>
                <Form.Item
                  label="Planned Start - End Date"
                  name="plannedDate"
                  rules={[
                    { required: true, message: "Please select planned dates" },
                  ]}
                >
                  <RangePicker format="YYYY-MM-DD" />
                </Form.Item>
              </Col>

              {/* Wightage */}
              <Col span={24}>
                <Form.Item
                  label="Wightage"
                  name="atim_wightage"
                  rules={[
                    { required: true, message: "Please enter wightage" },
                    { pattern: /^[0-9]+$/, message: "Only numbers allowed" },
                  ]}
                >
                  <Input placeholder="Enter wightage %" />
                </Form.Item>
              </Col>

              {/* Parent Task */}
              <Col span={24}>
                <Form.Item label="Parent Task" name="parentId">
                  <Select
                    placeholder="Select parent task (leave empty for new Task)"
                    allowClear
                    options={flatData
                      .filter((x) => !x.atim_parent_id) // only parent tasks
                      .map((t) => ({
                        value: t.atim_id,
                        label: t.atim_activities,
                      }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Table */}
        <div className="p-4">
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="atim_id"
            expandable={{
              expandRowByClick: true,
              rowExpandable: (record) => record.children?.length > 0,
            }}
            pagination={false}
            rowClassName={(record) =>
              record.atim_parent_id ? "child-row" : "parent-row"
            }
          />
        </div>
      </div>
    </div>
  );
}
