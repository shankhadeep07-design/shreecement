import {
    Card,
    Descriptions,
    Select,
    Typography,
    Button,
    Input,
    DatePicker,
    InputNumber
} from "antd";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { fetchBudgetingDetailsByBudgetId } from "../../services/Budget-service";
import { getSdgList, getNgoList, getKpiList } from "../../Services/Master-service";
import { createProject } from "../../services/Project-service";

const ProjectCreate = () => {

    const { budget_id } = useParams();

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
    console.log("budgetData---------- ", budgetData);

    const [unitLocation, setUnitLocation] = useState({
        blocks: [],
        grampanchayats: [],
        revenue_villages: [],
        villages: []
    });

    const handleChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleKpiChange = (index, value) => {

        const updated = [...formData.kpis];
        updated[index] = value;

        setFormData((prev) => ({
            ...prev,
            kpis: updated
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

        getKpiList().then((res) => {

            const list = res?.data?.data || [];

            const formatted = list.map((item) => ({
                label: item.label || item.name,
                value: item.value || item.id
            }));

            setKpiList(formatted);

        });

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
                value: item.value || item.id
            }));

            setNgoList(formatted);

        });

    }, []);
    const handleSubmit = async () => {

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

        } catch (error) {

            console.log(error);

        }

    };

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

                    <Descriptions.Item label="Type of Village">
                        {budgetData?.ttovill_type_of_village}
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

                        <label>SDG</label>

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

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

                <div className="row mt-4">

                    <div className="col-md-6 mb-3">
                        <label>Project Title</label>
                        <Input
                            value={formData.tproj_project_title}
                            onChange={(e) =>
                                handleChange("tproj_project_title", e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project Description</label>
                        <Input.TextArea
                            rows={3}
                            value={formData.tproj_project_desc}
                            onChange={(e) =>
                                handleChange("tproj_project_desc", e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project Start Date</label>
                        <DatePicker
                            style={{ width: "100%" }}
                            onChange={(date, dateString) =>
                                handleChange("tproj_project_start_date", dateString)
                            }
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project End Date</label>
                        <DatePicker
                            style={{ width: "100%" }}
                            onChange={(date, dateString) =>
                                handleChange("tproj_project_end_date", dateString)
                            }
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project Started Necessarily</label>
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
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Project Budget Amount</label>
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            value={formData.tproj_budget_amount}
                            onChange={(value) =>
                                handleChange("tproj_budget_amount", value)
                            }
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Baseline Info</label>
                        <Input
                            value={formData.tproj_baseline_info}
                            onChange={(e) =>
                                handleChange("tproj_baseline_info", e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Implement Partner</label>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Select NGO"
                            options={ngoList}
                            value={formData.tproj_implement_partner_id}
                            onChange={(value) =>
                                handleChange("tproj_implement_partner_id", value)
                            }
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Monitoring Method</label>
                        <Input
                            value={formData.tproj_monitoring_method}
                            onChange={(e) =>
                                handleChange("tproj_monitoring_method", e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Target Beneficiary Group</label>
                        <Input
                            value={formData.tproj_target_beneficiary_group}
                            onChange={(e) =>
                                handleChange("tproj_target_beneficiary_group", e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-6 mb-3">

                        <label>KPI</label>

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