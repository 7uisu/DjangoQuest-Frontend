// src/hooks/useAuth.tsx
import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';

/**
 * Custom hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}