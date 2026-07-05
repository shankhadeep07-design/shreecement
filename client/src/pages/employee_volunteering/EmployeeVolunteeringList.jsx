import {
  CheckCircleTwoTone,
  DownloadOutlined,
  EllipsisOutlined,
  PlusOutlined,
  StopTwoTone,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Modal, Pagination, Spin } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { privateAxios } from "../../services/Helper";
import AddEditEmployeeVolunteering from "./AddEditEmployeeVolunteering";
import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";
const EmployeeVolunteeringList = () => {
  const drawRef = useRef(1);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toogleLoading, setToogleLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    doct_name: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 2,
  });

  const [selectedData, setSelectedData] = useState({});
  const [isOpenUpsertModal, setIsOpenUpsertModal] = useState(false);

  const handleUpdate = (data) => {
    setSelectedData(data);
    setIsOpenUpsertModal(true);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleToggleActive = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Debounce search input
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput]);

  const buildPayload = useMemo(() => {
    return {
      draw: drawRef.current,
      start: (pagination.page - 1) * pagination.pageSize,
      length: pagination.pageSize,
      order: [
        {
          column: 1,
          dir: "asc",
          name: "name",
        },
      ],
      search: {
        value: search || "",
        regex: false,
      },
      columns: [
        {
          data: "id",
          name: "",
          searchable: "false",
          orderable: "false",
          search: { value: "", regex: false },
        },
        {
          data: "tevol_name",
          name: "tevol_name",
          searchable: "true",
          orderable: "true",
          search: { value: "", regex: false },
        },
        {
          data: "tevol_department",
          name: "tevol_department",
          searchable: "true",
          orderable: "true",
          search: { value: "", regex: false },
        },
        {
          data: "tevol_another_mem_no",
          name: "tevol_another_mem_no",
          searchable: "true",
          orderable: "true",
          search: { value: "", regex: false },
        },
      ],
      filterParams: filters,
    };
  }, [pagination.page, pagination.pageSize, search, filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await privateAxios.post(
        "admin/employee-volunteering/ev_datatable",
        buildPayload
      );
      const data = response?.data;
      setRecords(data?.data || []);
      setTotalRecords(data?.recordsTotal || 0);
      drawRef.current += 1;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [buildPayload]);

  const handleExcelDownload = async () => {
    try {
      const response = await privateAxios.post(
        "doct/dt-file-dwn",
        buildPayload,
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        }
      );

      let fileName = "Doctor Profile List.xlsx";
      const contentDisposition = response.headers["Content-Disposition"];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) fileName = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download Excel file");
    }
  };

  const handleActiveInactive = async (selectedItem) => {
    setToogleLoading(true);
    try {
      const res = await privateAxios.post("/doct/active-inactive", {
        user_id: selectedItem?.user_id,
        is_active: selectedItem?.is_active ? false : true,
      });
      fetchData();
      setModalVisible(false);
      toast.success(res?.data?.message);
    } catch (error) {
      toast.error(
        error?.response?.data?.originalError || error?.response?.data?.message
      );
    } finally {
      setToogleLoading(false);
    }
  };

  const handleDoctorProfileView = (doct_id) => {
    window.open(
      `${import.meta.env.VITE_BASENAME}/doctor-profile/view/${doct_id}`,
      "_blank"
    );
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="home-content">
      <div className="card common-card">
        <div className="card-header common-card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
          <h5 className="mb-0">Employee volunteering List</h5>
          <div className="d-flex align-items-center gap-2">
            {/* {(permissions.includes('add') || permissions === "*") && ( */}
            <Button
              shape="circle"
              title="Add employee volunteering"
              icon={<PlusOutlined />}
              onClick={() => setIsOpenUpsertModal(true)}
            />
            {/* )} */}
          </div>
        </div>

        <div className="flex justify-end items-center p-2 gap-2">
          <Input
            placeholder="Search..."
            className="max-w-xs"
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
          <Button
            icon={<DownloadOutlined />}
            type="primary"
            onClick={handleExcelDownload}
          >
            Download
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Spin size="large" />
          </div>
        ) : (
          <div className="p-2 row gap-6 ">
            {records?.map((item) => (
              <div
                key={item?.med_id}
                className="col-lg-4 bg-white border border-success rounded shadow p-3"
              >
                <b className="text-[10px]">{item?.doct_unique_id || ""}</b>
 
                <Dropdown
                  trigger={["click"]}
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="view"
                        onClick={() => handleDoctorProfileView(item?.doct_id)}
                      >
                        View
                      </Menu.Item>
                      <Menu.Item key="edit" onClick={() => handleUpdate(item)}>
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        key="toggle"
                        icon={
                          item?.is_active ? (
                            <StopTwoTone twoToneColor="#f5222d" />
                          ) : (
                            <CheckCircleTwoTone twoToneColor="#52c41a" />
                          )
                        }
                        onClick={() => handleToggleActive(item)}
                      >
                        {item?.is_active ? "Deactivate" : "Activate"}
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button
                    type="text"
                    icon={<EllipsisOutlined />}
                    className="!absolute !top-2 !right-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
 
                <div className="mt-6 overflow-y-auto">
                  {/* <div className="flex justify-center mb-2">
                    {item?.documents?.[0]?.file_path ? (
                      <img
                        src={item?.documents?.[0]?.file_path}
                        alt={item?.documents?.[0]?.doc_purpose || "Profile"}
                        className="h-28 w-28 object-cover rounded-full border"
                      />
                    ) : (
                      <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl border">
                        <UserOutlined />
                      </div>
                    )}
                  </div> */}
                  {/* Name - full width, one-line truncate */}
                  {/* <div className="text-left font-semibold text-sm mb-1 truncate flex items-center gap-1">
                    {item?.is_active ? (
                      <AiFillCheckCircle className="text-green-600 text-base" />
                    ) : (
                      <AiFillCloseCircle className="text-red-500 text-base" />
                    )}
                    {item?.name}
                  </div> */}
 
                  {/* Description - slightly narrower, max 2 lines then ellipsis */}
                  <div className="text-left text-sm text-gray-600 mb-1 max-w-[90%] line-clamp-2">
                    Name: {item?.tevol_name}
                  </div>
                  <div className="text-left text-sm text-gray-600 mb-1 max-w-[90%] line-clamp-2">
                    Department: {item?.tevol_department}
                  </div>
                  <div className="text-left text-sm text-gray-600 mb-1 max-w-[90%] line-clamp-2">
                    Another Member No: {item?.tevol_another_mem_no}
                  </div>
                  <div className="text-left text-sm text-gray-600 mb-1 max-w-[90%] line-clamp-2">
                    Another Member Name: {item?.tevol_another_mem_name}
                  </div>
                  <div className="text-left text-sm text-gray-600 mb-1 max-w-[90%] line-clamp-2">
                    Description: {item?.tevol_description}
                  </div>
{/*  
                  <div className="flex flex-col items-end justify-end self-end gap-1 mt-1">
                    <span className="text-sm font-bold text-black">
                     Department: {item?.tevol_department || "N/A"}
                    </span>
                    
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-end m-3">
          <Pagination
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={totalRecords}
            onChange={(page, pageSize) => setPagination({ page, pageSize })}
          />
        </div>

        {isOpenUpsertModal && (
          <AddEditEmployeeVolunteering
            visible={isOpenUpsertModal}
            onClose={() => {
              setIsOpenUpsertModal(false);
              setSelectedData({});
            }}
            data={selectedData}
            fetchData={fetchData}
          />
        )}

        {modalVisible && (
          <Modal
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setModalVisible(false)}>
                Cancel
              </Button>,
              <Button
                key="confirm"
                type="primary"
                loading={toogleLoading}
                // danger={selectedItem?.is_active}
                onClick={() => handleActiveInactive(selectedItem)}
              >
                {/* {selectedItem?.is_active ? "Deactivate" : "Activate"} */}
                OK
              </Button>,
            ]}
          >
            <p>
              Are you sure you want to{" "}
              <b>{selectedItem?.is_active ? "Deactivate" : "Activate"}</b> this
              doctor?
            </p>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default EmployeeVolunteeringList;
