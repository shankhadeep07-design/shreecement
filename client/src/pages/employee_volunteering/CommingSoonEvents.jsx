import {
  EllipsisOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Modal, Pagination, Spin } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { privateAxios } from "../../services/Helper";
// import AddEditNgoMaster from "./AddEditNgoMaster";

const CommingSoonEvents = () => {
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
          name: "tevent_domain",
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
          data: "tevent_domain",
          name: "tevent_domain",
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
        "admin/events/comming_soon_events/datatable",
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
          <h5 className="mb-0">Coming Soon Events</h5>
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

        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Spin size="large" />
          </div>
        ) : (
          <div className="p-2 row gap-6 ">
            {records?.map((item, index) => (

              <div
                key={index}
                className="col-lg-4 bg-white border border-success rounded shadow p-3"
              >
               
                  <div className="d-flex justify-content-between align-items-start mb-3">
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

                  </div>
               

                <div className="mt-6 overflow-y-auto">
                  <div className="project-list-card bg-white border border-success rounded shadow">
                    <div className="cover-img">
                      <div className="back-img">
                        {(() => {
                          const logoDoc = item?.documents?.find(
                            (doc) => doc?.doc_purpose === "tevent_thumbnail" && doc?.full_url
                          );

                          return logoDoc ? (
                            <img
                              src={logoDoc.full_url}
                              alt={logoDoc.doc_purpose || "tevent_thumbnail"}
                              className="shadow"
                            />
                          ) : (
                            <div>
                              <UserOutlined />
                            </div>
                          );
                        })()}

                      </div>

                      <div className="container position-relative pb-4">
                        <div className="d-flex align-items-center profile-pic-details">
                          <div className="me-3">
   
                            {(() => {
                              const logoDoc = item?.documents?.find(
                                (doc) => doc?.doc_purpose === "tevent_profile_pic" && doc?.full_url
                              );

                              return logoDoc ? (
                                <img
                                  src={logoDoc.full_url}
                                  alt={logoDoc.doc_purpose || "tevent_profile_pic"}
                                  className="profile-pic shadow"
                                />
                              ) : (
                                <div>
                                  <UserOutlined />
                                </div>
                              );
                            })()}
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name - full width, one-line truncate */}

                  {/* Description - slightly narrower, max 2 lines then ellipsis */}
                

                  <div className="text-left">
                    Domain : <b>{item?.tevent_domain}</b>
                  </div>
                  <div className="text-left">
                    Activity Title : <b>{item?.tevent_activity_title}</b>
                  </div>
                  <div className="text-left">
                    Region : <b>{item?.treg_region_name}</b>
                  </div>
                  <div className="text-left">
                    State : <b>{item?.tsl_state_name}</b>
                  </div>
                  <div className="text-left">
                    Location : <b>{item?.tevent_location}</b>
                  </div>

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

export default CommingSoonEvents;
