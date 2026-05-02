import React, { createContext, useContext } from "react";

interface WebSocketContextValue {
  notifications: never[];
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  notifications: [],
  connected: false,
});

export function useWebSocket(): WebSocketContextValue {
  return useContext(WebSocketContext);
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketContext.Provider value={{ notifications: [], connected: false }}>
      {children}
    </WebSocketContext.Provider>
  );
}
