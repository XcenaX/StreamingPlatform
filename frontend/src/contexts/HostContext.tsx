import React, { createContext, useContext } from "react";

type HostContextType = {
  host: string;
  protocol: "http" | "https";
  socketProtocol: "ws" | "wss";
};

const HostContext = createContext<HostContextType | null>(null);

export const HostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = window.location;
  const protocol = location.protocol.replace(":", "") as "http" | "https";
  const socketProtocol = protocol === "https" ? "wss" : "ws";
  const host = location.hostname;

  return (
    <HostContext.Provider value={{ host, protocol, socketProtocol }}>
      {children}
    </HostContext.Provider>
  );
};

export const useHost = () => useContext(HostContext)!;
