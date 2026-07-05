import {
  DeleteOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Tooltip,
  Typography,
  Upload,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { projectMonitoringCreateUpdateApi } from "../../services/Project-service";
const { RangePicker } = DatePicker;
const { Text } = Typography;
const SUPPORTED_IMAGE_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
];

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { fromLonLat, transform } from "ol/proj";
import Draw from "ol/interaction/Draw";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import "ol/ol.css";
import { defaults as defaultControls } from "ol/control";
import ScaleLine from "ol/control/ScaleLine";
import FullScreen from "ol/control/FullScreen";

import { TimePicker } from "antd";
import { deleteDocumentApi } from "../../services/Project-service";


const projectMonitoringSchema = Yup.object().shape({
  tpmon_date: Yup.string().required("Date is required"),

  tpmon_subject: Yup.string()
    .required("Subject is required")
    .test("not-empty", "Subject cannot be empty", (val) => val?.trim()),

  tpmon_start_time: Yup.string().required("Start time is required"),
  tpmon_end_time: Yup.string()
    .required("End time is required")
    .test("is-greater", "End time must be after start time", function (value) {
      const { tpmon_start_time } = this.parent;
      if (!tpmon_start_time || !value) return true;
      return value > tpmon_start_time; // HH:mm works fine
    }),

  tpmon_members: Yup.string().required("Members are required"),

  tpmon_discussion_points: Yup.string().required(
    "Discussion points are required",
  ),

  tpmon_action_points: Yup.string().required("Action points are required"),
});
const AddEditProjectMonitoring = ({ fetchData, visible, onClose, data }) => {
  const mapInstanceRef = useRef(null);

  const [fileLists, setFileLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const tproj_id = useParams()?.tproj_id;

  const [showMapModal, setShowMapModal] = useState(false);
  const mapRef = useRef(null);

  const lat = 23.297;
  const lon = 77.638;
  const initializeMap = () => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setTarget(null);
      mapInstanceRef.current = null;
    }

    alert("Please click on the map to mark your location.");
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    const esriLayer = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        maxZoom: 18,
      }),
    });
    const map = new Map({
      target: mapRef.current,
      layers: [esriLayer, vectorLayer],
      controls: defaultControls({ attribution: false }).extend([
        new ScaleLine(),
        new FullScreen(),
      ]),
      view: new View({
        // center: fromLonLat([
        //     Number(longitude) || 77.638,
        //     Number(latitude) || 23.297,
        // ]),
        center: fromLonLat([lon, lat]),

        zoom: 6,
      }),
    });

    const draw = new Draw({
      source: vectorSource,
      type: "Point",
    });

    map.addInteraction(draw);

    draw.on("drawend", (evt) => {
      // remove previous features BEFORE draw adds new one
      vectorSource.clear();

      const coords = transform(
        evt.feature.getGeometry().getCoordinates(),
        "EPSG:3857",
        "EPSG:4326",
      );

      setFormData((prev) => ({
        ...prev,
        tpmon_latitude: coords[1],
        tpmon_longitude: coords[0],
      }));
    });

    map.updateSize();
    mapInstanceRef.current = map;
  };

  const [formData, setFormData] = useState({
    tpmon_id: "",
    tpmon_project_id: tproj_id,

    tpmon_date: null,
    tpmon_subject: "",

    tpmon_start_time: null,
    tpmon_end_time: null,

    tpmon_members: "",
    tpmon_discussion_points: "",
    tpmon_action_points: "",

    tpmon_latitude: "",
    tpmon_longitude: "",

    tpmon_status: "",

    tpmon_docs: [],
  });
  const [form] = Form.useForm();

  const handleChange = (name, value) => {
    let updatedData;

    if (name === "tpmon_start_date") {
      // Store YYYY-MM-DD string for DB
      updatedData = { ...formData, [name]: value || null };
    } else {
      updatedData = { ...formData, [name]: value };
    }

    setFormData(updatedData);
  };

  useEffect(() => {
    const loadEditData = async () => {
      setErrors({});

      if (data && Object.keys(data).length > 0) {
        // ---------- FILE MAP ----------
        const fileMap = (data?.documents || []).map((doc, index) => ({
          uid: doc.tdoc_id || index, // ✅ required
          name: doc.name, // ✅ correct key
          status: "done",
          url: doc.full_url, // ✅ must be full_url
        }));

        setFileLists({
          tpmon_docs: fileMap,
        });

        setFormData((prev) => ({
          ...prev,
          tpmon_docs: fileMap,
        }));

        // ---------- FORM DATA ----------
        setFormData({
          tpmon_id: data?.tpmon_id || "",
          tpmon_project_id: data?.tpmon_project_id || tproj_id,

          tpmon_date: data?.tpmon_date || null,
          tpmon_subject: data?.tpmon_subject || "",

          tpmon_start_time: data?.tpmon_start_time || null,
          tpmon_end_time: data?.tpmon_end_time || null,

          tpmon_members: data?.tpmon_members || "",
          tpmon_discussion_points: data?.tpmon_discussion_points || "",
          tpmon_action_points: data?.tpmon_action_points || "",

          tpmon_latitude: data?.tpmon_latitude || "",
          tpmon_longitude: data?.tpmon_longitude || "",

          tpmon_status: data?.tpmon_status || "",

          // tpmon_docs: fileMap?.tpmon_docs ||a [],
        });
      } else {
        // ---------- RESET ----------
        setFormData({
          tpmon_id: "",
          tpmon_project_id: tproj_id,

          tpmon_date: null,
          tpmon_subject: "",

          tpmon_start_time: null,
          tpmon_end_time: null,

          tpmon_members: "",
          tpmon_discussion_points: "",
          tpmon_action_points: "",

          tpmon_latitude: "",
          tpmon_longitude: "",

          tpmon_status: "",

          tpmon_docs: [],
        });

        setFileLists({
          tpmon_docs: [],
        });

        form.resetFields();
      }
    };

    loadEditData();
  }, [data?.tpmon_id]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // ✅ DIRECT VALIDATION HERE (no separate method)
      await projectMonitoringSchema.validate(formData, {
        abortEarly: false,
      });

      // ✅ CLEAR ERRORS IF VALID
      setErrors({});

      const payload = new FormData();

      // ---------------- APPEND FORM DATA ----------------
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== "tpmon_docs") {
          payload.append(key, value);
        }
      });

      // ---------------- ENSURE PROJECT ID ----------------
      // payload.append("tpmon_project_id", formData.tpmon_project_id || tproj_id);

      // ---------------- FILE UPLOAD ----------------
      if (Array.isArray(formData.tpmon_docs)) {
        formData.tpmon_docs.forEach((file) => {
          if (file?.originFileObj) {
            payload.append("tpmon_docs", file.originFileObj);
          }
        });
      }

      // ---------------- API CALL ----------------
      const res = await projectMonitoringCreateUpdateApi(payload);

      if (res?.status) {
        toast.success(res.message);
        fetchData();
        onClose();
      } else {
        toast.error(res?.message || "Failed to save data");
      }
    } catch (err) {
      // ✅ HANDLE YUP VALIDATION ERRORS
      if (err.inner) {
        const fieldErrors = {};
        err.inner.forEach((e) => {
          fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);
      }

      // ✅ OTHER ERRORS
      else {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Something went wrong",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<>{`${data?.tpmon_id ? "Update" : "Add"} Project Monitoring`}</>}
      style={{ top: 40 }}
      open={visible}
      onOk={handleSubmit}
      confirmLoading={loading}
      onCancel={onClose}
      maskClosable={false}
      width={"90%"}
      okText={data?.tpmon_id ? "Update" : "Submit"}
      cancelText="Close"
    >
      {/* <Form layout="vertical"> */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          tevnt_participating_organizations: [
            { org_name: "", org_details: "" },
          ],
        }}
      >
        <Row gutter={[8, 16]}>
          {/* Date */}
          <Col span={8}>
            <Form.Item label="Date">
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select Date"
                value={formData.tpmon_date ? dayjs(formData.tpmon_date) : null}
                onChange={(date, dateString) =>
                  handleChange("tpmon_date", dateString)
                }
              />
            </Form.Item>
            {errors?.tpmon_date && (
              <div className="text-danger">{errors.tpmon_date}</div>
            )}
          </Col>

          {/* Subject */}
          <Col span={8}>
            <Form.Item label="Subject">
              <Input
                placeholder="Enter Subject"
                value={formData.tpmon_subject}
                onChange={(e) => handleChange("tpmon_subject", e.target.value)}
              />
            </Form.Item>
            {errors?.tpmon_subject && (
              <div className="text-danger">{errors.tpmon_subject}</div>
            )}
          </Col>

          {/* Start Time */}
          <Col span={8}>
            <Form.Item label="Start Time">
              <TimePicker
                style={{ width: "100%" }}
                format="HH:mm"
                value={
                  formData.tpmon_start_time
                    ? dayjs(formData.tpmon_start_time, "HH:mm")
                    : null
                }
                onChange={(time) =>
                  handleChange(
                    "tpmon_start_time",
                    time ? dayjs(time).format("HH:mm:ss") : null,
                  )
                }
              />
            </Form.Item>
            {errors?.tpmon_start_time && (
              <div className="text-danger">{errors.tpmon_start_time}</div>
            )}
          </Col>

          {/* End Time */}
          <Col span={8}>
            <Form.Item label="End Time">
              <TimePicker
                style={{ width: "100%" }}
                format="HH:mm"
                value={
                  formData.tpmon_end_time
                    ? dayjs(formData.tpmon_end_time, "HH:mm")
                    : null
                }
                onChange={(time) =>
                  handleChange(
                    "tpmon_end_time",
                    time ? dayjs(time).format("HH:mm:ss") : null,
                  )
                }
              />
            </Form.Item>
            {errors?.tpmon_end_time && (
              <div className="text-danger">{errors.tpmon_end_time}</div>
            )}
          </Col>

          {/* Members */}
          <Col span={8}>
            <Form.Item label="Members">
              <Input
                placeholder="Enter Members (comma separated)"
                value={formData.tpmon_members || ""}
                onChange={(e) => handleChange("tpmon_members", e.target.value)}
              />
            </Form.Item>
            {errors?.tpmon_members && (
              <div className="text-danger">{errors.tpmon_members}</div>
            )}
          </Col>

          {/* Discussion Points */}
          <Col span={12}>
            <Form.Item label="Discussion Points">
              <Input.TextArea
                rows={3}
                placeholder="Enter discussion points"
                value={formData.tpmon_discussion_points}
                onChange={(e) =>
                  handleChange("tpmon_discussion_points", e.target.value)
                }
              />
            </Form.Item>
            {errors?.tpmon_discussion_points && (
              <div className="text-danger">
                {errors.tpmon_discussion_points}
              </div>
            )}
          </Col>

          {/* Action Points */}
          <Col span={12}>
            <Form.Item label="Action Points">
              <Input.TextArea
                rows={3}
                placeholder="Enter action points"
                value={formData.tpmon_action_points}
                onChange={(e) =>
                  handleChange("tpmon_action_points", e.target.value)
                }
              />
            </Form.Item>
            {errors?.tpmon_action_points && (
              <div className="text-danger">{errors.tpmon_action_points}</div>
            )}
          </Col>

          <Col span={4}>
            <Button
              type="primary"
              icon={<EnvironmentOutlined />}
              onClick={() => setShowMapModal(true)}
              block
              style={{ marginTop: 30 }}
            >
              Location
            </Button>
          </Col>

          {/* Latitude */}
          <Col span={4}>
            <Form.Item label="Latitude">
              <Input
                placeholder="Latitude"
                value={formData.tpmon_latitude}
                onChange={(e) => handleChange("tpmon_latitude", e.target.value)}
              />
            </Form.Item>
            {errors?.tpmon_latitude && (
              <div className="text-danger">{errors.tpmon_latitude}</div>
            )}
          </Col>

          {/* Longitude */}
          <Col span={4}>
            <Form.Item label="Longitude">
              <Input
                placeholder="Longitude"
                value={formData.tpmon_longitude}
                onChange={(e) =>
                  handleChange("tpmon_longitude", e.target.value)
                }
              />
            </Form.Item>
            {errors?.tpmon_longitude && (
              <div className="text-danger">{errors.tpmon_longitude}</div>
            )}
          </Col>
        </Row>

        <Row gutter={[8, 16]}>
          <Col span={12}>
            <label htmlFor="doct_profile_photo" className="form-label">
              Document Upload {/* <span className="text-danger"> *</span> */}
              <Tooltip title="Supported formats: JPG, JPEG, PNG, WebP.">
                <InfoCircleOutlined
                  style={{
                    color: "#1890ff",
                    marginLeft: 8,
                    cursor: "pointer",
                  }}
                />
              </Tooltip>{" "}
            </label>
            <br />

            <div
              style={{
                width: "100%",
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #d9d9d9",
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "#fff",
              }}
            >
              <Upload
                fileList={fileLists?.tpmon_docs || []}
                multiple
                beforeUpload={(file) => {
            const allowedTypes = [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "image/jpeg",
              "image/jpg",
              "image/png"
            ];

            const isValidType = allowedTypes.includes(file.type);
            if (!isValidType) {
              toast.error("Invalid file format");
              return Upload.LIST_IGNORE;
            }

            const isLt15MB = file.size / 1024 / 1024 < 15;
            if (!isLt15MB) {
              toast.error("File must be smaller than 15MB");
              return Upload.LIST_IGNORE;
            }

            return false; // stop auto upload
          }}



                onChange={({ fileList }) => {
                  setFileLists((prev) => ({
                    ...prev,
                    tpmon_docs: fileList,
                  }));

                  // ✅ always array
                  handleChange("tpmon_docs", fileList);
                }}


                showUploadList={{ showRemoveIcon: false }}

                
                itemRender={(originNode, file, currFileList) => (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>{originNode}</div>

                    <Popconfirm
                title="Delete?"
                onConfirm={async () => {
                 

                 const fieldValue = formData.tpmon_docs;
                 console.log('------------',fieldValue);
                 

                                                                    if (fieldValue?.tdoc_id) {
                                                                        try {
                                                                            await deleteDocumentApi({ tdoc_id: fieldValue.tdoc_id });
                                                                            toast.success("Document deleted successfully");
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            toast.error("Failed to delete document");
                                                                            return;
                                                                        }
                                                                    }

                  const updatedList = currFileList.filter((f) => f.uid !== file.uid);
                  setFileLists((prev) => ({
                    ...prev,
                    tpmon_docs: updatedList,
                  }));
                  handleChange("tpmon_docs", updatedList);
                }}
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
                  </div>
                )}
              >
                <Button icon={<UploadOutlined />}>Choose File</Button>
              </Upload>
            </div>

            {errors?.tpmon_docs && (
              <div className="error text-danger">{errors?.tpmon_docs}</div>
            )}
          </Col>
        </Row>
      </Form>

      <Modal
        open={showMapModal}
        onCancel={() => setShowMapModal(false)}
        footer={null}
        width={800}
        centered
        afterOpenChange={(open) => open && initializeMap()}
      >
        <Typography.Title level={5}>Location Preview</Typography.Title>

        <div ref={mapRef} style={{ width: "100%", height: "450px" }} />
      </Modal>
    </Modal>
  );
};

export default AddEditProjectMonitoring;
