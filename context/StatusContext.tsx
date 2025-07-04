import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo
} from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface StatusContextType {
  cartCount: number;
  unpaidCount: number;
  refreshStatus: () => Promise<void>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const refreshStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/users/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCartCount(response.data.cartCount);
      setUnpaidCount(response.data.unpaidCount);
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  }, [isAuthenticated, apiUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshStatus();
    } else {
      setCartCount(0);
      setUnpaidCount(0);
    }
  }, [isAuthenticated, refreshStatus]);

  const contextValue = useMemo(() => ({
    cartCount,
    unpaidCount,
    refreshStatus
  }), [cartCount, unpaidCount, refreshStatus]);

  return (
    <StatusContext.Provider value={contextValue}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};