// src/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

import { userDetails } from "../auth/auth";

const SocketContext = createContext("");

// const encodeBase64 = (str) => {
//     return Buffer.from(str).toString('base64');
// };

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!socket) {
            var user = userDetails();
            var userId = user?.id;
            if (user?.id) {
                const newSocket = io(`${process.env.REACT_APP_API_URL}`, {
                    reconnectionDelay: 5000,
                    extraHeaders: {
                        'x-authorization-id': btoa(userId),
                    },
                    path: `${process.env.REACT_APP_BASE_NAME}api/v1/socket.io`,
                    transports: ['websocket'],
                });
                setSocket(newSocket);
                // newSocket.emit('register', user?.id)
                return () => newSocket.close();
            }
        }
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};


export const useSocket = () => {
    return useContext(SocketContext);
};