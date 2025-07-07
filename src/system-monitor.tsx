import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { 
  Cpu, 
  MemoryStick, 
  Monitor, 
  Activity, 
  Clock, 
  HardDrive, 
  Network, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

// Types for system metrics
type CpuUsage = {
  usage: number;
  cores: number;
  loadAvg: number[];
};

type MemoryUsage = {
  total: number;
  free: number;
  used: number;
  usage: number;
};

type SystemStats = {
  cpu: CpuUsage;
  memory: MemoryUsage;
  system: {
    uptime: number;
    platform: string;
    hostname: string;
  };
};

declare global {
  interface Window {
    systemInfo: {
      get: () => Promise<any>;
      getCpuUsage: () => Promise<CpuUsage>;
      getMemoryUsage: () => Promise<MemoryUsage>;
      getSystemStats: () => Promise<SystemStats>;
    };
  }
}

export function SystemMonitor() {
  const [stats, setStats] = React.useState<SystemStats | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.systemInfo.getSystemStats();
      setStats(data);
      setLastUpdate(new Date());
    } catch (e) {
      setError('Failed to fetch system stats');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 2 seconds
  React.useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getCpuStatus = (usage: number) => {
    if (usage < 50) return { color: 'text-emerald-500', bg: 'bg-emerald-500', status: 'Good' };
    if (usage < 80) return { color: 'text-amber-500', bg: 'bg-amber-500', status: 'Moderate' };
    return { color: 'text-red-500', bg: 'bg-red-500', status: 'High' };
  };

  const getMemoryStatus = (usage: number) => {
    if (usage < 60) return { color: 'text-blue-500', bg: 'bg-blue-500', status: 'Good' };
    if (usage < 85) return { color: 'text-amber-500', bg: 'bg-amber-500', status: 'Moderate' };
    return { color: 'text-red-500', bg: 'bg-red-500', status: 'High' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Good': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Moderate': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'High': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Good': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Good</Badge>;
      case 'Moderate': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Moderate</Badge>;
      case 'High': return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">High</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  System Monitor
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Real-time system performance monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <Button 
                onClick={fetchStats} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {stats && (
          <div className="space-y-6">
            {/* Main Metrics Grid */}
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {/* CPU Usage */}
               <Card className="bg-white dark:bg-slate-800 shadow-lg border-0 hover:shadow-xl transition-all duration-300 animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">
                          CPU Usage
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          {stats.cpu.cores} cores
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusIcon(getCpuStatus(stats.cpu.usage).status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                                         <div className="text-center">
                       <div className="text-3xl font-bold text-slate-900 dark:text-white">
                         {stats.cpu.usage.toFixed(1)}%
                       </div>
                       <div className="mt-2">
                         {getStatusBadge(getCpuStatus(stats.cpu.usage).status)}
                       </div>
                     </div>
                    <Progress 
                      value={stats.cpu.usage} 
                      className="h-2"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Load: {stats.cpu.loadAvg.map(n => n.toFixed(2)).join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>

                             {/* Memory Usage */}
               <Card className="bg-white dark:bg-slate-800 shadow-lg border-0 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <MemoryStick className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white">
                          Memory
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          RAM usage
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusIcon(getMemoryStatus(stats.memory.usage).status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                                         <div className="text-center">
                       <div className="text-3xl font-bold text-slate-900 dark:text-white">
                         {stats.memory.usage.toFixed(1)}%
                       </div>
                       <div className="mt-2">
                         {getStatusBadge(getMemoryStatus(stats.memory.usage).status)}
                       </div>
                     </div>
                    <Progress 
                      value={stats.memory.usage} 
                      className="h-2"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(stats.memory.used)} / {formatBytes(stats.memory.total)}
                    </div>
                  </div>
                </CardContent>
              </Card>

                             {/* System Uptime */}
               <Card className="bg-white dark:bg-slate-800 shadow-lg border-0 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900 dark:text-white">
                        Uptime
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        System running time
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {formatUptime(stats.system.uptime)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Since last boot
                    </div>
                  </div>
                </CardContent>
              </Card>

                             {/* Platform Info */}
               <Card className="bg-white dark:bg-slate-800 shadow-lg border-0 hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <HardDrive className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900 dark:text-white">
                        Platform
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        {stats.system.hostname}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-slate-900 dark:text-white capitalize">
                      {stats.system.platform}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Operating System
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

                         {/* Detailed Metrics */}
             <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <Separator className="flex-1" />
                 <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Detailed Metrics</h2>
                 <Separator className="flex-1" />
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CPU Load History */}
              <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white">CPU Load History</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        System load averages over time
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.cpu.loadAvg[0].toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">1 minute</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.cpu.loadAvg[1].toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">5 minutes</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.cpu.loadAvg[2].toFixed(2)}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">15 minutes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Memory Breakdown */}
              <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white">Memory Breakdown</CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Detailed memory allocation
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">Used Memory</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {formatBytes(stats.memory.used)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${stats.memory.usage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">Free Memory</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {formatBytes(stats.memory.free)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-emerald-500 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${100 - stats.memory.usage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Total Memory</span>
                        <span className="text-slate-900 dark:text-white font-semibold">
                          {formatBytes(stats.memory.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        )}

        {!stats && !loading && (
          <Card className="bg-white dark:bg-slate-800 shadow-lg border-0">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Monitor className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No system stats available.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 