import React, { useState, useEffect } from 'react'
import ScaleLoader from "react-spinners/ScaleLoader";
import { getAllUnitApi, updateUnitDetailsApi, createUnitApi, deleteUnitApi } from "../../Services/unit-service"
import toast, { Toaster } from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Table } from 'ant-table-extensions';
import { SearchOutlined } from '@ant-design/icons';
import { FaEllipsisH, FaPencilAlt, FaTrash, FaRegPlusSquare } from 'react-icons/fa';
import { Modal, Dropdown } from "react-bootstrap";
import Select from 'react-select';
import { getAllDistrictApi, getDistrictByStateId } from '../../Services/District-service';
import { getAllStateApi } from '../../Services/State-service';
import { getAllTalukaApi, getAllTalukaByStateAndDistrict } from '../../Services/Taluka-service';
import {useLoading} from '../../context/LoadingContext'

import { roleHasPermission } from "../../Services/Role-service.js";

import PlotListShimmer from "../shimmers/PlotListShimmer.jsx"

export const Unit = () => {
    let {loading, setLoading} = useLoading(false);
    let [shimmerLoading, setShimmerLoading] = useState(true);
    let [color] = useState("#ffffff");
    const [searchText, setSearchText] = useState('');

    const [permissions, setPermissions] = useState([])
    const [responseReceived, setResponseReceived] = useState(false)
    useEffect(() => {
        roleHasPermission('units').then((response) => {
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
        { add_unit_modal: false },
        { update_unit_modal: false },
    );
    let changeModalStatus = (id, status) => {
        setShow({
            ...show, [id]: status
        })
    }
    //Modal States End

    const [unit_list, setunitList] = useState([]);
    const [filter_unit_list, setFilteredunitList] = useState([]);

    ////////////////////////state of states start///////////////////////
    const [state_list, set_state_list] = useState([])
    const [state_list_update, set_state_list_update] = useState([])
    const [selectedStateOption, setSelectedStateOption] = useState(null);
    const [state_id, setStateId] = useState(null);

    const [alreadySelectedStateOption, setAlreadySelectedStateOption] = useState(null);
    ////////////////////////state of states end///////////////////////

    ////////////////////////district of states start///////////////////////
    const [district_list, set_district_list] = useState([])
    const [district_list_update, set_district_list_update] = useState([])
    const [selectedDistrictOption, setSelectedDistrictOption] = useState(null);
    const [district_id, setDistrictId] = useState(null);

    const [alreadySelectedDistrictOption, setAlreadySelectedDistrictOption] = useState(null);
    ////////////////////////district of states end///////////////////////

    //////////////////////// of states start///////////////////////
    const [taluka_list, set_taluka_list] = useState([])
    const [taluka_list_update, set_taluka_list_update] = useState([])
    const [selectedTalukaOption, setSelectedTalukaOption] = useState(null);
    const [taluka_id, setTalukaId] = useState(null);

    const [alreadySelectedTalukaOption, setAlreadySelectedTalukaOption] = useState(null);
    //////////////////////// of states end///////////////////////

    const [addUnit, setAddUnit] = useState(
        {
            'tun_name': "",
            'tun_tsl_state_id': '',
            'tun_tdl_district_id': '',
            'tun_ttll_taluka_id': ''
        }
    );

    const [unit_edit, setEditUnit_edit] = useState({
        'tun_name': '',
        'tun_id': '',
        'tun_tsl_state_id': '',
        'tun_tdl_district_id': '',
        'tun_ttll_taluka_id': ''
    });



    const handleSearch = (value) => {
        setSearchText(value);
    };

     useEffect(() => {
       const filteredItems = unit_list.filter((item) => {
           console.log(item);
           const unitNameMatch = item.tun_name
             .toLowerCase()
             .includes(searchText.toLowerCase());
         const talukaNameMatch = item.ttll_taluka_name
           .toLowerCase()
           .includes(searchText.toLowerCase());
         const districtNameMatch = item.tdl_district_name
           .toLowerCase()
           .includes(searchText.toLowerCase());
         const stateNameMatch =
           item.tsl_state_name &&
           item.tsl_state_name.toLowerCase().includes(searchText.toLowerCase());

         return districtNameMatch || stateNameMatch || talukaNameMatch || unitNameMatch;
       });

       setFilteredunitList(filteredItems);
     }, [searchText]);

    // ---------------------------------  Plot List -------------------------------
    const getAllunitList = (callback = null) => {
        getAllUnitApi('').then(
            data => {

                let all_client = data.data;
                //console.log(all_client)
                setunitList(all_client);
                setFilteredunitList(all_client);
                setLoading(false);

            }
        )
            .catch((error) => {
                toast.error(error);
            })
    }




    useEffect(() => {

        // setLoading(true);
        getAllstateList()
        getAllDistrictList()
        getAllTalukaList()
        getAllunitList();

    }, []);

    const columns = [
        {
            title: 'Sl.',
            dataIndex: 'tvl_unit_id',
            align:'center',
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
            title: 'Unit Name',
            dataIndex: 'tun_name',
            render: (text, record) => {
                return (
                    <>
                        {record.tun_name}
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
                                <Dropdown.Toggle variant="light" id={`dropdown-${record.tvl_unit_id}`} size="sm">
                                    <FaEllipsisH style={{ marginRight: '5px' }} />
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {
                                        (permissions?.indexOf('edit') > -1 || permissions == "*") &&
                                            <Dropdown.Item  onClick={() => edit_unit(record)}>
                                                <FaPencilAlt style={{ marginRight: '5px' }} />
                                                Edit
                                            </Dropdown.Item>
                                    }
                                    {/* {       
                                        (permissions?.indexOf('delete') > -1 || permissions == "*") &&
                                            <Dropdown.Item style={{ color: 'red' }} onClick={() => unitDelete(record.tun_id)}>
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
    const edit_unit = (item) => {
        //console.log(item)

        const selectedStateOption = state_list.find((state) => state.tsl_state_id === item.tsl_state_id);
        const selectedDistrictOption = district_list_update.find((district) => district.tdl_district_id === item.tdl_district_id);
        const selectedTalukaOption = taluka_list_update.find((taluka) => taluka.ttll_taluka_id === item.ttll_taluka_id);
        setEditUnit_edit(item);
        setAlreadySelectedStateOption({ label: selectedStateOption?.tsl_state_name, value: selectedStateOption?.tsl_state_id })
        setAlreadySelectedDistrictOption({ label: selectedDistrictOption?.tdl_district_name, value: selectedDistrictOption?.tdl_district_id })
        setAlreadySelectedTalukaOption({ label: selectedTalukaOption?.ttll_taluka_name, value: selectedTalukaOption?.ttll_taluka_id })

        changeModalStatus('update_unit_modal', true)
    }

    let handleOnChangeEditUnit = (event, field) => {
        const actualValue = event.target.value;
        setEditUnit_edit({
            ...unit_edit, [field]: actualValue
        })
    }

    const handleUnitUpdateSubmit = (event) => {
        event.preventDefault();

        if (unit_edit.tun_name == '') {
            toast.error('Please fill all required fields...');
            return;
        }

        let id = unit_edit.tun_id
        //console.log(unit_edit)

        updateUnitDetailsApi(unit_edit, id).then(data => {
            toast.success(data.message);
            changeModalStatus('update_unit_modal', false)
            getAllunitList();
        })
            .catch((error) => { toast.error(error); })

    }
    //--------------------- Update Plot End ----------------------

    // -----------------------  Plot delete -------------------------------------------
    const unitDelete = (id) => {
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

        deleteUnitApi(delete_id).then(data => {

            toast.success(data.message);
            getAllunitList();
        }).catch((error) => {
            toast.error(error);
        });
    }

    // -----------------------  Plot delete End -------------------------------------------

    const [inputSearch, setInputSearch] = useState("");

    useEffect(() => {
        const result = unit_list.filter(data => {
            if (data.tvl_unit_name != null) {
                return data.tvl_unit_name.toLowerCase().match(inputSearch.toLowerCase())
            }
        });

        setFilteredunitList(result);
    }, [inputSearch]);

    // -----------------------  Plot Insert -------------------------------------------

    let handleOnAddUnitInputChange = (event, field) => {
        const actualValue = event.target.value;
        setAddUnit({
            ...addUnit, [field]: actualValue
        })
    }

    const addNewUnitSubmit = (event) => {
        event.preventDefault();

        if (addUnit.tun_name == '' || addUnit.tun_tsl_state_id == '' || addUnit.tun_tdl_district_id == '' || addUnit.tun_ttll_taluka_id == '') {
            toast.error('Please fill all required fields...');
            return;
        }

        //console.log(addUnit.tun_tsl_state_id);

        setLoading(true);

        //console.log(addUnit)

        createUnitApi(addUnit).then(data => {
            setAddUnit({ "tun_name": "" })
            setSelectedStateOption('')
            setSelectedDistrictOption('')
            setSelectedTalukaOption('')
            //console.log(data);
            toast.success(data.message);

            getAllunitList();
            changeModalStatus('add_unit_modal', false)
        })
            .catch((error) => { toast.error(error); })
    }

    //console.log("unit list", unit_edit)
    // -----------------------  Plot Insert end -------------------------------------------

    ////////////////////////////state operation start/////////////////////////////
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

    const handleStateChange = (selectedVillageOption) => {
        // //console.log(selectedVillageOption);

        var stateId = selectedVillageOption.value;

        setStateId(stateId);
        set_district_list(null);
        set_taluka_list(null)
        getDistrictByStateId(stateId).then((data) => {
            set_district_list(data.data)
        })
        setSelectedStateOption(selectedVillageOption)

        setAddUnit({
            ...addUnit, ["tun_tsl_state_id"]: stateId
        });
    };

    const handleStateChangeOnUpdate = (selectedVillageOption) => {
        // //console.log(selectedVillageOption);

        //console.log(selectedVillageOption)

        const stateId = selectedVillageOption.value;
        const stateName = selectedVillageOption.label;
        setStateId(stateId);
         getDistrictByStateId(stateId).then((data) => {
           set_district_list_update(data.data);
         });
        setAlreadySelectedStateOption({ label: stateName, value: stateId })

        setEditUnit_edit({
            ...unit_edit,
            tun_tsl_state_id: stateId,
        });
    };

    const renderStateList = () => {
        return state_list?.map((data) => ({
            label: data.tsl_state_name,
            value: data.tsl_state_id,
        }));
    };

    const renderStateUpdateList = () => {
        return state_list?.map((data) => ({
            label: data.tsl_state_name,
            value: data.tsl_state_id,
        }));
    };
    ////////////////////////////state operation end/////////////////////////////

    ////////////////////////////district operation start/////////////////////////////
    const getAllDistrictList = (callback = null) => {
        getAllDistrictApi('').then(
            data => {
                let all_client = data.data;
                set_district_list_update(all_client);
                setLoading(false);
            }
        )
            .catch((error) => {
                toast.error(error);
            })
    }


    const handleDistrictChange = (selectedVillageOption) => {
        // //console.log(selectedVillageOption);

        var districtId = selectedVillageOption.value;

        setDistrictId(districtId);
        set_taluka_list(null);
        getAllTalukaByStateAndDistrict(state_id, districtId).then((data) => {
            set_taluka_list(data.data)
        })
        setSelectedDistrictOption(selectedVillageOption)

        setAddUnit({
            ...addUnit, ["tun_tdl_district_id"]: districtId
        });
    };

    const handleDistrictChangeOnUpdate = (selectedVillageOption) => {
        // //console.log(selectedVillageOption);
        //console.log(selectedVillageOption)

        const districtIds = selectedVillageOption.value;
        const districtNames = selectedVillageOption.label;
        setDistrictId(districtIds);

        getAllTalukaByStateAndDistrict(state_id, districtIds).then((data) => {
          set_taluka_list_update(data.data);
        });

        setAlreadySelectedDistrictOption({ label: districtNames, value: districtIds })

        setEditUnit_edit({
            ...unit_edit,
            tun_tdl_district_id: districtIds,
        });
    };

    const renderDistrictList = () => {
        return district_list?.map((data) => ({
            label: data.tdl_district_name,
            value: data.tdl_district_id,
        }));
    };

    const renderDistrictUpdateList = () => {
        return district_list_update?.map((data) => ({
            label: data.tdl_district_name,
            value: data.tdl_district_id,
        }));
    };
    ////////////////////////////district operation end/////////////////////////////


    ////////////////////////////taluka operation end/////////////////////////////

    const getAllTalukaList = (callback = null) => {
        getAllTalukaApi('').then(
            data => {

                let all_client = data.data;
                set_taluka_list_update(all_client);
                setLoading(false);

            }
        )
            .catch((error) => {
                toast.error(error);
            })
    }

    const handleTalukaChange = (selectedVillageOption) => {
        //console.log(selectedVillageOption);

        var talukaId = selectedVillageOption.value;

        setTalukaId(talukaId);
        setSelectedTalukaOption(selectedVillageOption)

        setAddUnit({
            ...addUnit, ["tun_ttll_taluka_id"]: talukaId
        });
    };

    const handleTalukaChangeOnUpdate = (selectedVillageOption) => {
        // //console.log(selectedVillageOption);

        var talukaId = selectedVillageOption.value;
        var tvl_taluka_name = selectedVillageOption.label;

        setTalukaId(talukaId);
        setAlreadySelectedTalukaOption({ label: tvl_taluka_name, value: talukaId })

        setEditUnit_edit({
            ...unit_edit,
            tun_ttll_taluka_id: talukaId,
        });
    };

    const renderTalukaList = () => {
        return taluka_list?.map((data) => ({
            label: data.ttll_taluka_name,
            value: data.ttll_taluka_id,
        }));
    };

    const renderTalukaUpdateList = () => {
        return taluka_list_update?.map((data) => ({
            label: data.ttll_taluka_name,
            value: data.ttll_taluka_id,
        }));
    };

    ////////////////////////////taluka operation end/////////////////////////////

    return (
        <>
            <Toaster position='top-center' toastOptions={{ duration: 2000 }} reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            <div className="home-content">
                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 float-left">Unit List</h5>
                        <div className="float-right">
                            {
                                (permissions?.indexOf('add') > -1 || permissions == "*") &&
                                    <button type="button" className="btn btn-sm btn-dark" onClick={() => changeModalStatus('add_unit_modal', true)} >
                                        <a data-toggle="tooltip" data-placement="bottom" title="Add Unit" data-bs-original-title="Add Unit" aria-label="Add Unit"><i className="fas fa-plus" aria-hidden="true"></i></a>
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
                                                <Table dataSource={filter_unit_list} searchable rowKey={(record) => record.tvl_unit_id} columns={columns} pagination={{ pageSize: 10 }}  className='table table-bordered' />
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
                                                    <th>Unit Name</th>
                                                    <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                    <td colSpan={6} className="text-center">You don't have list permission</td>
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
                        show={show.add_unit_modal}
                        onHide={() => changeModalStatus('add_unit_modal', false)}
                        size="lg"
                        centered
                        backdrop="static"
                        id="add_unit_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Add Unit
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={addNewUnitSubmit} id="add_unit_form">
                                <div id="new_owner_div">
                                    <div className="validation-errors"></div>

                                    <div className="row">
                                        <div className="form-group col-md-6 mb-2">
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

                                        <div className="form-group col-md-6 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                District <span className="text-danger">*</span>
                                            </label>
                                            <Select
                                                value={selectedDistrictOption}
                                                onChange={handleDistrictChange}
                                                options={renderDistrictList()}
                                            />
                                        </div>

                                        <div className="form-group col-md-6 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                Taluka <span className="text-danger">*</span>
                                            </label>
                                            <Select
                                                value={selectedTalukaOption}
                                                onChange={handleTalukaChange}
                                                options={renderTalukaList()}
                                                required
                                            />
                                        </div>

                                        <div className="form-group col-md-6 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                Unit Name <span className="text-danger">*</span>
                                            </label>
                                            <input type="text" className="form-control" onChange={(e) => { handleOnAddUnitInputChange(e, 'tun_name') }} value={addUnit.tun_name} name="tun_name" placeholder="Unit Name" required />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className='row'>
                                <div className='form-group col-md-12 mb-2'>
                                    <div className='d-flex justify-content-end'>
                                        <button className='btn btn-dark' type='submit' form="add_unit_form">Submit</button>
                                    </div>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal>
                    {/* Add  Plot Owner Modal End*/}

                    {/* Update Plot Owner Modal Start*/}
                    <Modal
                        show={show.update_unit_modal}
                        onHide={() => changeModalStatus('update_unit_modal', false)}
                        size="lg"
                        backdrop="static"
                        centered
                        id="update_unit_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Edit Unit
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={handleUnitUpdateSubmit} method='post' id="edit_unit_form" encType=''>
                                <div id="new_owner_div">
                                    <div className="validation-errors"></div>

                                    <div className="row">
                                        <div className="form-group col-md-6 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                State <span className="text-danger">*</span>
                                            </label>
                                            <Select
                                                value={alreadySelectedStateOption}
                                                onChange={handleStateChangeOnUpdate}
                                                options={renderStateUpdateList()}
                                            />
                                        </div>

                                        <div className="form-group col-md-6 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                District <span className="text-danger">*</span>
                                            </label>
                                            <Select
                                                value={alreadySelectedDistrictOption}
                                                onChange={handleDistrictChangeOnUpdate}
                                                options={renderDistrictUpdateList()}
                                            />
                                        </div>

                                        <div className="form-group col-md-6 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                Taluka <span className="text-danger">*</span>
                                            </label>
                                            <Select
                                                value={alreadySelectedTalukaOption}
                                                onChange={handleTalukaChangeOnUpdate}
                                                options={renderTalukaUpdateList()}
                                            />
                                        </div>

                                        <div className="form-group col-md-6 mb-2">
                                            <label
                                                htmlFor="exampleFormControlInput1"
                                                className="form-label"
                                            >
                                                Unit Name <span className="text-danger">*</span>
                                            </label>
                                            <input type="text" className="form-control" onChange={(e) => { handleOnChangeEditUnit(e, 'tun_name') }} value={unit_edit.tun_name} name="tun_name" placeholder="Unit Name" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className='row'>
                                <div className='form-group col-md-12 mb-2'>
                                    <div className='d-flex justify-content-end'>
                                        <button className='btn btn-primary' type='submit' form="edit_unit_form">Submit</button>
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
