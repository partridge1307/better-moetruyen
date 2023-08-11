import { socketServer } from '@/config';
import { io } from 'socket.io-client';

export const socket = io(socketServer, { autoConnect: false });
