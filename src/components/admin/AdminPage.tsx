import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
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
  const { isAdmin, loading, error } = useAdminAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

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
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="mb-6 text-gray-600">
            You don't have permission to access the admin dashboard.
          </p>
          <a
            href="/"
            className="rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

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