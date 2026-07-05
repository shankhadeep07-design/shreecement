import React, { useState, useEffect } from 'react'
import ScaleLoader from "react-spinners/ScaleLoader";
import { getAllTalukaApi, updateTalukaDetailsApi, createTalukaApi, deleteTalukaApi } from "../../Services/Taluka-service"
import toast, { Toaster } from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Input } from 'antd';
import { Table } from 'ant-table-extensions';
import { SearchOutlined } from '@ant-design/icons';
import { FaEllipsisH, FaPencilAlt, FaTrash, FaRegPlusSquare } from 'react-icons/fa';
import { Modal, Dropdown } from "react-bootstrap";
import { getAllDistrictApi, getDistrictByStateId } from '../../Services/District-service';
import { getAllStateApi } from '../../Services/State-service';
import {useLoading} from '../../context/LoadingContext'
import Select from 'react-select';

import { roleHasPermission } from "../../Services/Role-service.js";

import PlotListShimmer from "../shimmers/PlotListShimmer.jsx"

export const TalukaMaster = () => {
    let {loading, setLoading} = useLoading(false);
    let [shimmerLoading, setShimmerLoading] = useState(true);
    let [color] = useState("#ffffff");
    const [searchText, setSearchText] = useState('');

    const [permissions, setPermissions] = useState([])
    const [responseReceived, setResponseReceived] = useState(false)
    useEffect(() => {
        roleHasPermission('talukas').then((response) => {
            if(response.status == 1){
                var pmsn = response?.data;
                setPermissions(pmsn);
                setResponseReceived(true)
            }
        })
        
            setTimeout(() =>{
                setShimmerLoading(false);
            }, 2000)
        
    },[])

    //Modal States Start
    const [show, setShow] = useState(
        { add_taluka_modal: false },
        { update_taluka_modal: false },
    );
    let changeModalStatus = (id, status) => {
        setShow({
            ...show, [id]: status
        })
    }
    //Modal States End

    const [alreadySelectedOptions, setAlreadySelectedOptions] = useState({});

    //////////////state for states start///////////////
    const [state_list, set_state_list] = useState([])
    const [selectedStateOption, setSelectedStateOption] = useState(null);
    const [state_id, setStateId] = useState(null);

    const [alreadySelectedStateOption, setAlreadySelectedStateOption] = useState(null);
    //////////////state for states end///////////////

    ///////////////state for District Started////////
    const [district_list, set_district_list] = useState([])
    const [district_list_update, set_district_list_update] = useState([])
    const [selectedDistrictOption, setSelectedDistrictOption] = useState(null);
    const [district_id, setDistrictId] = useState(null);

    const [alreadySelectedDistrictOption, setAlreadySelectedDistrictOption] = useState(null);
    ///////////////state for District Ended////////

    const [taluka_list, settalukaList] = useState([]);
    const [filter_taluka_list, setFilteredtalukaList] = useState([]);
    const [taluka_edit, setEdittaluka_edit] = useState({
        'ttll_taluka_name': '',
        'ttll_taluka_id': '',
        'ttll_tsl_state_id': '',
        'ttll_tdl_district_id': '',
    });

    const [addTaluka, setAddTaluka] = useState(
        {
            'ttll_taluka_name': "",
            'ttll_tsl_state_id': '',
            'ttll_tdl_district_id': ''
        }
    );

    useEffect(() => {
        // setLoading(true);
        getAllstateList()
    }, []);

    const handleSearch = (value) => {
        // console.log(value)
        setSearchText(value);
    };

     useEffect(() => {
         const filteredItems = taluka_list.filter((item) => {
             console.log(item)
            const talukaNameMatch = item.ttll_taluka_name
              .toLowerCase()
              .includes(searchText.toLowerCase());
         const districtNameMatch = item.tdl_district_name
           .toLowerCase()
           .includes(searchText.toLowerCase());
         const stateNameMatch =
           item.tsl_state_name &&
           item.tsl_state_name
             .toLowerCase()
             .includes(searchText.toLowerCase());

         return districtNameMatch || stateNameMatch || talukaNameMatch;
       });

       setFilteredtalukaList(filteredItems);
     }, [searchText]);

    /////////////////////////////////////state operation start///////////////////////////
    const getAllstateList = (callback = null) => {
        getAllStateApi('').then(
            data => {
                let all_client = data.data;
                set_state_list(all_client);
                setLoading(false);
            }
        )
            .catch((error) => {
                toast.error(error);
            })
    }

    const handleUpdateStateChange = (selectedOption) => {
        //console.log(selectedOption)

        const stateId = selectedOption.value;
        const stateName = selectedOption.label;
        setStateId(stateId);
        setAlreadySelectedStateOption({ label: stateName, value: stateId })
        getDistrictByStateId(stateId).then((data) => {
          set_district_list_update(data.data);
        });

        setEdittaluka_edit({
            ...taluka_edit,
            ttll_tsl_state_id: stateId,
        });
    };

    const handleStateChange = (selectedVillageOption) => {
        // //console.log(selectedVillageOption);

        var stateId = selectedVillageOption.value;

        setStateId(stateId);
        set_district_list(null);
        getDistrictByStateId(stateId).then((data) => {
            set_district_list(data.data)
        })
        setSelectedStateOption(selectedVillageOption)

        setAddTaluka({
            ...addTaluka, ["ttll_tsl_state_id"]: stateId
        });
    };
    const renderStateList = () => {
        return state_list?.map((data) => ({
            label: data.tsl_state_name,
            value: data.tsl_state_id,
        }));
    };
    /////////////////////////////////////state operation end////////////////////////////

    ////////////////////////////////////district operation start///////////////
    const handleUpdateDistrictChange = (alreadySelectedMenu) => {
        //console.log(alreadySelectedMenu)

        const districtId = alreadySelectedMenu.value;
        const districtName = alreadySelectedMenu.label;
        setDistrictId(districtId);

        setAlreadySelectedDistrictOption({ label: districtName, value: districtId })

        setEdittaluka_edit({
            ...taluka_edit,
            ttll_tdl_district_id: districtId,
        });
    };

    const handleDistrictOnChange = (selectedVillageOption) => {
        // //console.log(selectedVillageOption);

        var districtId = selectedVillageOption.value;
        setDistrictId(districtId);
        set_district_list(null);
        setSelectedDistrictOption(selectedVillageOption)

        setAddTaluka({
            ...addTaluka, ["ttll_tdl_district_id"]: districtId
        });
    };
    const renderDistrictList = () => {
        return district_list?.map((data) => ({
            label: data.tdl_district_name,
            value: data.tdl_district_id,
        }));
    };

    const renderDistrictListWhileUpdate = () => {
        return district_list_update?.map((data) => ({
            label: data.tdl_district_name,
            value: data.tdl_district_id,
        }));
    };
    ////////////////////////////////////district operation end///////////////

    // ---------------------------------  Plot List -------------------------------
    const getAlltalukaList = (callback = null) => {
        getAllTalukaApi('').then(
            data => {
                let all_client = data.data;

                settalukaList(all_client);
                setFilteredtalukaList(all_client);
                setLoading(false);
            }
        )
            .catch((error) => {
                toast.error(error);
            })
    }

    useEffect(() => {

        // setLoading(true);
        getAlltalukaList();
        getAllDistrictApi('').then((district) => {
            set_district_list_update(district.data)
        })

    }, []);

    const columns = [
        {
            title: 'Sl.',
            align:'center',
            dataIndex: 'ttll_taluka_id',
            render: (text, record, index) => index + 1,
            width: '10%',
        },
        {
            title: 'State Name',
            dataIndex: 'tsl_state_name',
            render: (text, record) => {
                return (
                    <>
                        {record.tsl_state_name}
                    </>
                );
            },
        },
        {
            title: 'District Name',
            dataIndex: 'tdl_district_name',
            render: (text, record) => {
                return (
                    <>
                        {record.tdl_district_name}
                    </>
                );
            },
        },
        {
            title: 'Taluka Name',
            dataIndex: 'ttll_taluka_name',
            render: (text, record) => {
                return (
                    <>
                        {record.ttll_taluka_name}
                    </>
                );
            },
        },
        
        {
            title: 'Actions',
            align:'center',
            render: (text, record) => (
                <>
                    {
                        (permissions?.indexOf('edit') > -1 || permissions?.indexOf('delete') > -1 || permissions == "*") ?
                            <Dropdown>
                                <Dropdown.Toggle variant="light" id={`dropdown-${record.tvl_taluka_id}`} size="sm">
                                    <FaEllipsisH style={{ marginRight: '5px' }} />
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {
                                        (permissions?.indexOf('edit') > -1 || permissions == "*") &&
                                            <Dropdown.Item  onClick={() => edit_taluka(record)}>
                                                <FaPencilAlt style={{ marginRight: '5px' }} />
                                                Edit
                                            </Dropdown.Item>
                                    }
                                    {/* {
                                        (permissions?.indexOf('delete') > -1 || permissions == "*") &&
                                            <Dropdown.Item style={{ color: 'red' }} onClick={() => talukaDelete(record.ttll_taluka_id)}>
                                                <FaTrash style={{ marginRight: '5px' }} />
                                                Delete
                                            </Dropdown.Item>
                                    } */}
                                </Dropdown.Menu>
                            </Dropdown>
                        :"-"
                    }
                </>
                
            ),
            width: '10%',
        },
    ]
    // ---------------------------------  Plot List End -------------------------------

    //--------------------- Update Plot ----------------------
    const edit_taluka = (item) => {
        const selectedStateOption = state_list.find((state) => state.tsl_state_id === item.tsl_state_id);
        const selectedDistrictOption = district_list_update.find((district) => district.tdl_district_id === item.tdl_district_id);
        setEdittaluka_edit(item);
        setAlreadySelectedStateOption({ label: selectedStateOption?.tsl_state_name, value: selectedStateOption?.tsl_state_id })
        setAlreadySelectedDistrictOption({ label: selectedDistrictOption?.tdl_district_name, value: selectedDistrictOption?.tdl_district_id })
        changeModalStatus('update_taluka_modal', true)
    }

    let handleOnChangeEditTaluka = (event, field) => {
        const actualValue = event.target.value;
        setEdittaluka_edit({
            ...taluka_edit, [field]: actualValue
        })
    }

    // const handleDropdownChange = (selectedOption, fieldName) => {
    //     //console.log(selectedOption,fieldName)
    //     setAlreadySelectedOptions((prevSelectedOptions) => ({
    //         ...prevSelectedOptions,
    //         [fieldName]: selectedOption,
    //       }));
    //     // setAlreadySelectedStateOption(selectedOption);
    //     setEdittaluka_edit((taluka_edit) => ({
    //       ...taluka_edit,
    //       [fieldName]: selectedOption.value, // Update the specified field
    //     }));
    //   };

    const handleTalukaUpdateSubmit = (event) => {
        event.preventDefault();

        if (taluka_edit.ttll_taluka_name == '') {
            toast.error('Please fill all required fields...');
            return;
        }

        let id = taluka_edit.ttll_taluka_id
        //console.log(taluka_edit)

        updateTalukaDetailsApi(taluka_edit, id).then(data => {
            toast.success(data.message);
            changeModalStatus('update_taluka_modal', false)
            getAlltalukaList();
            setEdittaluka_edit({
                'ttll_taluka_name': '',
                'ttll_taluka_id': '',
                'ttll_tsl_state_id': '',
                'ttll_tdl_district_id': '',
            });
        })
            .catch((error) => { toast.error(error); })
    }
    //--------------------- Update Plot End ----------------------

    // -----------------------  Plot delete -------------------------------------------
    const talukaDelete = (id) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui delete_popup_box'>
                        <h1>Are you sure ?</h1>
                        <p>You want to delete this record ?</p>
                        <div className='delete_button_box'>
                            <button className='btn btn-info mr-1' onClick={onClose}>Cancel</button>
                            <button className='btn btn-danger'
                                onClick={() => {
                                    handleOnClickDelete(id);
                                    onClose();
                                }}
                            >
                                Yes, Delete it!
                            </button>
                        </div>

                    </div>
                );
            }
        });
    }

    const handleOnClickDelete = (delete_id) => {
        setLoading(true);

        deleteTalukaApi(delete_id).then(data => {

            toast.success(data.message);
            getAlltalukaList();
        }).catch((error) => {
            toast.error(error);
        });
    }

    // -----------------------  Plot delete End -------------------------------------------

    const [inputSearch, setInputSearch] = useState("");

    useEffect(() => {
        const result = taluka_list.filter(data => {
            if (data.tvl_taluka_name != null) {
                return data.tvl_taluka_name.toLowerCase().match(inputSearch.toLowerCase())
            }
        });

        setFilteredtalukaList(result);
    }, [inputSearch]);

    // -----------------------  Plot Insert -------------------------------------------
    let handleOnAddTalukaInputChange = (event, field) => {
        const actualValue = event.target.value;
        setAddTaluka({
            ...addTaluka, [field]: actualValue
        })
    }

    const addNewTalukaSubmit = (event) => {
        event.preventDefault();

        if (addTaluka.ttll_taluka_name.trim() == '' || addTaluka.ttll_tdl_district_id.trim() == '' || addTaluka.ttll_tsl_state_id.trim() == '') {
            toast.error('Please fill all required fields...');
            return;
        }

        setLoading(true);
        //return;

        //console.log(addTaluka)

        createTalukaApi(addTaluka).then(data => {
            setAddTaluka('')
            setSelectedStateOption('')
            setSelectedDistrictOption('')
            //console.log(data);
            if(data.status == 0)
                {
                    toast.error(data.message);
                }
                else
                {
                    toast.success(data.message);
                }

            getAlltalukaList();
            changeModalStatus('add_taluka_modal', false)
        })
            .catch((error) => { toast.error(error); })
    }

    //console.log("taluka list", taluka_edit)
    // -----------------------  Plot Insert end -------------------------------------------

    return (
        <>
            <Toaster position='top-center' toastOptions={{ duration: 2000 }} reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            {/* This is a side bar */}
            <div className="home-content">

                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h5 className="mb-0 float-left">Taluka List</h5>

                        <div className="float-right">
                            {
                                (permissions?.indexOf('add') > -1 || permissions == "*") &&
                                    <button type="button" className="btn btn-sm btn-dark" onClick={() => changeModalStatus('add_taluka_modal', true)} >
                                        <a className='text-white' data-toggle="tooltip" data-placement="bottom" title="Add Taluka" data-bs-original-title="Add Taluka" aria-label="Add Taluka"><i className="fas fa-plus" aria-hidden="true"></i></a>
                                    </button>
                            }
                            
                        </div>
                    </div>

                    <div className="card-body at-elevation-z6 table-box">
                        {
                            (shimmerLoading) &&
                                <PlotListShimmer header={false}/>
                        }

                        <div className="card-body-content" style={{display : (shimmerLoading) ? 'none' : "block"}}>
                            {
                                (permissions?.indexOf('list') > -1 || permissions == "*") ?
                                    <>
                                        <div className="table-responsive mt-2 table table-bordered">
                                            <div style={{ overflowX: 'auto' }}>
                                                <Table dataSource={filter_taluka_list} searchable rowKey={(record) => record.tvl_taluka_id} columns={columns} pagination={{ pageSize: 10 }}  className='table table-bordered' />
                                            </div>
                                        </div>
                                    </> : 
                                    <div>
                                        <table className="table dataTable mt-2">
                                            <thead>
                                                <tr>
                                                <th>Sl.</th>
                                                <th>State Name</th>
                                                <th>District Name</th>
                                                <th>Taluka Name</th>
                                                <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                <td colSpan={5} className="text-center">You don't have list permission</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                            }
                            
                        </div>
                    </div>

                </div>

                <div className="allModals">
                    {/* Add Plot Owner Modal Start*/}
                    <Modal
                        show={show.add_taluka_modal}
                        onHide={() => changeModalStatus('add_taluka_modal', false)}
                        size="lg"
                        centered
                        backdrop="static"
                        id="add_taluka_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Add Taluka
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={addNewTalukaSubmit} id="add_taluka_form">
                                <div id="new_owner_div">
                                    <div className="validation-errors"></div>

                                    <div className="row">
                                        <div className="form-group col-md-12 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                State <span className="text-danger">*</span>
                                            </label>
                                            <Select
                                                value={selectedStateOption}
                                                onChange={handleStateChange}
                                                options={renderStateList()}
                                                required
                                            />
                                        </div>

                                        <div className="form-group col-md-12 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                District <span className="text-danger">*</span>
                                            </label>
                                            <Select
                                                value={selectedDistrictOption}
                                                onChange={handleDistrictOnChange}
                                                options={renderDistrictList()}
                                                required
                                            />
                                        </div>

                                        <div className="form-group col-md-12 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                Taluka Name <span className="text-danger">*</span>
                                            </label>
                                            <input type="text" className="form-control" onChange={(e) => { handleOnAddTalukaInputChange(e, 'ttll_taluka_name') }} value={addTaluka.ttll_taluka_name} name="ttll_taluka_name" placeholder="Taluka Name" required />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className='row'>
                                <div className='form-group col-md-12 mb-2'>
                                    <div className='d-flex justify-content-end'>
                                        <button className='btn btn-primary' type='submit' form="add_taluka_form">Submit</button>
                                    </div>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal>
                    {/* Add  Plot Owner Modal End*/}

                    {/* Update Plot Owner Modal Start*/}
                    <Modal
                        show={show.update_taluka_modal}
                        onHide={() => changeModalStatus('update_taluka_modal', false)}
                        size="lg"
                        backdrop="static"
                        centered
                        id="update_taluka_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Edit Taluka
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={handleTalukaUpdateSubmit} method='post' encType='' id="edit_taluka_form">
                                <div id="new_owner_div">
                                    <div className="validation-errors"></div>

                                    <div className="row">
                                        <div className="form-group col-md-12 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                State <span className="text-danger">*</span>
                                            </label>
                                            <Select
                                                value={alreadySelectedStateOption}
                                                onChange={handleUpdateStateChange
                                                }
                                                options={renderStateList()}
                                            />
                                        </div>

                                        <div className="form-group col-md-12 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                District <span className="text-danger">*</span>
                                            </label>
                                            <Select
                                                value={alreadySelectedDistrictOption}
                                                onChange={
                                                    handleUpdateDistrictChange
                                                }
                                                options={renderDistrictListWhileUpdate()}
                                            />
                                        </div>

                                        <div className="form-group col-md-12 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                Taluka Name <span className="text-danger">*</span>
                                            </label>
                                            <input type="text" className="form-control" onChange={(e) => { handleOnChangeEditTaluka(e, 'ttll_taluka_name') }} value={taluka_edit.ttll_taluka_name} name="ttll_taluka_name" placeholder="Taluka Name" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className='row'>
                                <div className='form-group col-md-12 mb-2'>
                                    <div className='d-flex justify-content-end'>
                                        <button className='btn btn-dark' type='submit' form="edit_taluka_form">Submit</button>
                                    </div>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal>
                    {/* Update  Plot Owner Modal End*/}

                </div>


                {/* Plot details modal */}



                {/* Plot details modal End */}

                


            </div>







        </>
    )
}
