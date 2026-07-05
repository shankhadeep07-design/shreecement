import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
    createClassificationApi,
    deleteClassificationApi,
    getAllClassificationsApi,
    updateClassificationDetailsApi,
} from "../../../Services/Classification-service.js";
import toast, { Toaster } from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

import { useLoading } from '../../../context/LoadingContext.jsx'

import { roleHasPermission } from "../../../Services/Role-service.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { slugToText } from "../../../helper/common.js";
import { useSelector, useDispatch } from "react-redux";
import { setOtherMaster, clearAllOtherMaster, setAllOtherMaster } from "../../../redux/slices/MasterModuleSlice.js";
import { createModule, getModuleById } from "../../../Services/ModuleMasterService.js";

export const OtherMastersAdd = () => {
    let {loading, setLoading} = useLoading();
    let [shimmerLoading, setShimmerLoading] = useState(true);
    let [color] = useState("#ffffff");
    const [searchText, setSearchText] = useState("");

    const OtherMasterState = useSelector(state => state?.MasterModuleSlice?.other_master);
    var dispatch = useDispatch();
    var navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const _pm = queryParams.get('_pm');
    const {id} = useParams();

    const [permissions, setPermissions] = useState([])

    useEffect(() => {
        if(id){
            setLoading(true);
            getModuleById({id : id}).then(response => {
                var obj = {
                    id : response?.data?.tmm_id,
                    title : response?.data?.tmm_disp_title,
                    description : response?.data?.tmm_description,
                }
                dispatch(setAllOtherMaster(obj));
                setLoading(false);
            })
        }
    },[id])

    useEffect(() => {
        roleHasPermission('other_masters').then((response) => {
            if (response.status == 1) {
                var pmsn = response?.data;
                setPermissions(pmsn);
            }
        })
        setTimeout(() => {
            setShimmerLoading(false);
        }, 2000)
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        var obj = {
            ...OtherMasterState,
            module_type : _pm || 'module'
        }

        createModule(obj).then(response => {
            if(response?.status) {
                toast.success(response?.message)
                dispatch(clearAllOtherMaster())
                navigate(`/admin/other-masters/${_pm || ''}`)
            }else{
                toast.error(response?.message)
            }
            setLoading(false);
        }).catch(err => {
            setLoading(false);
            toast.error(err?.message)
        })
    }


    const handleChange = (e) => {
        var obj = {
            field : e.target.name,
            value : e.target.value
        }
        dispatch(setOtherMaster(obj));
    }

    

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{ duration: 2000 }}
                reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            {/* This is a side bar */}

            <div className="home-content">


                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h5 className="mb-0 float-left">
                            Add Other Master {(_pm) && `of ${slugToText(_pm)}`}
                        </h5>
                    </div>

                    <div className="card-body at-elevation-z6 table-box">
                        <div className="card-body-content">
                            {
                                (permissions?.indexOf('add') > -1 || permissions?.indexOf('edit') > -1 || permissions == "*") ?
                                    <>
                                        <div className="row">
                                            <form onSubmit={handleSubmit} id="other_master_form">
                                                <div className="col-lg-12 mb-3">
                                                    <label htmlFor="" className="form-label">Enter Title</label>
                                                    <input name="title" type="text" value={OtherMasterState?.title} onChange={handleChange} required className="form-control" placeholder="Enter Title" />
                                                </div>
                                                <div className="col-lg-12">
                                                    <label htmlFor="" className="form-label">Enter Description</label>
                                                    <textarea name="description" required onChange={handleChange} className="form-control" value={OtherMasterState?.description} placeholder="Enter Description"></textarea>
                                                </div>
                                            </form>
                                        </div>
                                        <div className='row'>
                                            <div className='d-flex mt-3'>
                                                <div className='ml-auto'>
                                                    <button type='button' onClick={() => { navigate(`/admin/other-masters/${_pm || ''}`) }} className='btn btn-secondary' style={{ marginRight: "10px" }}>Cancel</button>
                                                    <button className='btn btn-primary' form="other_master_form">Submit</button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                    :
                                        <h6 className="text-center">You don't have the permission to access this resource</h6>
                            }



                        </div>
                    </div>
                </div>




                {/* Plot details modal */}

                {/* Plot details modal End */}


            </div>
        </>
    );
};
