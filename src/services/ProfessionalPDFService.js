import jsPDF from 'jspdf';

export class ProfessionalPDFService {
  constructor() {
    this.themes = {
      minimalist: {
        primaryColor: [41, 128, 185],      // Professional blue
        secondaryColor: [52, 73, 94],      // Dark gray
        accentColor: [149, 165, 166],      // Light gray
        dividerColor: [189, 195, 199],     // Light divider
        footerColor: [127, 140, 141],      // Footer gray
        backgroundColor: [255, 255, 255]   // White background
      },
      professional: {
        primaryColor: [44, 62, 80],        // Dark blue-gray
        secondaryColor: [52, 73, 94],      // Dark gray
        accentColor: [149, 165, 166],      // Light gray
        dividerColor: [189, 195, 199],     // Light divider
        footerColor: [127, 140, 141],      // Footer gray
        backgroundColor: [255, 255, 255]   // White background
      },
      creative: {
        primaryColor: [142, 68, 173],      // Purple
        secondaryColor: [52, 73, 94],      // Dark gray
        accentColor: [149, 165, 166],      // Light gray
        dividerColor: [189, 195, 199],     // Light divider
        footerColor: [127, 140, 141],      // Footer gray
        backgroundColor: [248, 249, 250]   // Light background
      }
    };
  }

  // Get currency symbol
  getCurrencySymbol(currencyCode, currencies) {
    const currency = currencies?.find(c => c.code === currencyCode);
    return currency?.symbol || '$';
  }

  // Calculate subtotal for items
  calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
  }

  // Generate professional styled PDF
  generateStyledPDF(data, type, theme = 'professional', isDraft = false, currencies) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;
    
    const currentTheme = this.themes[theme] || this.themes.professional;
    const currencySymbol = this.getCurrencySymbol(data.currency, currencies);
    
    // Professional color scheme
    const colors = {
      primary: currentTheme.primaryColor,
      secondary: currentTheme.secondaryColor,
      accent: currentTheme.accentColor,
      success: [46, 204, 113],
      danger: [231, 76, 60],
      text: [44, 62, 80],
      light: [248, 249, 250],
      white: [255, 255, 255]
    };
    
    // Helper functions for consistent styling
    const setColor = (color) => {
      doc.setTextColor(color[0], color[1], color[2]);
    };
    
    const setDrawColor = (color) => {
      doc.setDrawColor(color[0], color[1], color[2]);
    };
    
    const setFillColor = (color) => {
      doc.setFillColor(color[0], color[1], color[2]);
    };
    
    const drawDivider = (yPos, width = contentWidth, color = colors.accent) => {
      setDrawColor(color);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, margin + width, yPos);
    };
    
    const drawThickDivider = (yPos, width = contentWidth, color = colors.primary) => {
      setDrawColor(color);
      doc.setLineWidth(2);
      doc.line(margin, yPos, margin + width, yPos);
    };
    
    const addWatermark = () => {
      if (isDraft) {
        doc.saveGraphicsState();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(80);
        doc.setTextColor(220, 220, 220);
        
        const text = 'DRAFT';
        const textWidth = doc.getTextWidth(text);
        const centerX = pageWidth / 2 - textWidth / 2;
        const centerY = pageHeight / 2;
        
        doc.text(text, centerX, centerY, { angle: 45 });
        doc.restoreGraphicsState();
      }
    };
    
    // Header Section with Professional Styling
    setColor(colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(data.businessName || (type === 'invoice' ? 'Invoice' : 'Receipt'), margin, y);
    y += 40;
    
    // Business contact info with better formatting
    if (data.businessContact) {
      setColor(colors.secondary);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const contactLines = data.businessContact.split('\n');
      contactLines.forEach(line => {
        if (line.trim()) {
          doc.text(line.trim(), margin, y);
          y += 16;
        }
      });
    }
    y += 20;
    
    // Professional header divider
    drawThickDivider(y);
    y += 30;
    
    // Document type and number - Enhanced right-aligned section
    const rightX = pageWidth - margin;
    setColor(colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    const docType = type === 'invoice' ? 'INVOICE' : 'RECEIPT';
    const docTypeWidth = doc.getTextWidth(docType);
    doc.text(docType, rightX - docTypeWidth, y);
    y += 30;
    
    // Document details in a styled box
    setFillColor(colors.light);
    const boxWidth = 200;
    const boxHeight = 120;
    const boxX = rightX - boxWidth;
    const boxY = y - 25;
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 5, 5);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');
    
    // Box border
    setDrawColor(colors.accent);
    doc.setLineWidth(0.5);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 5, 5);
    
    // Document details inside box
    setColor(colors.secondary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const docNumber = type === 'invoice' ? data.invoiceNumber : data.receiptNumber;
    doc.text(`${type === 'invoice' ? 'Invoice' : 'Receipt'} #`, boxX + 15, boxY + 25);
    
    setColor(colors.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(docNumber || 'N/A', boxX + 15, boxY + 45);
    
    setColor(colors.secondary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Date', boxX + 15, boxY + 65);
    
    setColor(colors.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(data.date || new Date().toLocaleDateString(), boxX + 15, boxY + 85);
    
    if (type === 'invoice' && data.dueDate) {
      setColor(colors.secondary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Due Date', boxX + 15, boxY + 105);
      
      setColor(colors.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(data.dueDate, boxX + 15, boxY + 125);
    }
    
    y += 100;
    
    // Client information with professional styling
    setColor(colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Bill To:', margin, y);
    y += 25;
    
    // Client info box
    setFillColor(colors.light);
    const clientBoxWidth = 300;
    const clientBoxHeight = Math.max(80, (data.clientDetails ? data.clientDetails.split('\n').length * 16 + 40 : 60));
    doc.roundedRect(margin, y - 20, clientBoxWidth, clientBoxHeight, 5, 5);
    doc.rect(margin, y - 20, clientBoxWidth, clientBoxHeight, 'F');
    
    // Client box border
    setDrawColor(colors.accent);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y - 20, clientBoxWidth, clientBoxHeight, 5, 5);
    
    // Client content
    setColor(colors.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(data.clientName || 'N/A', margin + 15, y);
    
    if (data.clientDetails) {
      y += 20;
      setColor(colors.secondary);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const clientLines = data.clientDetails.split('\n');
      clientLines.forEach(line => {
        if (line.trim()) {
          doc.text(line.trim(), margin + 15, y);
          y += 14;
        }
      });
    }
    
    y += 40;
    
    // Items section with professional divider
    drawDivider(y);
    y += 30;
    
    if (type === 'invoice') {
      // Items table with enhanced styling
      setColor(colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Items & Services', margin, y);
      y += 35;
      
      // Professional table header with background
      setFillColor(colors.primary);
      const headerHeight = 25;
      doc.rect(margin, y - headerHeight, contentWidth, headerHeight, 'F');
      
      // Table headers
      setColor(colors.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Description', margin + 15, y - 10);
      doc.text('Qty', margin + 350, y - 10);
      doc.text('Price', margin + 420, y - 10);
      doc.text('Total', margin + 500, y - 10);
      
      y += 10;
      
      // Items with alternating row colors
      setColor(colors.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      data.items.forEach((item, index) => {
        const total = (item.quantity || 0) * (item.price || 0);
        
        // Alternating row background
        if (index % 2 === 0) {
          setFillColor(colors.light);
          doc.rect(margin, y - 15, contentWidth, 20, 'F');
        }
        
        setColor(colors.text);
        doc.text(item.description || 'N/A', margin + 15, y);
        doc.text(String(item.quantity || 0), margin + 350, y);
        doc.text(`${currencySymbol}${(item.price || 0).toFixed(2)}`, margin + 420, y);
        doc.text(`${currencySymbol}${total.toFixed(2)}`, margin + 500, y);
        y += 20;
      });
      
      y += 20;
    } else {
      // Receipt amount section with professional styling
      setColor(colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Payment Details', margin, y);
      y += 35;
      
      // Amount box
      setFillColor(colors.light);
      const amountBoxWidth = 300;
      const amountBoxHeight = 60;
      doc.roundedRect(margin, y - 20, amountBoxWidth, amountBoxHeight, 5, 5);
      doc.rect(margin, y - 20, amountBoxWidth, amountBoxHeight, 'F');
      
      // Amount box border
      setDrawColor(colors.accent);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y - 20, amountBoxWidth, amountBoxHeight, 5, 5);
      
      setColor(colors.secondary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Amount:', margin + 15, y);
      
      setColor(colors.text);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`${currencySymbol}${(data.amount || 0).toFixed(2)}`, margin + 15, y + 20);
      
      y += 50;
    }
    
    // Financial summary with professional styling
    drawDivider(y);
    y += 30;
    
    const rightColumnX = margin + 400;
    setColor(colors.secondary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    if (type === 'invoice') {
      const sub = this.calculateSubtotal(data.items);
      doc.text('Subtotal:', rightColumnX, y);
      doc.text(`${currencySymbol}${sub.toFixed(2)}`, rightColumnX + 100, y);
      y += 20;
      
      if (data.tax > 0) {
        doc.text(`Tax (${data.tax}%):`, rightColumnX, y);
        doc.text(`${currencySymbol}${(sub * (data.tax || 0) / 100).toFixed(2)}`, rightColumnX + 100, y);
        y += 20;
      }
      
      if (data.discount > 0) {
        doc.text(`Discount (${data.discount}%):`, rightColumnX, y);
        doc.text(`-${currencySymbol}${(sub * (data.discount || 0) / 100).toFixed(2)}`, rightColumnX + 100, y);
        y += 20;
      }
      
      y += 10;
      
      // Grand Total with enhanced styling
      drawThickDivider(y, 250);
      y += 20;
      
      setColor(colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      const grandTotal = sub + sub * (data.tax || 0) / 100 - sub * (data.discount || 0) / 100;
      doc.text('GRAND TOTAL:', rightColumnX, y);
      doc.text(`${currencySymbol}${grandTotal.toFixed(2)}`, rightColumnX + 120, y);
      
    } else {
      const amount = data.amount || 0;
      doc.text('Subtotal:', rightColumnX, y);
      doc.text(`${currencySymbol}${amount.toFixed(2)}`, rightColumnX + 100, y);
      y += 20;
      
      if (data.tax > 0) {
        doc.text(`Tax (${data.tax}%):`, rightColumnX, y);
        doc.text(`${currencySymbol}${(amount * (data.tax || 0) / 100).toFixed(2)}`, rightColumnX + 100, y);
        y += 20;
      }
      
      if (data.discount > 0) {
        doc.text(`Discount (${data.discount}%):`, rightColumnX, y);
        doc.text(`-${currencySymbol}${(amount * (data.discount || 0) / 100).toFixed(2)}`, rightColumnX + 100, y);
        y += 20;
      }
      
      y += 10;
      
      // Total with enhanced styling
      drawThickDivider(y, 250);
      y += 20;
      
      setColor(colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      const total = amount + amount * (data.tax || 0) / 100 - amount * (data.discount || 0) / 100;
      doc.text('TOTAL:', rightColumnX, y);
      doc.text(`${currencySymbol}${total.toFixed(2)}`, rightColumnX + 100, y);
    }
    
    y += 60;
    
    // Payment Terms and Notes with professional styling
    if (data.paymentTerms || data.notes) {
      drawDivider(y);
      y += 30;
      
      if (data.paymentTerms) {
        setColor(colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Payment Terms:', margin, y);
        y += 20;
        
        setColor(colors.text);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const termsLines = data.paymentTerms.split('\n');
        termsLines.forEach(line => {
          if (line.trim()) {
            doc.text(line.trim(), margin, y);
            y += 14;
          }
        });
        y += 20;
      }
      
      if (data.notes) {
        setColor(colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Notes:', margin, y);
        y += 20;
        
        setColor(colors.text);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const notesLines = data.notes.split('\n');
        notesLines.forEach(line => {
          if (line.trim()) {
            doc.text(line.trim(), margin, y);
            y += 14;
          }
        });
      }
    }
    
    y += 60;
    
    // Professional footer
    drawDivider(y);
    y += 25;
    
    setColor(colors.accent);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const footerText = 'Generated with InvoicePro • Professional invoicing made simple';
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, y);
    
    // Add watermark if draft
    addWatermark();
    
    return doc;
  }
}

export default new ProfessionalPDFService();
