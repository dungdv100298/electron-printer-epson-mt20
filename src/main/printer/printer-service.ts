import { PrintOptions, PrintData, SalesReceiptData } from '../../shared/types/printer.types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const execAsync = promisify(exec);

export class PrinterService {
  constructor() {
    // No dependencies needed for PDF generation
  }

  async printText(text: string, options: PrintOptions = {}): Promise<boolean> {
    try {
      const pdfPath = await this.generateTextPDF(text, options);
      return await this.printPDF(pdfPath);
    } catch (error) {
      console.error('Error printing text:', error);
      return false;
    }
  }

  async printImage(imagePath: string, options: PrintOptions = {}): Promise<boolean> {
    try {
      const pdfPath = await this.generateImagePDF(imagePath, options);
      return await this.printPDF(pdfPath);
    } catch (error) {
      console.error('Error printing image:', error);
      return false;
    }
  }

  async printMixed(data: PrintData): Promise<boolean> {
    try {
      const pdfPath = await this.generateMixedPDF(data);
      return await this.printPDF(pdfPath);
    } catch (error) {
      console.error('Error printing mixed content:', error);
      return false;
    }
  }

  async printSalesReceipt(receiptData: SalesReceiptData): Promise<boolean> {
    try {
      const pdfPath = await this.generateSalesReceiptPDF(receiptData);
      return await this.printPDF(pdfPath);
    } catch (error) {
      console.error('Error printing sales receipt:', error);
      return false;
    }
  }

  private async generateTextPDF(text: string, options: PrintOptions): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([384, 600]); // Thermal printer size (384px width for TM-P20)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const fontSize = options.fontSize === 'large' ? 18 : 
                   options.fontSize === 'small' ? 12 : 14;
    
    const lines = text.split('\n');
    let y = page.getHeight() - 20;
    
    for (const line of lines) {
      if (y < 20) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([384, 600]);
        y = newPage.getHeight() - 20;
      }
      
      page.drawText(line, {
        x: 10,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0)
      });
      
      y -= fontSize + 3;
    }
    
    return await this.savePDF(pdfDoc);
  }

  private async generateImagePDF(imagePath: string, options: PrintOptions): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([384, 600]); // Thermal printer size (384px width for TM-P20)
    
    try {
      // Read and embed image
      const imageBytes = fs.readFileSync(imagePath);
      let image;
      
      if (imagePath.toLowerCase().endsWith('.png')) {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg')) {
        image = await pdfDoc.embedJpg(imageBytes);
      } else {
        throw new Error('Unsupported image format');
      }
      
      // Scale image to fit thermal printer width (384px)
      const { width, height } = image.scale(384 / image.width);
      const x = (page.getWidth() - width) / 2;
      const y = (page.getHeight() - height) / 2;
      
      page.drawImage(image, {
        x: x,
        y: y,
        width: width,
        height: height
      });
    } catch (error) {
      console.error('Error processing image:', error);
      // Fallback to text
      page.drawText('Error loading image', {
        x: 10,
        y: page.getHeight() - 20,
        size: 14,
        font: await pdfDoc.embedFont(StandardFonts.Helvetica),
        color: rgb(1, 0, 0)
      });
    }
    
    return await this.savePDF(pdfDoc);
  }

  private async generateMixedPDF(data: PrintData): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([384, 600]); // Thermal printer size (384px width for TM-P20)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    let y = page.getHeight() - 20;
    
    // Add text if present
    if (data.text) {
      const fontSize = data.fontSize === 'large' ? 18 : 
                     data.fontSize === 'small' ? 12 : 14;
      
      const lines = data.text.split('\n');
      for (const line of lines) {
        if (y < 20) {
          const newPage = pdfDoc.addPage([384, 600]);
          y = newPage.getHeight() - 20;
        }
        
        page.drawText(line, {
          x: 10,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0)
        });
        
        y -= fontSize + 3;
      }
    }
    
    // Add image if present
    if (data.image) {
      try {
        const imageBytes = fs.readFileSync(data.image);
        let image;
        
        if (data.image.toLowerCase().endsWith('.png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (data.image.toLowerCase().endsWith('.jpg') || data.image.toLowerCase().endsWith('.jpeg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        if (image) {
          const { width, height } = image.scale(384 / image.width);
          const x = (page.getWidth() - width) / 2;
          y = Math.max(y - height - 10, 20);
          
          page.drawImage(image, {
            x: x,
            y: y,
            width: width,
            height: height
          });
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
    
    return await this.savePDF(pdfDoc);
  }

  private async generateSalesReceiptPDF(receiptData: SalesReceiptData): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([384, 600]); // Thermal printer size (384px width for TM-P20)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let y = page.getHeight() - 20;
    
    // Header
    page.drawText('納品書 兼 領収書', {
      x: 10,
      y: y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    y -= 25;
    
    // Receipt info
    page.drawText(`No: ${receiptData.header.receiptNo}`, {
      x: 10,
      y: y,
      size: 10,
      font: font,
      color: rgb(0, 0, 0)
    });
    y -= 15;
    
    page.drawText(`納品日: ${receiptData.header.date}`, {
      x: 10,
      y: y,
      size: 10,
      font: font,
      color: rgb(0, 0, 0)
    });
    y -= 15;
    
    page.drawText(`顧客コード: ${receiptData.header.customerCode}`, {
      x: 10,
      y: y,
      size: 10,
      font: font,
      color: rgb(0, 0, 0)
    });
    y -= 15;
    
    page.drawText(`顧客名: ${receiptData.header.customerName}`, {
      x: 10,
      y: y,
      size: 10,
      font: font,
      color: rgb(0, 0, 0)
    });
    y -= 20;
    
    // Items table header
    page.drawText('商品コード', { x: 10, y: y, size: 8, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText('商品名', { x: 80, y: y, size: 8, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText('数量', { x: 200, y: y, size: 8, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText('単価', { x: 240, y: y, size: 8, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText('金額', { x: 300, y: y, size: 8, font: boldFont, color: rgb(0, 0, 0) });
    y -= 15;
    
    // Items
    for (const item of receiptData.items) {
      if (y < 50) {
        const newPage = pdfDoc.addPage([384, 600]);
        y = newPage.getHeight() - 20;
      }
      
      page.drawText(item.productCode, { x: 10, y: y, size: 8, font: font, color: rgb(0, 0, 0) });
      page.drawText(item.productName, { x: 80, y: y, size: 8, font: font, color: rgb(0, 0, 0) });
      page.drawText(item.quantity.toString(), { x: 200, y: y, size: 8, font: font, color: rgb(0, 0, 0) });
      page.drawText(`¥${item.price.toLocaleString()}`, { x: 240, y: y, size: 8, font: font, color: rgb(0, 0, 0) });
      page.drawText(`¥${item.total.toLocaleString()}`, { x: 300, y: y, size: 8, font: font, color: rgb(0, 0, 0) });
      y -= 15;
    }
    
    y -= 15;
    
    // Summary
    page.drawText(`小計: ¥${receiptData.summary.subtotal.toLocaleString()}`, {
      x: 200,
      y: y,
      size: 10,
      font: font,
      color: rgb(0, 0, 0)
    });
    y -= 15;
    
    page.drawText(`税額 (10%): ¥${receiptData.summary.tax.toLocaleString()}`, {
      x: 200,
      y: y,
      size: 10,
      font: font,
      color: rgb(0, 0, 0)
    });
    y -= 15;
    
    page.drawText(`合計: ¥${receiptData.summary.total.toLocaleString()}`, {
      x: 200,
      y: y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    return await this.savePDF(pdfDoc);
  }

  private async savePDF(pdfDoc: PDFDocument): Promise<string> {
    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.join(process.cwd(), 'temp', `print_${Date.now()}.pdf`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(pdfPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(pdfPath, pdfBytes);
    return pdfPath;
  }

  private async printPDF(pdfPath: string): Promise<boolean> {
    try {
      // Use Windows print command
      await execAsync(`start /wait "" "${pdfPath}"`);
      console.log('PDF sent to default printer');
      return true;
    } catch (error) {
      console.error('Error printing PDF:', error);
      return false;
    }
  }

  // Test printer connection
  async testPrinter(): Promise<boolean> {
    try {
      const testText = 'Printer Test - ' + new Date().toLocaleString();
      return await this.printText(testText);
    } catch (error) {
      console.error('Printer test failed:', error);
      return false;
    }
  }

  // Get printer status
  async getPrinterStatus(): Promise<string> {
    try {
      const { stdout } = await execAsync('wmic printer where "default=true" get name /format:csv');
      if (stdout.includes('Name')) {
        return 'Ready';
      }
      return 'No default printer';
    } catch (error) {
      console.error('Status check failed:', error);
      return 'Error';
    }
  }
}
