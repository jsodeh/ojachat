import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export function useAdminOperations() {
  const { adminUser } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserRole = async (userId: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role });
      
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (subscriptionId: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('id', subscriptionId);
      
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = async (timeframe: 'day' | 'week' | 'month' | 'year') => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .rpc('get_admin_analytics', { timeframe });
      
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (settings: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ 
          id: 1, // Assuming single settings record
          ...settings,
          updated_by: adminUser?.id 
        });
      
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateUserRole,
    updateSubscription,
    updateOrderStatus,
    getAnalytics,
    updateSettings,
  };
} 