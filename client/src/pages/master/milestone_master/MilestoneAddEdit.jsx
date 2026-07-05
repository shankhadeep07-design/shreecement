import React, { useState, useEffect } from 'react'

import {useParams} from 'react-router-dom'

import { Input } from 'antd';
import { Table } from 'ant-table-extensions';
import { SearchOutlined } from '@ant-design/icons';
import { Modal, Dropdown } from "react-bootstrap";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toast, { Toaster } from 'react-hot-toast';
import '../master_data.css';

import Select from 'react-select';
import {getAllBanks} from '../../../Services/ModuleMasterService';
import { useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';

import { submitMilestoneApi, getMilestoneApi , getMilestoneById } from '../../../Services/Milestone-service.js';
import {setMilestoneState,setAllMilestone,clearAllMilestone} from '../../../redux/slices/MasterModuleSlice';
import {useLoading} from '../../../context/LoadingContext.jsx'

export const MilestoneAddEdit = () => {
    let navigate = useNavigate();
    const [bankList, setBankList] = useState([]);
    const milestone_master = useSelector((state) => {return state.MasterModuleSlice.milestone_master});
    const [fileState, setFileState] = useState();

    const [existDocuments, setExistDicuments] = useState({}); 

    const dispatch = useDispatch();
    let {loading, setLoading} = useLoading(false);

    const { id } = useParams();

    useEffect(()=>{
        setLoading(true);
        if(id){
            var data = {
                'tmm_id':id,
               
            }
            getMilestoneById(data).then(res => {
                console.log('ytrrcg');
                console.log(res.data.tmm_milestone_name);
                
               
                    
                    dispatch(setMilestoneState({
                        id : res.data.tmm_id,
                        tmm_milestone_name : res.data.tmm_milestone_name,
                    }))

                
                setLoading(false);
            })
        }else{
            setLoading(false);
        }
       
    }, []);


    useEffect(() => {
        console.log(milestone_master);
    },[milestone_master])

    const handleChange = (e) => {
        dispatch(setMilestoneState({field: e.target.name, value: e.target.value.replace(/[^a-zA-Z0-9 ]/g, '')}));
    }

    const handleSelectChange = (selectOption) => {
        dispatch(setMilestoneState({field: 'bank', value: selectOption}))
    }

    const handleFileChange = (e) => {
        setFileState({
            ...fileState, [e.target.name] : e.target.files[0]
        });
    }

    const submitMilestone = async (e) => {
        e.preventDefault();   
        setLoading(true);
       // const formData = new FormData();
       console.log(milestone_master.value);

       if(id){
        var data = {
            'tmm_milestone_name':milestone_master.value,
            'tmm_id':id ,
        }
       }
       else{
        var data = {
            'tmm_milestone_name':milestone_master.value ,
        }
       }

        

       // console.log(data);

        //return false ;


     

        // for (const [key, value] of Object.entries(milestone_master)) {
        //     if (typeof value === 'object' && value !== null && value.hasOwnProperty('value')) {
        //         formData.append(key, value.value);
        //     } else {
        //         formData.append(key, value);
        //     }
        // }
        try{
            await submitMilestoneApi(data);
            if(id){
                toast.success('Milestone Updated successfully!')
            }
            else{
                toast.success('Milestone added successfully!')
            }
            
            setLoading(false);
            navigate('/admin/milestone-master');
        }catch(err){
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
                        <h5 className="mb-0 float-left">Add Milestone</h5>
                    </div>

                    <div className="card-body at-elevation-z6 table-box">
                        <form id="add_company_form" onSubmit={submitMilestone} encType='multipart/form-data'>

                        <fieldset class="border shadow-sm mb-3 rounded-3 p-3">
                            <legend class="float-none w-auto px-3">MileStone</legend>

                            <div class="row">
                            <div className='col-lg-6'>
                                    <div className='form-group'>
                                        <label className='form-label'>MileStone Name </label>
                                        <input type="text" className="form-control" placeholder='Milestone ' name="tmm_milestone_name"
                                        value={milestone_master?.tmm_milestone_name} onChange={handleChange} required/>
                                    </div>
                                </div>
                               
                            </div>
                        </fieldset>

                        
                            <div className='row'>                              
                                <div className='d-flex mt-3'>
                                    <div className='ml-auto'>
                                        <button type='button' onClick={() => {navigate('/admin/advocate')}} className='btn btn-secondary' style={{marginRight : "10px"}}>Cancel</button>
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
