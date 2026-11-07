import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { socketEndpoint } from '../config';

@Injectable({ providedIn: 'root' })
export class SocketService {
  readonly socket: Socket = io(socketEndpoint, { transports: ['websocket'] });
}
