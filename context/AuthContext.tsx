import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  id: number | null;
  role: string | null;
  login: (username: string, role: string, id: number, token: string) => void;
  logout: () => void;
}

interface JwtPayload {
  exp: number;
  id: number;
  username: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);  
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  const login = useCallback((username: string, role: string, id: number, token: string) => {
    setIsAuthenticated(true);
    setUsername(username);
    setRole(role);
    setId(id);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('role', role);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
    setId(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
    }
    
    axios.post(`${apiUrl}/users/logout`).then(() => {
      router.push('/');
    });
  }, [router]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(`${apiUrl}/users/refresh-token`, {}, { 
        withCredentials: true 
      });
      
      const newToken = response.data.token;
      const decoded: JwtPayload = jwtDecode(newToken);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', newToken);
      }
      
      login(decoded.username, decoded.role, decoded.id, newToken);
      return newToken;
    } catch (error) {
      logout();
      return null;
    }
  }, [login, logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          const decoded: JwtPayload = jwtDecode(token);
          
          // Cek token expiry
          if (decoded.exp * 1000 < Date.now()) {
            await refreshToken();
          } else {
            // Verifikasi token
            try {
              const response = await axios.get(`${apiUrl}/users/check-auth`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              if (response.data.isAuthenticated) {
                login(decoded.username, decoded.role, decoded.id, token);
              } else {
                await refreshToken();
              }
            } catch (error) {
              await refreshToken();
            }
          }
        } catch (e) {
          console.error("Token invalid:", e);
          logout();
        }
      }
    };

    initializeAuth();
  }, [login, logout, refreshToken]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      username,
      id, 
      role, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};