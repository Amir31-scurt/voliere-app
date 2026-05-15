import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { baseApi } from '../store/api/baseApi';

export function useSocketCages() {
  const socket = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      dispatch(baseApi.util.invalidateTags([{ type: 'Cage', id: 'LIST' }]));
    };
    socket.on('cage:updated', handler);
    return () => socket.off('cage:updated', handler);
  }, [socket, dispatch]);
}
