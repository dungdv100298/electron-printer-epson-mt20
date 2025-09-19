export interface PrinterInfo {
  name: string;
  address: string; // MAC address
  isConnected: boolean;
}

export interface PrintOptions {
  align?: 'left' | 'center' | 'right';
  fontSize?: 'small' | 'medium' | 'large';
  bold?: boolean;
  cut?: boolean;
  feedLines?: number;
}

export interface PrintData {
  text?: string;
  image?: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: 'small' | 'medium' | 'large';
  bold?: boolean;
  cut?: boolean;
  feedLines?: number;
}

export interface SalesReceiptData {
  header: {
    receiptNo: string;
    date: string;
    customerCode: string;
    customerName: string;
  };
  items: Array<{
    productCode: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  summary: {
    subtotal: number;
    tax: number;
    total: number;
  };
  signature?: string; // Base64 image
}

export interface PrinterDiscovery {
  startDiscovery(): Promise<void>;
  getDiscoveredPrinters(): Promise<PrinterInfo[]>;
  stopDiscovery(): Promise<void>;
}

export interface PrinterConnection {
  connect(printerInfo: PrinterInfo): Promise<boolean>;
  isConnected(): boolean;
  disconnect(): Promise<void>;
  getCurrentPrinter(): PrinterInfo | null;
}

export interface PrinterService {
  printText(text: string, options?: PrintOptions): Promise<boolean>;
  printImage(imagePath: string, options?: PrintOptions): Promise<boolean>;
  printMixed(data: PrintData): Promise<boolean>;
  printSalesReceipt(receiptData: SalesReceiptData): Promise<boolean>;
}
