import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }
      
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'secretKey',
      });
      
      const userId = payload.sub;
      client.data.userId = userId;
      
      // Add socket to user's socket set
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      
      console.log(`Client connected: ${client.id} for user: ${userId}`);
    } catch (error) {
      console.error('Socket connection error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }
    
    console.log(`Client disconnected: ${client.id}`);
  }

  todoUpdated(userId: string, action: string) {
    if (this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      
      for (const socketId of sockets) {
        this.server.to(socketId).emit('todos-updated', { action });
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }
}