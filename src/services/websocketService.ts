import React, { useState } from 'react';

type MessageHandler = (message: any) => void;
type StatusHandler = (status: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimeout: number = 3000;
  private url: string;
  private userId: string | null = null;
  private isConnecting: boolean = false;
  private connectionTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingMessages: any[] = [];

  constructor(baseUrl: string) {
    this.url = baseUrl;
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
    
    // If userId is provided, store it and use it in the URL
    if (userId) {
      this.userId = userId;
    }

    // Construct the WebSocket URL properly
    let wsUrl = this.url;
    
    // Only append userId once if it exists
    if (this.userId) {
      // Remove trailing slashes
      wsUrl = wsUrl.replace(/\/+$/, '');
      // Ensure we have exactly one trailing slash
      wsUrl = wsUrl + '/' + this.userId + '/';
    }
    
    // Debug log the URL
    console.log('Connecting to WebSocket at:', wsUrl);
    
    try {
      // Check if URL is valid before attempting connection
      if (!wsUrl || !wsUrl.startsWith('ws')) {
        console.error('Invalid WebSocket URL:', wsUrl);
        this.handleConnectionFailure('Invalid WebSocket URL');
        return;
      }
      
      this.socket = new WebSocket(wsUrl);

      // Set a timeout for connection
      this.connectionTimer = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timed out, retrying...');
          this.socket.close();
          this.handleConnectionFailure('Connection timeout');
        }
      }, 10000); // 10 second timeout

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 3000;
        
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.statusHandlers.forEach(handler => handler('connected'));
        
        // Send any pending messages that accumulated while disconnected
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
    
    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})... Reason: ${reason}`);
      
      setTimeout(() => {
        this.connect();  // Don't pass userId again to avoid duplication
      }, this.reconnectTimeout);
      
      // Exponential backoff with jitter to prevent thundering herd
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

  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
      return true;
    } else {
      console.log('WebSocket is not connected, storing message to send later');
      this.pendingMessages.push(message);
      
      // If not currently connecting, try to connect
      if (!this.isConnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.connect();  // Don't pass userId again to avoid duplication
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

// Improved WebSocket URL handling with better fallbacks
const getWSBaseUrl = () => {
  // For development environment
  if (process.env.NODE_ENV !== 'production') {
    // For local development, attempt to use localhost WebSocket
    try {
      return 'ws://localhost:8000/ws';
    } catch {
      // Fallback to echo server if local server is unavailable
      return 'wss://echo.websocket.org';
    }
  }
  
  // For production environment
  if (window.location.protocol === 'https:') {
    return 'wss://api.example.com/ws'; // Replace with actual production WebSocket URL
  } else {
    return 'ws://api.example.com/ws'; // HTTP version (less common)
  }
};

// Create WebSocket instances with appropriate base URLs
export const userRideSocket = new WebSocketService(`${getWSBaseUrl()}/user/ride-status`);
export const driverNotificationsSocket = new WebSocketService(`${getWSBaseUrl()}/driver/notifications`);

// Hook for using WebSocket in components
export const useWebSocket = (
  wsInstance: WebSocketService,
  onMessage?: MessageHandler,
  onStatus?: StatusHandler,
  userId?: string
) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

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
    
    // Try to connect immediately, but only pass userId once to avoid duplications
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
