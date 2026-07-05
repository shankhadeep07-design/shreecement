import $, { data } from 'jquery';
import ReactDOM from 'react-dom/client';
import 'react-confirm-alert/src/react-confirm-alert.css';

export function initUserListDatatable(authToken, editUserFun, handleDelete) {
    if ($.fn.DataTable.isDataTable('#user_list_table')) {
        $('#user_list_table').DataTable().destroy();
    }

    $("#user_list_table").DataTable({
        order: [[0, 'asc']],
        ajax: {
            url: `${import.meta.env.VITE_API_URL}/admin/users/list`,
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", `Bearer ${authToken}`);
            }
        },
        processing: true,
        serverSide: true,
        columns: [
            {
                name: 'id',
                data: "id",
                searchable: false,
                orderable: true
            },
            {
                name: 'name',
                data: "name",
                searchable: true,
                orderable: true
            },
            {
                name: 'email',
                data: "email",
                searchable: true,
                orderable: true
            },
            {
                name: 'status',
                data: "status",
                searchable: true,
                orderable: true
            },
            {
                name: 'trl_role_name',
                data: "trl_role_name",
                searchable: true,
                orderable: true
            },
            {
                data: "id",
                name: 'id',
                searchable: false,
                orderable: false
            },
        ],
        columnDefs: [
            {
                targets: [5],
                createdCell: (td, celldata, rowdata) => {
                    ReactDOM.createRoot(td).render(
                        <>
                            <button data-bs-toggle="dropdown" type="button" className="btn btn-sm btn-light">
                                <a data-toggle="tooltip" data-placement="bottom" title="Action">
                                    <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                                </a>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a className="dropdown-item text-primary" onClick={() => {
                                        editUserFun(rowdata)
                                    }}>
                                        <i className="fa fa-pencil-alt"></i> Edit
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item text-danger" onClick={() => handleDelete(rowdata)}>
                                        <i className="fa fa-trash"></i>
                                        <span> Delete</span>
                                    </a>
                                </li>
                            </ul>
                        </>
                    )
                }
            },
            {
                targets: [3],
                createdCell: (td, celldata, rowdata) => {
                    var attributes = {
                        className: 'form-check-input',
                        type: 'checkbox',
                        onChange: function () {
                        }
                    };
                    if (celldata === 'active') {
                        attributes.defaultChecked = 'true';
                    }
                    ReactDOM.createRoot(td).render(
                        <>
                            <div className="form-check form-switch">
                                <input {...attributes} />
                            </div>
                        </>
                    )
                }
            }
        ]
    });
}
