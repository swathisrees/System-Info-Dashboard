// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('systemInfo', {
  get: () => ipcRenderer.invoke('get-system-info'),
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
  getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  getDetailedSystemInfo: () => ipcRenderer.invoke('get-detailed-system-info'),
  getProcesses: () => ipcRenderer.invoke('get-processes'),
  getDiskUsage: () => ipcRenderer.invoke('get-disk-usage'),
  getSystemUptime: () => ipcRenderer.invoke('get-system-uptime'),
});
