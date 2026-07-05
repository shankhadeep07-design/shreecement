import React, { useState, useEffect } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { SearchOutlined } from "@ant-design/icons";
import {useLoading} from '../../../context/LoadingContext';
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
    submitProjectService
  } from "../../../Services/Project-service";

  import {
    getAllActiveSPV
  } from "../../../Services/SPV-Service";
import { Modal, Dropdown, Button } from "react-bootstrap";

import { MdOutlinePageview } from "react-icons/md";

export const AddProject = ({show, changeModalStatus, getAllProjectList, updateProjectValues, clearUpdateValues}) => {

    const [formData, setFormData] = useState({
        tpm_project_name: '',
        tpm_project_description: '',
        tpm_profit_center: ''
    })
    let {loading, setLoading} = useLoading(false);
    const [selectedStateOption, setSelectedStateOption] = useState(null);
    const [selectedDistrictOption, setSelectedDistrictOption] = useState(null);
    const [selectedTalukaOption, setSelectedTalukaOption] = useState(null);
    const [selectedUnitOption, setSelectedUnitOption] = useState(null);
    const [selectedVillageOption, setVillageOption] = useState(null);
    const [selectedSPVOption, setSPVOption] = useState(null);
    const [state_list, setState_list] = useState([]);
    const [district_list, setDistrict_list] = useState([]);
    const [taluka_list, setTaluka_list] = useState([]);
    const [unit_list, setUnit_list] = useState([]);
    const [village_list, setVillageList] = useState([]);
    const [spv_list, setSPVList] = useState([]);
    const [state_id, setStateId] = useState(null);
    const [district_id, setDistrictId] = useState(null);
    const [taluka_id, setTalukaId] = useState(null);
    const [spv_id, setSPVId] = useState(null);

    const [spv_code, setSPVCode] = useState(null);
    const [spv_pan, setSPVPan] = useState(null);
    const [spv_gst, setSPVGst] = useState(null);
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    const addNewProjectSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        submitProjectService(formData)
        .then((data) => {
        toast.success(data.message);
        changeModalStatus('addModal',false);
        clearUpdateValues();
        setFormData({});
        setSelectedStateOption(null);
        setSelectedDistrictOption(null);
        setSelectedTalukaOption(null);
        setSelectedUnitOption(null);
        setVillageOption(null);
        getAllProjectList();
      })
      .catch((error) => {
        toast.error(error);
      });;
    }
    const renderStateList = () => {
        return state_list?.map((data) => ({
          label: data.tsl_state_name,
          value: data.tsl_state_id,
        }));
      };

    // const renderSPVList = () => {
    //   return spv_list?.map((data) => ({
    //     label: data.tspvm_name,
    //     value: data.tspvm_id,
    //   }));
    // };
    
    useEffect(() => {
      setLoading(true);
      dashboardStateNames().then((states) => {
        setState_list(states.data);
      });
      getAllActiveSPV().then((spv) => {
        setSPVList(spv.data);
      });
  
      if(updateProjectValues.tpm_id && show){
          let state_val = updateProjectValues.tpm_state_id;
          let district_val = updateProjectValues.tpm_district_id;
          let taluka_val = updateProjectValues.tpm_taluka_id;
          let unit_val = updateProjectValues.tpm_unit_id;
          let village_val = updateProjectValues?.tpm_village_id;
          let spv_val = updateProjectValues.tpm_spv_id;
          
          handleStateChange(state_val);
          handleDistrictChange(district_val);
          handleTalukaChange(taluka_val);
          handleUnitChange(unit_val);
          handleVillageChange(village_val);
          handleVillageChange(village_val);
          handleSPVChange(spv_val);

          var villageId = getVillageId(updateProjectValues?.tpm_village_id);

          setFormData({
              tpm_id: updateProjectValues.tpm_id,
              tpm_project_name: updateProjectValues.tpm_project_name,
              tpm_project_description: updateProjectValues.tpm_project_description,
              tpm_profit_center: updateProjectValues.tpm_profit_center,
              tpl_state_id: updateProjectValues?.tpm_state_id?.value,
              tpl_district_id: updateProjectValues?.tpm_district_id?.value,
              tpl_taluka_id: updateProjectValues?.tpm_taluka_id?.value,
              tpl_unit_id: updateProjectValues?.tpm_unit_id?.value,
              tpl_village_id: villageId,
              tpm_spv_id: updateProjectValues?.tpm_spv_id?.value,
          })
      }else{
          setSelectedStateOption(null);
          setSelectedDistrictOption(null);
          setSelectedTalukaOption(null);
          setSelectedUnitOption(null);
          setVillageOption(null);
          setFormData({
              tpm_project_name: '',
              tpm_project_description: '',
              tpm_profit_center: ''
          })
      }
      setLoading(false);
    }, [updateProjectValues]);

    const handleStateChange = (selectedVillageOption) => {

      var stateId = selectedVillageOption.value;
      setStateId(stateId);
      setDistrict_list(null);
      setTaluka_list(null);
      setUnit_list(null);
      setVillageList(null);
      setSelectedStateOption(selectedVillageOption);
      setSelectedDistrictOption(null);
      setSelectedTalukaOption(null);
      setSelectedUnitOption(null);
      setVillageOption(null);
      dashboardDistrictNAmes(stateId).then((districts) => {
        const allDistricts = districts.data;
        setDistrict_list(allDistricts);
      });
  
      setFormData({
        ...formData,
        tpm_state_id: stateId,
      });
    };
    const handleDistrictChange = (selectedVillageOption) => {
      // console.log(selectedDistrictOption);
  
      var districtId = selectedVillageOption.value;
  
      setDistrictId(districtId);
      setTaluka_list(null);
      setUnit_list(null);
      setVillageList(null);
      setSelectedDistrictOption(selectedVillageOption);
      setSelectedTalukaOption(null);
      setSelectedUnitOption(null);
      setVillageOption(null);
  
      dashboardTalukasNAmes(state_id, districtId).then((talukas) => {
        const allTalukas = talukas;
        setTaluka_list(allTalukas.data);
      });
  
      setFormData({
          ...formData,
          tpm_district_id: districtId,
        });
    };

    const handleTalukaChange = (selectedVillageOption) => {
      // console.log(selectedVillageOption);
  
      var talukaId = selectedVillageOption.value;
      setSelectedTalukaOption(selectedVillageOption);
      setSelectedUnitOption(null);
      setVillageOption(null);
      setTalukaId(talukaId);
      setUnit_list(null);
      setVillageList(null);
      

      dashboardUnitNAmes(state_id, district_id, talukaId).then((units) => {
        const allUnits = units;
        setUnit_list(allUnits.data);
      });
  
      setFormData({
        ...formData,
        tpm_taluka_id: talukaId,
      });
    };
    const handleUnitChange = (selectedVillageOption) => {
  
      var unitId = selectedVillageOption.value;
      setSelectedUnitOption(selectedVillageOption);
      setVillageOption(null);
      setVillageList(null);
      dashboardVillageNAmes(state_id, district_id, taluka_id, unitId).then(
        (villages) => {
          const allVillages = villages;
          setVillageList(allVillages.data);
        }
      );
  
      setFormData({
        ...formData,
        ["tpm_unit_id"]: unitId,
      });
    };
    const handleVillageChange = (selectedVillageOption) => {
      var villageId = getVillageId(selectedVillageOption);
      setVillageOption(selectedVillageOption);
      setFormData({
        ...formData,
        tpm_village_id: villageId?.join(','),
      });
    };
    const handleSPVChange = (selectedVillageOption) => {
      var spvId = selectedVillageOption.tspvm_id;
      setSPVOption(selectedVillageOption);
      setFormData({
        ...formData,
        tpm_spv_id: spvId,
      });
    };

    const renderDistrictList = () => {
      return district_list?.map((data) => ({
        label: data.tdl_district_name,
        value: data.tdl_district_id,
      }));
    };
    const renderSPVList = () => {
      return spv_list?.map((data) => ({
        label: data.tspvm_name,
        value: data.tspvm_id,
      }));
    };
    const renderTalukaList = () => {
      return taluka_list?.map((data) => ({
        label: data.ttll_taluka_name,
        value: data.ttll_taluka_id,
      }));
    };
  
    const renderUnitList = () => {
      return unit_list?.map((data) => ({
        label: data.tun_name,
        value: data.tun_id,
      }));
    };
  
    const renderVillageList = () => {
      return village_list?.map((data) => ({
        label: data.tvl_village_name,
        value: data.tvl_village_id,
      }));
    };

    function closeModal(){
      // setSPVList([])
      clearUpdateValues();
      changeModalStatus('addModal',false);
    }


    function getVillageId(options){
      return options?.map(obj => {
        return obj.value;
      });
    }

  return (
    <>
        <Modal
            show={show}
            onHide={closeModal}
            size="lg"
            centered
            backdrop="static"
            scrollable={true}
            id="add_issue_modal">
            <Modal.Header closeButton>
              <Modal.Title>Add New Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <form onSubmit={addNewProjectSubmit} id="add_project_form">
                <div id="new_owner_div">
                    <div className="validation-errors"></div>

                    <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">
                            Project Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Project Name Here"
                            name="tpm_project_name"
                            value={formData.tpm_project_name}
                            onChange={handleChange}
                            required
                        />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className="form-label">
                            Project Description <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Description Here"
                            name="tpm_project_description"
                            value={formData.tpm_project_description}
                            onChange={handleChange}
                            required
                        />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="mb-3">
                        <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label">
                            State <span className="text-danger">*</span>
                        </label>
                        <Select
                            value={selectedStateOption}
                            onChange={handleStateChange}
                            options={renderStateList()}
                            required
                        />
                        </div>
                    </div>
                    
                    <div className="col-md-4">
                    <div className="mb-3">
                        <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label">
                            District <span className="text-danger">*</span>
                        </label>
                        <Select
                            value={selectedDistrictOption}
                            onChange={handleDistrictChange}
                            options={renderDistrictList()}
                            required
                        />
                        </div>
                    </div>
                    <div className="col-md-4">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label">
                    Talukas <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={selectedTalukaOption}
                    onChange={handleTalukaChange}
                    options={renderTalukaList()}
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label">
                    Unit <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={selectedUnitOption}
                    onChange={handleUnitChange}
                    options={renderUnitList()}
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label">
                    Village <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={selectedVillageOption}
                    onChange={handleVillageChange}
                    isMulti
                    options={renderVillageList()}
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label">
                    SPV Name <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={selectedSPVOption}
                    onChange={handleSPVChange}
                    options={spv_list}
                    getOptionLabel={e => e.tspvm_name}
                    getOptionValue={e => e.tspvm_id}
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label">
                    SPV Code <span className="text-danger">*</span>
                  </label>
                  <input type="text" disabled={true} placeholder="Select SPV" className="form-control" value={selectedSPVOption?.tspvm_code}/>
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label">
                    SPV PAN Number <span className="text-danger">*</span>
                  </label>
                  <input type="text" disabled={true} placeholder="Select SPV" className="form-control" value={selectedSPVOption?.tspvm_pan_no}/>
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label">
                    SPV Code <span className="text-danger">*</span>
                  </label>
                  <input type="text" disabled={true} placeholder="Select SPV" className="form-control" value={selectedSPVOption?.tspvm_gst_no}/>
                </div>
              </div>
                 
                    
                    </div>
                </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{marginRight:"10px"}}>
                  Close
                </button>
                <button type="submit" className="btn btn-dark" form="add_project_form">
                  Submit
                </button>
              </div>
            </Modal.Footer>
        </Modal>
    </>
  )
}
