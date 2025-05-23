import { FC, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Edit, 
  Trash2,
  Check,
  X,
  Loader2,
  BadgeCheck
} from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  created_at: string;
  
  // Joined data
  user_email?: string;
  user_name?: string;
  plan_name?: string;
  plan_price?: number;
}

// Type for the data returned from Supabase
interface SubscriptionData {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  created_at: string;
  user: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  } | null;
  plan: {
    name: string;
    price: number;
  } | null;
}

const SubscriptionManagement: FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'created_at',
    direction: 'desc',
  });
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // Query subscriptions with user and plan information
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          plan_id,
          status,
          start_date,
          end_date,
          auto_renew,
          created_at,
          user:user_id(email, user_metadata),
          plan:plan_id(name, price)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Format the subscription data for display
        const formattedSubscriptions = data.map(subscription => {
          // Create a properly typed subscription object
          return {
            id: subscription.id,
            user_id: subscription.user_id,
            plan_id: subscription.plan_id,
            status: subscription.status,
            start_date: subscription.start_date,
            end_date: subscription.end_date,
            auto_renew: subscription.auto_renew,
            created_at: subscription.created_at,
            
            // Extract joined data - handle the types safely
            user_email: subscription.user && Array.isArray(subscription.user) && subscription.user[0]?.email,
            user_name: subscription.user && Array.isArray(subscription.user) && subscription.user[0]?.user_metadata?.full_name,
            plan_name: subscription.plan && Array.isArray(subscription.plan) && subscription.plan[0]?.name,
            plan_price: subscription.plan && Array.isArray(subscription.plan) && subscription.plan[0]?.price,
          } as Subscription;
        });

        setSubscriptions(formattedSubscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
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

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const { column, direction } = sort;
    
    // Handle undefined values
    const aValue = a[column as keyof Subscription] || '';
    const bValue = b[column as keyof Subscription] || '';
    
    // Sort based on direction
    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const filteredSubscriptions = sortedSubscriptions.filter(subscription => {
    const searchLower = searchQuery.toLowerCase();
    return (
      subscription.user_email?.toLowerCase().includes(searchLower) ||
      subscription.user_name?.toLowerCase().includes(searchLower) ||
      subscription.plan_name?.toLowerCase().includes(searchLower) ||
      subscription.status.toLowerCase().includes(searchLower)
    );
  });

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      // Cancel the subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'canceled',
          auto_renew: false,
          end_date: new Date().toISOString()
        })
        .eq('id', subscriptionId);
      
      if (error) {
        throw error;
      }
      
      // Update the UI
      setSubscriptions(prevSubscriptions => 
        prevSubscriptions.map(subscription => 
          subscription.id === subscriptionId 
            ? { 
                ...subscription, 
                status: 'canceled',
                auto_renew: false,
                end_date: new Date().toISOString()
              } 
            : subscription
        )
      );
      
      setIsCancelModalOpen(false);
      setSelectedSubscription(null);
      
      // You might want to show a success message here
    } catch (error) {
      console.error('Error canceling subscription:', error);
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
  const renderCancelConfirmation = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Cancel Subscription</h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to cancel this subscription? The user will lose access immediately.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsCancelModalOpen(false)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            No, Keep It
          </button>
          <button
            onClick={() => selectedSubscription && handleCancelSubscription(selectedSubscription.id)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <button
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          onClick={() => {/* Open modal to add subscription */}}
        >
          Add Subscription
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
            placeholder="Search by user, plan, status..."
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

      {/* Subscriptions table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('user_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>User</span>
                    <SortIndicator column="user_name" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('plan_name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Plan</span>
                    <SortIndicator column="plan_name" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <SortIndicator column="status" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('start_date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Start Date</span>
                    <SortIndicator column="start_date" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('end_date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>End Date</span>
                    <SortIndicator column="end_date" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSortChange('auto_renew')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Auto-Renew</span>
                    <SortIndicator column="auto_renew" />
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
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading subscriptions...
                    </div>
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No subscriptions found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.user_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.user_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.plan_name}
                        </div>
                        {subscription.plan_price !== undefined && subscription.plan_price > 0 && (
                          <BadgeCheck className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {subscription.plan_price !== undefined && subscription.plan_price > 0 && (
                        <div className="text-sm text-gray-500">
                          ₦{subscription.plan_price.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          subscription.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : subscription.status === 'canceled'
                            ? 'bg-red-100 text-red-800'
                            : subscription.status === 'trial'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.end_date 
                        ? new Date(subscription.end_date).toLocaleDateString() 
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.auto_renew 
                        ? <Check className="h-5 w-5 text-green-500" /> 
                        : <X className="h-5 w-5 text-red-500" />
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            // View subscription details
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            // Edit subscription
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              setIsCancelModalOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
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
                <span className="font-medium">{filteredSubscriptions.length}</span> of{' '}
                <span className="font-medium">{subscriptions.length}</span> subscriptions
              </p>
            </div>
            {/* Pagination controls would go here */}
          </div>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {isCancelModalOpen && renderCancelConfirmation()}
    </div>
  );
};

export default SubscriptionManagement; 