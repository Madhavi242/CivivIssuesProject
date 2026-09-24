import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('⚡ [Socket.IO] Connected to CivicPulse real-time stream');

      if (user) {
        newSocket.emit('join_user', user.id || user._id);
        if (user.role) {
          newSocket.emit('join_role', user.role);
        }
        if (user.department?._id || user.department) {
          newSocket.emit('join_department', user.department?._id || user.department);
        }
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('⚡ [Socket.IO] Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
