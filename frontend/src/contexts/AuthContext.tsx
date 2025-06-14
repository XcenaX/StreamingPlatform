import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useHost } from "./HostContext";

type AuthContextType = {
  userId: number | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  token: string,
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { host, protocol } = useHost();
  const baseUrl = `${protocol}://${host}:8000`;

  const [token, setToken] = useState<string>(localStorage.getItem("token") || "");
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка токена
  useEffect(() => {
    if (!token) {
      setUserId(null);
      setIsLoadingAuth(false);
      return;
    }

    fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUserId(data.id);
        setIsAuthenticated(true);
      })
      .catch((err) => {
        console.log(err);
        setUserId(null);
        setIsAuthenticated(false);
        localStorage.removeItem("vlad_token");
      })
      .finally(() => setIsLoadingAuth(false));
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error("Неверный логин или пароль");

    const data = await res.json();
    localStorage.setItem("vlad_token", data.access_token);
    setToken(data.access_token);
    setIsAuthenticated(true);
  };

  const register = async (username: string, email: string, password: string) => {
    await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  };

  const logout = () => {
    localStorage.removeItem("vlad_token");
    setToken("");
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ userId, isAuthenticated, isLoadingAuth, token, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
