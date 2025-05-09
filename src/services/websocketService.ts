// Enhanced WebSocket service with improved reliability
type MessageHandler = (message: any) => void;
type StatusHandler = (status: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10; // Increased from 5 to 10
  private reconnectTimeout: number = 1000; // Start with 1 second
  private isConnecting: boolean = false;
  private connectionTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private baseUrl: string;
  private userId: string | null = null;
  private path: string;

  constructor(path: string) {
    this.baseUrl = this.getBaseUrl();
    this.path = path.replace(/^\/+|\/+$/g, ''); // Normalize path
    
    // Add window event listeners for online/offline
    window.addEventListener('online', () => {
      console.log('Network connection restored - reconnecting WebSocket');
      this.connect();
    });
    
    window.addEventListener('offline', () => {
      console.log('Network connection lost - WebSocket will reconnect when online');
    });
  }

  private getBaseUrl(): string {
    // For development environment
    if (process.env.NODE_ENV !== 'production') {
      return 'ws://localhost:8000';
    }
    
    // For production environment - use the same host as the current page
    return window.location.protocol === 'https:' 
      ? `wss://${window.location.host}` 
      : `ws://${window.location.host}`;
  }

  connect(userId?: string) {
    // Don't attempt to connect if offline
    if (!navigator.onLine) {
      console.log('Currently offline. WebSocket connection will be attempted when online.');
      return;
    }
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }
    
    this.isConnecting = true;
    
    // Clear any existing timers
    this.clearTimers();
    
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
      }, 10000); // 10 seconds timeout

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 1000; // Reset to initial timeout
        
        // Start ping interval to keep connection alive
        this.startPingInterval();
        
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        this.statusHandlers.forEach(handler => handler('connected'));
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
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
        console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        this.isConnecting = false;
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        
        // Stop ping interval
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }
        
        this.statusHandlers.forEach(handler => handler('disconnected'));
        this.handleDisconnect();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.handleDisconnect();
    }
  }
  
  // Start periodic pings to keep connection alive
  private startPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));
      }
    }, 30000); // Send ping every 30 seconds
  }
  
  private clearTimers() {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleDisconnect() {
    this.isConnecting = false;
    
    // Don't try to reconnect if offline
    if (!navigator.onLine) {
      console.log('Network is offline - will reconnect when online');
      return;
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => this.connect(), this.reconnectTimeout);
      // Exponential backoff with max of 30 seconds
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 1.5, 30000);
    } else {
      console.log('Max reconnect attempts reached.');
      this.statusHandlers.forEach(handler => handler('max_attempts_reached'));
    }
  }

  disconnect() {
    this.clearTimers();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  sendMessage(message: any): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(message);
        this.socket.send(messageStr);
        console.log('WebSocket message sent:', message);
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('Attempted to send message while WebSocket is not connected');
      // Try to reconnect if not connected
      if (this.socket?.readyState !== WebSocket.CONNECTING) {
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
  
  // Utility method to force a reconnection
  reconnect() {
    if (this.socket) {
      this.socket.close();
    }
    this.reconnectAttempts = 0;
    this.reconnectTimeout = 1000;
    this.connect();
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
    
    // Add handlers
    if (onMessage) wsInstance.addMessageHandler(onMessage);
    wsInstance.addStatusHandler(statusHandler);
    
    // Try to connect with the user ID
    wsInstance.connect(userId);
    
    // Cleanup on unmount
    return () => {
      if (onMessage) wsInstance.removeMessageHandler(onMessage);
      wsInstance.removeStatusHandler(statusHandler);
    };
  }, [wsInstance, onMessage, onStatus, userId]);

  return {
    sendMessage: (message: any) => wsInstance.sendMessage(message),
    connect: (userId?: string) => wsInstance.connect(userId),
    disconnect: () => wsInstance.disconnect(),
    reconnect: () => wsInstance.reconnect(),
    isConnected
  };
};

// Add React import at the top
import React from 'react';
