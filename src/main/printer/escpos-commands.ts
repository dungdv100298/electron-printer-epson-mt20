import Jimp from 'jimp';
import { PrintOptions, SalesReceiptData } from '../../shared/types/printer.types';

export class ESCPOSCommands {
  buildTextCommands(text: string, options: PrintOptions): Buffer {
    let commands = Buffer.alloc(0);
    
    // Initialize printer
    commands = Buffer.concat([commands, Buffer.from([0x1B, 0x40])]);
    
    // Set alignment
    if (options.align === 'center') {
      commands = Buffer.concat([commands, Buffer.from([0x1B, 0x61, 0x01])]);
    } else if (options.align === 'right') {
      commands = Buffer.concat([commands, Buffer.from([0x1B, 0x61, 0x02])]);
    } else {
      commands = Buffer.concat([commands, Buffer.from([0x1B, 0x61, 0x00])]);
    }
    
    // Set font size
    if (options.fontSize === 'large') {
      commands = Buffer.concat([commands, Buffer.from([0x1B, 0x21, 0x30])]);
    } else if (options.fontSize === 'small') {
      commands = Buffer.concat([commands, Buffer.from([0x1B, 0x21, 0x00])]);
    } else {
      commands = Buffer.concat([commands, Buffer.from([0x1B, 0x21, 0x10])]);
    }
    
    // Set bold
    if (options.bold) {
      commands = Buffer.concat([commands, Buffer.from([0x1B, 0x45, 0x01])]);
    }
    
    // Add text
    commands = Buffer.concat([commands, Buffer.from(text, 'utf8')]);
    
    // Add line feed
    if (options.feedLines) {
      for (let i = 0; i < options.feedLines; i++) {
        commands = Buffer.concat([commands, Buffer.from([0x0A])]);
      }
    }
    
    // Cut paper
    if (options.cut) {
      commands = Buffer.concat([commands, Buffer.from([0x1D, 0x56, 0x00])]);
    }
    
    return commands;
  }

  buildSalesReceiptCommands(receiptData: SalesReceiptData): Buffer {
    let commands = Buffer.alloc(0);
    
    // Initialize printer
    commands = Buffer.concat([commands, Buffer.from([0x1B, 0x40])]);
    
    // Header
    commands = Buffer.concat([commands, this.buildTextCommands('納品書 兼 領収書', { align: 'center', fontSize: 'large' })]);
    commands = Buffer.concat([commands, this.buildTextCommands('', { feedLines: 2 })]);
    
    // Receipt number and date
    commands = Buffer.concat([commands, this.buildTextCommands(`No: ${receiptData.header.receiptNo}`, { align: 'left' })]);
    commands = Buffer.concat([commands, this.buildTextCommands(`納品日: ${receiptData.header.date}`, { align: 'left' })]);
    commands = Buffer.concat([commands, this.buildTextCommands('', { feedLines: 1 })]);
    
    // Customer info
    commands = Buffer.concat([commands, this.buildTextCommands(receiptData.header.customerCode, { align: 'left' })]);
    commands = Buffer.concat([commands, this.buildTextCommands(receiptData.header.customerName, { align: 'left' })]);
    commands = Buffer.concat([commands, this.buildTextCommands('', { feedLines: 1 })]);
    
    // Items
    commands = Buffer.concat([commands, this.buildTextCommands('----------------------------------------', { align: 'center' })]);
    commands = Buffer.concat([commands, this.buildTextCommands('', { feedLines: 1 })]);
    
    receiptData.items.forEach(item => {
      commands = Buffer.concat([commands, this.buildTextCommands(`${item.productCode} ${item.productName}`, { align: 'left' })]);
      commands = Buffer.concat([commands, this.buildTextCommands(`${item.quantity} x ${item.price} = ${item.total}`, { align: 'right' })]);
    });
    
    // Summary
    commands = Buffer.concat([commands, this.buildTextCommands('----------------------------------------', { align: 'center' })]);
    commands = Buffer.concat([commands, this.buildTextCommands(`小計: ${receiptData.summary.subtotal}`, { align: 'right' })]);
    commands = Buffer.concat([commands, this.buildTextCommands(`税額: ${receiptData.summary.tax}`, { align: 'right' })]);
    commands = Buffer.concat([commands, this.buildTextCommands(`合計: ${receiptData.summary.total}`, { align: 'right', fontSize: 'large', bold: true })]);
    
    // Signature
    if (receiptData.signature) {
      commands = Buffer.concat([commands, this.buildTextCommands('', { feedLines: 2 })]);
      commands = Buffer.concat([commands, this.buildTextCommands('署名:', { align: 'left' })]);
      // Add signature image processing here
    }
    
    // Cut paper
    commands = Buffer.concat([commands, this.buildTextCommands('', { feedLines: 3, cut: true })]);
    
    return commands;
  }

  async buildImageCommands(imagePath: string, options: PrintOptions): Promise<Buffer> {
    try {
      // Sử dụng Jimp để xử lý hình ảnh (không cần native build tools)
      const image = await Jimp.read(imagePath);
      
      // Convert to monochrome and resize
      image.grayscale().resize(384, Jimp.AUTO); // 384px width for TM-P20
      
      // Convert to bitmap data
      const bitmap = image.bitmap.data;
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      
      // Generate ESC/POS image commands
      let commands = Buffer.alloc(0);
      
      // ESC * command for bitmap printing
      commands = Buffer.concat([commands, Buffer.from([0x1B, 0x2A, 0x00])]);
      commands = Buffer.concat([commands, Buffer.from([width & 0xFF, (width >> 8) & 0xFF])]);
      commands = Buffer.concat([commands, Buffer.from([height & 0xFF, (height >> 8) & 0xFF])]);
      
      // Convert bitmap to monochrome data
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x += 8) {
          let byte = 0;
          for (let bit = 0; bit < 8; bit++) {
            if (x + bit < width) {
              const pixelIndex = (y * width + x + bit) * 4;
              const gray = bitmap[pixelIndex]; // R channel (grayscale)
              if (gray < 128) { // Threshold for black/white
                byte |= (1 << (7 - bit));
              }
            }
          }
          commands = Buffer.concat([commands, Buffer.from([byte])]);
        }
      }
      
      return commands;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  // Build mixed content commands
  buildMixedCommands(data: { text?: string; image?: string; options?: PrintOptions }): Buffer {
    let commands = Buffer.alloc(0);
    
    // Initialize printer
    commands = Buffer.concat([commands, Buffer.from([0x1B, 0x40])]);
    
    if (data.text) {
      commands = Buffer.concat([commands, this.buildTextCommands(data.text, data.options || {})]);
    }
    
    return commands;
  }
}
