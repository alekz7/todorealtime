"use client";

import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket.io connection
let socket: Socket | null = null;

export const connectSocket = () => {
  const token = Cookies.get('auth_token');
  
  if (!token || socket) return;
  
  socket = io(WS_URL, {
    auth: {
      token: `Bearer ${token}`,
    },
  });
  
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

// Todo API
export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  order?: number;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  order?: number;
}

export const TodoApi = {
  getAll: async (): Promise<Todo[]> => {
    const response = await api.get('/todos');
    return response.data;
  },
  
  getById: async (id: string): Promise<Todo> => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },
  
  create: async (todo: CreateTodoInput): Promise<Todo> => {
    const response = await api.post('/todos', todo);
    return response.data;
  },
  
  update: async (id: string, todo: UpdateTodoInput): Promise<Todo> => {
    const response = await api.patch(`/todos/${id}`, todo);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
  
  reorder: async (todoIds: string[]): Promise<void> => {
    await api.post('/todos/reorder', { todoIds });
  },
};