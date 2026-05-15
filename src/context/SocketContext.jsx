import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(window.location.origin, { path: '/socket.io' });
    socketRef.current = s;
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext).socket;
export const useSocketConnected = () => useContext(SocketContext).connected;
