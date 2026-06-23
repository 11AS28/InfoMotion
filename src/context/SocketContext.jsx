import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// URL-ul backend-ului tău. În dezvoltare e localhost, pe producție va fi URL-ul de la VPS/Render
const SOCKET_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'URL_BACKEND_PRODUCȚIE_AICI'; // Îl lași așa momentan, se rezolvă când pui pe VPS

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Inițializăm conexiunea cu serverul
    const newSocket = io(SOCKET_URL, {
      autoConnect: true, // Se conectează automat când se încarcă aplicația
    });

    newSocket.on('connect', () => {
      console.log('Conectat la serverul de WebSockets! ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Deconectat de la serverul de WebSockets');
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Curățăm conexiunea când componenta se dezinstalează (unmount)
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook personalizat ca să apelăm ușor socket-ul în componente
export const useSocket = () => {
  return useContext(SocketContext);
};