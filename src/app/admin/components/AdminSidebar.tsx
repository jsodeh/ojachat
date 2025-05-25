import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShoppingCart,
  DollarSign,
  BarChart2,
  Settings,
  FileText,
  Activity,
  Server,
  Database,
  LogOut,
  ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminSection = {
  name: string;
  path: string;
  icon: React.ElementType;
};

const sections: AdminSection[] = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Transactions', path: '/admin/transactions', icon: DollarSign },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
  { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
  { name: 'User Activity', path: '/admin/user-activity', icon: Activity },
  { name: 'System Health', path: '/admin/system-health', icon: Server },
  { name: 'System Backups', path: '/admin/system-backups', icon: Database },
  { name: 'System Logs', path: '/admin/system-logs', icon: ScrollText },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      {/* Logo and Branding */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">OjaChat Admin</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className={cn(
                'flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors',
                location.pathname === section.path
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {section.name}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={signOut}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
} 