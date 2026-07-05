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
// import AddEditNgoMaster from "./AddEditNgoMaster";
import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";

const MyEvents = () => {
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
    pageSize: 12,
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
      setPagination((prev) => ({ ...prev, page: 1 }));
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
          name: "tevent_type",
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
          data: "tevent_type",
          name: "tevent_type",
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
        "admin/events/my-event/datatable",
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

  const handleNgoProfileView = (event) => {
    // window.open(
    //   `${import.meta.env.VITE_HOME_PAGE}/admin/event/${tevent_id}`,
    //   "_blank"
    // );

    
    if (event.tevent_type == 'social_development') {
      window.open(
        `${import.meta.env.VITE_HOME_PAGE}/admin/event-social-development/${event.tevent_id}`,
        "_blank"
      );
      
    } else {
      window.open(
        `${import.meta.env.VITE_HOME_PAGE}/admin/event-cil/${event.tevent_id}`,
        "_blank"
      );
    }

  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="home-content">
      <div className="card common-card">
        <div className="card-header common-card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
          <h5 className="mb-0">My Events</h5>
          <div className="d-flex align-items-center gap-2">
            {/* {(permissions.includes('add') || permissions === "*") && ( */}
            {/* <Button
              shape="circle"
              title="Add Events"
              icon={<PlusOutlined />}
              onClick={() => setIsOpenUpsertModal(true)}
            /> */}
            {/* )} */}
          </div>
        </div>

        <div className="flex justify-end items-center p-2 gap-2">
          <Input
            placeholder="Search..."
            className="max-w-xs"
            onChange={(e) => {
              setSearchInput(e.target.value);
             
            }}
          />
          {/* <Button
            icon={<DownloadOutlined />}
            type="primary"
            onClick={handleExcelDownload}
          >
            Download
          </Button> */}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Spin size="large" />
          </div>
        ) : (
          <div className="p-2 row gap-6 ">
            {records?.map((item , index) => (
              <div
                key={index}
                className="col-lg-4 bg-white border border-success rounded shadow p-3"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <b className="text-[10px]">{index || ""}</b>
                  <div className="d-flex justify-content-between align-items-center">
                    <Dropdown
                      trigger={["click"]}
                      overlay={
                        <Menu>
                          <Menu.Item
                            key="view"
                            onClick={() =>
                              handleNgoProfileView(item)
                            }
                          >
                            View
                          </Menu.Item>
                         
                          {/* <Menu.Item
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
                          </Menu.Item> */}
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
                    {/* <div className="text-left text-sm ms-2 mb-1">
                      {item?.is_active ? (
                        <AiFillCheckCircle className="text-green-600 text-base" />
                      ) : (
                        <AiFillCloseCircle className="text-red-500 text-base" />
                      )}
                    </div> */}
                  </div>
                </div>

                <div className="mt-6 overflow-y-auto">
                  <div className="d-flex justify-content-start gap-2 align-items-center mb-2">
                    {/* <div className="ngo-list-dp-img">
                      {item?.documents?.[0]?.doc_path ? (
                        <img
                          src={item?.documents?.[0]?.full_url}
                          alt={item?.documents?.[0]?.doc_purpose || "tngo_logo"}
                          className=""
                        />
                      ) : (
                        <div className="">
                          <UserOutlined />
                        </div>
                      )}
                    </div> */}
                    {/* <div className="text-left">
                      <b>{item?.tevent_type}</b>
                    </div> */}
                  </div>

                  {/* Name - full width, one-line truncate */}

                  {/* Description - slightly narrower, max 2 lines then ellipsis */}
                  <div className="text-left">
                    Activity Name : <b>{item?.tevent_activity_title}</b>
                  </div>
                  {/* <div className="text-left">
                    Company Name : <b>{item?.tcom_company_name}</b>
                  </div> */}
                  <div className="text-left">
                    Vertical : <b>{item?.tvm_vertical_name}</b>
                  </div>

                  {/* <div className="text-left">
                    NGO : <b>{item?.tngo_name || "N/A"}</b>
                  </div> */}

                  {/* <div className="text-left">
                    Assign User : <b>{item?.tngo_user_name || "N/A"}</b>
                  </div> */}
                  {/* <div className="text-left mt-2">
                    Certificates :{" "}
                    <span class="badge bg-info py-1 px-1 me-1">01</span>
                    <span class="badge bg-info py-1 px-1 me-1">02</span>
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

        {/* {isOpenUpsertModal && (
          <AddEditNgoMaster
            visible={isOpenUpsertModal}
            onClose={() => {
              setIsOpenUpsertModal(false);
              setSelectedData({});
            }}
            data={selectedData}
            fetchData={fetchData}
          />
        )} */}

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
              ngo?
            </p>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
