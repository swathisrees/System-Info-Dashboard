import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import os from 'node:os';
import { exec } from 'child_process';
import { promisify } from 'util';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const isDev = process.env.NODE_ENV === 'development';
const devServerURL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
const execAsync = promisify(exec);

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the renderer
  if (isDev && devServerURL) {
    // Development: load from Vite dev server
    mainWindow.loadURL(devServerURL);
  } else {
    // Production: load the built HTML from dist/renderer
    mainWindow.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// System metrics handlers
ipcMain.handle('get-system-info', async () => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    uptime: os.uptime(),
    hostname: os.hostname(),
    userInfo: os.userInfo(),
    type: os.type(),
    release: os.release(),
    loadavg: os.loadavg(),
    networkInterfaces: os.networkInterfaces(),
  };
});

ipcMain.handle('get-cpu-usage', async () => {
  const cpus = os.cpus();
  const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalTick = cpus.reduce((acc, cpu) => 
    acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq, 0);
  
  return {
    usage: ((totalTick - totalIdle) / totalTick) * 100,
    cores: cpus.length,
    loadAvg: os.loadavg(),
  };
});

ipcMain.handle('get-memory-usage', async () => {
  const totalmem = os.totalmem();
  const freemem = os.freemem();
  const usedmem = totalmem - freemem;
  
  return {
    total: totalmem,
    free: freemem,
    used: usedmem,
    usage: (usedmem / totalmem) * 100,
  };
});

ipcMain.handle('get-system-stats', async () => {
  const cpus = os.cpus();
  const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalTick = cpus.reduce((acc, cpu) => 
    acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq, 0);
  
  const totalmem = os.totalmem();
  const freemem = os.freemem();
  const usedmem = totalmem - freemem;
  
  return {
    cpu: {
      usage: ((totalTick - totalIdle) / totalTick) * 100,
      cores: cpus.length,
      loadAvg: os.loadavg(),
    },
    memory: {
      total: totalmem,
      free: freemem,
      used: usedmem,
      usage: (usedmem / totalmem) * 100,
    },
    system: {
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname(),
    }
  };
});

// New detailed system info handlers
ipcMain.handle('get-detailed-system-info', async () => {
  const cpus = os.cpus();
  const networkInterfaces = os.networkInterfaces();
  
  // Get CPU details
  const cpuDetails = cpus.map((cpu, index) => ({
    id: index,
    model: cpu.model,
    speed: cpu.speed,
    times: {
      user: cpu.times.user,
      nice: cpu.times.nice,
      sys: cpu.times.sys,
      idle: cpu.times.idle,
      irq: cpu.times.irq,
    }
  }));

  // Get network interface details
  const networkDetails = Object.entries(networkInterfaces || {}).map(([name, interfaces]) => ({
    name,
    interfaces: interfaces?.map(iface => ({
      address: iface.address,
      netmask: iface.netmask,
      family: iface.family,
      mac: iface.mac,
      internal: iface.internal,
      cidr: iface.cidr,
    })) || []
  }));

  return {
    platform: {
      platform: os.platform(),
      arch: os.arch(),
      type: os.type(),
      release: os.release(),
      version: os.version(),
      machine: os.machine(),
      hostname: os.hostname(),
      homedir: os.homedir(),
      tmpdir: os.tmpdir(),
    },
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0,
      details: cpuDetails,
    },
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    },
    system: {
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      userInfo: os.userInfo(),
    },
    network: networkDetails,
  };
});

// Get running processes
ipcMain.handle('get-processes', async () => {
  try {
    let command: string;
    let parseFunction: (output: string) => any[];

    if (process.platform === 'win32') {
      command = 'tasklist /FO CSV /NH';
      parseFunction = (output: string) => {
        return output.split('\n')
          .filter(line => line.trim() && !line.includes('"Image Name"'))
          .map(line => {
            const parts = line.split('","').map(part => part.replace(/"/g, ''));
            return {
              name: parts[0] || '',
              pid: parseInt(parts[1]) || 0,
              memory: parts[4] || '0 K',
              cpu: 'N/A',
            };
          })
          .filter(process => process.pid > 0)
          .slice(0, 50); // Limit to top 50 processes
      };
    } else {
      command = 'ps aux --no-headers';
      parseFunction = (output: string) => {
        return output.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const parts = line.trim().split(/\s+/);
            return {
              name: parts[10] || parts[0] || '',
              pid: parseInt(parts[1]) || 0,
              cpu: parseFloat(parts[2]) || 0,
              memory: parseFloat(parts[3]) || 0,
              vsz: parseInt(parts[4]) || 0,
              rss: parseInt(parts[5]) || 0,
              tty: parts[6] || '',
              stat: parts[7] || '',
              start: parts[8] || '',
              time: parts[9] || '',
            };
          })
          .filter(process => process.pid > 0)
          .sort((a, b) => b.cpu - a.cpu)
          .slice(0, 50); // Limit to top 50 processes
      };
    }

    const { stdout } = await execAsync(command);
    return parseFunction(stdout);
  } catch (error) {
    console.error('Error getting processes:', error);
    return [];
  }
});

// Get disk usage
ipcMain.handle('get-disk-usage', async () => {
  try {
    let command: string;
    let parseFunction: (output: string) => any[];

    if (process.platform === 'win32') {
      command = 'wmic logicaldisk get size,freespace,caption';
      parseFunction = (output: string) => {
        return output.split('\n')
          .filter(line => line.trim() && !line.includes('Caption'))
          .map(line => {
            const parts = line.trim().split(/\s+/);
            const caption = parts[0];
            const freeSpace = parseInt(parts[1]) || 0;
            const size = parseInt(parts[2]) || 0;
            const usedSpace = size - freeSpace;
            
            return {
              filesystem: caption,
              size: size,
              used: usedSpace,
              available: freeSpace,
              usePercent: size > 0 ? ((usedSpace / size) * 100) : 0,
              mounted: caption,
            };
          });
      };
    } else {
      command = 'df -h';
      parseFunction = (output: string) => {
        return output.split('\n')
          .filter(line => line.trim() && !line.includes('Filesystem'))
          .map(line => {
            const parts = line.trim().split(/\s+/);
            return {
              filesystem: parts[0] || '',
              size: parts[1] || '',
              used: parts[2] || '',
              available: parts[3] || '',
              usePercent: parseInt(parts[4]?.replace('%', '')) || 0,
              mounted: parts[5] || '',
            };
          });
      };
    }

    const { stdout } = await execAsync(command);
    return parseFunction(stdout);
  } catch (error) {
    console.error('Error getting disk usage:', error);
    return [];
  }
});

// Get system uptime and boot time
ipcMain.handle('get-system-uptime', async () => {
  try {
    const uptime = os.uptime();
    const bootTime = Date.now() - (uptime * 1000);
    
    return {
      uptime,
      bootTime: new Date(bootTime).toISOString(),
      formattedUptime: formatUptime(uptime),
    };
  } catch (error) {
    console.error('Error getting system uptime:', error);
    return { uptime: 0, bootTime: '', formattedUptime: 'Unknown' };
  }
});

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
