import React, { useState, useEffect } from "react";

import ScaleLoader from "react-spinners/ScaleLoader";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { SearchOutlined } from "@ant-design/icons";
import { useLoading } from '../../../context/LoadingContext';
import {
    FaEllipsisH,
    FaPencilAlt,
    FaTrash,
    FaRegPlusSquare,
} from "react-icons/fa";
import {
    dashboardDistrictNAmes,
    dashboardStateNames,
    dashboardTalukasNAmes,
    dashboardUnitNAmes,
    dashboardVillageNAmes,
    mapNoPlotList,
} from "../../../Services/Dashboard-service";

import {
    submitProjectService ,getProjectById,getLandSiteList
} from "../../../Services/Project-service";

import {
    getAllActiveSPV
} from "../../../Services/SPV-Service";
import { Modal, Dropdown, Button } from "react-bootstrap";

import { MdOutlinePageview } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
    DistrictNames,
    StateNames,
    TalukasNAmes,

} from "../../../Services/Common-service";

import { setProjectState,setProjectStateById } from '../../../redux/slices/ProjectMasterSlice';


import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'


const AddProject = () => {
    var navigate = useNavigate();

    const [state_list, setState_list] = useState([]);

    const [district_list, setDistrict_list] = useState([]);

    const [taluk_list, setTaluk_list] = useState([]);

    const [land_site_list , setLandSiteList] = useState([]);

    const projectState = useSelector((state) => state.ProjectMaster?.proejctState);
    const dispatch = useDispatch();

    let { loading, setLoading } = useLoading(false);

    const { id } = useParams();
    const [fileState, setFileState] = useState();
    const [existDocuments, setExistDicuments] = useState({}); 
    useEffect(() => {
    }, [projectState])


    useEffect(() => {
        StateNames().then((states) => {
            setState_list(states.data);
        });
        getLandSiteList().then((landSites) => {
            setLandSiteList(landSites.data);
        });


        setLoading(true);
        if(id){
            getProjectById({id : id}).then(res => {
                if(res?.data[0]){
                    var data = res.data[0];

                    dispatch(setProjectStateById({
                        id : data?.tpm_id,
                        tpm_project_name : data?.tpm_project_name,
                        tpm_state_id : {
                            label : data?.tsl_state_name,
                            value : data?.tpm_state_id
                        },
                        tpm_district_id : {
                            label : data?.tdl_district_name,
                            value : data?.tpm_district_id
                        },
                        tpm_taluka_id : {
                            label : data?.ttll_taluka_name,
                            value : data?.tpm_taluka_id
                        },
                        tpm_land_site_id:{
                            label : data?.tsm_name,
                            value : data?.tsm_id
                        },
                        
                        
                        
                        tpm_oaf_no : data?.tpm_oaf_no,
                        tpm_wbs_no : data?.tpm_wbs_no,
                        tpm_pr_no_for_land : data?.tpm_pr_no_for_land,
                        tpm_pr_no_for_title_deed : data?.tpm_pr_no_for_title_deed,
                        tpm_pr_no_services : data?.tpm_pr_no_services,
                        tpm_po_no_for_land : data?.tpm_po_no_for_land,
                        tpm_po_no_for_title_deed : data?.tpm_po_no_for_title_deed,
                        tpm_po_no_services : data?.tpm_po_no_services,
                        tpm_total_land_planned : data?.tpm_total_land_planned,
                        tpm_total_no_location : data?.tpm_total_no_location
                        //tpm_board_approval : data?.tpm_board_approval
                       
                    }))

                   


                }
                setLoading(false);
            })
        }else{
            setLoading(false);
        }


    }, []);



    const renderStateList = () => {
        return state_list?.map((data) => ({
            label: data.tsl_state_name,
            value: data.tsl_state_id,
        }));
    };



    const renderDistrictList = () => {

        return district_list?.map((data) =>
        ({
            label: data.tdl_district_name,
            value: data.tdl_district_id,
        }))


    };

    const renderTalukaList = () => {

        return taluk_list?.map((data) => ({
            label: data.ttll_taluka_name,
            value: data.ttll_taluka_id,
        }))
    };

    const renderLandSiteList = () => {

        return land_site_list?.map((land_site) => ({
            label: land_site.tsm_name,
            value: land_site.tsm_id,
        }))
    };

    const handleStateChange = (selectedVillageOption) => {

        var stateId = selectedVillageOption.value;
        // setDistrict_list(null);
        // setTaluka_list(null);
        // setUnit_list(null);
        // setVillageList(null);
        // handleSelectChange(selectedVillageOption, 'state');
        // handleSelectChange(null, 'site');
        // handleSelectChange(null, 'district');
        // handleSelectChange(null, 'taluka');
        // handleSelectChange(null, 'unit');
        // handleSelectChange(null, 'village');


        dispatch(setProjectState({ field: 'tpm_state_id', value: selectedVillageOption }))

        DistrictNames(stateId).then((districts) => {
            const allDistricts = districts.data;
            setDistrict_list(allDistricts);
        });



    };

    const handleLandSiteChange = (selectedVillageOption)=> {
        var disId = selectedVillageOption.value;

        dispatch(setProjectState({ field: 'tpm_land_site_id', value: selectedVillageOption }))
    }

    const handleDistrictChange = (selectedVillageOption) => {
        var disId = selectedVillageOption.value;

        dispatch(setProjectState({ field: 'tpm_district_id', value: selectedVillageOption }))



        TalukasNAmes(disId).then((taluks) => {
            const allTaluk = taluks.data;
            setTaluk_list(allTaluk);
        });


    };
    const handleTalukaChange = (selectedVillageOption) => {
        var talukId = selectedVillageOption.value;

        dispatch(setProjectState({ field: 'tpm_taluka_id', value: selectedVillageOption }))
    }
    const handleChange = (e, type = null) => {
        

        if (type == 'file') {
            

            setFileState({
                ...fileState, [e.target.name]: e.target.files[0]
            });

        }
        else if (type == 'select') {

        } else {
            dispatch(setProjectState({ field: e.target.name, value: e.target.value }));
        }


    }

    ////////////////////  // Add Company DropDown Ended ///////////////////////////////////////
    const projectSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();


        if (fileState && Object.keys(fileState).length > 0) {
            for (const [key, value] of Object.entries(fileState)) {
                formData.append(key, value);
            }
        }

        for (const [key, value] of Object.entries(projectState)) {
            if (typeof value === 'object' && value !== null && value.hasOwnProperty('value')) {
                formData.append(key, value.value);
            } else {
                formData.append(key, value);
            }
        }
        try {

            await submitProjectService(formData);
            toast.success('Project added successfully!')
            setLoading(false);
            // navigate('/admin/company');
        } catch (err) {
            toast.error('Something went wrong!');
            console.error(err);
        }
    }



    return (
        <>

            <Toaster position='top-center' toastOptions={{ duration: 2000 }} reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            <div className="home-content">
                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 float-left">Add Project</h5>
                    </div>

                    <div className="card-body at-elevation-z6 table-box">
                        <form id="add_company_form" onSubmit={projectSubmit} encType='multipart/form-data' >

                            <fieldset class="border shadow-sm mb-3 rounded-3 p-3">
                                <legend class="float-none w-auto px-3">General Information</legend>
                                <div class="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label">
                                                State
                                            </label>
                                            <Select
                                                name="tpm_state_id"

                                                value={(projectState?.tpm_state_id) ? projectState.tpm_state_id : null}
                                                onChange={handleStateChange}
                                                options={renderStateList()}
                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label">
                                                District
                                            </label>
                                            <Select
                                                name="tpm_district_id"
                                                value={projectState?.tpm_district_id}
                                                onChange={handleDistrictChange}
                                                options={renderDistrictList()}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label">
                                                Taluka
                                            </label>
                                            <Select
                                                name="tpm_taluka_id"
                                                value={projectState?.tpm_taluka_id}
                                                onChange={handleTalukaChange}
                                                options={renderTalukaList()}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label">
                                                Site
                                            </label>
                                            <Select
                                                name="tpm_land_site_id"

                                                value={(projectState?.tpm_land_site_id) ? projectState.tpm_land_site_id : null}
                                                onChange={handleLandSiteChange}
                                                options={renderLandSiteList()}
                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>
                                    </div>



                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Project Name <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder='Project Name' name="tpm_project_name" value={projectState?.tpm_project_name} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Board Approval <span className="text-danger">*</span></label>
                                            <input type="file" className="form-control" name="tpm_board_approval" value={projectState?.tpm_board_approval} onChange={(e) => {handleChange(e, 'file')}} required />
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>OAF Number <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder="OAF Number" name="tpm_oaf_no" value={projectState?.tpm_oaf_no} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>WBS Number <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder="WBS Number" name="tpm_wbs_no" value={projectState?.tpm_wbs_no} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset class="border shadow-sm mb-3 rounded-3 p-3">
                                <legend class="float-none w-auto px-3">PR Details</legend>
                                <div class="row">
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Number For Land <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder='Number For Land' name="tpm_pr_no_for_land" value={projectState?.tpm_pr_no_for_land} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Number For Title DD <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder='Number For Title DD' name="tpm_pr_no_for_title_deed" value={projectState?.tpm_pr_no_for_title_deed} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Number For Services <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder='Number For Services' name="tpm_pr_no_services" value={projectState?.tpm_pr_no_services} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset class="border shadow-sm mb-3 rounded-3 p-3">
                                <legend class="float-none w-auto px-3">PO Details</legend>
                                <div class="row">
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Number For Land <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder='Number For Land' name="tpm_po_no_for_land" value={projectState?.tpm_po_no_for_land} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Number For Title DD <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder='Number For Title DD' name="tpm_po_no_for_title_deed" value={projectState?.tpm_po_no_for_title_deed} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Number For Services <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder='Number For Services' name="tpm_po_no_services" value={projectState?.tpm_po_no_services} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset class="border shadow-sm mb-3 rounded-3 p-3">
                                <legend class="float-none w-auto px-3">Total Value</legend>
                                <div class="row">
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Total Land Planned To Be Acquired <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder='Total Land Planned To Be Acquired' name="tpm_total_land_planned" value={projectState?.tpm_total_land_planned} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className='col-lg-6'>
                                        <div className='form-group'>
                                            <label className='form-label'>Total Number of Locations <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" placeholder='Total Number of Locations' name="tpm_total_no_location" value={projectState?.tpm_total_no_location} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            <div className='row'>
                                <div className='d-flex mt-3'>
                                    <div className='ml-auto'>
                                        <button type='button' onClick={() => { navigate('/admin/project-management') }} className='btn btn-secondary' style={{ marginRight: "10px" }}>Cancel</button>
                                        <button className='btn btn-primary'>Submit</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </>
    )
}


export default AddProject;