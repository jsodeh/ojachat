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
import { RefreshCw, Server, Database, Cpu, HardDrive } from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  database: {
    connections: number;
    queries: number;
    latency: number;
  };
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  created_at: string;
  resolved_at?: string;
}

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemHealth = async () => {
    setLoading(true);
    try {
      // Fetch system metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_system_metrics');

      if (metricsError) throw metricsError;

      // Fetch system alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      setMetrics(metricsData);
      setAlerts(alertsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'destructive';
    if (value >= thresholds.warning) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Health</h2>
        <Button onClick={fetchSystemHealth} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading system health data...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <>
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Usage</span>
                    <Badge variant={getStatusColor(metrics?.cpu.usage || 0, { warning: 70, critical: 90 })}>
                      {metrics?.cpu.usage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cores</span>
                    <span>{metrics?.cpu.cores}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Memory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Usage</span>
                    <Badge variant={getStatusColor(
                      ((metrics?.memory.used || 0) / (metrics?.memory.total || 1)) * 100,
                      { warning: 80, critical: 90 }
                    )}>
                      {((metrics?.memory.used || 0) / (metrics?.memory.total || 1) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Free</span>
                    <span>{(metrics?.memory.free || 0).toFixed(1)} GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Disk Space
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Usage</span>
                    <Badge variant={getStatusColor(
                      ((metrics?.disk.used || 0) / (metrics?.disk.total || 1)) * 100,
                      { warning: 80, critical: 90 }
                    )}>
                      {((metrics?.disk.used || 0) / (metrics?.disk.total || 1) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Free</span>
                    <span>{(metrics?.disk.free || 0).toFixed(1)} GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Connections</span>
                    <Badge variant={getStatusColor(metrics?.database.connections || 0, { warning: 80, critical: 100 })}>
                      {metrics?.database.connections}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Latency</span>
                    <Badge variant={getStatusColor(metrics?.database.latency || 0, { warning: 100, critical: 200 })}>
                      {metrics?.database.latency}ms
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Recent system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No alerts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          {format(new Date(alert.created_at), 'MMM d, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            alert.type === 'error' ? 'destructive' :
                            alert.type === 'warning' ? 'secondary' :
                            'default'
                          }>
                            {alert.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>
                          {alert.resolved_at ? (
                            <Badge variant="default">Resolved</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 