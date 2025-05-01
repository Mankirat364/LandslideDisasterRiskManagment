
import { io } from 'socket.io-client';

let socket;

export const initSocket = (baseUrl) => {
  if (!socket) {
    socket = io(baseUrl , {
       withCredentials: true,
  transports: ['websocket']
    });
  }
  return socket;
};

export const getSocket = () => socket;
