import {
    Button,
    Card,
    DatePicker,
    Descriptions,
    Input,
    InputNumber,
    Select,
    Typography,
    message
} from "antd";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { fetchBudgetingDetailsByBudgetId } from "../../services/Budget-service";
import { fetchKpiByThemeId, getNgoList, getSdgList } from "../../Services/Master-service";
import { createProject } from "../../services/Project-service";
import * as Yup from "yup";
import dayjs from "dayjs";
const noLeadingSpace = /^(?!\s)/;
const noEmoji = /^(?!.*[\p{Extended_Pictographic}]).*$/u;
const noSpecialStart = /^[a-zA-Z0-9]/;

const trimmedString = () =>
    Yup.string().transform((value) => (value ? value.trim() : ""));

const Schema = Yup.object({

    tproj_project_title: trimmedString()
        .required("Project title is required")
        .max(255, "Max 255 characters")
        .matches(noLeadingSpace, { message: "Cannot start with space" })
        .matches(noSpecialStart, { message: "Cannot start with special character" })
        .matches(noEmoji, { message: "Emoji not allowed" }),

    tproj_project_desc: trimmedString()
        .required("Project description is required"),
    tproj_baseline_info: trimmedString()
        .required("Baseline information is required"),
    tproj_monitoring_method: trimmedString()
        .required("Monitoring method is required"),
    tproj_target_beneficiary_group: trimmedString()
        .required("Target beneficiary group is required"),
    tproj_project_started_necessarily: Yup.number()
        .required("Project started necessarily is required"),

    tproj_project_start_date: Yup.string()
        .required("Start date is required"),


    tproj_budget_amount: Yup.number()
        .required("Budget amount is required")
        .min(1, "Must be greater than 0"),

 tproj_implement_partner_id: Yup.mixed()
    .required("NGO is required"),

    tproj_sdg_id: Yup.array()
        .min(1, "At least one SDG required"),
    sdgWeightages: Yup.object().test(
        "sdg-weightage-required",
        "Weightage is required for all selected SDGs",
        function (value) {
            const { tproj_sdg_id } = this.parent;

            // only validate if 2 or more SDGs selected
            if (!tproj_sdg_id || tproj_sdg_id.length < 2) return true;

            for (let id of tproj_sdg_id) {
                if (!value || !value[id]) {
                    return this.createError({
                        message: "All SDG weightages are required"
                    });
                }
            }

            return true;
        }
    ),
   kpis: Yup.array()
    .of(
        Yup.mixed() // ✅ accept string or number
            .required("KPI is required")
    )
    .min(1, "At least one KPI is required"),
    tproj_project_end_date: Yup.string()
        .required("End date is required")
        .test(
            "is-after-start",
            "End date cannot be before start date",
            function (value) {
                const { tproj_project_start_date } = this.parent;

                if (!tproj_project_start_date || !value) return true;

                return new Date(value) >= new Date(tproj_project_start_date);
            }
        ),
});
const ProjectCreate = () => {

    const { budget_id } = useParams();
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        tproj_sdg_id: [],
        tproj_project_title: "",
        tproj_project_desc: "",
        tproj_project_start_date: null,
        tproj_project_end_date: null,
        tproj_project_started_necessarily: null,
        tproj_budget_amount: 0,
        tproj_baseline_info: "",
        tproj_implement_partner_id: null,
        tproj_monitoring_method: "",
        tproj_target_beneficiary_group: "",
        tproj_remarks: "",
        kpis: [null]
    });

    const [kpiList, setKpiList] = useState([]);
    const [sdgWeightages, setSdgWeightages] = useState({});
    const [budgetData, setBudgetData] = useState({});
    const [sdgList, setSdgList] = useState([]);
    const [ngoList, setNgoList] = useState([]);


    const [unitLocation, setUnitLocation] = useState({
        blocks: [],
        grampanchayats: [],
        revenue_villages: [],
        villages: []
    });

    const validateForm = async () => {
        try {
            await Schema.validate(
                { ...formData, sdgWeightages }, // ✅ include this
                { abortEarly: false }
            );
            setErrors({});
            return true;
        } catch (err) {
            const newErrors = {};

            err.inner.forEach((e) => {
                if (e.path?.includes("kpis")) {
                    newErrors.kpis = e.message;
                } else if (e.path?.includes("sdgWeightages")) {
                    newErrors.sdgWeightages = e.message;
                } else {
                    newErrors[e.path] = e.message;
                }
            });

            setErrors(newErrors);
            return false;
        }
    };
    const handleChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // const handleKpiChange = (index, value) => {

    //     const updated = [...formData.kpis];
    //     updated[index] = value;

    //     setFormData((prev) => ({
    //         ...prev,
    //         kpis: updated
    //     }));
    // };

    const handleKpiChange = (index, value) => {

        const updated = [...formData.kpis];
       updated[index] = value; // ✅ FIX

        setFormData((prev) => ({
            ...prev,
            kpis: updated
        }));

        // ✅ clear error
        setErrors((prev) => ({
            ...prev,
            kpis: ""
        }));
    };

    const addMoreKpi = () => {

        setFormData((prev) => ({
            ...prev,
            kpis: [...prev.kpis, null]
        }));
    };

    const removeKpi = (index) => {

        const updated = formData.kpis.filter((_, i) => i !== index);

        setFormData((prev) => ({
            ...prev,
            kpis: updated
        }));
    };

    const fetchBudgetDetailsByBudgetIdApi = async () => {

        try {

            const response = await fetchBudgetingDetailsByBudgetId({ budget_id });

            const data = response?.data;

            setBudgetData(data?.budget_details || {});
            setUnitLocation(data?.unit_locations || {});

        } catch (error) {

            console.log("error", error);
        }
    };

    useEffect(() => {
        fetchBudgetDetailsByBudgetIdApi();
    }, [budget_id]);

    useEffect(() => {

        // getKpiList().then((res) => {

        //     const list = res?.data?.data || [];

        //     const formatted = list.map((item) => ({
        //         label: item.label || item.name,
        //         value: item.value || item.id
        //     }));

        //     setKpiList(formatted);

        // });

        getSdgList().then((res) => {

            const list = res?.data?.data || [];

            const formatted = list.map((item) => ({
                label: item.label || item.name,
                value: item.value || item.id
            }));

            setSdgList(formatted);

        });

    }, []);

    useEffect(() => {

        getNgoList().then((res) => {

            const list = res?.data?.data || [];

            const formatted = list.map((item) => ({
                label: item.label || item.name,
                 value: Number(item.value || item.id)
            }));

            setNgoList(formatted);

        });

    }, []);
    // const handleSubmit = async () => {

    //     const sdgPayload = formData.tproj_sdg_id.map((id) => ({
    //         sdg_id: id,
    //         sdg_weightage_value: sdgWeightages[id] || 0
    //     }));

    //     const { kpis, ...rest } = formData;

    //     const finalPayload = {
    //         ...rest,
    //         tproj_budgets_id: budgetData?.tbad_id,
    //         tproj_budget_master_id: budgetData?.tbm_id,
    //         sdg_details: sdgPayload,
    //         kpi_ids: kpis.filter(Boolean)
    //     };

    //     try {

    //         const res = await createProject(finalPayload);

    //     } catch (error) {

    //         console.log(error);

    //     }

    // };

    const handleSubmit = async () => {

        const isValid = await validateForm();
        if (!isValid) return;
        const totalBudget = Number(budgetData?.tbm_proposed_total_amount || 0);
        const projectBudget = Number(formData.tproj_budget_amount || 0);

        // ✅ Validation
        if (projectBudget > totalBudget) {
            message.error("Project Budget cannot be greater than Total Proposed Budget");
            return;
        }

        const sdgPayload = formData.tproj_sdg_id.map((id) => ({
            sdg_id: id,
            sdg_weightage_value: sdgWeightages[id] || 0
        }));

        const { kpis, ...rest } = formData;

        const finalPayload = {
            ...rest,
            tproj_budgets_id: budgetData?.tbad_id,
            tproj_budget_master_id: budgetData?.tbm_id,
            sdg_details: sdgPayload,
            kpi_ids: kpis.filter(Boolean)
        };

        try {

            const res = await createProject(finalPayload);

            // ✅ Success message
            message.success("Project created successfully");

            // ✅ Reset form
            setFormData({
                tproj_sdg_id: [],
                tproj_project_title: "",
                tproj_project_desc: "",
                tproj_project_start_date: null,
                tproj_project_end_date: null,
                tproj_project_started_necessarily: null,
                tproj_budget_amount: 0,
                tproj_baseline_info: "",
                tproj_implement_partner_id: null,
                tproj_monitoring_method: "",
                tproj_target_beneficiary_group: "",
                tproj_remarks: "",
                kpis: [null]
            });
            setErrors({});
            setSdgWeightages({});

        } catch (error) {

            message.error("Failed to create project");
            console.log(error);

        }
    };

    useEffect(() => {

        if (!budgetData?.tthm_theme_id) return;


        fetchKpiByThemeId(budgetData.tthm_theme_id).then((res) => {

            const list = res?.data || [];

            const formatted = list.map((item) => ({
                label: item.label,
                value: item.value
            }));

            setKpiList(formatted);

        }).catch((err) => {
            console.log("KPI fetch error", err);
        });

    }, [budgetData?.tthm_theme_id]);

    return (

        <div className="home-content">

            <Card
                style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
                }}
            >

                <Typography.Title level={3}>
                    Project
                </Typography.Title>

                <Descriptions
                    column={2}
                    size="middle"
                    labelStyle={{ fontWeight: 500 }}
                    contentStyle={{
                        background: "#fafafa",
                        padding: "8px 12px",
                        borderRadius: 6
                    }}
                >

                    <Descriptions.Item label="Financial Year">
                        {budgetData?.tfy_year_label}
                    </Descriptions.Item>

                    <Descriptions.Item label="Unit">
                        {budgetData?.tun_name}
                    </Descriptions.Item>

                    <Descriptions.Item label="State">
                        {budgetData?.tsl_state_name}
                    </Descriptions.Item>

                    <Descriptions.Item label="District">
                        {budgetData?.tdl_district_name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Block">
                        {unitLocation?.blocks?.map(b => b.label).join(", ") || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Gram Panchayat">
                        {unitLocation?.grampanchayats?.map(g => g.label).join(", ") || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Revenue Village Name">
                        {unitLocation?.revenue_villages?.map(rv => rv.label).join(", ") || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Village / Hamlet">
                        {unitLocation?.villages?.map(v => v.label).join(", ") || "-"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Theme">
                        {budgetData?.tthm_theme_name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Schedule Name">
                        {budgetData?.tschm_schedule_name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Sub Schedule">
                        {budgetData?.tsubshcm_sub_schedule_name}
                    </Descriptions.Item>

                    <Descriptions.Item label="Total Proposed Budget">
                        ₹ {budgetData?.tbm_proposed_total_amount?.toLocaleString() || 0}
                    </Descriptions.Item>

                </Descriptions>

                <div className="row mt-4">

                    <div className="col-md-6 mb-3">

                        <label>SDG<span style={{ color: "red" }}>*</span></label>

                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: "100%" }}
                            placeholder="Select SDG"
                            options={sdgList}
                            value={formData.tproj_sdg_id}
                            onChange={(value) => {

                                handleChange("tproj_sdg_id", value);

                                setSdgWeightages((prev) => {

                                    const updated = { ...prev };

                                    Object.keys(updated).forEach((key) => {
                                        if (!value.includes(Number(key))) {
                                            delete updated[key];
                                        }
                                    });

                                    return updated;
                                });

                            }}
                        />
                        {errors?.tproj_sdg_id && (
                            <div className="error text-danger">
                                {errors.tproj_sdg_id}
                            </div>
                        )}
                    </div>

                </div>

                {formData.tproj_sdg_id.length >= 2 && (

                    <div className="mt-3">

                        <Typography.Title level={5}>
                            SDG Weightage
                        </Typography.Title>

                        {formData.tproj_sdg_id.map((sdgId) => {

                            const sdg = sdgList.find((s) => s.value === sdgId);

                            return (

                                <div className="row mb-2" key={sdgId}>

                                    <div className="col-md-6">
                                        <b>{sdg?.label}</b>
                                    </div>

                                    <div className="col-md-6">

                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter Weightage"
                                            value={sdgWeightages[sdgId] || ""}
                                            onChange={(e) =>
                                                setSdgWeightages({
                                                    ...sdgWeightages,
                                                    [sdgId]: e.target.value
                                                })
                                            }
                                        />
                                        {errors?.sdgWeightages && (
                                            <div className="error text-danger mt-2">
                                                {errors.sdgWeightages}
                                            </div>
                                        )}
                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

                <div className="row mt-4">

                    <div className="col-md-6 mb-3">
                        <label>Project Title <span style={{ color: "red" }}>*</span></label>
                        <Input
                            value={formData.tproj_project_title}
                            onChange={(e) =>
                                handleChange("tproj_project_title", e.target.value)
                            }
                        />
                        {errors?.tproj_project_title && (
                            <div className="error text-danger">
                                {errors.tproj_project_title}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project Description<span style={{ color: "red" }}>*</span></label>
                        <Input.TextArea
                            rows={3}
                            value={formData.tproj_project_desc}
                            onChange={(e) =>
                                handleChange("tproj_project_desc", e.target.value)
                            }
                        />
                        {errors?.tproj_project_desc && (
                            <div className="error text-danger">
                                {errors.tproj_project_desc}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project Start Date <span style={{ color: "red" }}>*</span></label>
                        <DatePicker
                            style={{ width: "100%" }}
                            onChange={(date, dateString) =>
                                handleChange("tproj_project_start_date", dateString)
                            }
                        />
                        {errors?.tproj_project_start_date && (
                            <div className="error text-danger">
                                {errors.tproj_project_start_date}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project End Date<span style={{ color: "red" }}>*</span></label>
                        <DatePicker
                            style={{ width: "100%" }}
                            disabledDate={(current) => {
                                if (!formData.tproj_project_start_date) return false;

                                return current && current.isBefore(dayjs(formData.tproj_project_start_date), "day");
                            }}
                            onChange={(date, dateString) =>
                                handleChange("tproj_project_end_date", dateString)
                            }
                        />
                        {errors?.tproj_project_end_date && (
                            <div className="error text-danger">
                                {errors.tproj_project_end_date}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project Started Necessarily <span style={{ color: "red" }}>*</span></label>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select"
                            options={[
                                { label: "Yes", value: 1 },
                                { label: "No", value: 0 }
                            ]}
                            value={formData.tproj_project_started_necessarily}
                            onChange={(value) =>
                                handleChange("tproj_project_started_necessarily", value)
                            }
                        />
                        {errors?.tproj_project_started_necessarily && (
                            <div className="error text-danger">
                                {errors.tproj_project_started_necessarily}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project Budget Amount <span style={{ color: "red" }}>*</span></label>
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            value={formData.tproj_budget_amount}
                            onChange={(value) =>
                                handleChange("tproj_budget_amount", value)
                            }
                        />
                        {errors?.tproj_budget_amount && (
                            <div className="error text-danger">
                                {errors.tproj_budget_amount}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Baseline Info <span style={{ color: "red" }}>*</span></label>
                        <Input
                            value={formData.tproj_baseline_info}
                            onChange={(e) =>
                                handleChange("tproj_baseline_info", e.target.value)
                            }
                        />
                        {errors?.tproj_baseline_info && (
                            <div className="error text-danger">
                                {errors.tproj_baseline_info}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Implement Partner <span style={{ color: "red" }}>*</span></label>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select NGO"
                            options={ngoList}
                            value={formData.tproj_implement_partner_id}
                            onChange={(value) =>
                                handleChange("tproj_implement_partner_id", value) 
                            }
                        />
                        {errors?.tproj_implement_partner_id && (
                            <div className="error text-danger">
                                {errors.tproj_implement_partner_id}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Monitoring Method <span style={{ color: "red" }}>*</span></label>
                        <Input
                            value={formData.tproj_monitoring_method}
                            onChange={(e) =>
                                handleChange("tproj_monitoring_method", e.target.value)
                            }
                        />
                        {errors?.tproj_monitoring_method && (
                            <div className="error text-danger">
                                {errors.tproj_monitoring_method}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Target Beneficiary Group <span style={{ color: "red" }}>*</span></label>
                        <Input
                            value={formData.tproj_target_beneficiary_group}
                            onChange={(e) =>
                                handleChange("tproj_target_beneficiary_group", e.target.value)
                            }
                        />
                        {errors?.tproj_target_beneficiary_group && (
                            <div className="error text-danger">
                                {errors.tproj_target_beneficiary_group}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">

                        <label>KPI <span style={{ color: "red" }}>*</span></label>

                        {formData.kpis.map((kpi, index) => {

                            const selectedKpis = formData.kpis.filter(Boolean);

                            const availableOptions = kpiList.filter(
                                (item) => !selectedKpis.includes(item.value) || item.value === kpi
                            );

                            return (

                                <div key={index} className="d-flex mb-2">

                                    <Select
                                        style={{ width: "100%" }}
                                        placeholder="Select KPI"
                                        options={availableOptions}
                                        value={kpi}
                                        onChange={(value) => handleKpiChange(index, value)}
                                    />

                                    {index !== 0 && (
                                        <Button
                                            danger
                                            style={{ marginLeft: 8 }}
                                            onClick={() => removeKpi(index)}
                                        >
                                            Remove
                                        </Button>
                                    )}

                                </div>

                            );

                        })}
                        {errors?.kpis && (
                            <div className="error text-danger">
                                {errors.kpis}
                            </div>
                        )}
                        <Button type="dashed" onClick={addMoreKpi}>
                            Add More KPI
                        </Button>

                    </div>

                    <div className="col-md-12 mb-3">
                        <label>Remarks</label>
                        <Input.TextArea
                            rows={3}
                            value={formData.tproj_remarks}
                            onChange={(e) =>
                                handleChange("tproj_remarks", e.target.value)
                            }
                        />
                    </div>

                </div>

                <div className="mt-4">
                    <Button type="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </div>

            </Card>

        </div>

    );
};

export default ProjectCreate;