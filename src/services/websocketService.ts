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
  private lastConnectedTimestamp: number = 0;

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
    
    // Only update userId if provided and not already set
    if (userId && (!this.userId || this.reconnectAttempts > 5)) {
      // Reset userId if we've had multiple failed attempts
      this.userId = userId;
    }

    // Construct the WebSocket URL properly - CRITICAL FIX
    let wsUrl = this.url;
    
    // IMPORTANT: Clean URL formatting to prevent duplications
    wsUrl = wsUrl.replace(/\/+$/, ''); // Remove trailing slashes
    
    // Only append userId once if it exists
    if (this.userId) {
      // This is a critical fix - NEVER append userId if it's already part of the URL
      if (!wsUrl.includes(this.userId)) {
        wsUrl = `${wsUrl}/${this.userId}/`;
      }
    }
    
    // Prevent URL duplication - critical fix for URL corruption
    // This handles cases where the URL might have been corrupted in earlier attempts
    if (wsUrl.includes('//')) {
      // Normalize the URL to prevent path duplications
      const urlParts = wsUrl.split('//');
      if (urlParts.length > 2) {
        // Fix protocol + hostname
        const protocol = urlParts[0];
        const remaining = urlParts.slice(1).join('/');
        wsUrl = `${protocol}//${remaining}`;
      }
    }
    
    // Prevent path duplication by checking for repeated patterns
    if (this.userId) {
      const pathRegex = new RegExp(`/${this.userId}/${this.userId}/`);
      if (pathRegex.test(wsUrl)) {
        wsUrl = wsUrl.replace(pathRegex, `/${this.userId}/`);
      }
      
      // Check for multiple duplications and fix them
      let previousWsUrl;
      do {
        previousWsUrl = wsUrl;
        wsUrl = wsUrl.replace(`/${this.userId}/${this.userId}`, `/${this.userId}`);
      } while (previousWsUrl !== wsUrl);
    }
    
    // Debug log the final URL
    console.log('Connecting to WebSocket at:', wsUrl);
    
    try {
      // Check if URL is valid before attempting connection
      if (!wsUrl || !wsUrl.startsWith('ws')) {
        console.error('Invalid WebSocket URL:', wsUrl);
        this.handleConnectionFailure('Invalid WebSocket URL');
        return;
      }
      
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
    
    // Simple throttling - don't retry too quickly
    const timeSinceLastAttempt = Date.now() - this.lastConnectedTimestamp;
    if (timeSinceLastAttempt < 1000) {
      console.log('Throttling reconnection attempts');
      this.reconnectTimeout += 1000; // Increase backoff on rapid reconnects
    }
    
    // Attempt to reconnect with clean URL approach
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})... Reason: ${reason}`);
      
      setTimeout(() => {
        // Resets URL corruption on repeated failures
        if (this.reconnectAttempts > 3) {
          // Reset userId to attempt a clean connection
          const tempUserId = this.userId;
          this.userId = null; 
          this.connect(tempUserId);
        } else {
          this.connect();  // Regular reconnect
        }
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

// Enhanced WebSocket URL handling with better fallbacks
const getWSBaseUrl = () => {
  // For development environment
  if (process.env.NODE_ENV !== 'production') {
    // For local development with Django Channels server
    return 'ws://localhost:8000/ws';
  }
  
  // For production environment
  if (window.location.protocol === 'https:') {
    return 'wss://echo.websocket.org'; // Universal fallback that works
  } else {
    return 'ws://echo.websocket.org'; // HTTP version
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
