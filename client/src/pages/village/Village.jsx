import React, { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import ScaleLoader from "react-spinners/ScaleLoader";
import { createVillageApi, deleteVillageApi, getAllVillagesApi, updateVillageDetailsApi } from "../../Services/Village-service"
import toast, { Toaster } from 'react-hot-toast';

import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

import { Table, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { FaEllipsisH, FaPencilAlt, FaTrash, FaRegPlusSquare } from 'react-icons/fa';



import { Modal, Dropdown } from "react-bootstrap";

import $ from 'jquery';
import { getAllUnitApi } from '../../Services/unit-service';



export const Village = () => {
    let {loading, setLoading} = useLoading(false);
    let [color] = useState("#ffffff");
    const [searchText, setSearchText] = useState('');

    //Modal States Start
    const [show, setShow] = useState(
        { add_village_modal: false },
        { update_village_modal: false },
    );
    let changeModalStatus = (id, status) => {
        setShow({
            ...show, [id]: status
        })
    }
    //Modal States End

    const [plot_list, setPlotList] = useState([]);
    const [village_list, setVillageList] = useState([]);
    const [filter_village_list, setFilteredVillageList] = useState([]);
    const [village_edit, setEditVillage_edit] = useState({
        'tvl_village_name': '',
        'tvl_village_id': '',
        'tvl_tun_unit_id': "",
        'tvl_tun_unit_name': ""
    });
    const [client_status] = useState({
        'id': '',
        'c_status': '',
    });
    const [addVillage, setAddVillage] = useState(
        {
            "wkb_geometry": "",
            "tvl_village_name": "",
            "tvl_tun_unit_id": "",
            "tvl_tun_unit_name": ""
        }
    );
    const [selectedOption, setOwnerOption] = useState(null);


    const handleSearch = (value) => {
        setSearchText(value);
    };


    // ---------------------------------  Plot List -------------------------------
    const getAllVillageList = (callback = null) => {
        getAllVillagesApi('').then(
            data => {

                let all_client = data.data;
                setVillageList(all_client);
                setFilteredVillageList(all_client);
                setLoading(false);
            }
        )
            .catch((error) => {
                toast.error(error);
            })
    }

    const getAllPlotList = (callback = null) => {
        getAllUnitApi('').then(
            data => {

                let all_client = data.data;
                setPlotList(all_client);
                setLoading(false);
            }
        )
            .catch((error) => {
                toast.error(error);
            })
    }



    useEffect(() => {

        setLoading(true);
        getAllPlotList();
        getAllVillageList();

    }, []);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'tvl_village_id',
            render: (text, record, index) => index + 1,
            width: '10%',
        },
        {
            title: 'Village Name',
            dataIndex: 'tvl_village_name',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => Object.values(record).some((val) => val && val.toString().toLowerCase().includes(value.toLowerCase())),
            render: (text, record) => {
                return (
                    <>
                        {record.tvl_village_name}
                    </>
                );
            },
        },
        {
            title: 'Unit  Name',
            dataIndex: 'tvl_tun_unit_name',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => Object.values(record).some((val) => val && val.toString().toLowerCase().includes(value.toLowerCase())),
            render: (text, record) => {
                return (
                    <>
                        {record.tvl_tun_unit_name}
                    </>
                );
            },
        },
        {
            title: 'Actions',
            render: (text, record) => (
                <Dropdown>
                    <Dropdown.Toggle variant="secondary" id={`dropdown-${record.tvl_village_id}`} size="sm">
                        <FaEllipsisH style={{ marginRight: '5px' }} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>

                        <Dropdown.Item  onClick={() => handleOnChangeEditVillage(record)}>
                            <FaPencilAlt style={{ marginRight: '5px' }} />
                            Edit
                        </Dropdown.Item>
                        <Dropdown.Item  onClick={() => handleOnVillageDelete(record.tvl_village_id)}>
                            <FaTrash style={{ marginRight: '5px' }} />
                            Delete
                        </Dropdown.Item>

                    </Dropdown.Menu>
                </Dropdown>
            ),
        },
    ]



    // ---------------------------------  Plot List End -------------------------------

    //--------------------- Update Plot ----------------------

    const [unitOptionChange, setUnitOptionChange] = useState();

    const handleOnChangeEditVillage = (item) => {

        var edit_data = {
            'tvl_village_id': (item.tvl_village_id != null) ? item.tvl_village_id : '',
            'tvl_village_name': (item.tvl_village_name != null) ? item.tvl_village_name : '',

        }
        setEditVillage_edit(item);

        setUnitOptionChange({ label: item.tvl_tun_unit_name, value: item.tvl_tun_unit_id });
        changeModalStatus('update_village_modal', true)
    }
    let inputUpdate = (event, field) => {
        const actualValue = event.target.value;
        setEditVillage_edit({
            ...village_edit, [field]: actualValue
        })
    }

    const handleOnUnitChange = (selectedOption) => {

        var plot_id = selectedOption.value;
        setUnitOptionChange(selectedOption);


        setEditVillage_edit({
            ...village_edit, 'tvl_tun_unit_id': plot_id, "tvl_tun_unit_name": selectedOption.label
        })

    };



    const handleUpdateVillageSubmit = (event) => {

        event.preventDefault();
        // let data=JSON.stringify({villageName:village_edit.tvl_village_name})
        let id = village_edit.tvl_village_id
        //setLoading(true);return;

        updateVillageDetailsApi(village_edit, id).then(data => {

            toast.success(data.message);
            changeModalStatus('update_village_modal', false)
            getAllVillageList();
            $('#handleUpdateVillageSubmit').hide();
            $('.modal-backdrop').hide();
        })
            .catch((error) => { toast.error(error); })

    }

    //--------------------- Update Plot End ----------------------

    // -----------------------  Plot delete -------------------------------------------
    const handleOnVillageDelete = (id) => {

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
                                    handleClickDelete(id);
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

    const handleClickDelete = (delete_id) => {
        setLoading(true);
        deleteVillageApi(delete_id).then(data => {
            toast.success(data.message);
            getAllVillageList();
        }).catch((error) => {
            toast.error(error);
        });
    }

    // -----------------------  Plot delete End -------------------------------------------

    const [inputSearch, setInputSearch] = useState("");

    useEffect(() => {
        const result = village_list.filter(data => {

            if (data.tvl_village_name != null) {
                return data.tvl_village_name.toLowerCase().match(inputSearch.toLowerCase())
            }


        });

        setFilteredVillageList(result);

    }, [inputSearch]);



    // -----------------------  Plot Insert -------------------------------------------

    let handleOnAddChange = (event, field) => {
        const actualValue = event.target.value;
        setAddVillage({
            ...addVillage, [field]: actualValue
        })
    }
    let handelImageChange = (event, field) => {
        let files = event.target.files[0];

        setAddVillage({
            ...addVillage, [field]: files
        })

    }

    const plotChange = (selectedOption) => {

        var plot_id = selectedOption.value;
        let plot_name = selectedOption.label
        setOwnerOption(selectedOption);

        setAddVillage({
            ...addVillage,
            'tvl_tun_unit_id': plot_id,
            'tvl_tun_unit_name': selectedOption.label
        })

    };

    const renderList = () => {

        return (plot_list.map(data => ({ label: data.tun_name, value: data.tun_id })))
    }


    const handleAddVillageSubmit = (event) => {

        event.preventDefault();
        setLoading(true);


        createVillageApi(addVillage).then(data => {

            toast.success(data.message);

            getAllVillageList();
            changeModalStatus('add_village_modal', false)
            $('#staticBackdrop').hide();
            $('.modal-backdrop').hide();
        })
            .catch((error) => { toast.error(error); })

    }

    // -----------------------  Plot Insert end -------------------------------------------

    return (
        <>
            <Toaster position='top-center' toastOptions={{ duration: 2000 }} reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            <div className="home-content">
                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h5 className="mb-0 float-left"><i className="fa fa-list" aria-hidden="true"></i> Village List</h5>
                        <div className="float-right">

                            <button type="button" className="btn btn-sm btn-dark" onClick={() => changeModalStatus('add_village_modal', true)} >
                                <a className='text-white' data-toggle="tooltip" data-placement="bottom" title="Add Village" data-bs-original-title="Add Village" aria-label="Add User"><FaRegPlusSquare /></a>
                            </button>

                            {/* <a className="btn btn-sm btn-primary btn-customized open-menu" href="http://localhost/coal_india_lms/ncl/plots#" role="button">
                    <i className="fas fa-align-left"></i> <span>Filter</span>
                </a> */}

                        </div>
                    </div>

                    <div className="card-body at-elevation-z6 table-box">
                        <div className="table-responsive mt-2 table table-bordered">
                            <div>
                                <div className="data_search">
                                    <Input.Search placeholder="Search" value={searchText} onChange={(e) => handleSearch(e.target.value)} style={{ width: '200px' }} prefix={<SearchOutlined style={{ marginRight: '8px', color: 'rgba(0, 0, 0, 0.25)' }} />} className="no-addon" />
                                    <style>{`.no-addon .ant-input-group-addon { display: none; }`}</style>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <Table dataSource={filter_village_list} rowKey={(record) => record.tvl_village_id} columns={columns} pagination={{ pageSize: 10 }} className="table table-bordered" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="allModals">
                    {/* Add Plot Owner Modal Start*/}
                    <Modal
                        show={show.add_village_modal}
                        onHide={() => changeModalStatus('add_village_modal', false)}
                        size="lg"
                        id="add_village_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Add Village
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={handleAddVillageSubmit}>
                                <div id="new_owner_div">
                                    <div className="validation-errors"></div>

                                    <div className='row'>
                                        <div className='col-md-4'>
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Select Unit</label>

                                                <Select
                                                    value={selectedOption}
                                                    onChange={plotChange}
                                                    options={renderList()}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    <div className="row">
                                        <div className="form-group col-md-4 mb-2">
                                            <label>Village Name <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" onChange={(e) => { handleOnAddChange(e, 'tvl_village_name') }} value={addVillage.tvl_village_name} name="tvl_village_name" placeholder="Village Name" />
                                        </div>
                                    </div>

                                    {/* <label>Documents (PAN / Aadhar / Voter / Ration etc.)</label>
                            <div className="add_item">
                                <div className="row">
                                    <div className="form-group col-md-4 mb-2">
                                        <input type="text" className="form-control"  onChange={(e) => {handleOnAddChange(e,'tplo_occupation')}} value={addVillage.tplo_name} name="add_plot_owner_document_name[]" placeholder="Document Name"/>
                                    </div>

                                    <div className="form-group col-md-4 mb-2">
                                        <input type="file" className="form-control"  onChange={(e) => {handleOnAddChange(e,'tplo_occupation')}} value={addVillage.tplo_name} name="add_plot_owner_document_file[]" placeholder="Document File"/>
                                    </div>

                                    <div className="form-group col-sm-3">
                                        <span className="btn text-primary addAnotherRow"><i className="fa fa-plus-circle"></i></span>
                                    </div>
                                </div>
                            </div> */}

                                    <div className='row'>
                                        <div className='col-md-10'>

                                        </div>
                                        <div className='col-md-2'>
                                            <button className='btn btn-info'>Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal>
                    {/* Add  Plot Owner Modal End*/}

                    {/* Update Plot Owner Modal Start*/}
                    <Modal
                        show={show.update_village_modal}
                        onHide={() => changeModalStatus('update_village_modal', false)}
                        size="lg"
                        id="update_village_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Update Village Details
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={handleUpdateVillageSubmit} method='post' encType=''>
                                <div id="new_owner_div">
                                    <div className="validation-errors"></div>

                                    <div className='row'>
                                        <div className='col-md-4'>
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Select Plot</label>

                                                <Select
                                                    value={unitOptionChange}
                                                    onChange={handleOnUnitChange}
                                                    options={renderList()}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="form-group col-md-4 mb-2">
                                            <label>New Village Name</label>
                                            <textarea rows="2" className="form-control" onChange={(e) => { inputUpdate(e, 'tvl_village_name') }} value={village_edit.tvl_village_name} name="tvl_village_name"></textarea>
                                        </div>
                                    </div>

                                    {/* <label>Documents (PAN / Aadhar / Voter / Ration etc.)</label>
                            <div className="add_item">
                                <div className="row">
                                    <div className="form-group col-md-4 mb-2">
                                        <input type="text" className="form-control"  onChange={(e) => {inputUpdate(e,'tplo_occupation')}} value={village_edit.tplo_name} name="add_plot_owner_document_name[]" placeholder="Document Name"/>
                                    </div>

                                    <div className="form-group col-md-4 mb-2">
                                        <input type="file" className="form-control"  onChange={(e) => {inputUpdate(e,'tplo_occupation')}} value={village_edit.tplo_name} name="add_plot_owner_document_file[]" placeholder="Document File"/>
                                    </div>

                                    <div className="form-group col-sm-3">
                                        <span className="btn text-primary addAnotherRow"><i className="fa fa-plus-circle"></i></span>
                                    </div>
                                </div>
                            </div> */}

                                    <div className='row'>
                                        <div className='col-md-10'>

                                        </div>
                                        <div className='col-md-2'>
                                            <button className='btn btn-info'>Update</button>
                                        </div>

                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal>
                    {/* Update  Plot Owner Modal End*/}

                </div>


                {/* Plot details modal */}

                {/* Plot details modal End */}

                {(loading) ? <ScaleLoader
                    color={color}
                    loading={loading}
                    size={250}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    className='my_spanner'
                /> : ''}


            </div>
        </>
    )
}
