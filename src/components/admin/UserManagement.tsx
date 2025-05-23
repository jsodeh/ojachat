import { FC, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Loader2
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  created_at: string;
  last_sign_in_at?: string;
  avatar_url?: string;
}

const UserManagement: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'created_at',
    direction: 'desc',
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First, fetch all users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }

      // Then, fetch associated profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        throw profilesError;
      }

      // Combine the data from both sources, ensuring required fields are present
      const combinedUsers = authUsers.users
        .filter(authUser => authUser.email) // Ensure email exists
        .map(authUser => {
          const profile = profiles?.find(p => p.id === authUser.id);
          return {
            id: authUser.id,
            email: authUser.email!, // Assert non-null since we filtered above
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at,
            full_name: profile?.full_name || authUser.user_metadata?.full_name,
            phone_number: profile?.phone_number,
            avatar_url: profile?.avatar_url,
          };
        });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (column: string) => {
    setSort(prevSort => ({
      column,
      direction: prevSort.column === column && prevSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedUsers = [...users].sort((a, b) => {
    const { column, direction } = sort;
    
    // Handle undefined values
    const aValue = a[column as keyof User] || '';
    const bValue = b[column as keyof User] || '';
    
    // Sort based on direction
    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const filteredUsers = sortedUsers.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.phone_number?.includes(searchQuery)
    );
  });

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete the user
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        throw error;
      }
      
      // Update the UI
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      
      // You might want to show a success message here
    } catch (error) {
      console.error('Error deleting user:', error);
      // You might want to show an error message here
    }
  };

  const SortIndicator = ({ column }: { column: string }) => (
    <>
      {sort.column === column && (
        sort.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </>
  );

  // Placeholder until actual modals are implemented
  const renderDeleteConfirmation = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Delete User</h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          onClick={() => {/* Open modal to add user */}}
        >
          Add User
        </button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Search users by name, email, phone..."
          />
        </div>
        <div>
          <button
            className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('full_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <SortIndicator column="full_name" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('email')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    <SortIndicator column="email" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('phone_number')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Phone</span>
                    <SortIndicator column="phone_number" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('created_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Joined</span>
                    <SortIndicator column="created_at" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('last_sign_in_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Last Active</span>
                    <SortIndicator column="last_sign_in_at" />
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar_url}
                              alt=""
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-500">
                              {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone_number || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString() 
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewModalOpen(true);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination would go here */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{filteredUsers.length}</span> of{' '}
                <span className="font-medium">{users.length}</span> users
              </p>
            </div>
            {/* Pagination controls would go here */}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && renderDeleteConfirmation()}

      {/* View and edit modals would go here */}
    </div>
  );
};

export default UserManagement; 