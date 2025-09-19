import { contextBridge, ipcRenderer } from 'electron';
import { PrinterInfo, PrintOptions, PrintData, SalesReceiptData } from '../shared/types/printer.types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Printer Discovery
  startPrinterDiscovery: (): Promise<PrinterInfo[]> => 
    ipcRenderer.invoke('start-printer-discovery'),
  
  stopPrinterDiscovery: (): Promise<void> => 
    ipcRenderer.invoke('stop-printer-discovery'),
  
  getDiscoveredPrinters: (): Promise<PrinterInfo[]> => 
    ipcRenderer.invoke('get-discovered-printers'),

  // Printer Connection
  connectPrinter: (printerInfo: PrinterInfo): Promise<boolean> => 
    ipcRenderer.invoke('connect-printer', printerInfo),
  
  disconnectPrinter: (): Promise<void> => 
    ipcRenderer.invoke('disconnect-printer'),
  
  isPrinterConnected: (): Promise<boolean> => 
    ipcRenderer.invoke('is-printer-connected'),

  // Printer Service
  printText: (text: string, options?: PrintOptions): Promise<boolean> => 
    ipcRenderer.invoke('print-text', text, options),
  
  printImage: (imagePath: string, options?: PrintOptions): Promise<boolean> => 
    ipcRenderer.invoke('print-image', imagePath, options),
  
  printSalesReceipt: (receiptData: SalesReceiptData): Promise<boolean> => 
    ipcRenderer.invoke('print-sales-receipt', receiptData),

  // Utility
  getAppVersion: (): Promise<string> => 
    ipcRenderer.invoke('get-app-version')
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      startPrinterDiscovery: () => Promise<PrinterInfo[]>;
      stopPrinterDiscovery: () => Promise<void>;
      getDiscoveredPrinters: () => Promise<PrinterInfo[]>;
      connectPrinter: (printerInfo: PrinterInfo) => Promise<boolean>;
      disconnectPrinter: () => Promise<void>;
      isPrinterConnected: () => Promise<boolean>;
      printText: (text: string, options?: PrintOptions) => Promise<boolean>;
      printImage: (imagePath: string, options?: PrintOptions) => Promise<boolean>;
      printSalesReceipt: (receiptData: SalesReceiptData) => Promise<boolean>;
      getAppVersion: () => Promise<string>;
    };
  }
}
