import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
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
  Info,
  Server,
  Database,
  Globe,
  Users,
  Terminal
} from 'lucide-react';

// Types for detailed system information
type DetailedSystemInfo = {
  platform: {
  platform: string;
  arch: string;
  type: string;
  release: string;
    version: string;
    machine: string;
    hostname: string;
    homedir: string;
    tmpdir: string;
  };
  cpu: {
    cores: number;
    model: string;
    speed: number;
    details: Array<{
      id: number;
      model: string;
      speed: number;
      times: {
        user: number;
        nice: number;
        sys: number;
        idle: number;
        irq: number;
      };
    }>;
  };
  memory: {
    total: number;
    free: number;
    used: number;
  };
  system: {
    uptime: number;
  loadavg: number[];
    userInfo: {
      username: string;
      uid: number;
      gid: number;
      shell: string;
      homedir: string;
    };
  };
  network: Array<{
    name: string;
    interfaces: Array<{
      address: string;
      netmask: string;
      family: string;
      mac: string;
      internal: boolean;
      cidr: string;
    }>;
  }>;
};

type Process = {
  name: string;
  pid: number;
  cpu: number | string;
  memory: number | string;
  vsz?: number;
  rss?: number;
  tty?: string;
  stat?: string;
  start?: string;
  time?: string;
};

type DiskUsage = {
  filesystem: string;
  size: string | number;
  used: string | number;
  available: string | number;
  usePercent: number;
  mounted: string;
};

declare global {
  interface Window {
    systemInfo: {
      get: () => Promise<any>;
      getCpuUsage: () => Promise<any>;
      getMemoryUsage: () => Promise<any>;
      getSystemStats: () => Promise<any>;
      getDetailedSystemInfo: () => Promise<DetailedSystemInfo>;
      getProcesses: () => Promise<Process[]>;
      getDiskUsage: () => Promise<DiskUsage[]>;
      getSystemUptime: () => Promise<any>;
    };
  }
}

export function SystemInfoDashboard() {
  const [detailedInfo, setDetailedInfo] = React.useState<DetailedSystemInfo | null>(null);
  const [processes, setProcesses] = React.useState<Process[]>([]);
  const [diskUsage, setDiskUsage] = React.useState<DiskUsage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [detailed, procs, disk] = await Promise.all([
        window.systemInfo.getDetailedSystemInfo(),
        window.systemInfo.getProcesses(),
        window.systemInfo.getDiskUsage(),
      ]);
      
      setDetailedInfo(detailed);
      setProcesses(procs);
      setDiskUsage(disk);
      setLastUpdate(new Date());
    } catch (e) {
      setError('Failed to fetch system information');
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds
  React.useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
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

  const getDiskStatus = (usage: number) => {
    if (usage < 70) return { color: 'text-emerald-500', bg: 'bg-emerald-500', status: 'Good' };
    if (usage < 90) return { color: 'text-amber-500', bg: 'bg-amber-500', status: 'Warning' };
    return { color: 'text-red-500', bg: 'bg-red-500', status: 'Critical' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Good': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Good</Badge>;
      case 'Warning': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Warning</Badge>;
      case 'Critical': return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Critical</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-100 to-indigo-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/30 dark:bg-slate-800/40 rounded-xl shadow-xl backdrop-blur-md border border-white/30 dark:border-slate-700/60">
                <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white drop-shadow-md">
                  System Information Dashboard
                </h1>
                <p className="text-slate-700 dark:text-slate-200">
                  Comprehensive system monitoring and process management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <div className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <Button 
                onClick={fetchAllData} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-white/30 dark:bg-slate-800/40 border-white/30 dark:border-slate-700/60 backdrop-blur-md hover:bg-white/50 dark:hover:bg-slate-700/60 transition text-slate-900 dark:text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50/70 dark:bg-red-950/40 dark:border-red-800 backdrop-blur-md shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {detailedInfo && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/30 dark:border-slate-700/60 shadow-md mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-200/60 dark:data-[state=active]:bg-blue-900/40 data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-200 transition-all text-slate-900 dark:text-white">
                <Monitor className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="processes" className="flex items-center gap-2 data-[state=active]:bg-purple-200/60 dark:data-[state=active]:bg-purple-900/40 data-[state=active]:text-purple-900 dark:data-[state=active]:text-purple-200 transition-all text-slate-900 dark:text-white">
                <Terminal className="w-4 h-4" />
                Processes
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center gap-2 data-[state=active]:bg-green-200/60 dark:data-[state=active]:bg-green-900/40 data-[state=active]:text-green-900 dark:data-[state=active]:text-green-200 transition-all text-slate-900 dark:text-white">
                <HardDrive className="w-4 h-4" />
                Storage
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2 data-[state=active]:bg-cyan-200/60 dark:data-[state=active]:bg-cyan-900/40 data-[state=active]:text-cyan-900 dark:data-[state=active]:text-cyan-200 transition-all text-slate-900 dark:text-white">
                <Network className="w-4 h-4" />
                Network
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2 data-[state=active]:bg-orange-200/60 dark:data-[state=active]:bg-orange-900/40 data-[state=active]:text-orange-900 dark:data-[state=active]:text-orange-200 transition-all text-slate-900 dark:text-white">
                <Server className="w-4 h-4" />
                System
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CPU Info */}
                <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white drop-shadow-sm">CPU</CardTitle>
                        <CardDescription className="text-slate-700 dark:text-slate-200">
                          {detailedInfo.cpu.cores} cores
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Model:</div>
                        <div className="truncate text-slate-900 dark:text-white">{detailedInfo.cpu.model}</div>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Speed:</div>
                        <div className="text-slate-900 dark:text-white">{detailedInfo.cpu.speed} MHz</div>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Load Average:</div>
                        <div className="text-slate-900 dark:text-white">{detailedInfo.system.loadavg.map(n => n.toFixed(2)).join(', ')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Memory Info */}
                <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <MemoryStick className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white drop-shadow-sm">Memory</CardTitle>
                        <CardDescription className="text-slate-700 dark:text-slate-200">
                          RAM usage
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Total:</div>
                        <div className="text-slate-900 dark:text-white">{formatBytes(detailedInfo.memory.total)}</div>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Used:</div>
                        <div className="text-slate-900 dark:text-white">{formatBytes(detailedInfo.memory.used)}</div>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Free:</div>
                        <div className="text-slate-900 dark:text-white">{formatBytes(detailedInfo.memory.free)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Info */}
                <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Server className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white drop-shadow-sm">System</CardTitle>
                        <CardDescription className="text-slate-700 dark:text-slate-200">
                          Platform info
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Platform:</div>
                        <div className="capitalize text-slate-900 dark:text-white">{detailedInfo.platform.platform}</div>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Architecture:</div>
                        <div className="text-slate-900 dark:text-white">{detailedInfo.platform.arch}</div>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Hostname:</div>
                        <div className="text-slate-900 dark:text-white">{detailedInfo.platform.hostname}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Info */}
                <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-white drop-shadow-sm">User</CardTitle>
                        <CardDescription className="text-slate-700 dark:text-slate-200">
                          Current user
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Username:</div>
                        <div className="text-slate-900 dark:text-white">{detailedInfo.system.userInfo.username}</div>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">UID:</div>
                        <div className="text-slate-900 dark:text-white">{detailedInfo.system.userInfo.uid}</div>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        <div className="font-medium">Home:</div>
                        <div className="truncate text-slate-900 dark:text-white">{detailedInfo.system.userInfo.homedir}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Processes Tab */}
            <TabsContent value="processes" className="space-y-6">
              <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white drop-shadow-sm">Running Processes</CardTitle>
                      <CardDescription className="text-slate-700 dark:text-slate-200">
                        Top 50 processes by CPU usage
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-white/30 dark:border-slate-700/60 bg-white/20 dark:bg-slate-800/30 backdrop-blur-md overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow> 
                          <TableHead className="text-slate-900 dark:text-white">Process</TableHead>
                          <TableHead className="text-slate-900 dark:text-white">PID</TableHead>
                          <TableHead className="text-slate-900 dark:text-white">CPU %</TableHead>
                          <TableHead className="text-slate-900 dark:text-white">Memory</TableHead>
                          <TableHead className="text-slate-900 dark:text-white">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processes.map((process, index) => (
                          <TableRow key={`${process.pid}-${index}`}> 
                            <TableCell className="font-medium max-w-[200px] truncate text-slate-900 dark:text-white">
                              {process.name}
                            </TableCell>
                            <TableCell className="text-slate-900 dark:text-white">{process.pid}</TableCell>
                            <TableCell className="text-slate-900 dark:text-white">
                              {typeof process.cpu === 'number' ? `${process.cpu.toFixed(1)}%` : process.cpu}
                            </TableCell>
                            <TableCell className="text-slate-900 dark:text-white">
                              {typeof process.memory === 'number' ? `${process.memory.toFixed(1)}%` : process.memory}
                            </TableCell>
                            <TableCell>
                              {process.stat && (
                                <Badge variant="outline" className="text-xs text-slate-700 dark:text-slate-200">
                                  {process.stat}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Storage Tab */}
            <TabsContent value="storage" className="space-y-6">
              <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <HardDrive className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white drop-shadow-sm">Disk Usage</CardTitle>
                      <CardDescription className="text-slate-700 dark:text-slate-200">
                        Storage information and usage
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {diskUsage.map((disk, index) => (
                      <div key={index} className="p-4 border border-white/30 dark:border-slate-700/60 rounded-lg bg-white/20 dark:bg-slate-800/30 backdrop-blur-md shadow-md">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white drop-shadow-sm">
                              {disk.filesystem}
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-200">
                              Mounted on: {disk.mounted}
                            </p>
                          </div>
                          {getStatusBadge(getDiskStatus(disk.usePercent).status)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-200">Usage</span>
                            <span className="text-slate-900 dark:text-white font-medium">
                              {disk.usePercent.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={disk.usePercent} className="h-2" />
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-700 dark:text-slate-200">Size:</span>
                              <div className="font-medium text-slate-900 dark:text-white">{disk.size}</div>
                            </div>
                            <div>
                              <span className="text-slate-700 dark:text-slate-200">Used:</span>
                              <div className="font-medium text-slate-900 dark:text-white">{disk.used}</div>
                            </div>
                            <div>
                              <span className="text-slate-700 dark:text-slate-200">Available:</span>
                              <div className="font-medium text-slate-900 dark:text-white">{disk.available}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network" className="space-y-6">
              <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white drop-shadow-sm">Network Interfaces</CardTitle>
                      <CardDescription className="text-slate-700 dark:text-slate-200">
                        Network configuration and addresses
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detailedInfo.network.map((interface_, index) => (
                      <div key={index} className="p-4 border border-white/30 dark:border-slate-700/60 rounded-lg bg-white/20 dark:bg-slate-800/30 backdrop-blur-md shadow-md">
                        <h4 className="font-medium text-slate-900 dark:text-white drop-shadow-sm mb-3">
                          {interface_.name}
                        </h4>
                        <div className="space-y-2">
                          {interface_.interfaces.map((iface, ifaceIndex) => (
                            <div key={ifaceIndex} className="text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-700 dark:text-slate-200">Address:</span>
                                <span className="font-mono text-slate-900 dark:text-white">{iface.address}</span>
                                {iface.internal && (
                                  <Badge variant="outline" className="text-xs text-slate-700 dark:text-slate-200">Internal</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-700 dark:text-slate-200">Family:</span>
                                <span className="text-slate-900 dark:text-white">{iface.family}</span>
                              </div>
                              {iface.mac && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-700 dark:text-slate-200">MAC:</span>
                                  <span className="font-mono text-slate-900 dark:text-white">{iface.mac}</span>
                                </div>
                              )}
                              {iface.netmask && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-700 dark:text-slate-200">Netmask:</span>
                                  <span className="font-mono text-slate-900 dark:text-white">{iface.netmask}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Details */}
                <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Server className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-slate-900 dark:text-white drop-shadow-sm">System Details</CardTitle>
                        <CardDescription className="text-slate-700 dark:text-slate-200">
                          Platform and version information
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Platform:</span>
                        <span className="font-medium capitalize text-slate-900 dark:text-white">{detailedInfo.platform.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Architecture:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{detailedInfo.platform.arch}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Type:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{detailedInfo.platform.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Release:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{detailedInfo.platform.release}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Version:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{detailedInfo.platform.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Machine:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{detailedInfo.platform.machine}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Hostname:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{detailedInfo.platform.hostname}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CPU Details */}
                <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-slate-900 dark:text-white drop-shadow-sm">CPU Details</CardTitle>
                        <CardDescription className="text-slate-700 dark:text-slate-200">
                          Processor information
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Cores:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{detailedInfo.cpu.cores}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Model:</span>
                        <span className="font-medium truncate max-w-[200px] text-slate-900 dark:text-white">{detailedInfo.cpu.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-200">Speed:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{detailedInfo.cpu.speed} MHz</span>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="font-medium text-slate-900 dark:text-white">Load Average:</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                            <div className="font-medium text-slate-900 dark:text-white">{detailedInfo.system.loadavg[0].toFixed(2)}</div>
                            <div className="text-slate-700 dark:text-slate-200">1 min</div>
                          </div>
                          <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                            <div className="font-medium text-slate-900 dark:text-white">{detailedInfo.system.loadavg[1].toFixed(2)}</div>
                            <div className="text-slate-700 dark:text-slate-200">5 min</div>
                          </div>
                          <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                            <div className="font-medium text-slate-900 dark:text-white">{detailedInfo.system.loadavg[2].toFixed(2)}</div>
                            <div className="text-slate-700 dark:text-slate-200">15 min</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!detailedInfo && !loading && (
          <Card className="bg-white/30 dark:bg-slate-800/40 shadow-xl border border-white/30 dark:border-slate-700/60 backdrop-blur-md">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Server className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 dark:text-slate-200">No system information available.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 