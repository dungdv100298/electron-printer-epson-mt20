import { useState, useCallback } from 'react';
import { PrinterInfo } from '../types/printer.types';

export const usePrinter = () => {
  const [discoveredPrinters, setDiscoveredPrinters] = useState<PrinterInfo[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [currentPrinter, setCurrentPrinter] = useState<PrinterInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const startDiscovery = useCallback(async () => {
    setIsDiscovering(true);
    try {
      const printers = await window.electronAPI.startPrinterDiscovery();
      setDiscoveredPrinters(printers);
    } catch (error) {
      console.error('Discovery failed:', error);
      throw error;
    } finally {
      setIsDiscovering(false);
    }
  }, []);

  const stopDiscovery = useCallback(async () => {
    try {
      await window.electronAPI.stopPrinterDiscovery();
      setIsDiscovering(false);
    } catch (error) {
      console.error('Stop discovery failed:', error);
      throw error;
    }
  }, []);

  const connectPrinter = useCallback(async (printer: PrinterInfo) => {
    try {
      const success = await window.electronAPI.connectPrinter(printer);
      if (success) {
        setCurrentPrinter(printer);
        setIsConnected(true);
      }
      return success;
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }, []);

  const disconnectPrinter = useCallback(async () => {
    try {
      await window.electronAPI.disconnectPrinter();
      setCurrentPrinter(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Disconnection failed:', error);
      throw error;
    }
  }, []);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const connected = await window.electronAPI.isPrinterConnected();
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('Connection status check failed:', error);
      return false;
    }
  }, []);

  const testPrinter = useCallback(async () => {
    try {
      const success = await window.electronAPI.testPrinter();
      return success;
    } catch (error) {
      console.error('Printer test failed:', error);
      return false;
    }
  }, []);

  const getPrinterStatus = useCallback(async () => {
    try {
      const status = await window.electronAPI.getPrinterStatus();
      return status;
    } catch (error) {
      console.error('Get printer status failed:', error);
      return 'Error';
    }
  }, []);

  return {
    discoveredPrinters,
    isDiscovering,
    currentPrinter,
    isConnected,
    startDiscovery,
    stopDiscovery,
    connectPrinter,
    disconnectPrinter,
    checkConnectionStatus,
    testPrinter,
    getPrinterStatus
  };
};
