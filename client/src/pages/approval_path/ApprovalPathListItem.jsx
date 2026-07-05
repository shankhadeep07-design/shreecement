import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FaDeleteLeft } from "react-icons/fa6";

import toast, { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";

import { deleteApprover, deleteIntemator, setApproverOption, setIntematorOption, setRoles} from "../../redux/slices/ApprovalPathSlice";
import { FaGlasses } from "react-icons/fa";
import { userListRoleIdWiseApi } from "../../services/User-service";


function getNumberSuffix(number) {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return 'th'; // Numbers ending in 11, 12, 13 always get "th"
    }

    switch (lastDigit) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
export function ApprovalPathListItem ({isDeletable, suffix_title, index, type, id, option}) {

    const [userListData, setUserListData] = useState([]);



    const userListFun = (role_id) => {
        userListRoleIdWiseApi(role_id).then(response => {
          if(response.status){
            setUserListData(response.data);
          }else{
            toast.error(response.message);  
          }
        }).catch(err => {
          toast.error(err.message);
        }) 
    }

    var approvalPathState = useSelector((state) => state.ApprovalPath);
    var dispatch = useDispatch();

    function handleClickOnDelete(type, index){
        if(type == "intemator"){
            dispatch(deleteIntemator(index))
        }else if(type == "approver"){
            dispatch(deleteApprover(index))
        }
    }
    function handleChange(option){
        var obj = {
            index : index,
            option : option
        }
        if(type == "intemator"){
            dispatch(setIntematorOption(obj))
        }else if(type == "approver"){
            dispatch(setApproverOption(obj))
        }
    }

    return (
        <li key={index} className="list-item">
            <div className="list-item-child">
                <span className="drag_icon">
                    <i class="fa-solid fa-grip-vertical"></i>
                </span>
                {/* <span className="approver_number">{index + 1}<sup>{getNumberSuffix(index+1)}</sup> {suffix_title}</span> */}
                <span className="approver_number"> {suffix_title}</span>
                <div className="w-100">
                    <Select
                        options={approvalPathState?.roles}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        menuPortalTarget={document.body}
                        onChange={handleChange}
                        // value={(type == 'intemator') ? approvalPathState.intemators?.[index]?.['option'] : approvalPathState.approvers?.[index]?.['option']}
                        value={option}
                        isClearable
                        required={(type == 'intemator') ? false : true}
                    />
                </div>
                <div className="w-100">
                    <Select
                        options={approvalPathState?.roles}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        menuPortalTarget={document.body}
                        onChange={handleChange}
                        // value={(type == 'intemator') ? approvalPathState.intemators?.[index]?.['option'] : approvalPathState.approvers?.[index]?.['option']}
                        value={option}
                        isClearable
                        required={(type == 'intemator') ? false : true}
                    />
                </div>
                <div>
                    <button type="button" 
                    disabled={isDeletable} 
                    className="btn btn-sm delete-list-item-button"
                    onClick={() => {
                        handleClickOnDelete(type, index)
                    }}
                    >
                        <span>
                        <FaDeleteLeft />
                        </span>
                    </button>
                </div>
                
            </div>
            
        </li>
    )
}