import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppSystemContextValue {
  isLoggedIn: boolean;
  token: string;
  userId: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  logout: () => void;
}

// Create the app system context
const AppSystemContext = createContext<AppSystemContextValue | undefined>(undefined);

// Custom hook
export const useSystemContext = () => {
  const context = useContext(AppSystemContext);
  if (!context) {
    throw new Error('useSystemContext must be used within an AppSystemProvider');
  }
  return context;
};

// Provider component
export const AppSystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');

  const logout = () => {
    setIsLoggedIn(false);
    setToken('');
    setUserId('');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
    }

    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const appSystemContextValue: AppSystemContextValue = {
    isLoggedIn,
    token,
    userId,
    setToken,
    logout,
  };

  return (
    <AppSystemContext.Provider value={appSystemContextValue}>
      {children}
    </AppSystemContext.Provider>
  );
};
