import { API_BASE_URL } from './config';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.callbacks = {
      onNewAppointment: [],
      onAppointmentUpdated: [],
      onConnect: [],
      onDisconnect: []
    };
    
    // Reconnection settings
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.reconnectDelay = 2000; // Start with 2 seconds
  }

  connect() {
    if (this.stompClient) {
      this.disconnect();
    }
    
    try {
      // Extract the host from API URL
      const apiUrl = new URL(API_BASE_URL);
      const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`;
      const wsUrl = `${baseUrl}/ws`; // Endpoint /ws (không phải /api/ws)
      
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      // Sử dụng Client từ stompjs thay vì Stomp.over
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        debug: function (str) {
          // console.log(str); // Đã tắt debug logs
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });
      
      this.stompClient.onConnect = this.handleConnect.bind(this);
      this.stompClient.onStompError = this.handleError.bind(this);
      
      // Bắt đầu kết nối
      this.stompClient.activate();
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      this.attemptReconnect();
    }
  }
  
  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.connected = false;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  handleConnect(frame) {
    console.log('WebSocket connection established');
    this.connected = true;
    this.reconnectAttempts = 0;
    
    // Subscribe to topic channels
    this.stompClient.subscribe('/topic/appointments', this.handleAppointmentMessage.bind(this));
    
    this.callbacks.onConnect.forEach(callback => callback());
  }
  
  handleAppointmentMessage(message) {
    try {
      const data = JSON.parse(message.body);
      console.log('WebSocket message received:', data);
      
      if (data.type === 'NEW_APPOINTMENT') {
        this.callbacks.onNewAppointment.forEach(callback => callback(data.appointment));
      } else if (data.type === 'APPOINTMENT_UPDATED') {
        this.callbacks.onAppointmentUpdated.forEach(callback => callback(data.appointment));
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }
  
  handleError(error) {
    console.error('WebSocket error:', error);
    this.connected = false;
    this.callbacks.onDisconnect.forEach(callback => callback(error));
    this.attemptReconnect();
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnection attempts reached, giving up');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Reconnecting now (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }
  
  // Event subscription methods
  onNewAppointment(callback) {
    this.callbacks.onNewAppointment.push(callback);
    return () => {
      this.callbacks.onNewAppointment = this.callbacks.onNewAppointment.filter(cb => cb !== callback);
    };
  }
  
  onAppointmentUpdated(callback) {
    this.callbacks.onAppointmentUpdated.push(callback);
    return () => {
      this.callbacks.onAppointmentUpdated = this.callbacks.onAppointmentUpdated.filter(cb => cb !== callback);
    };
  }
  
  onConnect(callback) {
    this.callbacks.onConnect.push(callback);
    return () => {
      this.callbacks.onConnect = this.callbacks.onConnect.filter(cb => cb !== callback);
    };
  }
  
  onDisconnect(callback) {
    this.callbacks.onDisconnect.push(callback);
    return () => {
      this.callbacks.onDisconnect = this.callbacks.onDisconnect.filter(cb => cb !== callback);
    };
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService; 