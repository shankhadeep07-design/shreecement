import { useState } from "react";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

const KanbanColumn = ({ title, count, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`kanban-column ${collapsed ? "collapsed" : "expanded"}`}>
      {/* Header */}
      <div className="kanban-header" onClick={() => setCollapsed(!collapsed)}>
        <span>{title} {count !== undefined ? count : ""}</span>
        {collapsed ? <DownOutlined /> : <UpOutlined />}
      </div>

      {/* Body (hidden if collapsed) */}
      {!collapsed && <div className="kanban-body">{children}</div>}
    </div>
  );
};

export default KanbanColumn;
