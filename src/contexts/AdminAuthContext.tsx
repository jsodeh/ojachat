import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface AdminUser {
  id: string;
  email?: string;
  role: string;
  permissions: Record<string, boolean>;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  error: string | null;
  checkAdminAccess: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminUser(null);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, permissions')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error) {
        console.error('Admin access check error:', error);
        setError(error.message);
        setIsAdmin(false);
        setAdminUser(null);
        return false;
      }

      if (!data) {
        setIsAdmin(false);
        setAdminUser(null);
        return false;
      }

      setIsAdmin(true);
      setAdminUser({
        id: user.id,
        email: user.email,
        role: data.role,
        permissions: data.permissions || {}
      });
      return true;
    } catch (err) {
      console.error('Admin access check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify admin access');
      setIsAdmin(false);
      setAdminUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAdmin = async () => {
      setLoading(true);
      setError(null);
      await checkAdminAccess();
      setLoading(false);
    };

    initializeAdmin();
  }, [user]);

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        adminUser,
        loading,
        error,
        checkAdminAccess,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
} 