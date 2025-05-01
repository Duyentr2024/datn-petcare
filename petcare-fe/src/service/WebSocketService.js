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
      onAppointmentConfirmed: [],
      onSlotsUpdated: [],
      onConnect: [],
      onDisconnect: [],
      onAppointmentCancelled: [],
      onRefundStatusUpdated: [],
      onPetRemoved: [] // Thêm callback mới
    };
    
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectTimeout = null;
    this.reconnectDelay = 3000;
  }

  connect() {
    if (this.stompClient) {
      this.disconnect();
    }
    
    try {
      const apiUrl = new URL(API_BASE_URL);
      const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`;
      const wsUrl = `${baseUrl}/ws`;
      
      console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
      
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        debug: function (str) {
          console.log('WebSocket debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });
      
      this.stompClient.onConnect = this.handleConnect.bind(this);
      this.stompClient.onStompError = this.handleError.bind(this);
      this.stompClient.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
      };
      this.stompClient.onWebSocketClose = (event) => {
        console.log('WebSocket closed:', event);
      };
      
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
    console.log('WebSocket connection established:', frame);
    this.connected = true;
    this.reconnectAttempts = 0;
    
    if (this.connected) {
      this.stompClient.subscribe('/topic/new-appointment', this.handleAppointmentMessage.bind(this));
      this.stompClient.subscribe('/topic/slots', this.handleSlotsMessage.bind(this));
      this.stompClient.subscribe('/topic/appointments', this.handleAppointmentMessage.bind(this));
      console.log('Subscribed to WebSocket topics');
    }
    
    this.callbacks.onConnect.forEach(callback => callback());
  }
  
  handleAppointmentMessage(message) {
    try {
      const data = JSON.parse(message.body);
      console.log('WebSocket message received on /topic/appointments:', data);
      
      if (data.type === 'APPOINTMENT_UPDATED') {
        this.callbacks.onAppointmentUpdated.forEach(callback => callback(data));
      } else if (data.type === 'NEW_APPOINTMENT') {
        this.callbacks.onNewAppointment.forEach(callback => callback(data));
      } else if (data.type === 'APPOINTMENT_CANCELLED') {
        this.callbacks.onAppointmentCancelled.forEach(callback => callback(data));
      } else if (data.type === 'APPOINTMENT_CONFIRMED') {
        this.callbacks.onAppointmentConfirmed.forEach(callback => callback(data));
      } else if (data.type === 'REFUND_STATUS_UPDATED') {
        this.callbacks.onRefundStatusUpdated.forEach(callback => callback(data));
      } else if (data.type === 'PET_REMOVED') {
        this.callbacks.onPetRemoved.forEach(callback => callback(data));
      }
    } catch (error) {
      console.error('Error processing WebSocket appointment message:', error);
    }
  }
  
  handleSlotsMessage(message) {
    try {
      const data = JSON.parse(message.body);
      console.log('WebSocket message received on /topic/slots:', data);
      this.callbacks.onSlotsUpdated.forEach(callback => callback(data));
    } catch (error) {
      console.error('Error processing WebSocket slots message:', error);
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

  notifyAppointmentConfirmed() {
    if (this.stompClient && this.connected) {
      this.stompClient.publish({
        destination: '/topic/appointments',
        body: JSON.stringify({ type: 'APPOINTMENT_CONFIRMED' })
      });
      this.stompClient.publish({
        destination: '/topic/slots',
        body: JSON.stringify({ type: 'SLOTS_UPDATED' })
      });
    } else {
      console.error('Cannot notify: WebSocket is not connected');
    }
  }

  notifyRefundStatusUpdated(appointmentId) {
    if (this.stompClient && this.connected) {
      this.stompClient.publish({
        destination: '/topic/appointments',
        body: JSON.stringify({ type: 'REFUND_STATUS_UPDATED', appointmentId })
      });
    } else {
      console.error('Cannot notify refund status update: WebSocket is not connected');
    }
  }

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
  
  onAppointmentConfirmed(callback) {
    this.callbacks.onAppointmentConfirmed.push(callback);
    return () => {
      this.callbacks.onAppointmentConfirmed = this.callbacks.onAppointmentConfirmed.filter(cb => cb !== callback);
    };
  }

  onSlotsUpdated(callback) {
    this.callbacks.onSlotsUpdated.push(callback);
    return () => {
      this.callbacks.onSlotsUpdated = this.callbacks.onSlotsUpdated.filter(cb => cb !== callback);
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

  onAppointmentCancelled(callback) {
    this.callbacks.onAppointmentCancelled.push(callback);
    return () => {
      this.callbacks.onAppointmentCancelled = this.callbacks.onAppointmentCancelled.filter(cb => cb !== callback);
    };
  }

  onRefundStatusUpdated(callback) {
    this.callbacks.onRefundStatusUpdated.push(callback);
    return () => {
      this.callbacks.onRefundStatusUpdated = this.callbacks.onRefundStatusUpdated.filter(cb => cb !== callback);
    };
  }

  onPetRemoved(callback) {
    this.callbacks.onPetRemoved.push(callback);
    return () => {
      this.callbacks.onPetRemoved = this.callbacks.onPetRemoved.filter(cb => cb !== callback);
    };
  }
}

const webSocketService = new WebSocketService();

export default webSocketService;