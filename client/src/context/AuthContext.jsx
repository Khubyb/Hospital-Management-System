import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  // On first mount, try to restore the session from the httpOnly cookie.
  // This is what gives us "auto login" across page refreshes.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { user: me } = await authService.getMe();
        setUser(me);
      } catch {
        setUser(null); // no valid session, that's fine - user just sees the login page
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser } = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = { user, loading, login, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for consuming auth state anywhere in the app
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
