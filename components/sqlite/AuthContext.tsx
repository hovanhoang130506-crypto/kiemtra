import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { loginUser, registerUser, updateUserProfile, getProductById, type User } from './database';
import { Alert } from 'react-native';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string, fullname: string, email: string) => Promise<void>;
  updateProfile: (fullname: string, email: string, phone: string, address: string, password?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setLoggedInUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = useSQLiteContext();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await loginUser(db, username.trim(), password.trim());
      if (user) {
        setCurrentUser(user);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  };

  const setLoggedInUser = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = async (username: string, password: string, fullname: string, email: string): Promise<void> => {
    setIsLoading(true);
    try {
      await registerUser(db, username.trim(), password.trim(), fullname.trim(), email.trim());
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Lỗi đăng ký:', error);
      throw error;
    }
  };

  const updateProfile = async (
    fullname: string,
    email: string,
    phone: string,
    address: string,
    password?: string
  ): Promise<void> => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await updateUserProfile(db, currentUser.id, fullname.trim(), email.trim(), phone.trim(), address.trim(), password);
      
      // Cập nhật lại state user hiện tại
      setCurrentUser({
        ...currentUser,
        fullname: fullname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Lỗi cập nhật thông tin:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!currentUser) return;
    try {
      const result = await db.getFirstAsync<User>(
        'SELECT id, username, fullname, email, role, phone, address FROM users WHERE id = ?',
        currentUser.id
      );
      if (result) {
        setCurrentUser(result);
      }
    } catch (error) {
      console.error('Lỗi khi tải lại thông tin user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        logout,
        register,
        updateProfile,
        refreshUser,
        setLoggedInUser,
      }}
    >
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
