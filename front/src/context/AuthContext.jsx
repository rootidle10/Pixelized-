import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : { user: null, token: null };
  });

  const user = auth?.user || null;
  const token = auth?.token || null;

  const login = ({ user, token }) => {
    const payload = { user, token };
    setAuth(payload);
    localStorage.setItem("auth", JSON.stringify(payload));
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("auth");
  };

  // Helper robuste: Authorization + credentials + Content-Type uniquement si body
  const authFetch = useMemo(() => {
    return async (url, options = {}) => {
      const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
      };

      const hasBody = options.body !== undefined && options.body !== null;

      // Ne force pas Content-Type si pas de body (évite certains effets de bord)
      if (hasBody && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      if (token) headers.Authorization = `Bearer ${token}`;

      return fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
