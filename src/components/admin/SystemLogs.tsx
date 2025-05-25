import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, FileText, RefreshCw } from 'lucide-react';

interface SystemLog {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  source: string;
  message: string;
  stack_trace?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

interface LogStats {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsBySource: Record<string, number>;
  errorRate: number;
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [filters, setFilters] = useState({
    level: '',
    source: '',
    search: '',
    date_range: '24h'
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.search) {
        query = query.or(`message.ilike.%${filters.search}%,stack_trace.ilike.%${filters.search}%`);
      }
      if (filters.date_range) {
        const date = new Date();
        switch (filters.date_range) {
          case '1h':
            date.setHours(date.getHours() - 1);
            break;
          case '24h':
            date.setHours(date.getHours() - 24);
            break;
          case '7d':
            date.setDate(date.getDate() - 7);
            break;
          case '30d':
            date.setDate(date.getDate() - 30);
            break;
        }
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;
      setLogs(data || []);
      calculateStats(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system logs');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logs: SystemLog[]) => {
    const stats: LogStats = {
      totalLogs: logs.length,
      logsByLevel: {},
      logsBySource: {},
      errorRate: 0
    };

    logs.forEach(log => {
      // Count logs by level
      stats.logsByLevel[log.level] = (stats.logsByLevel[log.level] || 0) + 1;
      
      // Count logs by source
      stats.logsBySource[log.source] = (stats.logsBySource[log.source] || 0) + 1;
    });

    // Calculate error rate
    const errorCount = stats.logsByLevel['error'] || 0;
    stats.errorRate = (errorCount / stats.totalLogs) * 100;

    setStats(stats);
  };

  const exportToCSV = () => {
    const headers = ['Time', 'Level', 'Source', 'Message', 'Stack Trace', 'Metadata'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.level,
        log.source,
        log.message,
        log.stack_trace || '',
        JSON.stringify(log.metadata || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `system-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  useEffect(() => {
    fetchLogs();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Logs</h2>
        <div className="flex items-center gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchLogs} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalLogs}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.errorRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Log Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.logsByLevel).map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center">
                    <Badge variant={
                      level === 'error' ? 'destructive' :
                      level === 'warning' ? 'secondary' :
                      'default'
                    }>
                      {level}
                    </Badge>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.logsBySource)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center">
                      <span className="truncate">{source}</span>
                      <span>{count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search logs..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={filters.level}
          onValueChange={(value) => handleFilterChange('level', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Log Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.source}
          onValueChange={(value) => handleFilterChange('source', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sources</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.date_range}
          onValueChange={(value) => handleFilterChange('date_range', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>
            Recent system logs and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        log.level === 'error' ? 'destructive' :
                        log.level === 'warning' ? 'secondary' :
                        'default'
                      }>
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.source}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.message}
                    </TableCell>
                    <TableCell>
                      {(log.stack_trace || log.metadata) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const details = {
                              ...(log.stack_trace && { stackTrace: log.stack_trace }),
                              ...(log.metadata && { metadata: log.metadata })
                            };
                            alert(JSON.stringify(details, null, 2));
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 