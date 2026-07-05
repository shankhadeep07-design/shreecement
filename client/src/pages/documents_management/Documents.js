import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Modal, Dropdown, Accordion } from "react-bootstrap";
import Select from 'react-select';
import {useLoading} from '../../context/LoadingContext.jsx'

import PlotListShimmer from "../shimmers/PlotListShimmer.jsx"
import {getAllDocumentsApi, getAllDocTypesApi, getSubTypesApi} from "../../Services/Document-service";
import { Table } from "antd";
import {
    FileOutlined
  } from '@ant-design/icons';

export const Documents = () => {
    const [shimmerLoading, setShimmerLoading] = useState(true);
    const [allDocumentsList, setAllDocumentsList] = useState([]);
    const [TypeList, setTypeList] = useState([])
    const [TypeFilter, setTypeFilter] = useState(null);
    const [SubTypeList, setSubTypeList] = useState([]);
    const [selectedSubtype, setSelectedSubtype] = useState([]);
    const [FilterList, setFilterList] = useState({
        type:"",
        subtype:""
    });

    useEffect(()=>{
        getAllDocTypesApi().then((response)=>{
            setTypeList(response.data)
        });
        getAllDocumentsApi().then((response)=>{
            setAllDocumentsList(response.data);
            setTimeout(() =>{
                setShimmerLoading(false);
            }, 2000)
        })
    }, []);

    let columns = [
        {
            title: "Sl.",
            dataIndex: "tta_id",
            render: (text, record, index) => index + 1,
            width: "10%",
        },
        {
            title: "Doc Name",
            dataIndex: "file_name",
            render: (text, record) => {
                return <>{record.file_name}</>;
            },
        },
        {
            title: "Doc Type",
            dataIndex: "type",
            filteredValue: FilterList.type ? [FilterList.type] : null,
                onFilter: (value, record) =>{
                return Object.values(record).some(
                    (val) =>
                    val && val.toString().toLowerCase().includes(value.toLowerCase())
                )
            },
            render: (text, record) => {
                return <>{record.type}</>;
            },
        },
        {
            title: "Doc Sub-Type",
            dataIndex: "sub_type",
            filteredValue: FilterList.subtype ? [FilterList.subtype] : null,
                onFilter: (value, record) =>{
                return Object.values(record).some(
                    (val) =>
                    val && val.toString().toLowerCase().includes(value.toLowerCase())
                )
            },
            render: (text, record) => {
                return <>{record?.sub_type}</>;
            },
        },
        {
            title: "View File",
            dataIndex: "view_file",
            render: (text, record) => {
                return (<><a href={process.env.REACT_APP_BASEPATH+'/'+record.file_path+'/'+record.file_name} download><FileOutlined /></a></>);
            },
        },
    ];

    const renderTypeFilter = ()=>{
        return TypeList.map((data)=>(
            {
              label: data.type,
              value: data.type
            }
          ))
    }

    const handleTypeFilter = (typeData) => {
        setTypeFilter(typeData);
        getSubTypesApi(typeData.value).then((response)=>{
            setSubTypeList(response.data);
        });
        setSelectedSubtype([])
        setFilterList({ type: typeData.value, subtype: ""})
    }

    const rederSubtypeList = ()=>{
       return SubTypeList.map((data)=>(
            {
              label: data.sub_type,
              value: data.sub_type
            }))
    }

    const handleSubtypeChange = (subtype)=> {
        setSelectedSubtype(subtype);
        setFilterList((prevData)=> ({...prevData, subtype: subtype.value}))
    }

    const resetFiter = ()=> {
        setFilterList({
            type:"",
            subtype:""
        })
    }

    return (
        <>
            <Toaster position='top-center' toastOptions={{ duration: 2000 }} reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            <div className="home-content">
                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 float-left">Documents</h5>
                        <div className="float-right">
                            <button type="button" className="btn btn-sm btn-dark">
                            <i class="fa-regular fa-list"></i>
                            </button>
                        </div>
                    </div>

                    <div className="card-body at-elevation-z6 table-box">
                    <Accordion defaultActiveKey={0} className="mt-3">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <span>Filter</span>
                  </Accordion.Header>
                  <Accordion.Body className="p-2">
                    <form id="filter_plots">
                      <div className="row mt-4" style={{ alignItems: "end" }}>
                        {/* Unit */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label">
                              Document Type
                            </label>
                            <Select
                              value={TypeFilter}
                              onChange={handleTypeFilter}
                              options={renderTypeFilter()}
                              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                              menuPortalTarget={document.body}
                            />
                          </div>
                        </div>
                        {/* Village */}
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label">
                              Document Sub-type
                            </label>
                            <Select
                              value={selectedSubtype}
                              onChange={handleSubtypeChange}
                              options={rederSubtypeList()}
                              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                              menuPortalTarget={document.body}
                            />
                          </div>
                        </div> 
                        
                        {/* Filter Button  */}
                        <div className="col-md-2">
                          <div className="mb-3 d-flex">
                            {/* <button type="submit" className="btn btn-info">
                                Search
                              </button> */}

                            <button
                              type="button"
                              className="btn btn-dark ml-2"
                              onClick={resetFiter}>
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <hr />
                    {
                        (shimmerLoading) &&
                            <PlotListShimmer header={false}/>
                    }
                        <div className="card-body-content" style={{display : (shimmerLoading) ? 'none' : "block"}}>
                            <div className="table-responsive table table-bordered">
                                <div style={{ overflowX: "auto" }}>
                                    <Table
                                    dataSource={allDocumentsList}
                                    rowKey={(record) => record.id}
                                    columns={columns}
                                    pagination={{ pageSize: 10, responsive: true}}
                                    className='table table-bordered'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
