import { PrinterInfo } from '../../shared/types/printer.types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class PrinterDiscovery {
  private discoveredPrinters: PrinterInfo[] = [];

  constructor() {
    // No native dependencies needed
  }

  async startDiscovery(): Promise<void> {
    console.log('Starting printer discovery...');
    
    try {
      // Get list of installed printers on Windows
      const { stdout } = await execAsync('wmic printer get name,portname /format:csv');
      const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('Node'));
      
      this.discoveredPrinters = lines.map(line => {
        const parts = line.split(',');
        const name = parts[1]?.trim() || 'Unknown Printer';
        const port = parts[2]?.trim() || 'Unknown Port';
        
        return {
          name: name,
          address: port, // Use port as address for regular printers
          isConnected: false
        };
      }).filter(printer => printer.name !== 'Unknown Printer');
      
      // If no printers found, add some default ones
      if (this.discoveredPrinters.length === 0) {
        this.discoveredPrinters = [
          {
            name: 'Microsoft Print to PDF',
            address: 'PDF:',
            isConnected: false
          },
          {
            name: 'Default Printer',
            address: 'LPT1:',
            isConnected: false
          }
        ];
      }
      
      console.log('Discovered printers:', this.discoveredPrinters);
    } catch (error) {
      console.error('Error discovering printers:', error);
      // Fallback to default printers
      this.discoveredPrinters = [
        {
          name: 'Microsoft Print to PDF',
          address: 'PDF:',
          isConnected: false
        }
      ];
    }
  }

  getDiscoveredPrinters(): PrinterInfo[] {
    return this.discoveredPrinters;
  }

  async stopDiscovery(): Promise<void> {
    console.log('Stopping printer discovery...');
    // Cleanup discovery process
  }

  // Get printer by address
  getPrinterByAddress(address: string): PrinterInfo | undefined {
    return this.discoveredPrinters.find(printer => printer.address === address);
  }

  // Clear discovered printers
  clearDiscoveredPrinters(): void {
    this.discoveredPrinters = [];
  }
}
