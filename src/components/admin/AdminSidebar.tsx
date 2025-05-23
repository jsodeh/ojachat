import { FC } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type AdminSection = 
  | 'dashboard' 
  | 'users' 
  | 'subscriptions' 
  | 'orders' 
  | 'transactions' 
  | 'analytics' 
  | 'settings';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const AdminSidebar: FC<AdminSidebarProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const { signOut } = useAuth();

  const navItems = [
    { 
      id: 'dashboard' as AdminSection, 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      id: 'users' as AdminSection, 
      label: 'Users', 
      icon: <Users size={20} /> 
    },
    { 
      id: 'subscriptions' as AdminSection, 
      label: 'Subscriptions', 
      icon: <CreditCard size={20} /> 
    },
    { 
      id: 'orders' as AdminSection, 
      label: 'Orders', 
      icon: <ShoppingCart size={20} /> 
    },
    { 
      id: 'transactions' as AdminSection, 
      label: 'Transactions', 
      icon: <Receipt size={20} /> 
    },
    { 
      id: 'analytics' as AdminSection, 
      label: 'Analytics', 
      icon: <BarChart3 size={20} /> 
    },
    { 
      id: 'settings' as AdminSection, 
      label: 'Settings', 
      icon: <Settings size={20} /> 
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo and branding */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
          <div className="text-lg font-bold text-green-700">O</div>
        </div>
        <div className="text-lg font-bold text-gray-900">OjaChat Admin</div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 py-4">
        <ul className="px-3 space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium",
                  activeSection === item.id
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout button */}
      <div className="border-t border-gray-200 px-3 py-4">
        <button
          onClick={signOut}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut size={20} className="mr-3 text-gray-500" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar; 