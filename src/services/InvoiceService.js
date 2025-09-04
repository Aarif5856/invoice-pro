import PDFService from './PDFService.js';
import ValidationService from './ValidationService.js';
import StorageService from './StorageService.js';
import CurrencyService from './CurrencyService.js';
import FirebaseService from './FirebaseService.js';
import { SubscriptionService } from './SubscriptionService.js';

export class InvoiceService {
  constructor() {
    this.pdfService = PDFService;
    this.validationService = ValidationService;
    this.storageService = StorageService;
    this.currencyService = CurrencyService;
    this.firebaseService = FirebaseService;
    this.subscriptionService = SubscriptionService;
  }

  // Generate professional invoice PDF
  async generateInvoicePDF(invoiceData, theme = 'minimalist', isDraft = false) {
    try {
      // Check subscription limits FIRST
      const canGenerate = this.subscriptionService.canGenerateDocument('invoice');
      if (!canGenerate.allowed) {
        throw new Error(canGenerate.reason || 'Monthly invoice limit reached. Upgrade to Pro for unlimited invoices.');
      }
      // Validate invoice data
      const errors = this.validationService.validateInvoice(invoiceData);
      if (Object.keys(errors).length > 0) {
        throw new Error('Validation failed');
      }

      // Generate PDF
      const doc = this.pdfService.generateStyledPDF(
        invoiceData, 
        'invoice', 
        theme, 
        isDraft, 
        this.currencyService.getCurrencies()
      );

      // Generate filename
      const timestamp = Date.now();
      const filename = `invoice_${invoiceData.invoiceNumber || timestamp}.pdf`;

      // Download PDF using blob method (mobile compatible)
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Add to history
      this.storageService.addToHistory(invoiceData, 'invoice', filename);

      // Increment usage counter after successful generation
      this.subscriptionService.incrementUsage('invoice');

      // Try to save to Firebase (optional)
      try {
        await this.firebaseService.saveInvoice(invoiceData, filename, theme, isDraft);
      } catch (firebaseError) {
        console.warn('Firebase save failed (non-critical):', firebaseError);
      }

      return { success: true, filename };
    } catch (error) {
      console.error('Invoice generation failed:', error);
      throw error;
    }
  }

  // Generate professional receipt PDF
  async generateReceiptPDF(receiptData, theme = 'minimalist', isDraft = false) {
    try {
      // Check subscription limits FIRST
      const canGenerate = this.subscriptionService.canGenerateDocument('receipt');
      if (!canGenerate.allowed) {
        throw new Error(canGenerate.reason || 'Monthly receipt limit reached. Upgrade to Pro for unlimited receipts.');
      }
      // Validate receipt data
      const errors = this.validationService.validateReceipt(receiptData);
      if (Object.keys(errors).length > 0) {
        throw new Error('Validation failed');
      }

      // Generate PDF
      const doc = this.pdfService.generateStyledPDF(
        receiptData, 
        'receipt', 
        theme, 
        isDraft, 
        this.currencyService.getCurrencies()
      );

      // Generate filename
      const timestamp = Date.now();
      const filename = `receipt_${receiptData.receiptNumber || timestamp}.pdf`;

      // Download PDF using blob method (mobile compatible)
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Add to history
      this.storageService.addToHistory(receiptData, 'receipt', filename);

      // Increment usage counter after successful generation
      this.subscriptionService.incrementUsage('receipt');

      // Try to save to Firebase (optional)
      try {
        await this.firebaseService.saveReceipt(receiptData, filename, theme, isDraft);
      } catch (firebaseError) {
        console.warn('Firebase save failed (non-critical):', firebaseError);
      }

      return { success: true, filename };
    } catch (error) {
      console.error('Receipt generation failed:', error);
      throw error;
    }
  }

  // Generate invoice/receipt number
  generateInvoiceNumber() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `INV-${year}${month}${day}-${random}`;
  }

  generateReceiptNumber() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `REC-${year}${month}${day}-${random}`;
  }

  // Get current date
  getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Get current date and time
  getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString();
  }

  // Calculate totals for invoice
  calculateInvoiceTotals(items, tax = 0, discount = 0) {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.quantity || 0) * (item.price || 0), 0
    );
    
    const taxAmount = subtotal * (tax || 0) / 100;
    const discountAmount = subtotal * (discount || 0) / 100;
    const grandTotal = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal
    };
  }

  // Calculate totals for receipt
  calculateReceiptTotals(amount, tax = 0, discount = 0) {
    const baseAmount = amount || 0;
    const taxAmount = baseAmount * (tax || 0) / 100;
    const discountAmount = baseAmount * (discount || 0) / 100;
    const total = baseAmount + taxAmount - discountAmount;

    return {
      baseAmount,
      taxAmount,
      discountAmount,
      total
    };
  }

  // Create initial invoice template
  createInitialInvoice() {
    return {
      invoiceNumber: this.generateInvoiceNumber(),
      date: this.getCurrentDate(),
      dueDate: '',
      businessName: '',
      businessLogo: '',
      businessContact: '',
      clientName: '',
      clientDetails: '',
      items: [{ description: '', quantity: 1, price: 0 }],
      tax: 0,
      discount: 0,
      currency: 'USD',
      notes: '',
      paymentTerms: '',
      isDraft: false
    };
  }

  // Create initial receipt template
  createInitialReceipt() {
    return {
      receiptNumber: this.generateReceiptNumber(),
      date: this.getCurrentDate(),
      businessName: '',
      businessLogo: '',
      businessContact: '',
      clientName: '',
      clientDetails: '',
      amount: 0,
      tax: 0,
      discount: 0,
      currency: 'USD',
      notes: '',
      paymentTerms: '',
      isDraft: false
    };
  }

  // Export functionality
  async generateShareableLink(data, type) {
    try {
      // In a real application, this would upload to a server and return a public URL
      // For now, we'll create a data URL
      const dataString = JSON.stringify({ data, type, timestamp: Date.now() });
      const encodedData = btoa(dataString);
      const shareableLink = `${window.location.origin}/shared/${encodedData}`;
      return shareableLink;
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
      throw new Error('Failed to generate shareable link');
    }
  }

  // Email functionality
  emailDocument(data, type) {
    try {
      const subject = type === 'invoice' 
        ? `Invoice ${data.invoiceNumber || 'Document'}` 
        : `Receipt ${data.receiptNumber || 'Document'}`;
      
      const body = `Please find attached ${type} for ${data.clientName || 'your records'}.`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    } catch (error) {
      console.error('Failed to open email client:', error);
      throw new Error('Failed to open email client');
    }
  }

  // Get validation methods (delegated to ValidationService)
  validateInvoice(data) {
    return this.validationService.validateInvoice(data);
  }

  validateReceipt(data) {
    return this.validationService.validateReceipt(data);
  }

  // Get storage methods (delegated to StorageService)
  saveDraft(data, type) {
    return this.storageService.saveDraft(data, type);
  }

  getDrafts() {
    return this.storageService.getDrafts();
  }

  deleteDraft(draftId) {
    return this.storageService.deleteDraft(draftId);
  }

  // Get currency methods (delegated to CurrencyService)
  getCurrencies() {
    return this.currencyService.getCurrencies();
  }

  formatAmount(amount, currencyCode) {
    return this.currencyService.formatAmount(amount, currencyCode);
  }

  getCurrencySymbol(currencyCode) {
    return this.currencyService.getCurrencySymbol(currencyCode);
  }

  // Get PDF themes
  getThemes() {
    return this.pdfService.getThemes();
  }
}

export default new InvoiceService();
