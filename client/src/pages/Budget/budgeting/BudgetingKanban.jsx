import { useEffect, useState } from "react";
import { Card, Button, Spin, Select, Input, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { getAuthToken } from "../../../services/Helper.js";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";
import BudgetingAddUpdateModal from "./BudgetingAddUpdateModal.jsx";
import BudgetingKanbanDraft from "./BudgetingKanbanDraft.jsx";
import BudgetingKanbanSendForApproval from "./BudgetingKanbanSendForApproval.jsx";
import BudgetingKanbanApproved from "./BudgetingKanbanApproved.jsx";
import BudgetingKanbanRejected from "./BudgetingKanbanRejected.jsx";


const BudgetingKanban = () => {

    const [permissions, setPermissions] = useState([])

    const [sendForApprovalKey, setSendForApprovalKey] = useState(0);

    const refreshSendForApproval = () => setSendForApprovalKey(prev => prev + 1);

    console.log(sendForApprovalKey);
    
    
  return (
    
        <div className="home-content">
            <div className="card">
            <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                <h5 className="mb-0 float-left">Budgeting Management</h5>
            </div>
            <div className="card-body">
                <div className="kanban-container">

                    <div className="kanban-board">
                        <BudgetingKanbanDraft 
                            permissions={permissions} 
                        
                            refreshSendForApproval={refreshSendForApproval}
                        />

                        <BudgetingKanbanSendForApproval 
                            permissions={permissions} 
                            key={sendForApprovalKey} 
                        />
                        <BudgetingKanbanApproved permissions={permissions} />
                        <BudgetingKanbanRejected permissions={permissions} />
                    </div>
                </div>
            </div>
            </div>
        </div>

  );
};

export default BudgetingKanban;
