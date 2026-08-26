import React, { createContext, useContext, useEffect, useState } from "react";

import { anonymousLogin, getMe, googleLogin, User } from "../api/auth";

import { getToken, removeToken, saveToken } from "../utils/storage";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function login() {
    try {
      const result = await anonymousLogin();

      await saveToken(result.token);

      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      console.error("Anonymous login failed:", error);
      throw error;
    }
  }

  async function logout() {
    await removeToken();

    setToken(null);
    setUser(null);
  }

  async function loginWithGoogle(idToken: string) {
    const result = await googleLogin(idToken);
    await saveToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }

  useEffect(() => {
    async function initialize() {
      try {
        const existingToken = await getToken();

        if (!existingToken) return;

        const result = await getMe(existingToken);

        setToken(existingToken);
        setUser(result.user);
      } catch (error) {
        console.log("Existing session invalid.");

        await removeToken();

      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
