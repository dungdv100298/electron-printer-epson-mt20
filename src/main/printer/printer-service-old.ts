import { ESCPOSCommands } from './escpos-commands';
import { PrintOptions, PrintData, SalesReceiptData } from '../../shared/types/printer.types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const execAsync = promisify(exec);

export class PrinterService {
  private escpos: ESCPOSCommands;

  constructor() {
    this.escpos = new ESCPOSCommands();
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
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const fontSize = options.fontSize === 'large' ? 18 : 
                   options.fontSize === 'small' ? 12 : 14;
    
    const lines = text.split('\n');
    let y = page.getHeight() - 50;
    
    for (const line of lines) {
      if (y < 50) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        y = newPage.getHeight() - 50;
      }
      
      page.drawText(line, {
        x: 50,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0)
      });
      
      y -= fontSize + 5;
    }
    
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

  private createImageHtmlContent(imagePath: string, options: PrintOptions): string {
    const imageData = fs.readFileSync(imagePath, 'base64');
    const textAlign = options.align || 'left';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            text-align: ${textAlign};
            margin: 20px;
          }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <img src="data:image/png;base64,${imageData}" alt="Print Image">
      </body>
      </html>
    `;
  }

  private createMixedHtmlContent(data: PrintData): string {
    const fontSize = data.fontSize === 'large' ? '18px' : 
                   data.fontSize === 'small' ? '12px' : '14px';
    const fontWeight = data.bold ? 'bold' : 'normal';
    const textAlign = data.align || 'left';

    let content = '';
    if (data.text) {
      content += `<div style="font-size: ${fontSize}; font-weight: ${fontWeight}; text-align: ${textAlign}; white-space: pre-wrap;">${data.text.replace(/\n/g, '<br>')}</div>`;
    }
    if (data.image) {
      const imageData = fs.readFileSync(data.image, 'base64');
      content += `<img src="data:image/png;base64,${imageData}" alt="Print Image" style="max-width: 100%; height: auto;">`;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 20px; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }

  private createSalesReceiptHtml(receiptData: SalesReceiptData): string {
    const itemsHtml = receiptData.items.map(item => `
      <tr>
        <td>${item.productCode}</td>
        <td>${item.productName}</td>
        <td style="text-align: right;">${item.quantity}</td>
        <td style="text-align: right;">¥${item.price.toLocaleString()}</td>
        <td style="text-align: right;">¥${item.total.toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 14px;
            margin: 20px;
            line-height: 1.4;
          }
          .header { text-align: center; margin-bottom: 20px; }
          .receipt-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          .summary { text-align: right; font-weight: bold; }
          .signature { margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>納品書 兼 領収書</h2>
        </div>
        
        <div class="receipt-info">
          <p><strong>No:</strong> ${receiptData.header.receiptNo}</p>
          <p><strong>納品日:</strong> ${receiptData.header.date}</p>
          <p><strong>顧客コード:</strong> ${receiptData.header.customerCode}</p>
          <p><strong>顧客名:</strong> ${receiptData.header.customerName}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>商品コード</th>
              <th>商品名</th>
              <th>数量</th>
              <th>単価</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary">
          <p>小計: ¥${receiptData.summary.subtotal.toLocaleString()}</p>
          <p>税額 (10%): ¥${receiptData.summary.tax.toLocaleString()}</p>
          <p style="font-size: 18px;">合計: ¥${receiptData.summary.total.toLocaleString()}</p>
        </div>

        ${receiptData.signature ? `
          <div class="signature">
            <p>署名:</p>
            <img src="data:image/png;base64,${receiptData.signature}" alt="Signature" style="max-width: 200px; height: auto;">
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }

  private async generatePDF(htmlContent: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfPath = path.join(process.cwd(), 'temp', `print_${Date.now()}.pdf`);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(pdfPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      return pdfPath;
    } finally {
      await browser.close();
    }
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
      const testCommand = Buffer.from([0x1B, 0x40]); // ESC @ (Initialize)
      await this.sendCommands(testCommand);
      return true;
    } catch (error) {
      console.error('Printer test failed:', error);
      return false;
    }
  }

  // Get printer status
  async getPrinterStatus(): Promise<string> {
    try {
      // Send status request command
      const statusCommand = Buffer.from([0x1B, 0x76, 0x00]); // ESC v (Status request)
      await this.sendCommands(statusCommand);
      return 'Ready';
    } catch (error) {
      console.error('Status check failed:', error);
      return 'Error';
    }
  }
}
