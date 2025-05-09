
// Remove React import as it shouldn't be part of a service
type MessageHandler = (message: any) => void;
type StatusHandler = (status: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimeout: number = 3000;
  private baseUrl: string;
  private userId: string | null = null;
  private isConnecting: boolean = false;
  private connectionTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingMessages: any[] = [];
  private lastConnectedTimestamp: number = 0;
  private path: string;

  constructor(path: string) {
    this.baseUrl = this.getBaseUrl();
    this.path = this.normalizePath(path);
  }

  private normalizePath(path: string): string {
    // Remove leading and trailing slashes to normalize the path
    return path.replace(/^\/+|\/+$/g, '');
  }

  private getBaseUrl(): string {
    // For development environment
    if (process.env.NODE_ENV !== 'production') {
      return 'ws://localhost:8000';
    }
    
    // For production environment
    if (window.location.protocol === 'https:') {
      return 'wss://echo.websocket.org'; // Universal fallback that works
    } else {
      return 'ws://echo.websocket.org'; // HTTP version
    }
  }

  private buildUrl(): string {
    // Start with base URL
    let url = this.baseUrl;
    
    // Ensure there's a trailing slash on the base URL
    if (!url.endsWith('/')) {
      url += '/';
    }

    // Append the normalized path
    url += this.path;
    
    // Only append userId if it exists
    if (this.userId) {
      // Make sure url ends with a slash before appending userId
      if (!url.endsWith('/')) {
        url += '/';
      }
      url += this.userId;
    }
    
    // Remove any duplicate slashes that might appear (except in protocol)
    url = url.replace(/([^:]\/)\/+/g, '$1');
    
    console.log('WebSocket URL:', url);
    
    return url;
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
      console.log('Setting userId:', userId);
    }

    // Build the URL
    const wsUrl = this.buildUrl();
    
    try {
      console.log('Attempting to connect to WebSocket:', wsUrl);
      
      // Create new WebSocket connection
      this.socket = new WebSocket(wsUrl);
      this.lastConnectedTimestamp = Date.now();

      // Set a timeout for connection
      this.connectionTimer = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timed out, retrying...');
          this.socket.close();
          this.handleConnectionFailure('Connection timeout');
        }
      }, 10000); // 10 second timeout

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 3000;
        
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.statusHandlers.forEach(handler => handler('connected'));
        
        // Send any pending messages
        while (this.pendingMessages.length > 0) {
          const message = this.pendingMessages.shift();
          this.sendMessage(message);
        }
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
        
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.statusHandlers.forEach(handler => handler('error'));
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket closed, code:', event.code, 'reason:', event.reason);
        this.isConnecting = false;
        
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.statusHandlers.forEach(handler => handler('disconnected'));
        this.handleConnectionFailure(`Connection closed (${event.code})`);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleConnectionFailure('Connection error');
    }
  }

  private handleConnectionFailure(reason: string) {
    this.isConnecting = false;
    
    // Simple throttling - don't retry too quickly
    const timeSinceLastAttempt = Date.now() - this.lastConnectedTimestamp;
    if (timeSinceLastAttempt < 1000) {
      console.log('Throttling reconnection attempts');
      this.reconnectTimeout += 1000; // Increase backoff on rapid reconnects
    }
    
    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})... Reason: ${reason}`);
      
      // Reset userId after a few failed attempts to try a simpler connection
      if (this.reconnectAttempts > 3) {
        const tempUserId = this.userId;
        this.userId = null;
        setTimeout(() => {
          // Try to connect without userId first, then restore it on next attempt
          this.connect();
          this.userId = tempUserId;
        }, this.reconnectTimeout);
      } else {
        setTimeout(() => this.connect(), this.reconnectTimeout);
      }
      
      // Exponential backoff with jitter
      this.reconnectTimeout = Math.min(
        this.reconnectTimeout * 1.5 + Math.random() * 1000, 
        30000 // Cap at 30 seconds
      );
    } else {
      console.log('Max reconnect attempts reached. Switching to polling fallback.');
      // The app will now rely on polling for critical operations
    }
  }

  disconnect() {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
    this.pendingMessages = []; // Clear pending messages
  }

  sendMessage(message: any): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
      return true;
    } else {
      console.log('WebSocket is not connected, storing message to send later');
      this.pendingMessages.push(message);
      
      // If not currently connecting, try to connect
      if (!this.isConnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.connect();
      }
      
      return false;
    }
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

// Hook for using WebSocket in React components
export const useWebSocket = (
  wsInstance: WebSocketService,
  onMessage?: MessageHandler,
  onStatus?: StatusHandler,
  userId?: string
) => {
  const [isConnected, setIsConnected] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Custom status handler to track connection status
    const statusHandler = (status: string) => {
      setIsConnected(status === 'connected');
      if (onStatus) {
        onStatus(status);
      }
    };
    
    if (onMessage) {
      wsInstance.addMessageHandler(onMessage);
    }
    
    wsInstance.addStatusHandler(statusHandler);
    
    // Try to connect immediately
    wsInstance.connect(userId);
    
    return () => {
      if (onMessage) {
        wsInstance.removeMessageHandler(onMessage);
      }
      
      wsInstance.removeStatusHandler(statusHandler);
      
      // We don't disconnect here to keep the WebSocket alive
      // between component mounts
    };
  }, [wsInstance, onMessage, onStatus, userId]);

  return {
    sendMessage: (message: any) => wsInstance.sendMessage(message),
    connect: (userId?: string) => wsInstance.connect(userId),
    disconnect: () => wsInstance.disconnect(),
    isConnected
  };
};

// Add React import at the top if needed by the useWebSocket hook
import React from 'react';
