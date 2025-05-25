import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, MapPin, Globe } from 'lucide-react';

interface UserSession {
  id: string;
  user_id: string;
  user_email: string;
  started_at: string;
  last_active: string;
  ip_address: string;
  user_agent: string;
  location?: {
    country?: string;
    city?: string;
  };
}

interface UserAction {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export default function UserActivity() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [actions, setActions] = useState<UserAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUserActivity = async () => {
    setLoading(true);
    try {
      // Fetch active sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select(`
          *,
          users:user_id (email)
        `)
        .order('last_active', { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;

      // Fetch recent actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('user_actions')
        .select(`
          *,
          users:user_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (actionsError) throw actionsError;

      setSessions(sessionsData || []);
      setActions(actionsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserActivity();
    // Refresh data every minute
    const interval = setInterval(fetchUserActivity, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter(session => 
    session.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.ip_address?.includes(searchQuery)
  );

  const filteredActions = actions.filter(action =>
    action.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Activity</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button onClick={fetchUserActivity} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="actions">Recent Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Currently active user sessions and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No active sessions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.user_email}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            {session.location?.country || 'Unknown'}
                            {session.location?.city && (
                              <span className="text-gray-500">
                                ({session.location.city})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {session.user_agent}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
              <CardDescription>
                Latest user actions and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredActions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No actions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActions.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell>{action.user_email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            action.action.includes('login') ? 'success' :
                            action.action.includes('update') ? 'info' :
                            action.action.includes('delete') ? 'destructive' :
                            'default'
                          }>
                            {action.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(action.details, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 