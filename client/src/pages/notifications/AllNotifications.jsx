import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Accordion, ListGroup } from 'react-bootstrap';
import { NavLink, useNavigate } from "react-router-dom";

// import { useSocket } from '../../context/SocketContext';
import { getAllNotificationListApi } from '../../Services/Notification-service';

const AllNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        getAllNotificationListApi().then(res => {
            setNotifications(res.data);
        }).catch(err => {
            console.error(err);
        });
    }, []);

    // const socket = useSocket();

    // useEffect(() => {
    //     if (socket) {
    //         socket.on('notification', (data) => {
    //             setNotifications(prev => [data, ...prev]);
    //             alert(`🔔 New Notification: ${data.tnot_message}`);
    //         });
    //     }
    // }, [socket]);

    // Group notifications by type
    const groupedNotifications = notifications.reduce((acc, curr) => {
        const type = curr.tnot_type || 'Others';
        if (!acc[type]) acc[type] = [];
        acc[type].push(curr);
        return acc;
    }, {});

    const handleViewAll = (type, list) => {
        const tnotTypes = [...new Set(list.map(item => item.tnot_type))];
        console.log('Unique tnot_type(s):', tnotTypes[0]);
        navigate(`/admin/view-all-notifications/${tnotTypes[0]}`);
    };
    return (
        <>
            <Toaster position='top-center' toastOptions={{ duration: 2000 }} reverseOrder={false} />

            <div className="home-content">
                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 float-left">Notifications</h5>
                    </div>

                    <div className="card-body at-elevation-z6 table-box pt-3">
                        <Accordion>
                            {Object.entries(groupedNotifications).map(([type, list], index) => (
                                <Accordion.Item eventKey={index.toString()} key={type}>
                                    <Accordion.Header>
                                        <div className='d-flex justify-content-between align-items-center w-100'>
                                            <h6 className="mb-0 text-capitalize">{type.replaceAll('_', ' ')}</h6>
                                            <span className="badge badge-info mx-2 px-2">{list.length}</span>
                                        </div>
                                        {/* <button type="button" className="btn btn-sm btn-primary w-10 me-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewAll(type, list)
                                            }}
                                        >View All</button> */}
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <ListGroup as="ol">
                                            {list.map((not, idx) => (
                                                <NavLink to={`/admin/${not.tnot_url}`} key={idx}>
                                                    <ListGroup.Item as="li">
                                                        {
                                                            not.proposal ? (
                                                                <div>
                                                                    <strong>{not.tnot_text}</strong> - <em>{not.proposal[0].tpros_introduction}</em> ({not.proposal[0].financial_year})
                                                                </div>
                                                            ) : not.budget_master ? (
                                                                <div>
                                                                    <strong>{not.tnot_text}</strong> - <em>{not.budget_master.tbm_total_budget_amount}</em>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <strong>{not.tnot_text}</strong>
                                                                </div>
                                                            )
                                                        }
                                                    </ListGroup.Item>
                                                </NavLink>
                                            ))}
                                        </ListGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AllNotifications;
