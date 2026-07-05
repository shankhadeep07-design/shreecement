import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { useLoading } from "../../../context/LoadingContext";
import {
  dashboardStateNames,
} from "../../../Services/Dashboard-service";
import { Modal} from "react-bootstrap";

import {useSelector, useDispatch} from 'react-redux';
import {setFormData, clearState} from "../../../redux/slices/SiteMasterSlice"
import { submitSiteMaster } from "../../../Services/SiteMaster-service";


export const AddAreaUnit = ({
  show,
  changeModalStatus,
  refreshTable
}) => {
  let { loading, setLoading } = useLoading(false);
  const [state_list, setState_list] = useState([]);

  var siteMasterState = useSelector((state) => state.SiteMaster)
  var dispatch = useDispatch();
  const renderStateList = () => {
    return state_list?.map((data) => ({
      label: data.tsl_state_name,
      value: data.tsl_state_id,
    }));
  };


  useEffect(() => {
    dashboardStateNames().then((states) => {
      setState_list(states.data);
    });
  }, []);

  function handleModalHide() {
    changeModalStatus(false);
    dispatch(clearState());
  }

  function handleInputChange(key, value){
    var obj = {
        key : key,
        value : value
    }
    dispatch(setFormData(obj))
  }

  function handleSubmit(e){
    e.preventDefault();

    var formData = {
      data : {
        id : siteMasterState.formData?.id,
        name : siteMasterState.formData?.name,
        area : siteMasterState.formData?.area,
        state_id : siteMasterState.formData?.state?.value
      }
    };
    setLoading(true);
    submitSiteMaster(formData).then((data) => {
      setLoading(false);
      if(data.status == false){
          toast.error(data.message)
      }else{
          toast.success(data.message)
          handleModalHide();
          refreshTable();
      }
    }).catch(error => {
      setLoading(false);
      toast.error(error.response.data.message)
    })
  }

  return (
    <>
      <Modal
        show={show}
        onHide={handleModalHide}
        size="lg"
        centered
        backdrop="static"
        scrollable={true}
        id="add_issue_modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Area Unit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} id="add_project_form">
            <div id="new_owner_div">
              <div className="validation-errors"></div>
              <div className="row">
                <div className="col-md-12">
                  <div className="mb-3">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      State*
                    </label>
                    <Select
                      options={renderStateList()}
                      required
                      name="state"
                      onChange={(option) => {
                        handleInputChange("state", option);
                      }}
                      value={siteMasterState.formData?.state}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      Site Name*
                    </label>
                    <input 
                      className="form-control" 
                      name="name" 
                      placeholder="Site Name" 
                      type="text" 
                      onInput={(e) => {
                        handleInputChange("name", e.target.value);
                      }}
                      value={siteMasterState.formData?.name}
                      />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label
                      htmlFor="exampleFormControlInput1"
                      className="form-label"
                    >
                      Approximate Site Area (in acre)*
                    </label>
                    <input 
                    className="form-control" 
                    placeholder="Site Area" 
                    type="text"
                    name="area"
                    onInput={(e) => {
                      handleInputChange("area", e.target.value);
                    }}
                    value={siteMasterState.formData?.area}
                    />
                  </div>
                </div>

              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleModalHide}
              style={{ marginRight: "10px" }}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-dark"
              form="add_project_form"
            >
              Submit
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};
