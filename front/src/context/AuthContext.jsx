import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    const logoutback = async (data) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        Authorisation:{'bearertoken' : user.bearertoken},
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        login(result.user);
        setMessage("Connexion réussie !");
      } else {
        setMessage(result.message || "Identifiants incorrects.");
      }

    } catch (error) {
      console.error("Erreur:", error);
      setMessage("Erreur lors de la connexion.");
    }
  };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
