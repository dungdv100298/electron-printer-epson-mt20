import { PrinterInfo } from '../../shared/types/printer.types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class PrinterConnection {
  private currentPrinter: PrinterInfo | null = null;
  private isConnected: boolean = false;

  constructor() {
    // No native dependencies needed
  }

  async connect(printerInfo: PrinterInfo): Promise<boolean> {
    console.log('Attempting to connect to printer:', printerInfo);
    
    try {
      // Check if printer exists and is available
      const { stdout } = await execAsync(`wmic printer where "name='${printerInfo.name}'" get name,portname /format:csv`);
      
      if (stdout.includes(printerInfo.name)) {
        this.currentPrinter = printerInfo;
        this.isConnected = true;
        console.log('Successfully connected to printer');
        return true;
      } else {
        console.error('Printer not found or not available');
        return false;
      }
    } catch (error) {
      console.error('Connection error:', error);
      // For PDF printer, always allow connection
      if (printerInfo.name.includes('PDF') || printerInfo.address.includes('PDF')) {
        this.currentPrinter = printerInfo;
        this.isConnected = true;
        console.log('Connected to PDF printer');
        return true;
      }
      return false;
    }
  }

  isConnected(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        this.isConnected = false;
        this.currentPrinter = null;
        console.log('Disconnected from printer');
      } catch (error) {
        console.error('Error disconnecting:', error);
        throw error;
      }
    }
  }

  getCurrentPrinter(): PrinterInfo | null {
    return this.currentPrinter;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      // Simulate test command
      console.log('Testing printer connection...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Send data to printer
  async sendData(data: Buffer): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Printer not connected');
    }

    // Simulate sending data
    console.log('Sending data to printer:', data.length, 'bytes');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
