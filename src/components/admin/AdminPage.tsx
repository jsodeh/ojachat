import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import TransactionManagement from '@/components/admin/TransactionManagement';
import Analytics from '@/components/admin/Analytics';
import Settings from '@/components/admin/Settings';
import { isAdmin as checkIsAdmin } from '@/lib/utils/admin';

// Admin sections
type AdminSection = 
  | 'dashboard' 
  | 'users' 
  | 'subscriptions' 
  | 'orders' 
  | 'transactions' 
  | 'analytics' 
  | 'settings';

const AdminPage = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log('Debug: No user found');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('Debug: Checking admin status for user', user.id);
      
      try {
        // Direct query to check admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin');
          
        setDebugInfo({ roleData, roleError, userId: user.id });
        console.log('Debug: Direct DB query result:', roleData, roleError);
        
        // Check if the user has admin role using the user_roles table
        const adminStatus = await checkIsAdmin();
        console.log('Debug: Admin status result:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Debug output
  console.log('Debug: Current state - loading:', loading, 'isAdmin:', isAdmin);

  const assignCurrentUserAsAdmin = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });
        
      if (error) {
        console.error('Error assigning admin role:', error);
        alert('Failed to assign admin role: ' + error.message);
        return;
      }
      
      // Refresh admin status
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
      
      alert('Admin role successfully assigned!');
    } catch (err) {
      console.error('Error:', err);
      alert('An unexpected error occurred');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    );
  }

  // Render access denied
  if (!isAdmin) {
    console.log('Debug: Access denied rendering');
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="mb-6 text-gray-600">
            You don't have permission to access the admin dashboard.
          </p>
          <div className="flex flex-col gap-4">
            <a
              href="/"
              className="rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
            >
              Return to Home
            </a>
            
            <button
              onClick={assignCurrentUserAsAdmin}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Make Me Admin
            </button>
          </div>
          
          {debugInfo && (
            <div className="mt-8 border-t border-gray-200 pt-4 text-left text-xs">
              <h3 className="font-bold">Debug Information:</h3>
              <pre className="mt-2 bg-gray-100 p-2">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  console.log('Debug: Admin dashboard rendering');
  
  // Render the admin dashboard
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={user} />
        
        <main className="flex-1 overflow-y-auto p-4">
          {/* Render the active section */}
          {activeSection === 'dashboard' && <AdminDashboard />}
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'subscriptions' && <SubscriptionManagement />}
          {activeSection === 'orders' && <OrderManagement />}
          {activeSection === 'transactions' && <TransactionManagement />}
          {activeSection === 'analytics' && <Analytics />}
          {activeSection === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default AdminPage; 