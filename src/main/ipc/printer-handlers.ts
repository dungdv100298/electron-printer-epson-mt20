import { ipcMain } from 'electron';
import { PrinterDiscovery } from '../printer/printer-discovery';
import { PrinterConnection } from '../printer/printer-connection';
import { PrinterService } from '../printer/printer-service';
import { PrinterInfo, PrintOptions, PrintData, SalesReceiptData } from '../../shared/types/printer.types';

// Initialize printer services
const printerDiscovery = new PrinterDiscovery();
const printerConnection = new PrinterConnection();
const printerService = new PrinterService();

export const setupPrinterHandlers = () => {
  console.log('Setting up printer IPC handlers...');

  // Printer Discovery
  ipcMain.handle('start-printer-discovery', async () => {
    try {
      console.log('Starting printer discovery...');
      await printerDiscovery.startDiscovery();
      const printers = printerDiscovery.getDiscoveredPrinters();
      console.log('Discovery completed. Found printers:', printers);
      return printers;
    } catch (error) {
      console.error('Discovery failed:', error);
      throw error;
    }
  });

  ipcMain.handle('stop-printer-discovery', async () => {
    try {
      console.log('Stopping printer discovery...');
      await printerDiscovery.stopDiscovery();
    } catch (error) {
      console.error('Stop discovery failed:', error);
      throw error;
    }
  });

  ipcMain.handle('get-discovered-printers', async () => {
    try {
      const printers = printerDiscovery.getDiscoveredPrinters();
      return printers;
    } catch (error) {
      console.error('Get discovered printers failed:', error);
      throw error;
    }
  });

  // Printer Connection
  ipcMain.handle('connect-printer', async (event, printerInfo: PrinterInfo) => {
    try {
      console.log('Connecting to printer:', printerInfo);
      const success = await printerConnection.connect(printerInfo);
      if (success) {
        console.log('Printer connected successfully');
      }
      return success;
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  });

  ipcMain.handle('disconnect-printer', async () => {
    try {
      console.log('Disconnecting printer...');
      await printerConnection.disconnect();
      console.log('Printer disconnected successfully');
    } catch (error) {
      console.error('Disconnection failed:', error);
      throw error;
    }
  });

  ipcMain.handle('is-printer-connected', async () => {
    try {
      const isConnected = printerConnection.isConnected();
      return isConnected;
    } catch (error) {
      console.error('Connection status check failed:', error);
      return false;
    }
  });

  // Printer Service
  ipcMain.handle('print-text', async (event, text: string, options?: PrintOptions) => {
    try {
      console.log('Printing text:', text);
      const success = await printerService.printText(text, options);
      return success;
    } catch (error) {
      console.error('Print text failed:', error);
      throw error;
    }
  });

  ipcMain.handle('print-image', async (event, imagePath: string, options?: PrintOptions) => {
    try {
      console.log('Printing image:', imagePath);
      const success = await printerService.printImage(imagePath, options);
      return success;
    } catch (error) {
      console.error('Print image failed:', error);
      throw error;
    }
  });

  ipcMain.handle('print-mixed', async (event, data: PrintData) => {
    try {
      console.log('Printing mixed content:', data);
      const success = await printerService.printMixed(data);
      return success;
    } catch (error) {
      console.error('Print mixed content failed:', error);
      throw error;
    }
  });

  ipcMain.handle('print-sales-receipt', async (event, receiptData: SalesReceiptData) => {
    try {
      console.log('Printing sales receipt:', receiptData);
      const success = await printerService.printSalesReceipt(receiptData);
      return success;
    } catch (error) {
      console.error('Print sales receipt failed:', error);
      throw error;
    }
  });

  // Utility handlers
  ipcMain.handle('get-app-version', async () => {
    try {
      const { app } = require('electron');
      return app.getVersion();
    } catch (error) {
      console.error('Get app version failed:', error);
      return '1.0.0';
    }
  });

  // Test printer connection
  ipcMain.handle('test-printer', async () => {
    try {
      console.log('Testing printer connection...');
      const success = await printerService.testPrinter();
      return success;
    } catch (error) {
      console.error('Printer test failed:', error);
      return false;
    }
  });

  // Get printer status
  ipcMain.handle('get-printer-status', async () => {
    try {
      const status = await printerService.getPrinterStatus();
      return status;
    } catch (error) {
      console.error('Get printer status failed:', error);
      return 'Error';
    }
  });

  console.log('Printer IPC handlers setup completed');
};
