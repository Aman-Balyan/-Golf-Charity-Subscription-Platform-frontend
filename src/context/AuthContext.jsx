import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Logging in:', email);
      const { data } = await api.post('/auth/login', { email, password });
      
      console.log('📝 Login response:', data);
      console.log('🔑 Token received:', data.token);
      
      if (!data.token) {
        console.error('❌ No token received!');
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (fullName, email, password) => {
    try {
      console.log('📝 Registering:', email);
      console.log('📤 Request data:', { fullName, email, password });
      
      const { data } = await api.post('/auth/register', { 
        fullName, 
        email, 
        password 
      });
      
      console.log('📥 Register response:', data);
      console.log('🔑 Token received:', data.token);
      console.log('👤 User received:', data);
      
      // ✅ Check if token exists
      if (!data.token) {
        console.error('❌ No token received from server!');
        console.error('Response data:', data);
        throw new Error('No token received from server');
      }
      
      // ✅ Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      // ✅ Verify token was stored
      const storedToken = localStorage.getItem('token');
      console.log('✅ Token stored successfully:', storedToken);
      console.log('✅ User stored:', data);
      
      setUser(data);
      return data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('✅ Logged out');
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isAuth = () => !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAdmin, 
      isAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};