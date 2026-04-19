'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { RoleType } from "@/interface/interface";

interface AuthContextType {
  role: RoleType;
  userId: string;
  isLoaded: boolean;
  setRole: (role: RoleType) => void;
  setUserId: (id: string) => void;
  login: (token: string, type: RoleType, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleType>("guest");
  const [userId, setUserId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 마운트 시 localStorage에서 토큰 및 권한 읽어오기
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') as RoleType;
    const storedUserId = localStorage.getItem('userId');

    if (storedToken && storedRole && storedUserId) {
      setRole(storedRole);
      setUserId(storedUserId);
    }
    setIsLoaded(true);
  }, []);

  const login = (token: string, type: RoleType, userId: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', type);
    localStorage.setItem('userId', userId);
    setRole(type);
    setUserId(userId);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setRole("guest");
    setUserId("");
  };

  return (
    <AuthContext.Provider value={{ role, userId, isLoaded, setRole, setUserId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
