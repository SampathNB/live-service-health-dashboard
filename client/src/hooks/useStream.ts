import { useEffect, useRef, useState, useCallback } from 'react';
import { StreamEvent } from '@shared/types';

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/stream`;

export function useStream(onEvent: (event: StreamEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>(0);
  const retryCountRef = useRef(0);
  
  // Keep the latest handler in a ref to avoid reconnecting when it changes
  const handlerRef = useRef(onEvent);
  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Pulse Stream Connected');
      setIsConnected(true);
      setError(null);
      retryCountRef.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        handlerRef.current(data);
      } catch (err) {
        console.error('Failed to parse socket message', err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
      retryCountRef.current++;
      
      console.log(`Pulse Stream Disconnected. Retrying in ${delay}ms...`);
      
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    };

    socket.onerror = (err) => {
      setError('WebSocket connection error');
      console.error('Pulse Stream Error', err);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  return { isConnected, error };
}
