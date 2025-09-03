import jsPDF from 'jspdf';

export class PDFService {
  constructor() {
    this.themes = {
      minimalist: {
        name: 'Minimalist',
        primaryColor: [0, 0, 0],      // Black
        accentColor: [85, 85, 85],    // Dark gray
        backgroundColor: [255, 255, 255], // White
        dividerColor: [200, 200, 200],   // Light gray
        footerColor: [128, 128, 128]     // Medium gray
      },
      corporate: {
        name: 'Corporate',
        primaryColor: [25, 47, 89],      // Navy blue
        accentColor: [70, 130, 180],     // Steel blue
        backgroundColor: [255, 255, 255], // White
        dividerColor: [70, 130, 180],    // Steel blue
        footerColor: [85, 85, 85]        // Dark gray
      },
      creative: {
        name: 'Creative',
        primaryColor: [139, 69, 19],     // Saddle brown
        accentColor: [210, 180, 140],    // Tan
        backgroundColor: [255, 248, 220], // Cornsilk
        dividerColor: [210, 180, 140],   // Tan
        footerColor: [160, 82, 45]       // Saddle brown lighter
      }
    };
  }

  // Helper method to get currency symbol
  getCurrencySymbol(currencyCode, currencies) {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  }

  // Calculate subtotal for invoice items
  calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
  }

  // Generate styled PDF with themes and professional formatting
  generateStyledPDF(data, type, theme = 'minimalist', isDraft = false, currencies) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;
    
    const currentTheme = this.themes[theme];
    const currencySymbol = this.getCurrencySymbol(data.currency, currencies);
    
    // Helper functions for consistent styling
    const setColor = (color) => {
      doc.setTextColor(color[0], color[1], color[2]);
    };
    
    const setDrawColor = (color) => {
      doc.setDrawColor(color[0], color[1], color[2]);
    };
    
    const drawDivider = (yPos, width = contentWidth) => {
      setDrawColor(currentTheme.dividerColor);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, margin + width, yPos);
    };
    
    const addWatermark = () => {
      if (isDraft) {
        doc.saveGraphicsState();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(60);
        doc.setTextColor(200, 200, 200);
        
        // Center the watermark
        const text = 'DRAFT';
        const textWidth = doc.getTextWidth(text);
        const centerX = pageWidth / 2 - textWidth / 2;
        const centerY = pageHeight / 2;
        
        // Rotate and add watermark
        doc.text(text, centerX, centerY, { angle: 45 });
        doc.restoreGraphicsState();
      }
    };
    
    // Background (for creative theme)
    if (theme === 'creative') {
      doc.setFillColor(currentTheme.backgroundColor[0], currentTheme.backgroundColor[1], currentTheme.backgroundColor[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
    
    // Header Section
    setColor(currentTheme.primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(data.businessName || (type === 'invoice' ? 'Invoice' : 'Receipt'), margin, y);
    y += 35;
    
    // Business contact info
    if (data.businessContact) {
      setColor(currentTheme.accentColor);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const contactLines = data.businessContact.split('\n');
      contactLines.forEach(line => {
        doc.text(line, margin, y);
        y += 16;
      });
    }
    y += 10;
    
    // Document header divider
    drawDivider(y);
    y += 25;
    
    // Document type and number - right aligned
    const rightX = pageWidth - margin;
    setColor(currentTheme.primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const docType = type === 'invoice' ? 'INVOICE' : 'RECEIPT';
    const docTypeWidth = doc.getTextWidth(docType);
    doc.text(docType, rightX - docTypeWidth, y - 10);
    
    setColor(currentTheme.accentColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const docNumber = type === 'invoice' ? data.invoiceNumber : data.receiptNumber;
    const numberText = `${type === 'invoice' ? 'Invoice' : 'Receipt'} #: ${docNumber || 'N/A'}`;
    const numberWidth = doc.getTextWidth(numberText);
    doc.text(numberText, rightX - numberWidth, y + 10);
    
    const dateText = `Date: ${data.date || new Date().toLocaleDateString()}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, rightX - dateWidth, y + 26);
    
    if (type === 'invoice' && data.dueDate) {
      const dueDateText = `Due Date: ${data.dueDate}`;
      const dueDateWidth = doc.getTextWidth(dueDateText);
      doc.text(dueDateText, rightX - dueDateWidth, y + 42);
    }
    
    // Client information
    setColor(currentTheme.primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Bill To:', margin, y);
    y += 20;
    
    setColor(currentTheme.accentColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(data.clientName || 'N/A', margin, y);
    y += 16;
    
    if (data.clientDetails) {
      const clientLines = data.clientDetails.split('\n');
      clientLines.forEach(line => {
        doc.text(line, margin, y);
        y += 14;
      });
    }
    y += 20;
    
    // Items section divider
    drawDivider(y);
    y += 25;
    
    if (type === 'invoice') {
      // Items table header
      setColor(currentTheme.primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Items & Services', margin, y);
      y += 25;
      
      // Table headers
      setColor(currentTheme.accentColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Description', margin, y);
      doc.text('Qty', margin + 300, y);
      doc.text('Price', margin + 360, y);
      doc.text('Total', margin + 450, y);
      y += 18;
      
      // Table header underline
      setDrawColor(currentTheme.dividerColor);
      doc.setLineWidth(0.5);
      doc.line(margin, y - 3, margin + contentWidth, y - 3);
      y += 5;
      
      // Items
      setColor([0, 0, 0]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      data.items.forEach(item => {
        const total = (item.quantity || 0) * (item.price || 0);
        doc.text(item.description || 'N/A', margin, y);
        doc.text(String(item.quantity || 0), margin + 300, y);
        doc.text(`${currencySymbol}${(item.price || 0).toFixed(2)}`, margin + 360, y);
        doc.text(`${currencySymbol}${total.toFixed(2)}`, margin + 450, y);
        y += 16;
      });
      
      y += 10;
    } else {
      // Receipt amount section
      setColor(currentTheme.primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Payment Details', margin, y);
      y += 25;
      
      setColor(currentTheme.accentColor);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Amount: ${currencySymbol}${(data.amount || 0).toFixed(2)}`, margin, y);
      y += 20;
    }
    
    // Calculations section divider
    drawDivider(y);
    y += 25;
    
    // Financial summary
    const rightColumnX = margin + 350;
    setColor(currentTheme.accentColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    if (type === 'invoice') {
      const sub = this.calculateSubtotal(data.items);
      doc.text('Subtotal:', rightColumnX, y);
      doc.text(`${currencySymbol}${sub.toFixed(2)}`, rightColumnX + 80, y);
      y += 18;
      
      if (data.tax > 0) {
        doc.text(`Tax (${data.tax}%):`, rightColumnX, y);
        doc.text(`${currencySymbol}${(sub * (data.tax || 0) / 100).toFixed(2)}`, rightColumnX + 80, y);
        y += 18;
      }
      
      if (data.discount > 0) {
        doc.text(`Discount (${data.discount}%):`, rightColumnX, y);
        doc.text(`-${currencySymbol}${(sub * (data.discount || 0) / 100).toFixed(2)}`, rightColumnX + 80, y);
        y += 18;
      }
      
      y += 5;
      
      // Grand Total - Enhanced styling
      setColor(currentTheme.primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const grandTotal = sub + sub * (data.tax || 0) / 100 - sub * (data.discount || 0) / 100;
      doc.text('GRAND TOTAL:', rightColumnX, y);
      doc.text(`${currencySymbol}${grandTotal.toFixed(2)}`, rightColumnX + 110, y);
      
      // Underline the grand total
      setDrawColor(currentTheme.primaryColor);
      doc.setLineWidth(1);
      doc.line(rightColumnX, y + 3, rightColumnX + 180, y + 3);
      
    } else {
      const amount = data.amount || 0;
      doc.text('Amount:', rightColumnX, y);
      doc.text(`${currencySymbol}${amount.toFixed(2)}`, rightColumnX + 80, y);
      y += 18;
      
      if (data.tax > 0) {
        doc.text(`Tax (${data.tax}%):`, rightColumnX, y);
        doc.text(`${currencySymbol}${(amount * (data.tax || 0) / 100).toFixed(2)}`, rightColumnX + 80, y);
        y += 18;
      }
      
      if (data.discount > 0) {
        doc.text(`Discount (${data.discount}%):`, rightColumnX, y);
        doc.text(`-${currencySymbol}${(amount * (data.discount || 0) / 100).toFixed(2)}`, rightColumnX + 80, y);
        y += 18;
      }
      
      y += 5;
      
      // Total - Enhanced styling
      setColor(currentTheme.primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const total = amount + amount * (data.tax || 0) / 100 - amount * (data.discount || 0) / 100;
      doc.text('TOTAL:', rightColumnX, y);
      doc.text(`${currencySymbol}${total.toFixed(2)}`, rightColumnX + 80, y);
      
      // Underline the total
      setDrawColor(currentTheme.primaryColor);
      doc.setLineWidth(1);
      doc.line(rightColumnX, y + 3, rightColumnX + 150, y + 3);
    }
    
    y += 40;
    
    // Payment Terms and Notes
    if (data.paymentTerms || data.notes) {
      drawDivider(y);
      y += 25;
      
      if (data.paymentTerms) {
        setColor(currentTheme.primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Payment Terms:', margin, y);
        y += 18;
        
        setColor(currentTheme.accentColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const termLines = data.paymentTerms.split('\n');
        termLines.forEach(line => {
          doc.text(line, margin, y);
          y += 14;
        });
        y += 10;
      }
      
      if (data.notes) {
        setColor(currentTheme.primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Notes:', margin, y);
        y += 18;
        
        setColor(currentTheme.accentColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const noteLines = data.notes.split('\n');
        noteLines.forEach(line => {
          doc.text(line, margin, y);
          y += 14;
        });
      }
    }
    
    // Footer
    const footerY = pageHeight - 60;
    drawDivider(footerY - 15);
    
    setColor(currentTheme.footerColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const footerText = data.businessContact ? 
      `${data.businessName || 'InvoicePro'} • Thank you for your business!` :
      'Generated with InvoicePro • Professional invoicing made simple';
    
    const footerWidth = doc.getTextWidth(footerText);
    const footerX = (pageWidth - footerWidth) / 2;
    doc.text(footerText, footerX, footerY);
    
    // Add watermark if draft
    addWatermark();
    
    return doc;
  }

  // Get available themes
  getThemes() {
    return this.themes;
  }
}

export default new PDFService();
