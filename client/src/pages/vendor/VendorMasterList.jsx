import {
  EllipsisOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Modal, Pagination, Spin } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { privateAxios } from "../../services/Helper";
import AddEditVendorMasterList from "./AddEditVendorMasterList";
import userLogo from "../../assets/images/no_image.webp";

const VendorMasterList = () => {
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
          name: "tvendor_prospect_name",
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
          data: "tvendor_prospect_name",
          name: "tvendor_prospect_name",
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
        "admin/vendor/datatable",
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

  const handleVendorProfileView = (tvendor_id) => {
    window.open(
      `${import.meta.env.VITE_HOME_PAGE}/admin/vendor/view/${tvendor_id}`,
      "_blank"
    );
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyToClipboardVolURL = () => {
    let url = "";
    if (import.meta.env.VITE_HOME_PAGE === "/") {
     // url = window.location.origin + `${import.meta.env.VITE_HOME_PAGE}` + "vendor-registration";
       url =  `${import.meta.env.VITE_HOME_PAGE}` + "vendor-registration";

    } else {
     // url = window.location.origin + `${import.meta.env.VITE_HOME_PAGE}` + "/vendor-registration";
      url =  `${import.meta.env.VITE_HOME_PAGE}` + "/vendor-registration";
    }

    navigator.clipboard.writeText(url).then(() => {
      alert("Vendor Registration URL copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy: ", err);
    });
  };

  return (
    <div className="home-content ">
      <div className="card common-card position-relative">
        <div className="card-header common-card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
          <h5 className="mb-0">Vendor List</h5>
          <div className="d-flex align-items-center gap-2">

            <button
              type="button"
              style={{ marginRight: "10px" }}
              className="btn btn-sm btn-dark"
              onClick={copyToClipboardVolURL}
            >
              <i className="fa-solid fa-plus" style={{ marginRight: "5px" }}></i>
              Copy Vendor REG URL
            </button>

            {/* {(permissions.includes('add') || permissions === "*") && ( */}
            <Button
              shape="circle"
              title="Add Vendor"
              icon={<PlusOutlined />}
              onClick={() => setIsOpenUpsertModal(true)}
            />
            {/* )} */}
          </div>
        </div>
        <div className="card-body">
            <div className="row">
              <div className="col-md-2 ms-auto">
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
              </div>
            </div>



        {loading ? (
          <div className="flex justify-center items-center h-60 position-relative">
               <div className="loading-content-large">
                  <Spin size="large" />
               </div>
          </div>
        ) : (
          <div className="row g-4">
            {records?.map((item, index) => (

              <div key={item?.med_id} className="col-lg-4">
                <div className="project-list-card ngo-card shadow">

                  {/* Cover/Header */}
                  <div className="cover-img">

                    <div className="back-img">
                      {(() => {
                        const logoDoc = item?.documents?.find(
                          (doc) => doc?.doc_purpose === "tngo_logo" && doc?.full_url
                        );

                        return logoDoc ? (
                          <img
                            src={logoDoc.full_url}
                            alt={logoDoc.doc_purpose || "tngo_logo"}
                            className="shadow"
                          />
                        ) : (
                          <div>
                            <img
                              src={userLogo} // <-- replace with your default image path
                              alt="default-user"
                              className="shadow"
                              style={{ marginTop: "60px" }}
                            />
                          </div>
                        );
                      })()}
                    </div>


                    <div className="container position-relative pb-4">
                      <div className="d-flex align-items-center profile-pic-details">
                        <div className="profile-title w-100">
                          <div
                            className="mb-0 d-flex justify-content-end align-items-center"
                            style={{ fontWeight: "700" }}
                          >
                            {/* Dropdown aligned to right */}
                            <Dropdown
                              trigger={["click"]}
                              className="border border-dark"
                              overlay={
                                <Menu>
                                  <Menu.Item
                                    key="view"
                                    onClick={() => handleVendorProfileView(item?.tvendor_id)}
                                  >
                                    View
                                  </Menu.Item>
                                  <Menu.Item
                                    key="edit"
                                    onClick={() => handleUpdate(item)}
                                  >
                                    Edit
                                  </Menu.Item>
                                </Menu>
                              }
                            >
                              <Button
                                type="text"
                                icon={<EllipsisOutlined />}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>


                  <div className="content-details-section">
                    <div className="row">
                      <div className="col-lg-6">
                        <b>Prospect`s Name : </b>
                      </div>
                      <div className="col-lg-6">
                        {item?.tvendor_prospect_name ? item.tvendor_prospect_name : "N/A"}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6">
                        <b>Preferred Location : </b>
                      </div>
                      <div className="col-lg-6">
                        {item?.tvendor_preferred_location ? item.tvendor_preferred_location : "N/A"}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6">
                        <b>Additional Location : </b>
                      </div>
                      <div className="col-lg-6">
                        {item?.tvendor_additional_location ? item.tvendor_additional_location : "N/A"}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6">
                        <b>Statues :</b>
                      </div>
                      <div className="col-lg-6">
                        {item?.tvendor_statues ? item.tvendor_statues : "N/A"}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6">
                        <b>Status : </b>
                      </div>
                      <div className="col-lg-6">
                        {
                          item?.tvendor_status && item?.tvendor_status == 'approved' &&(
                            <span className="badge bg-success">Approved</span>
                          )
                        }
                        {
                          item?.tvendor_status && item?.tvendor_status == 'pending' &&(
                            <span className="badge bg-warning">Pending</span>
                          )
                        }
                        {
                          item?.tvendor_status && item?.tvendor_status == 'send_for_approval' &&(
                            <span className="badge bg-info">Sent for Approval</span>
                          )
                        }
                         
                      </div>
                    </div>

                    
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

        {isOpenUpsertModal && (
          <AddEditVendorMasterList
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
              vendor?
            </p>
          </Modal>
        )}
        </div>
      </div>
    </div>
  );
};

export default VendorMasterList;
