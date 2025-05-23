import { useState, useEffect } from 'react';
import { isAdmin } from '@/lib/utils/admin';
import { useUser } from '@/hooks/useUser';

export function useAdmin() {
  const { user, loading: userLoading } = useUser();
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user || userLoading) {
        setIsLoading(false);
        setIsAdminUser(false);
        return;
      }

      setIsLoading(true);
      try {
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError(err instanceof Error ? err : new Error('Failed to check admin status'));
        setIsAdminUser(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, userLoading]);

  return {
    isAdmin: isAdminUser,
    isLoading,
    error
  };
} 