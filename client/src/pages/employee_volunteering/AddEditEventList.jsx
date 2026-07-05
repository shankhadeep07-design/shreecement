import {
  Modal,
  Form,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Upload,
  Button,
  Divider,
  Card
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useState ,useRef } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";


import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import Draw from "ol/interaction/Draw";
import { fromLonLat, transform } from "ol/proj";
import { defaults as defaultControls, ScaleLine, FullScreen } from "ol/control";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import Geocoder from "ol-geocoder";

/* ================= API SERVICES ================= */
import {
  createEventApi,
  updateEventApi,
  fetchEventDetailsApi
} from "../../services/Event-service";
import { getAllStateApi } from "../../services/State-service";
import { fetchDistrictsByStateIds } from "../../services/Master-service";
import { single_block_by_district_id_api } from "../../services/Block-service";
import {
  getAllSdgApi,
  getAllScheduleSevenApi,
  getAllSubScheduleSevenApi,
  getAllThemeApi
} from "../../services/PriorityAlignment-service";
import { fetchNgoListApi } from "../../services/Ngo-service";

const { RangePicker } = DatePicker;

const combineDateTime = (date, time) => {
  if (!date || !time) return null;
  return new Date(`${date}T${time}`);
};

/* ================= COMMON REGEX ================= */

// No only spaces, must start with letter, allow letters + space + dot + comma + - + '
const TEXT_REGEX = /^[A-Za-z].*$/;

// Indian Mobile Number (10 digit, starts with 6-9)
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const eventValidationSchema = Yup.object().shape({
  /* ================= BASIC ================= */
  // tevent_domain: Yup.string().required("Domain is required"),

  tevent_activity_title: Yup.string()
    .trim()
    .required("Activity title is required")
    .matches(TEXT_REGEX, "Invalid title (no special characters at start)"),

  tevent_activity_description: Yup.string()
    .trim()
    .required("Activity description is required")
    .matches(TEXT_REGEX, "Invalid description (no special characters at start)"),
    

  // tevent_expected_impact: Yup.string().trim().required("Expected impact is required"),

  /* ================= NGO & MODE ================= */
  tevent_ngo_id: Yup.string().required("NGO partner is required"),

  tevent_mode: Yup.string().required("Mode of event is required"),
  tevent_theme_id: Yup.string().required("CSR Thematic Area is required"),

  tevent_event_link: Yup.string().when("tevent_mode", {
    is: (mode) => mode === "virtual",
    then: () =>
      Yup.string()
        .url("Enter a valid URL")
        .required("Event link is required"),
    otherwise: () => Yup.string().nullable(),
  }),

  /* ================= COMPLIANCE ================= */
  tevent_schedule_vii: Yup.string().required("Schedule VII is required"),

  tevent_sub_schedule: Yup.string().required("Sub Schedule is required"),

  tevent_sdgs_id: Yup.array()
    .min(1, "At least one SDG must be selected")
    .required("SDG is required"),

  tevent_volunteer_roles: Yup.string()
    .trim()
    .required("Volunteer roles are required")
     .matches(TEXT_REGEX, "Invalid roles (no special characters at start)"),

  /* ================= LOCATION ================= */
  tevent_state_id: Yup.string().required("State is required"),
  tevent_district_id: Yup.string().required("District is required"),
  tevent_block_id: Yup.string().required("Sub-district is required"),

  tevent_village: Yup.string().trim().nullable().matches(TEXT_REGEX, "Invalid village name (no special characters at start)"),
  tevent_location: Yup.string().trim().nullable().matches(TEXT_REGEX, "Invalid location name (no special characters at start)"),
  tevent_gps_latitude: Yup.number()
  .typeError("Latitude must be a valid number")
  .min(-90, "Latitude must be >= -90")
  .max(90, "Latitude must be <= 90")
  .when("tevent_mode", {
    is: (mode) => mode == "in_person",
    then: (schema) => schema.required("Latitude is required"),
    otherwise: (schema) => schema.nullable(),
  }),

tevent_gps_longitude: Yup.number()
  .typeError("Longitude must be a valid number")
  .min(-180, "Longitude must be >= -180")
  .max(180, "Longitude must be <= 180")
  .when("tevent_mode", {
    is: (mode) => mode == "in_person",
    then: (schema) => schema.required("Longitude is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  
  /* ================= ORGANIZATION ================= */
  // tevent_org_type: Yup.string().required("Organization type is required"),
  // tevent_bu: Yup.string().required("Business unit is required"),

  /* ================= SCHEDULE ================= */
    tevent_start_date: Yup.string()
      .required("Start date is required"),

    tevent_start_time: Yup.string()
      .required("Start time is required"),

    tevent_end_date: Yup.string()
      .required("End date is required")
      .test(
        "end-date-after-start",
        "End date & time must be greater than start date & time",
        function (endDate) {
          const { tevent_start_date, tevent_start_time, tevent_end_time } = this.parent;

          const startDateTime = combineDateTime(
            tevent_start_date,
            tevent_start_time
          );

          const endDateTime = combineDateTime(
            endDate,
            tevent_end_time
          );

          if (!startDateTime || !endDateTime) return true;

          return endDateTime > startDateTime;
        }
      ),

    tevent_end_time: Yup.string()
      .required("End time is required")
      .test(
        "end-time-after-start",
        "End date & time must be greater than start date & time",
        function (endTime) {
          const { tevent_start_date, tevent_start_time, tevent_end_date } = this.parent;

          const startDateTime = combineDateTime(
            tevent_start_date,
            tevent_start_time
          );

          const endDateTime = combineDateTime(
            tevent_end_date,
            endTime
          );

          if (!startDateTime || !endDateTime) return true;

          return endDateTime > startDateTime;
        }
      ),
  /* ================= VOLUNTEERS ================= */
  tevent_volunteers_needed: Yup.number()
    .typeError("Enter a valid number")
    .positive("Must be greater than zero")
    .required("Volunteers count is required")
    .min(1, "Must be at least 1 volunteer"),

  tevent_family_participation: Yup.string().required(
    "Family participation is required"
  ),
  tevent_family_members_count: Yup.number().when(
    "tevent_family_participation",
    {
      is: "yes",
      then: () =>
        Yup.number()
          .typeError("Enter a valid number")
          .positive("Must be greater than zero")
          .required("Family members count is required"),
      otherwise: () => Yup.number().nullable(),
    }
  ),

  /* ================= CONTACT ================= */
  tevent_contact_person: Yup.string()
    .trim()
    .nullable()
    .matches(TEXT_REGEX, "Invalid name (no special characters at start)")
    .notRequired(),

  tevent_contact_email: Yup.string()
    .trim()
    .nullable()
    .email("Enter a valid email address")
    .notRequired(),

  tevent_partner_contact: Yup.string()
    .trim()
    .nullable()
    .matches(INDIAN_MOBILE_REGEX, "Enter valid Indian mobile number (10 digits, start with 6-9)")
    .notRequired(),

  /* ================= VEHICLE ================= */
  tevent_vehicle_arrangement: Yup.string().required(
    "Vehicle arrangement is required"
  ),

  /* ================= DOCUMENT ================= */
  tevent_flyer: Yup.array().min(1, "At least one flyer document is required"),
});

/* ================================================= */
const AddEditEventList = ({ visible, onClose, data, fetchData }) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /* ============== MASTER DATA ============== */
  const [stateOptions, setStateOptions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [sdgs, setSdgs] = useState([]);
  const [scheduleSeven, setScheduleSeven] = useState([]);
  const [subScheduleSeven, setSubScheduleSeven] = useState([]);
  const [ngoList, setNgoList] = useState([]);
  const [themes, setThemes] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  

  /* ============== FORM DATA ============== */
  const [formData, setFormData] = useState({
    tevent_domain: "",
    tevent_activity_title: "",
    tevent_activity_description: "",
    tevent_expected_impact: "",

    tevent_ngo_id: "",
    tevent_mode: "",
    tevent_event_link: "",
    tevent_theme_id: "",

    tevent_schedule_vii: "",
    tevent_sub_schedule: "",
    tevent_sdgs_id: [],
    tevent_volunteer_roles: "",

    tevent_state_id: "",
    tevent_district_id: "",
    tevent_block_id: "",
    tevent_village: "",
    tevent_location: "",
    tevent_map_location: "",
    tevent_gps_latitude: "",
    tevent_gps_longitude: "",

    tevent_org_type: "",
    tevent_bu: "",

    tevent_start_date: "",
    tevent_end_date: "",
    tevent_start_time: "",
    tevent_end_time: "",

    tevent_volunteers_needed: "",
    tevent_family_participation: "",
    tevent_family_members_count: 0,

    tevent_partner_contact: "",
    tevent_contact_person: "",
    tevent_contact_details: "",

    tevent_vehicle_arrangement: "",
    tevent_flyer: []
  });

    const [errors, setErrors] = useState({});

const sanitizeFirstChar = (value) => {
  if (value.length > 0 && !/^[A-Za-z0-9]/.test(value.charAt(0))) {
    return value.substring(1);
  }
  return value;
};

  /* ============== HANDLE CHANGE ============== */
  const handleChange = (name, value) => {


   

    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "tevent_state_id") {
      fetchDistrictsByStateIds(value)
        .then(res => setDistricts(res?.data || []));
    }

    if (name === "tevent_district_id") {
      single_block_by_district_id_api(value)
        .then(res => setBlocks(res?.data || []));
    }

    if (name === "tevent_schedule_vii") {
      getAllSubScheduleSevenApi({ schedule_id: value })
        .then(res => setSubScheduleSeven(res?.data || []));
    }

    if (name === "tevent_family_participation" && value === "no") {
      setFormData(prev => ({ ...prev, tevent_family_members_count: 0 }));
    }
  };

  /* ============== SUBMIT ============== */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      console.log("Form Data Submitted:", formData);

      // ✅ YUP VALIDATION
      await eventValidationSchema.validate(formData, {
        abortEarly: false,
      });

      // ✅ Image Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    for (const file of formData.tevent_flyer) {
      if (file.originFileObj) {
        const isValidType = allowedTypes.includes(file.originFileObj.type);

        if (!isValidType) {
          toast.error("Only JPG, PNG, WEBP images are allowed");
          setLoading(false);
          return;
        }

        const isLessThan2MB = file.originFileObj.size / 1024 / 1024 < 2;

        if (!isLessThan2MB) {
          toast.error("Image must be smaller than 2MB");
          setLoading(false);
          return;
        }
      }
    }

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) return;
        payload.set(key, value ?? "");
      });

      formData.tevent_sdgs_id.forEach(id =>
        payload.append("tevent_sdgs_id[]", id)
      );

      formData.tevent_flyer.forEach(file => {
        if (file.originFileObj) {
          payload.append("tevent_flyer", file.originFileObj);
        }
      });

      //   console.log("Payload Data:",payload);return

      const res = data?.tevent_id
        ? await updateEventApi(payload, data.tevent_id)
        : await createEventApi(payload);

      if (res?.status) {
        toast.success(res.message);
        fetchData();
        onClose();
      } else {
        toast.error(res.message);
      }

    } catch (err) {
      if (err.name === "ValidationError") {
        // err.errors.forEach((msg) => toast.error(msg));

        const fieldErrors = {};
        err.inner.forEach(e => {
          fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);

        console.log("Validation Errors:", errors);

      } else {
        toast.error("Failed to save event");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ============== EDIT MODE ============== */
  useEffect(() => {
    if (!data?.tevent_id) return;

    fetchEventDetailsApi(data.tevent_id).then((res) => {
      const d = res?.data;
      if (!d) return;

      const mapped = {
        ...d,

        // SDGs: string → array
        tevent_sdgs_id: d.tevent_sdgs_id
          ? d.tevent_sdgs_id.split(",")
          : [],

        // 🔥 Documents → AntD Upload format
        tevent_flyer: (d.documents || []).map((doc) => ({
          uid: doc.tdoc_id,          // ✅ stable unique id
          name: doc.doc_name,        // ✅ correct key
          status: "done",
          url: doc.full_url,         // ✅ preview/download
          type: doc.doc_type,
        })),
      };

      setFormData(mapped);

      if (mapped.tevent_state_id) {
        fetchDistrictsByStateIds(mapped.tevent_state_id).then((res) =>
          setDistricts(res?.data || [])
        );
      }

      if (mapped.tevent_district_id) {
        single_block_by_district_id_api(mapped.tevent_district_id).then((res) =>
          setBlocks(res?.data || [])
        );
      }

      if (mapped.tevent_schedule_vii) {
        getAllSubScheduleSevenApi({
          schedule_id: mapped.tevent_schedule_vii,
        }).then((res) => setSubScheduleSeven(res?.data || []));
      }
    });
  }, [data?.tevent_id]);


  /* ============== LOAD MASTERS ============== */
  useEffect(() => {
    getAllStateApi().then(res => setStateOptions(res?.data || []));
    getAllSdgApi().then(res => setSdgs(res?.data || []));
    getAllScheduleSevenApi().then(res => setScheduleSeven(res?.data || []));
    fetchNgoListApi().then(res =>
      setNgoList(
        (res?.data || []).map(n => ({
          label: n.tngo_name,
          value: n.tngo_id
        }))
      )
    );

    getAllThemeApi()
                .then((res) => {
                    setThemes(res?.data);
                })
                .catch((error) => toast.error(error?.response?.data?.message));
  }, []);

  /* ============== RENDER ============== */

   const lat = 23.297;
      const lon = 77.638;
      const initializeMap = () => {
          if (!mapRef.current) return;
  
          if (mapInstanceRef.current) {
              mapInstanceRef.current.setTarget(null);
              mapInstanceRef.current = null;
          }
  
          const vectorSource = new VectorSource();
          const vectorLayer = new VectorLayer({
              source: vectorSource,
          });
  
          const esriLayer = new TileLayer({
              source: new XYZ({
                  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
                  maxZoom: 12,
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
                  center: fromLonLat([lon, lat]),
                  zoom: 4,
              }),
          });
  
          /* =============================
             DRAW INTERACTION
          ==============================*/
          const draw = new Draw({
              source: vectorSource,
              type: "Point",
          });
  
          map.addInteraction(draw);
  
          draw.on("drawend", (evt) => {
              vectorSource.clear();
  
              const coords = transform(
                  evt.feature.getGeometry().getCoordinates(),
                  "EPSG:3857",
                  "EPSG:4326"
              );
  
              setFormData((prev) => ({
                  ...prev,
                  tevent_gps_latitude: coords[1],
                  tevent_gps_longitude: coords[0],
              }));
          });
  
          /* =============================
             AUTO SUGGEST SEARCH
          ==============================*/
          const geocoder = new Geocoder("nominatim", {
              provider: "osm",
              lang: "en",
              placeholder: "Search location...",
              limit: 5,
              autoComplete: true,
              keepOpen: false,
              countrycodes: "in", // restrict to India
          });
  
          map.addControl(geocoder);
  
          geocoder.on("addresschosen", function (evt) {
              const coords = transform(
                  evt.coordinate,
                  "EPSG:3857",
                  "EPSG:4326"
              );
  
              vectorSource.clear();
  
              const feature = new Feature({
                  geometry: new Point(fromLonLat([coords[0], coords[1]])),
              });
  
              vectorSource.addFeature(feature);
  
              map.getView().setCenter(evt.coordinate);
              map.getView().setZoom(14);
  
              setFormData((prev) => ({
                  ...prev,
                  tevent_gps_latitude: coords[1],
                  tevent_gps_longitude: coords[0],
              }));
          });
  
          map.updateSize();
          mapInstanceRef.current = map;

          setTimeout(() => {
            map.updateSize();
          }, 200);
      };
  

  return (

    <>
    <Modal
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit} className="csr-volunteering-section"
      confirmLoading={loading} 
      width="90%"
      title={`${data?.tevent_id ? "Update" : "Add"} CSR Event`}
    >

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
   
        {/* ================= BASIC DETAILS ================= */}
        <div className="card shadow-sm mt-3">
          <div className="card-header common-header">
            <h6>Basic Activity Details</h6>
          </div>
          <div className="card-body">
            <Row gutter={16}>
              {/* <Col span={8}>
                <Form.Item label="Domain Name" required>
                  <Select
                    placeholder="Select Domain"
                    value={formData.tevent_domain}
                    options={[
                      { label: "Coro Arogya (Healthcare)", value: "coro_arogya" },
                      { label: "Coro Vidya (Education)", value: "coro_vidya" },
                      { label: "Coro Vikas (Rural Development & Livelihood)", value: "coro_vikas" },
                      { label: "Environmental Sustainability", value: "environment" },
                      { label: "Others", value: "others" },
                    ]}
                    onChange={(val) => handleChange("tevent_domain", val)}
                  />
                  {errors.tevent_domain && (
                    <span className="text-danger small">{errors.tevent_domain}</span>
                  )}
                </Form.Item>
              </Col> */}

              <Col span={8}>
                <Form.Item label="Activity Title" required>
                  <Input
                    value={formData.tevent_activity_title}
                    onChange={(e) => handleChange("tevent_activity_title", sanitizeFirstChar(e.target.value))}
                  />
                  {errors.tevent_activity_title && (
                    <span className="text-danger small">{errors.tevent_activity_title}</span>
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Activity Description" required>
                  <Input.TextArea
                    rows={1}
                    value={formData.tevent_activity_description}
                    onChange={(e) =>
                      handleChange("tevent_activity_description", sanitizeFirstChar(e.target.value))
                    }
                  />
                   {errors.tevent_activity_description && (
                    <span className="text-danger small">{errors.tevent_activity_description}</span>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>

        <div className="card shadow-sm mt-3">
          <div className="card-header common-header">
            <h6>Partner & Mode</h6>
          </div>
          <div className="card-body">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="NGO Partner" required>
                  <Select
                    placeholder="Select NGO"
                    value={formData.tevent_ngo_id}
                    options={ngoList}
                    onChange={(val) => handleChange("tevent_ngo_id", val)}
                  />
                  {errors.tevent_ngo_id && (
                    <span className="text-danger small">
                      {errors.tevent_ngo_id}
                    </span>
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Type of Volunteering" required>
                  
                  <Select
                    value={formData.tevent_mode}
                    options={[
                      { label: "In-person", value: "in_person" },
                      { label: "Virtual", value: "virtual" },
                      { label: "Hybrid", value: "hybrid" },
                    ]}
                    onChange={(val) => handleChange("tevent_mode", val)}
                  />
                   {errors.tevent_mode && (
                      <span className="text-danger small">
                        {errors.tevent_mode}                      </span>
                    )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                    label="CSR Thematic Area"
                    name="tevent_theme_id"
                    rules={[{ required: true, message: "Theme is required" }]}
                >
                    <Select
                        placeholder="Select Theme"
                        showSearch
                        options={themes}
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                        onChange={(val) => handleChange("tevent_theme_id", val)}
                        filterOption={(input, option) =>
                            option?.label?.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                      {errors.tevent_theme_id && (
                          <span className="text-danger small">
                            {errors.tevent_theme_id}
                          </span>
                        )}



                </Form.Item>
              </Col>

              

              {(formData.tevent_mode === "virtual" || formData.tevent_mode === "hybrid") && (
                  <Col span={8}>
                    <Form.Item label="Event Link" required={formData.tevent_mode === "virtual"}>
                      <Input
                        value={formData.tevent_event_link}
                        onChange={(e) =>
                          handleChange("tevent_event_link", e.target.value)
                        }
                      />
                      {errors.tevent_event_link && (
                          <span className="text-danger small">
                            {errors.tevent_event_link}
                          </span>
                        )}
                    </Form.Item>
                  </Col>
                )}
            </Row>
          </div>
        </div>
        <div className="card shadow-sm mt-3">
          <div className="card-header common-header">
            <h6>Impact & Compliance</h6>
          </div>
          <div className="card-body">
            <Row gutter={16}>
              {/* <Col span={8}>
                <Form.Item label="Expected Impact" required>
                  <Input.TextArea
                    rows={1}
                    value={formData.tevent_expected_impact}
                    onChange={(e) =>
                      handleChange("tevent_expected_impact", e.target.value)
                    }
                  />
                   {errors.tevent_expected_impact && (
                    <span className="text-danger small">
                      {errors.tevent_expected_impact}
                    </span>
                  )}
                </Form.Item>
              </Col> */}

              <Col span={8}>
                <Form.Item label="Schedule VII" required>
                  <Select
                    value={formData.tevent_schedule_vii}
                    options={scheduleSeven}
                    onChange={(val) => handleChange("tevent_schedule_vii", val)}
                  />
                   {errors.tevent_schedule_vii && (
                    <span className="text-danger small">
                      {errors.tevent_schedule_vii}                    </span>
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Sub Schedule" required>
                  <Select
                    value={formData.tevent_sub_schedule}
                    options={subScheduleSeven}
                    onChange={(val) => handleChange("tevent_sub_schedule", val)}
                  />
                  {errors.tevent_sub_schedule && (
                    <span className="text-danger small">
                      {errors.tevent_sub_schedule}
                    </span>
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Linked SDGs" required>
                  <Select
                    mode="multiple"
                    value={formData.tevent_sdgs_id}
                    options={sdgs}
                    onChange={(val) => handleChange("tevent_sdgs_id", val)}
                  />
                  {errors.tevent_sdgs_id && (
                    <span className="text-danger small">
                      {errors.tevent_sdgs_id}
                    </span>
                  )}
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Volunteer Roles & Responsibilities" required>
                  <Input.TextArea
                    rows={1}
                    value={formData.tevent_volunteer_roles}
                    onChange={(e) =>
                      handleChange("tevent_volunteer_roles", sanitizeFirstChar(e.target.value))
                    }
                  />
                   {errors.tevent_volunteer_roles && (
                    <span className="text-danger small">
                      {errors.tevent_volunteer_roles}
                    </span>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
        <div className="card shadow-sm mt-3">
          <div className="card-header common-header">
            <h6>Location Details</h6>
          </div>
          <div className="card-body">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="State" required>
                  <Select
                    placeholder="Select State"
                    value={formData.tevent_state_id}
                    options={stateOptions}
                    onChange={(val) => handleChange("tevent_state_id", val)}
                  />
                    {errors.tevent_state_id && (
                    <span className="text-danger small">
                      {errors.tevent_state_id}
                    </span>
                  )}
                  </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="District" required>
                  <Select
                    placeholder="Select District"
                    value={formData.tevent_district_id}
                    options={districts}
                    onChange={(val) => handleChange("tevent_district_id", val)}
                  />
                  {errors.tevent_district_id && (
                    <span className="text-danger small">
                      {errors.tevent_district_id}                    </span>
                  )}
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Block" required>
                  <Select
                    placeholder="Block"
                    value={formData.tevent_block_id}
                    options={blocks}
                    onChange={(val) => handleChange("tevent_block_id", val)}
                  />
                  {errors.tevent_block_id && (
                    <span className="text-danger small">
                      {errors.tevent_block_id}                    </span>
                  )}
                </Form.Item>
              </Col>

            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>

              <Col span={8}>
                <Input
                  placeholder="Village"
                  value={formData.tevent_village}
                  onChange={(e) => handleChange("tevent_village", sanitizeFirstChar(e.target.value))}
                />
              </Col>

              <Col span={8}>
                <Input
                  placeholder="Location / Venue"
                  value={formData.tevent_location}
                  onChange={(e) => handleChange("tevent_location", sanitizeFirstChar(e.target.value))}
                />
              </Col>

              <Col span={8}>
                {/* <Input
                  placeholder="Google Map Location"
                  value={formData.tevent_map_location}
                  onChange={(e) => handleChange("tevent_map_location", sanitizeFirstChar(e.target.value))}
                /> */}
                               

              </Col>
            </Row>
             <Row gutter={16} style={{ marginTop: 16 }}>

              <Col span={4}>
                   <button
                                                    type="button"
                                                    className="btn btn-primary px-2 form-control"
                                                    onClick={() => setShowMapModal(true)}
                                                >
                                                    Pick Location
                                                </button>
              </Col>
              <Col span={8}>
                  <input
                                                        type="text"
                                                        className="form-control"
                                                        name="tevent_gps_latitude"
                                                        id="tevent_gps_latitude"
                                                        value={formData.tevent_gps_latitude || ""}
                                                       
                                                        onChange={(e) => handleChange("tevent_gps_latitude", e.target.value)}
                                                        placeholder="Enter Latitude"
                                                        readOnly
                                                    />
                                                    {errors?.tevent_gps_latitude && <div className="error text-danger">{errors.tevent_gps_latitude}</div>}
              </Col>
              <Col span={8}>
                   <input
                    type="text"
                    className="form-control"
                    name="tevent_gps_longitude"
                    id="tevent_gps_longitude"
                    value={formData.tevent_gps_longitude || ""}
                    onChange={(e) => handleChange("tevent_gps_longitude", e.target.value)}
                    placeholder="Enter Longitude"
                    readOnly
                />
                {errors?.tevent_gps_longitude && <div className="error text-danger">{errors.tevent_gps_longitude}</div>}
              </Col>
              </Row>
          </div>
        </div>

        <div className="card shadow-sm mt-3">
          <div className="card-header common-header">
            <h6>Schedule</h6>
          </div>
          <div className="card-body">
            <Row gutter={16} className="pt-2">
              <Col span={8}>
                <RangePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf("day");
                  }}
                  value={
                    formData.tevent_start_date && formData.tevent_end_date
                      ? [
                          dayjs(formData.tevent_start_date),
                          dayjs(formData.tevent_end_date),
                        ]
                      : []
                  }
                  onChange={(d, s) => {
                    handleChange("tevent_start_date", s[0]);
                    handleChange("tevent_end_date", s[1]);
                  }}
                />

                {
                  (errors.tevent_start_date || errors.tevent_end_date) && (
                    <span className="text-danger small">  
                      {errors.tevent_start_date || errors.tevent_end_date}
                    </span>
                  )
                }
              </Col>

              <Col span={8}>
                <TimePicker
                  placeholder="Start time"
                  use12Hours
                  format="hh:mm A"
                  style={{ width: "100%" }}
                  value={
                    formData.tevent_start_time
                      ? dayjs(formData.tevent_start_time, "HH:mm:ss")
                      : null
                  }
                  onChange={(t) =>
                    handleChange("tevent_start_time", t ? t.format("HH:mm:ss") : "")
                  }
                />

                {
                  errors.tevent_start_time && (
                    <span className="text-danger small">
                      {errors.tevent_start_time}
                    </span>
                  )
                }
              </Col>

              <Col span={8}>
                <TimePicker
                placeholder="End time"
                  use12Hours
                  format="hh:mm A"
                  style={{ width: "100%" }}
                  value={
                    formData.tevent_end_time
                      ? dayjs(formData.tevent_end_time, "HH:mm:ss")
                      : null
                  }
                  onChange={(t) =>
                    handleChange("tevent_end_time", t ? t.format("HH:mm:ss") : "")
                  }
                />
                {
                  errors.tevent_end_time && (
                    <span className="text-danger small">
                      {errors.tevent_end_time}
                    </span>
                  )
                }
              </Col>
            </Row>
          </div>
        </div>

        {/* ================= VOLUNTEERS ================= */}
        <div className="card shadow-sm mt-3">
          <div className="card-header common-header">
            <h6>Volunteers</h6>
          </div>
          <div className="card-body">
            <Row gutter={16} className="pt-1">
              <Col span={6}>
                <Form.Item label="Number of Volunteers Needed" required>
                  <Input
                    type="number"
                    placeholder="Number of Volunteers Needed"
                    value={formData.tevent_volunteers_needed}
                    onChange={(e) =>
                      handleChange("tevent_volunteers_needed", e.target.value)
                    }
                  />

                   {
                    errors.tevent_volunteers_needed && (
                      <span className="text-danger small">
                        {errors.tevent_volunteers_needed}
                      </span>
                    )
                  }
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Family Participation" required>
                  <Select
                    placeholder="Family Participation?"
                    value={formData.tevent_family_participation}
                    options={[
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                    ]}
                    onChange={(val) =>
                      handleChange("tevent_family_participation", val)
                    }
                  />
                    {
                      errors.tevent_family_participation && (
                        <span className="text-danger small">
                          {errors.tevent_family_participation}
                        </span>
                      )
                    }
                  </Form.Item>
              </Col>

              {formData.tevent_family_participation === "yes" && (
                <Col span={6}>
                  <Form.Item label="Family Members Count">
                    <Input
                      type="number"
                      placeholder="Family Members Count"
                      value={formData.tevent_family_members_count}
                      onChange={(e) =>
                        handleChange("tevent_family_members_count", e.target.value)
                      }
                    />

                    {
                      errors.tevent_family_members_count && (
                        <span className="text-danger small">
                          {errors.tevent_family_members_count}
                        </span>
                      )
                    }
                  </Form.Item>
                </Col>
              )}
            </Row>
          </div>
        </div>

        {/* ================= CONTACT ================= */}
        <div className="card shadow-sm mt-3">
          <div className="card-header common-header">
            <h6>Contact</h6>
          </div>
          <div className="card-body">
           
            <Row gutter={16} className="pt-2">

              <Col span={8}>
                <Form.Item label="Contact Person Name">
                  <Input
                    placeholder="Enter Contact Person Name"
                    value={formData.tevent_contact_person}
                    onChange={(e) =>
                      handleChange("tevent_contact_person", sanitizeFirstChar(e.target.value))
                    }
                  />
                    {
                      errors.tevent_contact_person && (
                        <span className="text-danger small">
                          {errors.tevent_contact_person}
                        </span>
                      )
                     }
                </Form.Item>

              </Col>

              
              

              <Col span={8}>
                <Form.Item label="Contact Person Email" >
                  <Input
                    placeholder="Enter Contact Person Email"
                    value={formData.tevent_contact_email}
                    onChange={(e) =>
                      handleChange("tevent_contact_email", sanitizeFirstChar(e.target.value))
                    }
                  />
                    {
                      errors.tevent_contact_email && (
                        <span className="text-danger small">  
                          {errors.tevent_contact_email}
                        </span> 
                      )
                    }
                    
                </Form.Item>

              </Col>

              <Col span={8}>
                <Form.Item label="Contact Person Number">
                  <Input
                    placeholder="Enter Contact Person Number"
                    value={formData.tevent_partner_contact}
                    onChange={(e) =>
                      handleChange("tevent_partner_contact", sanitizeFirstChar(e.target.value))
                    }
                  />
                    {
                      errors.tevent_partner_contact && (
                        <span className="text-danger small">
                          {errors.tevent_partner_contact}
                        </span>
                      )
                     }
                    
                </Form.Item>

              </Col>

            </Row>

            {/* ================= VEHICLE ================= */}
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Vehicle Arrangement" required>
                  <Select
                    placeholder="Vehicle Arrangement?"
                    value={formData.tevent_vehicle_arrangement}
                    options={[
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                    ]}
                    onChange={(val) =>
                      handleChange("tevent_vehicle_arrangement", val)
                    }
                  />

                  {
                      errors.tevent_vehicle_arrangement && (
                        <span className="text-danger small">
                          {errors.tevent_vehicle_arrangement}
                        </span>
                      )
                    }
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>

        <div className="card shadow-sm mt-3">
          <div className="card-header common-header">
            <h6>Documents</h6>
          </div>
          <div className="card-body">
            <Row gutter={16} className="pt-2">
              <Col span={6}>
                <Upload
                  accept="image/*"
                  maxCount={1} // ✅ allow only 1 file
                  beforeUpload={() => false}
                  fileList={formData.tevent_flyer}
                  onChange={({ fileList }) =>
                    handleChange("tevent_flyer", fileList)
                  }
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                  }}
                  onPreview={(file) => {
                    if (file.url) {
                      window.open(file.url, "_blank");
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />}>Upload Flyer</Button>
                </Upload>

                 {
                  errors.tevent_flyer && (
                    <span className="text-danger small">
                      {errors.tevent_flyer}
                    </span>
                )}
              </Col>
            </Row>

          </div>
        </div>
      </Form>


    </Modal>




                    <Modal
  open={showMapModal}
  onCancel={() => setShowMapModal(false)}
  footer={null}
  width={1000}
  afterOpenChange={(open) => {
    if (open) {
      setTimeout(() => {
        initializeMap();
      }, 300);
    }
  }}
>
  <div
    ref={mapRef}
    style={{ width: "100%", height: "450px" }}
  />
</Modal>

                    </>
  );
};

export default AddEditEventList;