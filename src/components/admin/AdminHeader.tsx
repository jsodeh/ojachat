import { FC } from 'react';
import { Bell, Search, User } from 'lucide-react';
import type { User as AuthUser } from '@supabase/supabase-js';

interface AdminHeaderProps {
  user: AuthUser | null;
}

const AdminHeader: FC<AdminHeaderProps> = ({ user }) => {
  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : 'AD';

  const displayName = user?.user_metadata?.full_name 
    || user?.email?.split('@')[0] 
    || 'Admin User';

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full py-2 pl-10 pr-3 text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Search..."
          />
        </div>

        {/* User menu and notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative rounded-full p-1 text-gray-700 hover:bg-gray-100 focus:outline-none">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
              {userInitials}
            </div>
            <span className="text-sm font-medium text-gray-700">{displayName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 