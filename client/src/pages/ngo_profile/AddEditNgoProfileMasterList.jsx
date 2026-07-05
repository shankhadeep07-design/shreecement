import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    Modal,
    Popconfirm,
    Row,
    Select,
    Tooltip,
    Typography,
    Upload
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { fetchDistrictsListByStateIds, getSubMasterListByMasterSlugApi } from "../../services/Master-service";
import { getAllFactoryApi } from "../../services/MasterData-service";
import { fetchNgoProifleDetailsApi, ngoProfileCreateApi } from "../../services/NgoProfile-service";
import { getAllStateApi } from "../../Services/State-service";



const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;


const SUPPORTED_IMAGE_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/webp",
];

const Schema = Yup.object({
    tngo_name: Yup.string().required("Name is required"),
    tngo_objective: Yup.string().required("Mission and Vision is required"),
    // tngo_factorys: Yup.array().min(1, "At least one area of factory is required"),
    tngo_csr_reg_no: Yup.string().required("CSR Registration Number is required"),
    tngo_category: Yup.string().required("Registration type is required"),
    tngo_email: Yup.string().email("Invalid email").required("Email is required"),
    tngo_contact_no: Yup.string().required("Contact number is required"),
    tngo_target_beneficiaries: Yup.array()
        .min(1, "At least one Target Beneficiary is required")
        .required("Target Beneficiary is required"),

    tngo_pan_no: Yup.string().required("PAN number is required"),
    tngo_twelve_a_registration_number: Yup.string().required("12A Registration Number is required"),

    tngo_fcra_license_is_guaranteed: Yup.string().required("FCRA License Purpose is required"),
    tngo_registered_address: Yup.string().required("Registered Address is required"),
    // tngo_user_id: Yup.string().required("NGO User is required"),
    tngo_logo: Yup.mixed()
        .required("Logo is required"),

    // For state and district (custom validated)
    state_district_blocks: Yup.array()
        .min(1, "At least one state district must be selected")
        .required("State District selection is required"),
});


const AddEditNgoProfileMasterList = ({ visible, onClose, data, fetchData }) => {

    const [factoryOptions, setFactoryOptions] = useState([]);
    const [usersOptions, setUserslOptions] = useState([]);
    const [registrationOptions, setRegistrationOptions] = useState([]);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [formData, setFormData] = useState({
        tngo_id: data?.tngo_id || '',
        tngo_name: '',
        tngo_objective: '',
        tngo_factorys: [],
        tngo_csr_reg_no: '',
        tngo_category: '',
        tngo_email: '',
        tngo_contact_no: '',
        tngo_contact_person: '',
        tngo_contact_person_no: '',
        tngo_target_beneficiaries: [],
        tngo_gst_number: '',
        // tngo_tan_number: '',
        tngo_pan_no: '',
        tngo_twelve_a_registration_number: '',
        tngo_ngo_registration_date: '',
        tngo_fcra_license_is_guaranteed: '',
        tngo_registered_address: '',
        tngo_present_address: '',
        tngo_website: '',

        tngo_litigation_against_org: '',
        tngo_blacklisted: '',
        tngo_associated_political_party: '',
        tngo_anyone_convicted: '',
        tngo_political_founders: '',
        tngo_certified_guidestar: '',
        tngo_certified_credibility_alliance: '',
        tngo_has_ca: '',
        tngo_has_auditor: '',
        tngo_budget_vs_actual: '',
        tngo_challenged_twelve_a: '',
        tngo_registered_darpan: '',
        tngo_file_return_charity: '',
        tngo_has_finance_team: '',

        // tngo_user_id: '',
        tngo_logo: null,
        tngo_csr_certificate: null,
    });

    const [beneficiaryOptions, setBeneficiaryOptions] = useState([]);
    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
    ];

    const [stateOptions, setStateOptions] = useState([]);
    const [districtsOptions, setDistrictsOptions] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [fileLists, setFileLists] = useState([]);


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchSubMasterListByMasterSlug = () => {
        getSubMasterListByMasterSlugApi({ master_slug: "registration_type" })
            .then((data) => {

                const formattedData = data?.data?.map((item) => ({
                    value: item?.tsml_id,
                    label: item?.tsml_sub_master_list_name,
                }));

                setRegistrationOptions(formattedData || []);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError || error?.response?.data?.message
                );
            });
    };

    const handleChange = (name, value) => {

        if (name === "tngo_factorys") {
            setSelectedFactory(value);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    


    const handleValidation = async (data) => {
        try {
            await Schema.validate(data, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {

            // console.log("Validation error:", err);


            const formatted = err.inner?.reduce((acc, curr) => {
                acc[curr.path] = curr.message;
                return acc;
            }, {});
            setErrors(formatted || {});
            return false;
        }
    };

    const fetchAllFactoryList = () => {
        getAllFactoryApi()
            .then((data) => {
                setFactoryOptions(data?.data || []);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError || error?.response?.data?.message
                );
            });
    };

    // const userListRoleSlugWise = (currentUserId = null) => {
    //     // console.log("Fetching users with role slug 'ngo'");

    //     let roleSlug = "ngo";
    //     userListRoleSlugWiseApi(roleSlug)
    //         .then((data) => {

    //             let formattedData = data?.data?.map(user => ({
    //                 value: user?.id,
    //                 label: user?.name
    //             })) || [];

    //             // console.log("formattedData---------- ", formattedData);


    //             fetchNgoUserIDApi().then((res) => {
    //                 // console.log("res", res?.data);
    //                 const ngoUserIds = res?.data?.map(item => item?.tngo_user_id) || [];

    //                 const filteredData = formattedData.filter(user =>
    //                     // !ngoUserIds.includes(String(user.value)) // keep users NOT in tngo_user_id
    //                     !ngoUserIds.includes(user.value) || user.value === String(currentUserId)
    //                 );

    //                 // console.log("filteredData (only users linked to NGOs): ", filteredData);
    //                 setUserslOptions(filteredData || []);
    //             })

    //         })
    //         .catch((error) => {
    //             toast.error(
    //                 error?.response?.data?.originalError || error?.response?.data?.message
    //             );
    //         });
    // };

    const fetchSubMasterListByMasterSlugForTargetBeneficiary = () => {
        getSubMasterListByMasterSlugApi({ master_slug: "target_beneficiary" })
            .then((data) => {

                const formattedData = data?.data?.map((item) => ({
                    value: item?.tsml_id,
                    label: item?.tsml_sub_master_list_name,
                }));

                setBeneficiaryOptions(formattedData || []);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError || error?.response?.data?.message
                );
            });
    };



    useEffect(() => {
        fetchAllFactoryList();
        // userListRoleSlugWise();
        fetchAllState();
        fetchSubMasterListByMasterSlug();
        fetchSubMasterListByMasterSlugForTargetBeneficiary();
    }, []);


    const fetchAllState = () => {
        getAllStateApi()
            .then((data) => setStateOptions(data?.data || []))
            .catch((error) =>
                toast.error(error?.response?.data?.originalError || error?.response?.data?.message)
            );
    };

    const fetchNgoDetails = () => {
        var ngo_id = {
            ngo_id: data?.tngo_id || null
        }
        fetchNgoProifleDetailsApi(ngo_id)
            .then((data) => {
                console.log("Fetched NGO Profile List details:", data);
                if (!data || !data.data) {
                    return;
                }
                // Populate formData with fetched NGO Profile List details
                let ngo_details = data.data;

                const fileMap = ngo_details?.documents?.reduce((acc, doc, index) => {
                    const { doc_purpose, doc_name, file_path, tdoc_id } = doc;

                    const fileObj = {
                        uid: tdoc_id || `${index}`,
                        name: doc_name || "Uploaded Document",
                        status: "done",
                        url: file_path,
                        id: tdoc_id,
                    };

                    if (!acc[doc_purpose]) {
                        acc[doc_purpose] = [];
                    }

                    acc[doc_purpose].push(fileObj);
                    return acc;
                }, {});

                // console.log(fileMap);

                setFileLists(fileMap || {});
                // console.log("ngo_details------------- ",ngo_details);

                // Extract state, district, and block IDs and names from user details
                const factoryIds = (ngo_details.factorys || []).map(st => ({
                    value: st.tfact_factory_id,
                    label: st.vertical_name // Set the label for the state
                }));

                const statesIds = (ngo_details.states || []).map(st => ({
                    value: st.state_id,
                    label: st.state_name // Set the label for the state
                }));

                const districtsIds = (ngo_details.districts || []).map(dt => ({
                    value: dt.district_id,
                    label: dt.district_name, // Set the label for the dt
                    stateId: dt.stateId
                }));

                var region_id = ngo_details.states.map((state) => state.state_id);
                fetchMinesFun(region_id);

                console.log("ngo_details-------------- ", ngo_details);
                console.log("factoryIds-------------- ", factoryIds);
                // userListRoleSlugWise(ngo_details.tngo_user_id);


                setFormData({
                    tngo_id: ngo_details.tngo_id || '',
                    tngo_name: ngo_details.tngo_name || '',
                    tngo_objective: ngo_details.tngo_objective || '',
                    tngo_factorys: Array.isArray(ngo_details.tngo_factorys)
                        ? ngo_details.tngo_factorys
                        : (ngo_details.tngo_factorys || '').split(',').filter(Boolean),
                    tngo_csr_reg_no: ngo_details.tngo_csr_reg_no || '',
                    tngo_category: ngo_details.tngo_category || '',
                    tngo_contact_no: ngo_details.tngo_contact_no || '',
                    tngo_contact_person: ngo_details.tngo_contact_person || '',
                    tngo_contact_person_no: ngo_details.tngo_contact_person_no || '',
                    tngo_email: ngo_details.tngo_email || '',
                    tngo_registered_address: ngo_details.tngo_registered_address || '',
                    tngo_present_address: ngo_details.tngo_present_address || '',
                    tngo_website: ngo_details.tngo_website || '',
                    tngo_pan_no: ngo_details.tngo_pan_no || '',
                    tngo_gst_number: ngo_details.tngo_gst_number || '',
                    // tngo_tan_number: ngo_details.tngo_tan_number || '',
                    // tngo_target_beneficiaries: parsedTargetBeneficiaries,
                    tngo_target_beneficiaries: Array.isArray(ngo_details.tngo_target_beneficiaries)
                        ? ngo_details.tngo_target_beneficiaries
                        : (ngo_details.tngo_target_beneficiaries || '').split(',').filter(Boolean),
                    tngo_twelve_a_registration_number: ngo_details.tngo_twelve_a_registration_number || '',
                    tngo_ngo_registration_date: ngo_details.tngo_ngo_registration_date || '',
                    tngo_fcra_license_is_guaranteed: ngo_details.tngo_fcra_license_is_guaranteed || '',

                    // Disclosures
                    tngo_litigation_against_org: ngo_details.tngo_litigation_against_org || '',
                    tngo_blacklisted: ngo_details.tngo_blacklisted || '',
                    tngo_associated_political_party: ngo_details.tngo_associated_political_party || '',
                    tngo_anyone_convicted: ngo_details.tngo_anyone_convicted || '',
                    tngo_political_founders: ngo_details.tngo_political_founders || '',
                    tngo_certified_guidestar: ngo_details.tngo_certified_guidestar || '',
                    tngo_certified_credibility_alliance: ngo_details.tngo_certified_credibility_alliance || '',
                    tngo_has_ca: ngo_details.tngo_has_ca || '',
                    tngo_has_auditor: ngo_details.tngo_has_auditor || '',
                    tngo_budget_vs_actual: ngo_details.tngo_budget_vs_actual || '',
                    tngo_challenged_twelve_a: ngo_details.tngo_challenged_twelve_a || '',
                    tngo_registered_darpan: ngo_details.tngo_registered_darpan || '',
                    tngo_file_return_charity: ngo_details.tngo_file_return_charity || '',
                    tngo_has_finance_team: ngo_details.tngo_has_finance_team || '',


                    // System fields
                    // tngo_user_id: ngo_details.tngo_user_id || '',
                    tngo_status: ngo_details.tngo_status || '',
                });


                setSelectedFactory(factoryIds); // Set selected states with both value and label
                setSelectedStates(statesIds); // Set selected states with both value and label
                setSelectedDistricts(districtsIds); // Set selected districts with both value and label

            })
            .catch((error) =>
                toast.error(error?.response?.data?.originalError || error?.response?.data?.message)
            );
    };

    const handleRegionChange = (selectedStates) => {

        setSelectedStates(selectedStates);
        // Fetch districts based on selected states
        var region_id = selectedStates.map((state) => state.value);
        fetchMinesFun(region_id);
    };

    const handleDistrictChange = (selectedDistricts) => {
        setSelectedDistricts(selectedDistricts);
    };

    const fetchMinesFun = async (regionIds) => {
        try {
            // Map the selected regions to extract the region values (IDs)
            const region_id = regionIds;

            // Create the request payload
            const state_ids = {
                state_ids: region_id
            };

            // Make the API call to fetch districts based on the selected region IDs
            const response = await fetchDistrictsListByStateIds(state_ids);

            // Assuming the response structure you provided
            const { data, status, message } = response;

            if (status === 1) {
                // Transforming API data into the required format for MultiSelect
                const districtsData = data.map(district => ({
                    label: district.tdl_district_name, // Using the district name as label
                    value: district.tdl_district_id,   // Using the district ID as value
                    stateId: district.tdl_state_id         // Assuming state_id is available in each district (modify if necessary)
                }));


                // Update the state to reflect the new district data
                setDistrictsOptions(districtsData);

                if (data == null || data.length == 0) {
                    setSelectedDistricts([]); // Reset selected districts
                }


            } else {
                setDistrictsOptions([]);
                console.error('Failed to fetch districts:', message);
            }

        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };



    const handleSubmit = async () => {


        // setLoading(true);
        // try {

        const state_district_blocks = selectedDistricts.map((district) => {

            const state = selectedStates.find(
                (state) => state.value === district.stateId
            );
            return {
                state_id: state.value,
                district_id: district.value
            };
        });



        const dataToValidate = {
            ...formData,
            // tngo_factorys: selectedFactory,
            tngo_logo: fileLists?.tngo_logo?.[0] || null,
            tngo_csr_certificate: fileLists?.tngo_csr_certificate || [],
            state_district_blocks,
            tngo_ngo_registration_date: formData.tngo_ngo_registration_date?.format
                ? formData.tngo_ngo_registration_date.format("YYYY")
                : formData.tngo_ngo_registration_date,
        };

        // console.log("dataToValidate------------ ", dataToValidate);
        //  return;

        const isValid = await handleValidation(dataToValidate);
        if (!isValid) return;
        // console.log('formData', formData);return


        const payload = new FormData();


        // Append all fields to FormData
        for (const key in dataToValidate) {
            if (key === 'state_district_blocks') continue;
            // console.log('key', key);
            if (dataToValidate[key] !== null) {

                // If it's a file object, make sure it's a File not just uid
                if (key === 'tngo_logo') {

                    if (dataToValidate[key]?.originFileObj) {

                        // console.log('dataToValidate[key].originFileObj', dataToValidate[key]);

                        payload.append(key, dataToValidate[key].originFileObj);
                    }

                }
                else if (key === 'tngo_csr_certificate') {
                    if (Array.isArray(dataToValidate[key])) {
                        dataToValidate[key].forEach((file) => {
                            if (file?.originFileObj) {
                                payload.append('tngo_csr_certificate', file.originFileObj);
                            }
                        });
                    }
                }
                else {
                    payload.append(key, dataToValidate[key]);
                }
            }
        }

        // console.log('payload', payload); return

        payload.append("state_district_blocks", JSON.stringify(state_district_blocks));


        // console.log("Payload being sent to API:", payload);return


        const response = await ngoProfileCreateApi(payload); // Your API must accept dataToValidate

        if (response.status !== true) {
            toast.error("Failed to submit NGO Profile List details. Please try again.");
            return;
        }
        // If the response is successful, you can handle it here
        // console.log("NGO Profile List created successfully:", response.data);
        // Optionally, you can reset the form or close the modal
        fetchData(); // Refresh the NGO Profile List list or perform any other necessary actions
        toast.success("NGO Profile List details submitted successfully!");
        // Optionally reset form or close modal
        onClose();

        // } catch (error) {
        //   console.error("Error creating NGO Profile List:", error);
        //   toast.error("Failed to submit NGO Profile List details. Please try again.");
        // } finally {
        //   setLoading(false);
        // }
    };

    useEffect(() => {
        if (data && data.tngo_id) {

            // If data is provided, populate the form with existing NGO Profile List details
            fetchNgoDetails();

        } else {
            setFormData({
                tngo_name: '',
                tngo_factorys: [],
                tngo_csr_reg_no: '',
                tngo_category: '',
                tngo_contact_no: '',
                tngo_email: '',
                tngo_registered_address: '',
                tngo_present_address: '',
                tngo_website: '',
                tngo_geographical_presence: '',
                tngo_pan_no: '',
                tngo_logo: null,
                tngo_csr_certificate: null,
            });
        }
        setErrors({});
    }, [data]);

    return (
        <Modal
            title={
                <>
                    {`${data?.id ? "Update" : "Add"} NGO Profile List`}
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px", fontWeight: "bold" }}>
                        Please fill in all required fields.
                    </Text>
                </>
            }
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={"80%"}
            style={{ top: 20 }}
            maskClosable={false}
            footer={[
                <Divider key="divider" style={{ margin: "0 0 10px 0", borderColor: "lightgrey" }} />,
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Submit
                </Button>,
            ]}
        >
            <Form layout="vertical">
                <Row gutter={[12, 2]}>

                    <Col span={12}>
                        <Form.Item label="Name" required>
                            <Input
                                value={formData.tngo_name}
                                onChange={(e) => handleChange("tngo_name", e.target.value)}
                            />
                            {errors.tngo_name && <div className="text-danger">{errors.tngo_name}</div>}
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Objective" required>
                            <TextArea
                                rows={2}
                                value={formData.tngo_objective}
                                onChange={(e) => handleChange("tngo_objective", e.target.value)}
                            />
                            {errors.tngo_objective && <div className="text-danger">{errors.tngo_objective}</div>}
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Factory" required>
                            <Select
                                mode="multiple"
                                placeholder="Select Factory"
                                id="tngo_factorys"
                                name="tngo_factorys"
                                value={selectedFactory}
                                onChange={(value) => handleChange("tngo_factorys", value)}
                                style={{ width: "100%" }}
                                options={factoryOptions}
                            />

                            {/* {errors.tngo_factorys && (
                                <div className="text-danger">{errors.tngo_factorys}</div>
                            )} */}
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="CSR Registration Number" required>
                            <Input
                                value={formData.tngo_csr_reg_no}
                                onChange={(e) => handleChange("tngo_csr_reg_no", e.target.value)}
                            />
                            {errors.tngo_csr_reg_no && (
                                <div className="text-danger">{errors.tngo_csr_reg_no}</div>
                            )}
                        </Form.Item>
                    </Col>


                    <Col span={8}>
                        <label htmlFor="tngo_category" className="form-label">
                            Registration Type <span className="text-danger">*</span>
                        </label>
                        <Select
                            placeholder="Select Registration Type"
                            id="tngo_category"
                            name="tngo_category"
                            value={registrationOptions.find(
                                ({ value }) => value == formData?.tngo_category
                            )}
                            onChange={(value) => handleChange("tngo_category", value)}
                            style={{ width: "100%" }}
                            options={registrationOptions}
                        />
                        {errors?.tngo_category && (
                            <div className="error text-danger">{errors.tngo_category}</div>
                        )}
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Email ID" required>
                            <Input
                                value={formData.tngo_email}
                                onChange={(e) => handleChange("tngo_email", e.target.value)}
                            />
                            {errors.tngo_email && <div className="text-danger">{errors.tngo_email}</div>}
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Contact Number" required>
                            <Input
                                value={formData.tngo_contact_no}
                                onChange={(e) => handleChange("tngo_contact_no", e.target.value)}
                            />
                            {errors.tngo_contact_no && (
                                <div className="text-danger">{errors.tngo_contact_no}</div>
                            )}
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item label="Target Beneficiary" required>
                            <Select
                                mode="multiple"
                                placeholder="Select Target Beneficiaries"
                                value={formData.tngo_target_beneficiaries || []}
                                onChange={(val) => handleChange("tngo_target_beneficiaries", val)}
                                options={beneficiaryOptions}
                                allowClear
                            />
                            {errors.tngo_target_beneficiaries && (
                                <div className="text-danger">{errors.tngo_target_beneficiaries}</div>
                            )}
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item label="GST Number" >
                            <Input
                                rows={2}
                                value={formData.tngo_gst_number}
                                onChange={(e) => handleChange("tngo_gst_number", e.target.value)}
                            />
                            {errors.tngo_gst_number && (
                                <div className="text-danger">{errors.tngo_gst_number}</div>
                            )}
                        </Form.Item>
                    </Col>




                    <Col span={6}>
                        <Form.Item label="PAN No." required>
                            <Input
                                value={formData.tngo_pan_no}
                                onChange={(e) => handleChange("tngo_pan_no", e.target.value)}
                            />
                            {errors.tngo_pan_no && <div className="text-danger">{errors.tngo_pan_no}</div>}
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item label="12A Registration Number" required>
                            <Input
                                rows={2}
                                value={formData.tngo_twelve_a_registration_number}
                                onChange={(e) => handleChange("tngo_twelve_a_registration_number", e.target.value)}
                            />
                            {errors.tngo_twelve_a_registration_number && (
                                <div className="text-danger">{errors.tngo_twelve_a_registration_number}</div>
                            )}
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item label="NGO Profile Registration Date">
                            {/* <DatePicker
                rows={2}
                value={formData.tngo_ngo_registration_date}
                onChange={(e) => handleChange("tngo_ngo_registration_date", e.target.value)}
              /> */}
                            <DatePicker
                                picker="year"
                                value={formData.tngo_ngo_registration_date ? dayjs(formData.tngo_ngo_registration_date) : null}
                                // format="YYYY-MM-DD"
                                format="YYYY"
                                onChange={(date) =>
                                    handleChange(
                                        "tngo_ngo_registration_date",
                                        // date ? date.format("YYYY-MM-DD") : ""
                                        date ? date.format("YYYY") : ""
                                    )
                                }
                            />


                            {errors.tngo_ngo_registration_date && (
                                <div className="text-danger">{errors.tngo_ngo_registration_date}</div>
                            )}
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Status OF FCRA License" required>
                            <Select
                                value={formData.tngo_fcra_license_is_guaranteed}
                                onChange={(value) => handleChange("tngo_fcra_license_is_guaranteed", value)}
                                placeholder="Select Yes or No"
                            >
                                <Option value="Yes">Yes</Option>
                                <Option value="No">No</Option>
                            </Select>
                            {errors.tngo_fcra_license_is_guaranteed && (
                                <div className="text-danger">{errors.tngo_fcra_license_is_guaranteed}</div>
                            )}
                        </Form.Item>
                    </Col>


                    <Col span={12}>
                        <Form.Item label="Complete Registered Address" required>
                            <TextArea
                                rows={2}
                                value={formData.tngo_registered_address}
                                onChange={(e) => handleChange("tngo_registered_address", e.target.value)}
                            />
                            {errors.tngo_registered_address && (
                                <div className="text-danger">{errors.tngo_registered_address}</div>
                            )}
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Website">
                            <Input
                                value={formData.tngo_website}
                                onChange={(e) => handleChange("tngo_website", e.target.value)}
                            />
                            {/* {errors.tngo_website && (
                <div className="text-danger">{errors.tngo_website}</div>
              )} */}
                        </Form.Item>
                    </Col>


                    <Col sm={8}>
                        <Form.Item label={
                            <>
                                <span style={{ color: "red" }}>*</span>&nbsp;State
                            </>
                        }>

                            <MultiSelect
                                options={stateOptions}
                                value={selectedStates}
                                onChange={handleRegionChange}
                                labelledBy="Select State"
                            />
                            {errors.state_district_blocks && (
                                <div className="error text-danger">{errors.state_district_blocks}</div>
                            )}
                        </Form.Item>
                    </Col>
                    <Col sm={8}>
                        <Form.Item
                            label={
                                <>
                                    <span style={{ color: "red" }}>*</span>&nbsp;District
                                </>
                            }
                        >
                            <MultiSelect
                                options={districtsOptions}
                                value={selectedDistricts}
                                onChange={handleDistrictChange}
                                labelledBy="Select District"
                            />
                            {errors.state_district_blocks && (
                                <div className="error text-danger">{errors.state_district_blocks}</div>
                            )}
                        </Form.Item>
                    </Col>


                    <Col span={8}>
                        <Form.Item label="CSR Partner Contact Person">
                            <Input
                                value={formData.tngo_contact_person}
                                onChange={(e) => handleChange("tngo_contact_person", e.target.value)}
                            />
                            {errors.tngo_contact_person && (
                                <div className="text-danger">{errors.tngo_contact_person}</div>
                            )}
                        </Form.Item>
                    </Col>


                    <Col span={6}>
                        <Form.Item label="CSR Partner Contact Person Number" >

                            <Input
                                value={formData.tngo_contact_person_no}
                                onChange={(e) => handleChange("tngo_contact_person_no", e.target.value)}
                            />
                            {errors.tngo_contact_person_no && (
                                <div className="text-danger">{errors.tngo_contact_person_no}</div>
                            )}
                        </Form.Item>
                    </Col>

                    {/* <Col span={8}>
                        <Form.Item label="User of the platform" required>
                            <Select
                                placeholder="Select User of the platform"
                                id="tngo_user_id"
                                name="tngo_user_id"
                                value={usersOptions.find(
                                    ({ value }) => value == formData?.tngo_user_id
                                )}
                                onChange={(value) => handleChange("tngo_user_id", value)}
                                style={{ width: "100%" }}
                                options={usersOptions}
                            />
                            {errors.tngo_user_id && (
                                <div className="text-danger">{errors.tngo_user_id}</div>
                            )}
                        </Form.Item>
                    </Col> */}


                    {/* <Col span={12}>
            <Form.Item label="Upload NGO Profile Logo">
               <Upload
                beforeUpload={(file) => {
                  handleChange("tngo_logo", {
                    ...file,
                    originFileObj: file,
                  });
                  return false;
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Certificate</Button>
              </Upload>
              
            </Form.Item>
          </Col> */}

                    <Col span={12}>
                        <label htmlFor="doct_profile_photo" className="form-label">
                            Upload CSR Partner Logo
                            <span className="text-danger"> *</span>
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
                                fileList={fileLists?.["tngo_logo"] || []}
                                multiple
                                beforeUpload={() => false}
                                onChange={({ fileList }) => {
                                    const latestFile = fileList?.slice(-1);
                                    setFileLists((prev) => ({
                                        ...prev,
                                        tngo_logo: latestFile,
                                    }));
                                    handleChange(
                                        "tngo_logo",
                                        latestFile?.[0]
                                    );
                                }}
                                showUploadList={{ showRemoveIcon: false }}
                                itemRender={(originNode, file, currFileList) => {
                                    return (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "4px 8px",
                                                marginBottom: 6,
                                                border: "1px solid #d9d9d9",
                                                borderRadius: 6,
                                                backgroundColor: "#fff",
                                                transition: "background-color 0.2s",
                                                cursor: "default",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.backgroundColor = "#f5f5f5")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.backgroundColor = "#fff")
                                            }
                                        >
                                            <div style={{ flex: 1, fontSize: 14 }}>
                                                {originNode}
                                            </div>
                                            <Popconfirm
                                                title="Are you sure to delete this?"
                                                okText="Yes"
                                                cancelText="No"
                                                onConfirm={async () => {
                                                    const isDeleted = await deleteFile(file);
                                                    if (isDeleted) {
                                                        const updatedList = (currFileList || []).filter(
                                                            (f) => f.uid !== file.uid
                                                        );
                                                        const latestFile = updatedList?.slice(-1);
                                                        setFileLists((prev) => ({
                                                            ...prev,
                                                            tngo_logo: updatedList,
                                                        }));
                                                        handleChange(
                                                            "tngo_logo",
                                                            latestFile?.[0]
                                                        );
                                                    }
                                                }}
                                            >
                                                {/* <DeleteOutlined
                            style={{
                              color: "red",
                              marginLeft: 8,
                              cursor: "pointer",
                            }}
                          /> */}
                                            </Popconfirm>
                                        </div>
                                    );
                                }}
                            >
                                <Button style={{ marginBottom: 4 }} icon={<UploadOutlined />}>
                                    Choose File
                                </Button>
                            </Upload>
                        </div>

                        {errors?.tngo_logo && (
                            <div className="error text-danger">
                                {errors?.tngo_logo}
                            </div>
                        )}
                    </Col>

                    <Col span={12}>
                        <label htmlFor="doct_profile_photo" className="form-label">
                            Upload Documents
                            {/* <span className="text-danger"> *</span> */}
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
                                fileList={fileLists?.["tngo_csr_certificate"] || []}
                                multiple
                                beforeUpload={() => false}
                                onChange={({ fileList }) => {

                                    setFileLists((prev) => ({
                                        ...prev,
                                        tngo_csr_certificate: fileList,
                                    }));
                                    handleChange(
                                        "tngo_csr_certificate",
                                        fileList
                                    );
                                }}
                                showUploadList={{ showRemoveIcon: false }}
                                itemRender={(originNode, file, currFileList) => {
                                    return (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "4px 8px",
                                                marginBottom: 6,
                                                border: "1px solid #d9d9d9",
                                                borderRadius: 6,
                                                backgroundColor: "#fff",
                                                transition: "background-color 0.2s",
                                                cursor: "default",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.backgroundColor = "#f5f5f5")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.backgroundColor = "#fff")
                                            }
                                        >
                                            <div style={{ flex: 1, fontSize: 14 }}>
                                                {originNode}
                                            </div>
                                            <Popconfirm
                                                title="Are you sure to delete this?"
                                                okText="Yes"
                                                cancelText="No"
                                                onConfirm={async () => {
                                                    const isDeleted = await deleteFile(file);
                                                    if (isDeleted) {
                                                        const updatedList = (currFileList || []).filter(
                                                            (f) => f.uid !== file.uid
                                                        );
                                                        const latestFile = updatedList?.slice(-1);
                                                        setFileLists((prev) => ({
                                                            ...prev,
                                                            tngo_csr_certificate: updatedList,
                                                        }));
                                                        handleChange(
                                                            "tngo_csr_certificate",
                                                            latestFile?.[0]
                                                        );
                                                    }
                                                }}
                                            >
                                                {/* <DeleteOutlined
                            style={{
                              color: "red",
                              marginLeft: 8,
                              cursor: "pointer",
                            }}
                          /> */}
                                            </Popconfirm>
                                        </div>
                                    );
                                }}
                            >
                                <Button style={{ marginBottom: 4 }} icon={<UploadOutlined />}>
                                    Choose File
                                </Button>
                            </Upload>
                        </div>

                        {errors?.tngo_csr_certificate && (
                            <div className="error text-danger">
                                {errors?.tngo_csr_certificate}
                            </div>
                        )}
                    </Col>

                </Row>


            </Form>
        </Modal>
    );
};

export default AddEditNgoProfileMasterList;

