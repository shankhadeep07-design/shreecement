import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  getAllRoleApi
} from "../../Services/Role-service";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { SearchOutlined } from "@ant-design/icons";
import { Input, Table } from "antd";
import {
  FaEllipsisH,
  FaPencilAlt,
  FaPlus
} from "react-icons/fa";
import { useLoading } from '../../context/LoadingContext';
import { Dropdown } from "react-bootstrap";
import { AddRole } from "./AddRole";
import { roleHasPermission } from "../../Services/Role-service.js";
import { getMyModulePermissionFun } from "../../helper/common.js";
import PlotListShimmer from "../shimmers/PlotListShimmer.jsx";

export const Role = () => {
  let { loading, setLoading } = useLoading(false);
  let [shimmerLoading, setShimmerLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [modulePermissions, setModulePermissions] = useState([]);

  const [show, setShow] = useState(
    { add_role_modal: false },
    { update_role_modal: false }
  );
  let changeModalStatus = (id, status) => {
    setShow({
      ...show,
      [id]: status,
    });
  };
  const [Role_list, setRoleList] = useState([]);
  const [filter_role_list, setFilteredRoleList] = useState([]);
  const [role_edit, setEditRole_edit] = useState({
    trl_role_name: "",
    trl_role_id: "",
    trl_ttm_type_id: "",
  });

  useEffect(() => {

    getMyModulePermissionFun('role')
      .then((module) => {
        setModulePermissions(module);
      })
      .catch((error) => {
        console.error('Error fetching module permissions:', error);
      });
    setTimeout(() => {
      setShimmerLoading(false);
    }, 2000);

  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  // ---------------------------------  Plot List -------------------------------
  const getAllRoleList = (callback = null) => {
    getAllRoleApi("")
      .then((data) => {
        let all_client = data.data;
        setRoleList(all_client);
        setFilteredRoleList(all_client);
        setLoading(false);

      })
      .catch((error) => {
        // toast.error(error);
      });
  };

  const [permissions, setPermissions] = useState([])
  const [responseReceived, setResponseReceived] = useState(false)
  useEffect(() => {
    roleHasPermission('roles').then((response) => {
      if (response.status == 1) {
        var pmsn = response?.data;
        setPermissions(pmsn);
        setResponseReceived(true)
      }
    })

    setTimeout(() => {
      setShimmerLoading(false);
    }, 2000)
  }, [])

  useEffect(() => {
    getAllRoleList();
  }, []);

  const columns = [
    {
      title: "Sl.",
      dataIndex: "trl_role_id",
      render: (text, record, index) => index + 1,
      width: "10%",
      className: "text-center",
    },
    {
      title: "Role Name",
      dataIndex: "trl_role_name",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        Object.values(record).some(
          (val) =>
            val && val.toString().toLowerCase().includes(value.toLowerCase())
        ),
      render: (text, record) => {
        return <>{record.trl_role_name}</>;
      },
      className: "text-center",
    },

    {
      title: "Actions",
      className: "text-center",
      render: (text, record) => (
        <>
          <div className="text-center">
            <Dropdown className='ddl-action'>
              <Dropdown.Toggle
                variant="light"
                id={`dropdown-${record.trl_role_id}`}
                size="sm"
              >
                <FaEllipsisH />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {
                  (modulePermissions?.indexOf('edit') > -1) &&
                  <Dropdown.Item

                    onClick={() => edit_role(record)}
                  >
                    <FaPencilAlt style={{ marginRight: "5px" }} />
                    Edit
                  </Dropdown.Item>
                }

              </Dropdown.Menu>
            </Dropdown>
          </div>
        </>
      ),
      width: "10%",
    },
  ];



  const [role_update, setRoleUpdate] = useState({});

  const edit_role = (item) => {
    setRoleUpdate(item);
    changeModalStatus("add_role_modal", true);
  };


  const [inputSearch, setInputSearch] = useState("");

  useEffect(() => {
    const result = Role_list.filter((data) => {
      if (data.trl_role_name != null) {
        return data.trl_role_name
          .toLowerCase()
          .match(inputSearch.toLowerCase());
      }
    });

    setFilteredRoleList(result);
  }, [inputSearch]);



  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{ duration: 2000 }}
        reverseOrder={false}
      ></Toaster>

      <span className="position-absolute trigger"></span>


      <div className="home-content">
        <div className="card pb-3">
          <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="mb-0 float-left">
              Role List
            </h5>
            <div className="float-right">
              {
                (modulePermissions?.indexOf('add') > -1) &&
                <div className="float-right">
                  <button
                    type="button"
                    className="btn btn-sm btn-dark"
                    onClick={() => { setRoleUpdate({}); changeModalStatus("add_role_modal", true) }}
                  >
                    <i className="fa-solid fa-plus"></i> Add Role
                  </button>
                </div>
              }
            </div>
          </div>

          <div className="card-body at-elevation-z6 table-box">
            {
              (shimmerLoading) &&
              <PlotListShimmer header={false} />
            }
            <div className="card-body-content" style={{ display: (shimmerLoading) ? 'none' : "block" }}>

              <>
                <div className='d-flex justify-content-between mt-2'>
                  <div></div>
                  {
                    (modulePermissions?.indexOf('list') > -1) &&
                    <div className="data_search">
                      <Input.Search
                        placeholder="Search"
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: "200px" }}
                        prefix={
                          <SearchOutlined
                            style={{
                              marginRight: "8px",
                              color: "rgba(0, 0, 0, 0.25)",
                            }}
                          />
                        }
                        className="no-addon"
                      />
                      <style>{`.no-addon .ant-input-group-addon { display: none; }`}</style>
                    </div>
                  }
                </div>
                <div className="initiated-State-table-container">
                <div className="mt-2 table table-bordered">
                  <div>
                    {
                      (modulePermissions?.indexOf('list') > -1) ?
                        <Table
                          dataSource={filter_role_list}
                          rowKey={(record) => record.trl_role_id}
                          columns={columns}
                          pagination={{ pageSize: 10 }}
                          className='table table-bordered dataTable'
                        />
                        :
                        <>
                          <tr>
                            <td colSpan={6} className='text-center'>You don't have any permissions</td>
                          </tr>
                        </>
                    }
                  </div>
                  </div>
                </div>
              </>
              
              <div className="text-center"></div>


            </div>
          </div>
        </div>

        <div className="allModals">

          {
            (show.add_role_modal) &&
            <AddRole
              show={show}
              changeModalStatus={changeModalStatus}
              updateInfo={role_update}
              getAllRoleList={getAllRoleList}
              setLoading={setLoading}
              loading={loading}
            />
          }

        </div >

      </div >
    </>
  );
};
