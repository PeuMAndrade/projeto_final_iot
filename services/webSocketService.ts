import { WebSocketMessage } from '../types';

type MessageCallback = (msg: WebSocketMessage) => void;
type StatusCallback = (isConnected: boolean) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessageCallback: MessageCallback | null = null;
  private onStatusChangeCallback: StatusCallback | null = null;
  private reconnectInterval: any = null;

  constructor(defaultUrl: string = 'ws://localhost:8080') {
    this.url = defaultUrl;
  }

  public connect(url?: string) {
    if (url) this.url = url;
    
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('🔌 Guitarra Conectada (WebSocket Open)');
        if (this.reconnectInterval) clearInterval(this.reconnectInterval);
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (e) {
          console.error('Erro ao processar mensagem da guitarra:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('Desconectado. Tentando reconectar...');
        this.ws = null;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
        // Simple reconnect logic
        if (!this.reconnectInterval) {
            this.reconnectInterval = setInterval(() => this.connect(), 5000);
        }
      };

      this.ws.onerror = (err) => {
        console.error('WebSocket Error:', err);
        // Status updates are handled by onclose usually, but safe to ensure false here if needed
      };

    } catch (e) {
      console.error('Falha na conexão:', e);
      if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
    }
  }

  public setOnMessage(callback: MessageCallback) {
    this.onMessageCallback = callback;
  }

  public setOnStatusChange(callback: StatusCallback) {
    this.onStatusChangeCallback = callback;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.reconnectInterval) clearInterval(this.reconnectInterval);
    if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
  }
}

export const wsService = new WebSocketService();