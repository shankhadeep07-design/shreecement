import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Masonry from "react-masonry-css";
import { Toaster } from "react-hot-toast";
import { toast } from "react-toastify";
import { FaFileExport, FaEye, FaEdit } from "react-icons/fa";
import { MdVisibility, MdEdit, MdPhotoLibrary } from "react-icons/md";
import "../../assets/css/gallery.css";

import { getMyModulePermissionFun } from "../../helper/common.js";

import {
  getAuthToken,
  tableToExcel
} from "../../services/Helper.js";

import {
  getExcelExportCaseStudiesList
} from "../../services/CaseStudy-service.js";

import AddEditGallery from "./AddEditGallery.jsx";

export default function Gallery() {

  const [showModal,setShowModal] = useState({});
  const [editList,setEditList] = useState("");
  const [viewData,setViewData] = useState(null);

  const [permissions,setPermissions] = useState([]);
  const [exportsLists,setExportsLists] = useState([]);

  const [galleries,setGalleries] = useState([]);

  const [page,setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages,setTotalPages] = useState(1);

  const api_url = `${import.meta.env.VITE_API_URL}/admin/gallery/datatable`;


  useEffect(()=>{

    getMyModulePermissionFun("district")
      .then((module)=>{
        setPermissions(module);
      });

    getGalleryList(1);

  },[]);



  const getGalleryList = async (pageNumber)=>{

    try{

      const token = getAuthToken();

      const response = await fetch(api_url,{
        method:"POST",
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          page:pageNumber,
          limit:limit
        })
      });

      const res = await response.json();

      if(res?.data){

        setGalleries(res.data);
        setTotalPages(res.totalPages || 1);
        setPage(pageNumber);

      }

    }catch(err){

      toast.error("Failed to load gallery");

    }

  };



  const changeModalStatus = (id,status)=>{

    setShowModal({
      ...showModal,
      [id]:status
    });

  };



  const addFun = ()=>{

    setEditList("");
    changeModalStatus("user_update_modal",true);

  };



  const editFun = (data)=>{

    setEditList(data);
    changeModalStatus("user_update_modal",true);

  };



  const viewFun = (data)=>{

    setViewData(data);
    changeModalStatus("view_case_modal",true);

  };



  const getAllExportData = ()=>{

    getExcelExportCaseStudiesList()
      .then((response)=>{
        setExportsLists(response.data);
      })
      .catch((error)=>{
        toast.error(error?.response?.data?.message);
      });

  };



  useEffect(()=>{

    if(exportsLists.length > 0){
      tableToExcel("new-table","Gallery List");
    }

  },[exportsLists]);



  return (

<>
<Toaster position="top-center" toastOptions={{duration:2000}}/>

<div className="home-content">

<div className="card pb-3">

<div className="card-header d-flex justify-content-between align-items-center">

<h5 className="mb-0">Gallery List</h5>

<div>

<button
className="btn btn-sm btn-dark"
onClick={addFun}
>
+ Add Gallery
</button>

{/* <button
className="btn btn-success btn-sm ms-2"
onClick={getAllExportData}
>
<FaFileExport/> Export
</button> */}

</div>

</div>



{/* CARD GRID */}
<div className="card-body">
  {galleries?.length > 0 ? (
    <div className="gallery-grid">
      {galleries.map((item, index) => (
        <div className="modern-gallery-item" key={index}>
          <div className="gallery-badge">{item.documents?.length || 0} Images</div>
          
          <div className="card-image-container">
            <img 
              src={item.documents?.[0]?.full_url || "https://via.placeholder.com/400x250?text=No+Preview"} 
              alt={item.project_name} 
            />
            <div className="card-hover-overlay">
              <button 
                className="hover-icon-btn view-btn" 
                title="View Gallery"
                onClick={() => viewFun(item)}
              >
                <MdVisibility />
              </button>
              
              {(permissions?.indexOf("edit") > -1 || permissions === "*") && (
                <button 
                  className="hover-icon-btn edit-btn" 
                  title="Edit Gallery"
                  onClick={() => editFun(item)}
                >
                  <MdEdit />
                </button>
              )}
            </div>
          </div>

          <div className="card-info-pane">
            <h6>{item.project_name}</h6>
            <p>{item.theme_name}</p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="empty-gallery-state">
      <MdPhotoLibrary />
      <h3>No Galleries Found</h3>
      <p>Click the "Add Gallery" button to get started.</p>
    </div>
  )}

  {/* PAGINATION */}
  {totalPages > 1 && (
    <div className="pagination-box">
      <button
        className="btn btn-outline-dark btn-sm rounded-pill px-4 me-3"
        disabled={page === 1}
        onClick={() => getGalleryList(page - 1)}
      >
        Previous
      </button>

      <div className="page-indicator">
        <span className="fw-bold fs-5">{page}</span>
        <small className="text-muted ms-1">/ {totalPages}</small>
      </div>

      <button
        className="btn btn-outline-dark btn-sm rounded-pill px-4 ms-3"
        disabled={page === totalPages}
        onClick={() => getGalleryList(page + 1)}
      >
        Next
      </button>
    </div>
  )}
</div>

</div>



{/* ADD EDIT MODAL */}

<Modal
show={showModal.user_update_modal}
onHide={()=>changeModalStatus("user_update_modal",false)}
size="lg"
centered
>

<Modal.Header closeButton>

<Modal.Title>
{editList==="" ? "Add Gallery":"Update Gallery"}
</Modal.Title>

</Modal.Header>

<Modal.Body>

<AddEditGallery
changeModalStatus={changeModalStatus}
editList={editList}
initiatedDistrictDatatable={()=>getGalleryList(page)}
/>

</Modal.Body>

</Modal>



{/* VIEW MODAL */}
<Modal
  show={showModal.view_case_modal}
  onHide={() => changeModalStatus("view_case_modal", false)}
  size="xl"
  centered
  className="gallery-modal"
>
  <Modal.Header closeButton className="gallery-modal-header">
    <Modal.Title className="gallery-title">Gallery Preview</Modal.Title>
  </Modal.Header>

  <Modal.Body className="gallery-modal-body">
    {/* INFO SECTION */}
    <div className="gallery-info-strip">
      <div className="info-badge">
        <span className="label">Project</span>
        <span className="value">{viewData?.project_name}</span>
      </div>
      <div className="info-badge">
        <span className="label">Theme</span>
        <span className="value">{viewData?.theme_name}</span>
      </div>
      <div className="info-badge">
        <span className="label">Total Images</span>
        <span className="value">{viewData?.documents?.length || 0}</span>
      </div>
    </div>

    {/* IMAGE GRID */}
    {viewData?.documents?.length > 0 ? (
      <Masonry
        breakpointCols={{
          default: 4,
          1200: 3,
          768: 2,
          480: 1
        }}
        className="masonry-grid"
        columnClassName="masonry-column"
      >
        {viewData.documents.map((doc, index) => (
          <div className="view-gallery-img-card" key={index} onClick={() => window.open(doc.full_url, "_blank")}>
            <img src={doc.full_url} alt={`Gallery image ${index + 1}`} />
            <div className="img-overlay">
              <button className="zoom-icon-btn" title="View Full Image">
                <MdVisibility />
              </button>
            </div>
          </div>
        ))}
      </Masonry>
    ) : (
      <div className="empty-gallery-state">
        <MdPhotoLibrary />
        <h3>No Images Found</h3>
        <p>This gallery currently has no documents attached.</p>
      </div>
    )}
  </Modal.Body>
</Modal>

</div>



{/* EXPORT TABLE */}

<div style={{display:"none"}}>

<table id="new-table">

<thead>
<tr>
<th>ID</th>
<th>Project</th>
<th>Theme</th>
</tr>
</thead>

<tbody>

{exportsLists?.map((data,index)=>(

<tr key={index}>
<td>{index+1}</td>
<td>{data.project_name}</td>
<td>{data.theme_name}</td>
</tr>

))}

</tbody>

</table>

</div>

</>

);

}