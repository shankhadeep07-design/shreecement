import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  FaLayerGroup,
  FaUsers,
  FaClipboardList,
  FaCheckCircle,
  FaFileAlt
} from "react-icons/fa";

import { getCurrentUserDetails } from "../../auth/auth";
import { getAllMenuApi } from "../../Services/Module-service";
import { createRole } from "../../Services/Role-service";

export function AddRole({ show, changeModalStatus, updateInfo, getAllRoleList }) {

  const [menuList, setMenuList] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState({});

  const [addNewRole, setAddNewRole] = useState({
    trl_role_id: "",
    trl_role_name: "",
    trl_min_access_amount: 0,
    trl_max_access_amount: 0,
    trl_access_amount: 0,
    trl_created_by: getCurrentUserDetails().email
  });

  /* ================= FETCH MENUS ================= */

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const { data } = await getAllMenuApi("");
      setMenuList(data || []);
    } catch {
      toast.error("Failed to fetch modules");
    }
  };

  /* ================= EDIT MODE ================= */

  useEffect(() => {

    if (!updateInfo?.trl_role_id || menuList.length === 0) return;

    const mappedPermissions = {};

    (updateInfo.permissions || [])
      .filter(Boolean) // removes null values
      .forEach(p => {

        if (!p.tpr_module_id) return;

        mappedPermissions[p.tpr_module_id] =
          p.tpr_actions?.split(",") || [];

      });

    setPermissions(mappedPermissions);

    setAddNewRole({
      trl_role_id: updateInfo.trl_role_id || "",
      trl_role_name: updateInfo.trl_role_name || "",
      trl_min_access_amount: updateInfo.trl_min_access_amount || 0,
      trl_max_access_amount: updateInfo.trl_max_access_amount || 0,
      trl_access_amount: updateInfo.trl_access_amount || 0,
      trl_created_by: getCurrentUserDetails().email
    });

  }, [updateInfo, menuList]);

  /* ================= RESET ON MODAL CLOSE ================= */

  useEffect(() => {

    if (!show.add_role_modal) {

      setPermissions({});
      setError({});

      setAddNewRole({
        trl_role_id: "",
        trl_role_name: "",
        trl_min_access_amount: 0,
        trl_max_access_amount: 0,
        trl_access_amount: 0,
        trl_created_by: getCurrentUserDetails().email
      });

    }

  }, [show.add_role_modal]);

  /* ================= INPUT HANDLER ================= */

  const handleInputChange = (e, field) => {

    let value = e.target.value;

    if (field === "trl_role_name") {
      if (value === "") {
        setAddNewRole(prev => ({ ...prev, trl_role_name: "" }));
        return;
      }
      if (!/^[A-Za-z]/.test(value)) return;
      setAddNewRole(prev => ({ ...prev, trl_role_name: value }));
      return;
    }
    setAddNewRole(prev => ({ ...prev, [field]: value }));
  };

  /* ================= ICONS ================= */

  const moduleIcons = {
    activities: <FaClipboardList />,
    approval: <FaCheckCircle />,
    users: <FaUsers />,
    reports: <FaFileAlt />,
    default: <FaLayerGroup />
  };

  const getIcon = slug => moduleIcons[slug] || moduleIcons.default;

  /* ================= PERMISSION TOGGLE ================= */

  const togglePermission = (moduleId, actionSlug) => {

    setPermissions(prev => {

      const moduleActions = prev[moduleId] || [];

      const updated = moduleActions.includes(actionSlug)
        ? moduleActions.filter(a => a !== actionSlug)
        : [...moduleActions, actionSlug];

      return {
        ...prev,
        [moduleId]: updated
      };

    });

  };

  /* ================= MODULE SELECT ================= */

  const selectAllModuleActions = module => {

    const actions = module.actions_data?.map(a => a.tac_name_slug) || [];

    setPermissions(prev => ({
      ...prev,
      [module.tmd_id]: actions
    }));

  };

  const clearModuleActions = moduleId => {

    setPermissions(prev => ({
      ...prev,
      [moduleId]: []
    }));

  };

  /* ================= GLOBAL SELECT ================= */

  const selectAllPermissions = () => {

    const all = {};

    menuList.forEach(m => {

      all[m.tmd_id] = m.actions_data?.map(a => a.tac_name_slug) || [];

    });

    setPermissions(all);

  };

  const clearAllPermissions = () => {
    setPermissions({});
  };

  /* ================= BUILD SUBMIT ARRAY ================= */

  const buildSubmitArr = () => {

    return Object.entries(permissions).map(([moduleId, actions]) => {

      const module = menuList.find(m => m.tmd_id == moduleId);

      return {
        module_id: moduleId,
        module_slug: module?.tmd_slug_name,
        actions: actions.join(",")
      };

    });

  };

  /* ================= SUBMIT ================= */

  const submitRole = async e => {

    e.preventDefault();

    if (!addNewRole.trl_role_name) {
      toast.error("Role name required");
      return;
    }

    if (Object.keys(error).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    try {

      setLoading(true);

      const res = await createRole({
        role: addNewRole,
        permissions: buildSubmitArr()
      });

      if (res.status) {

        toast.success(res.message);

        getAllRoleList();

        changeModalStatus("add_role_modal", false);

      }

    } catch (e) {

      toast.error(e.message);

    }

    setLoading(false);

  };

  /* ================= JSX ================= */

  return (

    <Modal
      show={show.add_role_modal}
      size="xl"
      centered
      scrollable
      backdrop="static"
      onHide={() => changeModalStatus("add_role_modal", false)}
    >

      <Modal.Header closeButton>
        <Modal.Title>
          {updateInfo?.trl_role_id ? "Edit Role" : "Add Role"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* ROLE DETAILS */}

        <div className="row mb-4">

          <div className="col-md-3">
            <label className="form-label">Role Name *</label>
            <input
              className="form-control"
              value={addNewRole.trl_role_name}
              onChange={e => handleInputChange(e, "trl_role_name")}
            />
          </div>



        </div>

        {/* PERMISSIONS HEADER */}

        <div className="d-flex justify-content-between mb-3">

          <h6 className="fw-bold">Access Permissions</h6>

          <div>

            <Button
              size="sm"
              variant="success"
              className="me-2"
              onClick={selectAllPermissions}
            >
              Select All
            </Button>

            <Button
              size="sm"
              variant="outline-secondary"
              onClick={clearAllPermissions}
            >
              Clear
            </Button>

          </div>

        </div>

        {/* MODULE GRID */}

        <div className="row g-3">

          {menuList.map(module => (

            <div className="col-md-4" key={module.tmd_id}>

              <div className="permission-card">

                <div className="permission-header">

                  <div className="module-title">

                    <span className="module-icon">
                      {getIcon(module.tmd_slug_name)}
                    </span>

                    {module.tmd_name}

                  </div>

                  <div>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm me-1"
                      onClick={() => selectAllModuleActions(module)}
                    >
                      All
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => clearModuleActions(module.tmd_id)}
                    >
                      Clear
                    </button>

                  </div>

                </div>

                <div className="permission-actions">

                  {module.actions_data?.map(action => (

                    <label
                      key={action.tac_id}
                      className="permission-checkbox"
                    >

                      <input
                        type="checkbox"
                        checked={
                          permissions[module.tmd_id]?.includes(
                            action.tac_name_slug
                          ) || false
                        }
                        onChange={() =>
                          togglePermission(
                            module.tmd_id,
                            action.tac_name_slug
                          )
                        }
                      />

                      {action.tac_name}

                    </label>

                  ))}

                </div>

              </div>

            </div>

          ))}

        </div>

        <Button
          className="mt-4"
          onClick={submitRole}
          disabled={loading || Object.keys(error).length > 0}
        >
          {loading ? "Saving..." : "Submit"}
        </Button>

      </Modal.Body>

    </Modal>

  );
}