
import React from 'react';

type MessageHandler = (message: any) => void;
type StatusHandler = (status: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 3000; // Start with 3 seconds
  private url: string;
  private userId: string | null = null;
  private isConnecting: boolean = false;

  constructor(baseUrl: string) {
    this.url = baseUrl;
  }

  connect(userId?: string) {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;
    
    this.isConnecting = true;
    
    // If userId is provided, store it and use it in the URL
    if (userId) {
      this.userId = userId;
      // Append userId to WebSocket URL if provided
      this.url = this.url.replace(/\/+$/, '') + '/' + userId + '/';
    }

    try {
      console.log('Connecting to WebSocket at:', this.url);
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 3000;
        this.statusHandlers.forEach(handler => handler('connected'));
      };

      this.socket.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.statusHandlers.forEach(handler => handler('error'));
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket closed, code:', event.code, 'reason:', event.reason);
        this.isConnecting = false;
        this.statusHandlers.forEach(handler => handler('disconnected'));
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            this.connect();
          }, this.reconnectTimeout);
          // Exponential backoff
          this.reconnectTimeout *= 2;
        } else {
          console.log('Max reconnect attempts reached.');
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  addMessageHandler(handler: MessageHandler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: MessageHandler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  addStatusHandler(handler: StatusHandler) {
    this.statusHandlers.push(handler);
  }

  removeStatusHandler(handler: StatusHandler) {
    this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
  }
}

// Create instances for user and driver notifications
// For development, use the fallback WebSocket server if needed
const WS_BASE_URL = 'ws://localhost:8000/ws';

export const userRideSocket = new WebSocketService(`${WS_BASE_URL}/user/ride-status`);
export const driverNotificationsSocket = new WebSocketService(`${WS_BASE_URL}/driver/notifications`);

// Hook for using WebSocket in components
export const useWebSocket = (
  wsInstance: WebSocketService,
  onMessage?: MessageHandler,
  onStatus?: StatusHandler,
  userId?: string
) => {
  React.useEffect(() => {
    if (onMessage) {
      wsInstance.addMessageHandler(onMessage);
    }
    
    if (onStatus) {
      wsInstance.addStatusHandler(onStatus);
    }
    
    wsInstance.connect(userId);
    
    return () => {
      if (onMessage) {
        wsInstance.removeMessageHandler(onMessage);
      }
      
      if (onStatus) {
        wsInstance.removeStatusHandler(onStatus);
      }
      
      // We don't disconnect here to keep the WebSocket alive
      // between component mounts
    };
  }, [wsInstance, onMessage, onStatus, userId]);

  return {
    sendMessage: (message: any) => wsInstance.sendMessage(message),
    connect: (userId?: string) => wsInstance.connect(userId),
    disconnect: () => wsInstance.disconnect()
  };
};
