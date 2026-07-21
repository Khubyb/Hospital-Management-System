import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load current user details on application startup
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AUTH CONTEXT ERROR] Failed to load user:', error.message);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Login User
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
        setIsAuthenticated(true);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register Patient
   */
  const signupPatient = async (patientData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup/patient', patientData);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Patient registration failed.',
        errors: error.response?.data?.errors || null
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register Doctor
   */
  const signupDoctor = async (doctorData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup/doctor', doctorData);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Doctor registration failed.',
        errors: error.response?.data?.errors || null
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify Email
   */
  const verifyEmail = async (token) => {
    try {
      const res = await api.post('/auth/verify-email', { token });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed.'
      };
    }
  };

  /**
   * Resend Verification link
   */
  const resendVerification = async (email) => {
    try {
      const res = await api.post('/auth/resend-verification', { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend verification link.'
      };
    }
  };

  /**
   * Forgot Password request
   */
  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset link.'
      };
    }
  };

  /**
   * Reset Password with token
   */
  const resetPassword = async (token, password) => {
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password.'
      };
    }
  };

  /**
   * Logout User
   */
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[AUTH CONTEXT ERROR] Logout call failed:', error.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated,
        login,
        signupPatient,
        signupDoctor,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
