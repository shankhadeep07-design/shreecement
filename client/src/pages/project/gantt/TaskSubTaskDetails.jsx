import React, { useState, useEffect } from "react";
import {
  Card, Progress, Tag, Timeline, Space, Button, Typography,
  Modal, Form, Input, DatePicker, Upload, Popconfirm, Table,
} from "antd";
import { useParams } from "react-router-dom";
import {
  PlayCircleOutlined, StopOutlined, EyeOutlined,
  BarChartOutlined, UploadOutlined, PlusCircleOutlined,
} from "@ant-design/icons";
import {
  projectActivityListApi, projectActivitySubmitApi,
  projectParentTaskEndApi, projectParentTaskStartApi,
  projectTaskSubTaskListApi,
} from "../../../services/Project-service";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import GanttChartModal from "./GanttChartModal";
import Draggable from "react-draggable";

const { Title, Text } = Typography;

const statusColors = {
  "not started": "default",
  started: "processing",
  ended: "success",
};

const ProjectTimeline = () => {
  const { tproj_id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedActivityTask, setSelectedActivityTask] = useState(null);
  const [activityList, setActivityList] = useState([]);

  const [taskStartModalOpen, setTaskStartModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [activityFormModalOpen, setActivityFormModalOpen] = useState(false);
  const [activityViewModalOpen, setActivityViewModalOpen] = useState(false);
   const [disabled, setDisabled] = useState(true);


  const [form] = Form.useForm();
  const [activityForm] = Form.useForm();

  /** 🔹 Convert flat list to tree */
  const buildTree = (data, parentId = null) =>
    data
      .filter((item) => item.atim_parent_id === parentId)
      .sort((a, b) => (a.atim_order || 0) - (b.atim_order || 0))
      .map((item) => ({ ...item, children: buildTree(data, item.atim_id) }));

  /** 🔹 Fetch tasks */
  const fetchTasks = async () => {
    try {
      const { data } = await projectTaskSubTaskListApi(tproj_id);
      setTasks(buildTree(data));
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [tproj_id]);

  /** 🔹 Start/End Task */
  const handleTaskAction = (task, type, isParent = false) => {
    if (type === "end" && isParent && task.children?.some((c) => c.atim_status?.toLowerCase() !== "ended")) {
      return toast.error("All child tasks must be completed first.");
    }
    setSelectedTask(task);
    type === "start" ? setTaskStartModalOpen(true) : setEndModalOpen(true);
  };

  /** 🔹 View/Add/Edit Activity */
  const handleViewActivity = (atim_id) => {
    projectActivityListApi({ atd_activity_id: atim_id}).then((res) => setActivityList(res.data));
    // setSelectedTask(task);
    setActivityViewModalOpen(true);
  };
  const handleAddActivity = (task) => {
    setSelectedActivityTask(task);
    setActivityFormModalOpen(true);
  };
  const handleEditActivity = (activity) => {
    setSelectedActivityTask(activity);
    activityForm.setFieldsValue({
      atd_activity_details: activity.atd_activity_details,
      atd_activity_date: activity.atd_activity_date ? dayjs(activity.atd_activity_date) : null,
      file: activity.documents.map((doc, i) => ({
        uid: i, name: doc.doc_name, status: "done", url: doc.doc_url,
      })),
    });
    setActivityFormModalOpen(true);
  };

  /** 🔹 Submit Start/End Task */
  const handleTaskSubmit = async (apiFn, closeModal) => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, atim_id: selectedTask?.atim_id, atim_project_id: tproj_id };
      await apiFn(payload);
      fetchTasks();
      toast.success("Task updated successfully!");
      closeModal(false);
      form.resetFields();
    } catch {
      toast.error("Please fill all required fields!");
    }
  };

  /** 🔹 Submit Add/Edit Activity */
  const handleActivitySubmit = () => {
    activityForm.validateFields().then((values) => {
      const fd = new FormData();
      let task_id = '';
      if (selectedActivityTask?.atd_id){
        fd.append("atd_id", selectedActivityTask.atd_id);
        task_id = selectedActivityTask.atd_activity_id 
      }
      else {
        fd.append("atd_activity_id", selectedActivityTask?.atim_id);
        fd.append("atd_project_id", tproj_id);
        task_id = selectedActivityTask?.atim_id
      }
      Object.entries(values).forEach(([k, v]) => k !== "file" && v && fd.append(k, v));
      if (values.file?.[0]?.originFileObj) fd.append("file", values.file[0].originFileObj);

      projectActivitySubmitApi(fd).then(() => {
        toast.success(selectedActivityTask?.atd_id ? "Activity updated!" : "Activity added!");
        setActivityFormModalOpen(false);
        activityForm.resetFields();
        handleViewActivity(task_id);
      });
    }).catch(() => toast.error("Please fill all required fields!"));
  };

const [ganttModalOpen, setGanttModalOpen] = useState(false);
const [ganttData, setGanttData] = useState([]);

const handleViewGanttChart = async (chartData) => {
  try {

    // console.log(chartData);return
    

    setGanttData(chartData);
    setGanttModalOpen(true);
  } catch {
    toast.error("Failed to load Gantt data");
  }
};

  /** 🔹 Render */
  return (
    <div  className="project-timeline">
      <Title level={3} className="timeline-title">Project Stages: Task & Sub-task</Title>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {tasks.map((task) => (
          <Card
          className="project-card"
            key={task.atim_id}
            title={
              <>
                <Title level={4}  className="task-title p-4">{task.atim_activities}</Title>
                <Text type="secondary">Planned: {task.atim_planned_start_dt || "-"} → {task.atim_planned_end_dt || "-"}</Text><br />
                <Text type="secondary">Actual: {task.atim_actual_start_dt || "-"} → {task.atim_actual_end_dt || "-"}</Text>
              </>
            }
            extra={
              <Space size="large">
                <Tag color={statusColors[task.atim_status?.toLowerCase()]}>{task.atim_status}</Tag>
                <Progress type="circle" percent={+task.atim_wightage || 0} size={50} strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }} />
                <Space>
                  {task.atim_status?.toLowerCase() === "not started" && (
                    <Popconfirm title="Start Task?" onConfirm={() => handleTaskAction(task, "start", true)}>
                      <Button type="text" icon={<PlayCircleOutlined   style={{ color: "green" , fontSize: 20}} />} />
                    </Popconfirm>
                  )}
                  <Popconfirm title="End Task?" onConfirm={() => handleTaskAction(task, "end", true)}>
                    <Button type="text" icon={<StopOutlined color="red" style={{ color: "red" , fontSize: 20}} />} disabled={task.children?.some((c) => c.atim_status?.toLowerCase() !== "ended") || task.atim_status?.toLowerCase() === "ended"} />
                  </Popconfirm>
                  <Button type="text" onClick={() => handleViewGanttChart(task)} icon={<BarChartOutlined  style={{ color: "blue" , fontSize: 20}}  />} title="View Gantt" />
                </Space>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            {task.children?.length > 0 && (
              <Timeline>
                {task.children.map((st) => (
                  <Timeline.Item key={st.atim_id} color={st.atim_status?.toLowerCase() === "completed" ? "green" : "blue"}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Space style={{ justifyContent: "space-between", width: "100%" }}>
                        <Text strong>{st.atim_activities}</Text>
                        <Progress type="circle" percent={+st.atim_wightage || 0} size={50} strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }} />
                        <Tag color={statusColors[st.atim_status?.toLowerCase()]}>{st.atim_status}</Tag>
                      </Space>
                      <Text type="secondary">Planned: {st.atim_planned_start_dt || "-"} → {st.atim_planned_end_dt || "-"} | Actual: {st.atim_actual_start_dt || "-"} → {st.atim_actual_end_dt || "-"}</Text>
                      <Space>
                        {task.atim_status?.toLowerCase() === "started" && st.atim_status?.toLowerCase() === "not started" && (
                          <Button onClick={() => handleTaskAction(st, "start")} type="text" icon={<PlayCircleOutlined />} />
                        )}
                        {st.atim_status?.toLowerCase() === "started" && (
                          <>
                            <Popconfirm title="End Sub-task?" onConfirm={() => handleTaskAction(st, "end")}>
                              <Button type="text" icon={<StopOutlined  style={{ color: "red" , fontSize: 20}}  />} />
                            </Popconfirm>
                            <Button type="text" icon={<PlusCircleOutlined />} onClick={() => handleAddActivity(st)} />
                          </>
                        )}
                        {st.atim_status?.toLowerCase() !== "not started" && (
                          <Button type="text" icon={<EyeOutlined   style={{ color: "green" , fontSize: 20}} />} onClick={() => handleViewActivity(st.atim_id)} />
                        )}
                      </Space>
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        ))}
      </Space>

      {/* Start Task Modal */}
      <Modal title={`Start Task: ${selectedTask?.atim_activities || ""}`} open={taskStartModalOpen} onCancel={() => setTaskStartModalOpen(false)} onOk={() => handleTaskSubmit(projectParentTaskStartApi, setTaskStartModalOpen)}>
        <Form form={form} layout="vertical">
          <Form.Item label="Activity Description" name="description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Start Date" name="date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* End Task Modal */}
      <Modal title={`End Task: ${selectedTask?.atim_activities || ""}`} open={endModalOpen} onCancel={() => setEndModalOpen(false)} onOk={() => handleTaskSubmit(projectParentTaskEndApi, setEndModalOpen)}>
        <Form form={form} layout="vertical">
          <Form.Item label="Activity Description" name="description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="End Date" name="date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add/Edit Activity Modal */}
      <Modal title={`Task: ${selectedActivityTask?.atim_activities || ""}`} open={activityFormModalOpen} onCancel={() => setActivityFormModalOpen(false)} onOk={handleActivitySubmit}>
        <Form form={activityForm} layout="vertical">
          <Form.Item label="Activity Description" name="atd_activity_details" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Date" name="atd_activity_date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Upload File" name="file" valuePropName="fileList" getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Activity Modal */}
      <Modal title={`Activity List - ${selectedTask?.atim_activities || ""}`} open={activityViewModalOpen} onCancel={() => setActivityViewModalOpen(false)} footer={null} width={800}>
        {activityList.length === 0 ? (
          <Text>No activities found.</Text>
        ) : (
          <Table dataSource={activityList} rowKey="atd_id" pagination={false} bordered>
            <Table.Column title="Date" dataIndex="atd_activity_date" />
            <Table.Column title="Description" dataIndex="atd_activity_details" />
            <Table.Column
              title="Documents"
              render={(_, record) =>
                record.documents?.length ? (
                  record.documents.map((doc, i) => (
                    <a key={i} href={doc.full_url} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}>
                      {doc.doc_name}
                    </a>
                  ))
                ) : (
                  <Text type="secondary">No documents</Text>
                )
              }
            />
            <Table.Column
              title="Action"
              render={(_, record) =>
                record.atim_status !== "ended" && (
                  <Button type="link" onClick={() => handleEditActivity(record)}>Edit</Button>
                )
              }
            />
          </Table>
        )}
      </Modal>



     <Modal
      title={
        <div
          style={{ width: "100%", cursor: "move" }}
          onMouseOver={() => {
            if (disabled) setDisabled(false);
          }}
          onMouseOut={() => {
            setDisabled(true);
          }}
        >
          Gantt Chart
        </div>
      }
      open={ganttModalOpen}
      onCancel={() => setGanttModalOpen(false)}
      footer={null}
      width="90%" // 🔹 make it very wide
      style={{ top: 20 }} // 🔹 keep some margin from top
      modalRender={(modal) => (
        <Draggable disabled={disabled} bounds="body">
          <div>{modal}</div>
        </Draggable>
      )}
      bodyStyle={{ height: "80vh", overflow: "auto" }} // 🔹 big and scrollable
    >
      <GanttChartModal data={ganttData} />
    </Modal>

    </div>
  );
};

export default ProjectTimeline;
