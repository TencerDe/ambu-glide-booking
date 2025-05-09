
// Simple WebSocket service that focuses on reliability
type MessageHandler = (message: any) => void;
type StatusHandler = (status: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 2000;
  private isConnecting: boolean = false;
  private connectionTimer: ReturnType<typeof setTimeout> | null = null;
  private baseUrl: string;
  private userId: string | null = null;
  private path: string;

  constructor(path: string) {
    this.baseUrl = this.getBaseUrl();
    this.path = path.replace(/^\/+|\/+$/g, ''); // Normalize path
  }

  private getBaseUrl(): string {
    // For development environment
    if (process.env.NODE_ENV !== 'production') {
      return 'ws://localhost:8000';
    }
    
    // For production environment
    return window.location.protocol === 'https:' 
      ? 'wss://echo.websocket.org' 
      : 'ws://echo.websocket.org';
  }

  connect(userId?: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }
    
    this.isConnecting = true;
    
    // Clear any existing connection timer
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
    }
    
    // Update userId if provided
    if (userId) {
      this.userId = userId;
    }

    // Build a clean URL without duplicate slashes
    let url = `${this.baseUrl}/${this.path}`;
    if (this.userId) {
      url += `/${this.userId}`;
    }
    url = url.replace(/([^:]\/)\/+/g, '$1'); // Clean up any duplicate slashes
    
    try {
      console.log('Connecting to WebSocket:', url);
      this.socket = new WebSocket(url);

      // Set a timeout for connection
      this.connectionTimer = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timed out');
          this.socket.close();
          this.handleDisconnect();
        }
      }, 5000);

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.statusHandlers.forEach(handler => handler('connected'));
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onerror = () => {
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
        }
        this.statusHandlers.forEach(handler => handler('error'));
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
        }
        this.statusHandlers.forEach(handler => handler('disconnected'));
        this.handleDisconnect();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleDisconnect();
    }
  }

  private handleDisconnect() {
    this.isConnecting = false;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => this.connect(), this.reconnectTimeout);
      // Exponential backoff
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 1.5, 10000);
    } else {
      console.log('Max reconnect attempts reached. Using polling fallback.');
    }
  }

  disconnect() {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  sendMessage(message: any): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
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

// Create WebSocket instances with appropriate paths
export const userRideSocket = new WebSocketService('ws/user/ride-status');
export const driverNotificationsSocket = new WebSocketService('ws/driver/notifications');

// Hook for using WebSocket in React components - much simpler now
export const useWebSocket = (
  wsInstance: WebSocketService,
  onMessage?: MessageHandler,
  onStatus?: StatusHandler,
  userId?: string
) => {
  const [isConnected, setIsConnected] = React.useState<boolean>(false);

  React.useEffect(() => {
    const statusHandler = (status: string) => {
      setIsConnected(status === 'connected');
      if (onStatus) onStatus(status);
    };
    
    if (onMessage) wsInstance.addMessageHandler(onMessage);
    wsInstance.addStatusHandler(statusHandler);
    wsInstance.connect(userId);
    
    return () => {
      if (onMessage) wsInstance.removeMessageHandler(onMessage);
      wsInstance.removeStatusHandler(statusHandler);
    };
  }, [wsInstance, onMessage, onStatus, userId]);

  return {
    sendMessage: (message: any) => wsInstance.sendMessage(message),
    connect: (userId?: string) => wsInstance.connect(userId),
    disconnect: () => wsInstance.disconnect(),
    isConnected
  };
};

// Add React import at the top
import React from 'react';
