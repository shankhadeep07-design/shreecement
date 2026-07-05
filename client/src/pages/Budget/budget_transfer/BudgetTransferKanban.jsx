import { useEffect, useState } from "react";
import { Card, Button, Spin, Select, Input, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { getAuthToken } from "../../../services/Helper.js";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";
import BudgetTransferAddUpdateModal from "./BudgetTransferAddUpdateModal.jsx";
import BudgetTransferKanbanDraft from "./BudgetTransferKanbanDraft.jsx";
import BudgetTransferKanbanSendForApproval from "./BudgetTransferKanbanSendForApproval.jsx";
import BudgetTransferKanbanApproved from "./BudgetTransferKanbanApproved.jsx";
import BudgetTransferKanbanRejected from "./BudgetTransferKanbanRejected.jsx";


const BudgetTransferKanban = () => {

    const [permissions, setPermissions] = useState([])

    const [sendForApprovalKey, setSendForApprovalKey] = useState(0);

    const refreshSendForApproval = () => setSendForApprovalKey(prev => prev + 1);

    console.log(sendForApprovalKey);
    
    
  return (
    <div className="home-content">
           <div className="card">
             <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                <h5 className="mb-0 float-left">Budget Transfer Master</h5>
            </div>
             <div className="card-body">
                   <div className="kanban-container">
                        <div className="kanban-board">
                            <BudgetTransferKanbanDraft 
                                permissions={permissions} 
                            
                                refreshSendForApproval={refreshSendForApproval}
                            />

                            <BudgetTransferKanbanSendForApproval 
                                permissions={permissions} 
                                key={sendForApprovalKey} 
                            />
                            <BudgetTransferKanbanApproved permissions={permissions} />
                            <BudgetTransferKanbanRejected permissions={permissions} />
                        </div>
                    </div>
             </div>
           </div>
       
    </div>
  
  );
};

export default BudgetTransferKanban;
