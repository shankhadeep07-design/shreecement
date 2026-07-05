import React, { useState, useEffect } from 'react'
import ScaleLoader from "react-spinners/ScaleLoader";
import { createMenu, getAllMenuApi, updateMenu, deleteMenu } from "../../Services/Module-service"
import toast, { Toaster } from 'react-hot-toast';

import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

import { Table, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { FaEllipsisH, FaPencilAlt, FaTrash, FaRegPlusSquare } from 'react-icons/fa';
import {useLoading} from '../../context/LoadingContext'


import { Modal, Dropdown } from "react-bootstrap";

import $ from 'jquery';
import { getCurrentUserDetails } from '../../auth/auth';
import { allAction } from '../../Services/Action-service';


export const Module = () => {
    let {loading, setLoading} = useLoading(false);
    let [color] = useState("#ffffff");
    const [searchText, setSearchText] = useState('');

    const [modalTitle, setModalTitle] = useState("Add Module");

    //Modal States Start
    const [show, setShow] = useState(
        { add_Menu_modal: false },
        { update_Menu_modal: false },
    );
    let changeModalStatus = (id, status) => {
        setShow({
            ...show, [id]: status
        })
    }
    //Modal States End

    const [module_list, setModule_list] = useState([]);
    const [Menu_list, setMenuList] = useState([]);
    const [filter_Menu_list, setFilteredMenuList] = useState([]);

    const [actions, setActions] = useState([]);

    const [Menu_edit, setEditMenu_edit] = useState({
        'tmd_name': '',
        'tmd_id': '',
        'tmd_actions' : ''
    });

    const [selectedActions, setSelectedActions] = useState([]);

    const [addNewMenu, setAddNewMenu] = useState({});



    const handleSearch = (value) => {
        setSearchText(value);
    };


    // ---------------------------------  Plot List -------------------------------
    const getAllMenuList = (callback = null) => {
        getAllMenuApi('').then(
            data => {
                let all_client = data.data;
                setMenuList(all_client);
                setFilteredMenuList(all_client);
                setLoading(false);

            }
        )
            .catch((error) => {
                toast.error(error);
            })
    }




    useEffect(() => {

        setLoading(true);
        getAllMenuList();

        allAction().then((data) => {
            setActions(data.data);
        });
    }, []);

    const columns = [
        {
            title: 'Sl.',
            dataIndex: 'tmd_id',
            render: (text, record, index) => index + 1,
            width: '10%',
        },
        {
            title: 'Module Name',
            dataIndex: 'tmd_name',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => Object.values(record).some((val) => val && val.toString().toLowerCase().includes(value.toLowerCase())),
            render: (text, record) => {
                return (
                    <>
                        {record.tmd_name}
                    </>
                );
            },
        },
        {
            title: 'Actions',
            dataIndex: 'tac_name',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => Object.values(record).some((val) => val && val.toString().toLowerCase().includes(value.toLowerCase())),
            render: (text, record) => {
                return (
                    <>
                        {
                            record?.actions_data?.map(obj => {
                               return <span class="badge bg-primary me-1 mb-1">{obj['tac_name']}</span>
                            })
                        }
                    </>
                );
            },
        },
        {
            title: 'Actions',
            render: (text, record) => (
                <Dropdown>
                    <Dropdown.Toggle variant="secondary" id={`dropdown-${record.tmd_id}`} size="sm">
                        <FaEllipsisH style={{ marginRight: '5px' }} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>

                        <Dropdown.Item  onClick={() => edit_owner(record)}>
                            <FaPencilAlt style={{ marginRight: '5px' }} />
                            Edit
                        </Dropdown.Item>
                        <Dropdown.Item style={{ color: 'red' }} onClick={() => ownerDelete(record.tmd_id)}>
                            <FaTrash style={{ marginRight: '5px' }} />
                            Delete
                        </Dropdown.Item>

                    </Dropdown.Menu>
                </Dropdown>
            ),
            width: '10%',
        },
    ]

    // ---------------------------------  Plot List End -------------------------------

    //--------------------- Update Plot ----------------------

    const [moduleOptionUpdate, setplotOptionUpdate] = useState();

    const edit_owner = (item) => {
        
        var exists_action_arr = item.tmd_actions.split(',');
        var filterActions = actions?.filter(obj => {
            return (exists_action_arr.indexOf(obj.tac_name_slug) > -1)
        })
        var edit_data = {
            'tmd_id': (item.tmd_id != null) ? item.tmd_id : '',
            'tmd_name': (item.tmd_name != null) ? item.tmd_name : '',
            'tmd_actions' : (item.tmd_actions) ?? ''
        }

        setModalTitle('Edit Module')
        setAddNewMenu(edit_data);
        setSelectedActions(filterActions)

        setplotOptionUpdate({ label: item.tmd_name, value: item.tmd_id });
        changeModalStatus('add_Menu_modal', true)
    }
    let inputUpdate = (event, field) => {
        const actualValue = event.target.value;
        setEditMenu_edit({
            ...Menu_edit, [field]: actualValue
        })
    }

    const moduleChangeUpdate = (selectedOption) => {

        var plot_id = selectedOption.value;
        setplotOptionUpdate(selectedOption);



        setEditMenu_edit({
            ...Menu_edit, ['tmd_plot_id']: plot_id
        })

    };

    const MenuUpdate = (event) => {
        event.preventDefault();

        if (Menu_edit.tmd_name == '') {
            toast.error('Please fill all required fields...');
            return;
        }

        let id = Menu_edit.tmd_id

        updateMenu(Menu_edit, id).then(data => {
            toast.success(data.message);
            changeModalStatus('update_Menu_modal', false)
            getAllMenuList();
            $('#MenuUpdate').hide();
            $('.modal-backdrop').hide();
        })
            .catch((error) => { toast.error(error); })

    }

    //--------------------- Update Plot End ----------------------


    // -----------------------  Plot delete -------------------------------------------
    const ownerDelete = (id) => {

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

        deleteMenu(delete_id).then(data => {

            toast.success(data.message);

            getAllMenuList();
        }).catch((error) => {
            toast.error(error);

        });

    }

    // -----------------------  Plot delete End -------------------------------------------

    const [inputSearch, setInputSearch] = useState("");

    useEffect(() => {
        const result = Menu_list.filter(data => {

            if (data.tmd_name != null) {
                return data.tmd_name.toLowerCase().match(inputSearch.toLowerCase())
            }


        });

        setFilteredMenuList(result);

    }, [inputSearch]);



    // -----------------------  Plot Insert -------------------------------------------

    let inputChange = (event, field) => {
        const actualValue = event.target.value;
        setAddNewMenu({
            ...addNewMenu, [field]: actualValue
        })
    }


    const renderModule = () => {

        return (module_list.map(data => ({ label: data.tpl_plot_no, value: data.tpl_plot_id })))
    }


    const newMenuSubmit = async (event) => {
        event.preventDefault();

        var options = selectedActions?.map(obj => {
            return obj.tac_name_slug;
        })
        addNewMenu.tmd_actions = options.join(',');
        setAddNewMenu(addNewMenu);

        if (addNewMenu.tmd_name == '' || addNewMenu.tmd_actions == '') {
            toast.error('Please fill all required fields...');
            return;
        }
        
        try {
            setLoading(true);
            await createMenu(addNewMenu).then(response => {
                if(response.status == 1 || response.status)
                {
                    toast.success(response.message);
                    getAllMenuList();
                    changeModalStatus('add_Menu_modal', false)
                    $('#staticBackdrop').hide();
                    $('.modal-backdrop').hide();
                }
                else
                {
                    toast.error(response.message);
                }
            });
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error(error.response.data.message);
            // Handle the Axios error here
        }
    };

    const handleActionChange = (obj) => {
        setSelectedActions(obj);
    }



    // -----------------------  Plot Insert end -------------------------------------------

    return (
        <>
            <Toaster position='top-center' toastOptions={{ duration: 2000 }} reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            <div className="home-content">

                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 float-left">Module List</h5>

                        <div className="float-right">
                            <button type="button" className="btn btn-sm btn-dark" onClick={() => {
                                    setAddNewMenu({});
                                    setSelectedActions([]);
                                    setModalTitle("Add Module")
                                    changeModalStatus('add_Menu_modal', true)
                                }} >
                                <a data-toggle="tooltip" data-placement="bottom" title="Add Module" data-bs-original-title="Add Module" aria-label="Add Module"><i className="fa-solid fa-plus"></i></a>
                            </button>
                        </div>
                    </div>

                    <div className="card-body at-elevation-z6 table-box">
                        <div className='d-flex justify-content-between'>
                            <div></div>
                            <div className="data_search">
                                <Input.Search placeholder="Search" value={searchText} onChange={(e) => handleSearch(e.target.value)} style={{ width: '200px' }} prefix={<SearchOutlined style={{ marginRight: '8px', color: 'rgba(0, 0, 0, 0.25)' }} />} className="no-addon" />
                                <style>{`.no-addon .ant-input-group-addon { display: none; }`}</style>
                            </div>
                        </div>

                        <div className="table-responsive mt-2 table table-bordered">
                            <div style={{ overflowX: 'auto' }}>
                                <Table dataSource={filter_Menu_list} rowKey={(record) => record.tmd_id} columns={columns} pagination={{ pageSize: 10 }}  className='table table-bordered'/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="allModals">
                    {/* Add Plot Owner Modal Start*/}
                    <Modal
                        show={show.add_Menu_modal}
                        onHide={() => changeModalStatus('add_Menu_modal', false)}
                        size="lg"
                        id="add_Menu_modal"
                        centered
                        backdrop="static"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {modalTitle}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={newMenuSubmit} id="moduleForm">
                                <div id="new_owner_div">
                                    <div className="validation-errors"></div>

                                    <div className="row">
                                        <div className="form-group col-md-12 mb-2">
                                            <label className="form-label">Module Name <span className="text-danger">*</span></label>

                                            <input type="text" className="form-control" onChange={(e) => { inputChange(e, 'tmd_name') }} value={addNewMenu.tmd_name} name="tmd_name" placeholder="Module Name" />
                                        </div>
                                        <div className="form-group col-md-12 mb-2">
                                            <label className="form-label">Select Actions <span className="text-danger">*</span></label>
                                            <Select
                                            value={selectedActions}
                                            getOptionLabel={e => e.tac_name}
                                            getOptionValue={e => e.tac_name_slug}
                                            options={actions}
                                            onChange={(obj) => {handleActionChange(obj)}}
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                            menuPortalTarget={document.body}
                                            placeholder="Search acions..."
                                            isMulti
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className='row'>
                                <div className='form-group col-md-12 mb-2'>
                                    <div className='d-flex justify-content-end'>
                                        <button className='btn btn-primary' type='submit' form="moduleForm">Submit</button>
                                    </div>
                                </div>
                            </div>
                        </Modal.Footer>
                    </Modal>
                    {/* Add  Plot Owner Modal End*/}
                </div>
                
            </div>







        </>
    )
}
