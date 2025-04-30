
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

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 3000;
        this.statusHandlers.forEach(handler => handler('connected'));
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(data));
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.statusHandlers.forEach(handler => handler('error'));
      };

      this.socket.onclose = () => {
        console.log('WebSocket closed');
        this.statusHandlers.forEach(handler => handler('disconnected'));
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.connect();
          }, this.reconnectTimeout);
          // Exponential backoff
          this.reconnectTimeout *= 2;
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
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

// Create an instance for driver notifications
export const driverNotificationsSocket = new WebSocketService('ws://localhost:8000/ws/driver/notifications/');

// Hook for using the WebSocket in components
export const useWebSocket = (
  wsInstance: WebSocketService,
  onMessage?: MessageHandler,
  onStatus?: StatusHandler
) => {
  React.useEffect(() => {
    if (onMessage) {
      wsInstance.addMessageHandler(onMessage);
    }
    
    if (onStatus) {
      wsInstance.addStatusHandler(onStatus);
    }
    
    wsInstance.connect();
    
    return () => {
      if (onMessage) {
        wsInstance.removeMessageHandler(onMessage);
      }
      
      if (onStatus) {
        wsInstance.removeStatusHandler(onStatus);
      }
    };
  }, [wsInstance, onMessage, onStatus]);

  return {
    sendMessage: (message: any) => wsInstance.sendMessage(message),
    connect: () => wsInstance.connect(),
    disconnect: () => wsInstance.disconnect()
  };
};
