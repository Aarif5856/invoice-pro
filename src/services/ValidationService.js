export class ValidationService {
  
  // Validate invoice data
  validateInvoice(invoiceData) {
    const errors = {};
    
    if (!invoiceData.businessName?.trim()) {
      errors.businessName = 'Business name is required';
    }
    
    if (!invoiceData.clientName?.trim()) {
      errors.clientName = 'Client name is required';
    }
    
    if (!invoiceData.invoiceNumber?.trim()) {
      errors.invoiceNumber = 'Invoice number is required';
    }
    
    if (!invoiceData.date) {
      errors.date = 'Invoice date is required';
    }
    
    // Validate items
    invoiceData.items.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors[`item_${index}_description`] = 'Item description is required';
      }
      
      if (!item.quantity || item.quantity <= 0) {
        errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      
      if (!item.price || item.price <= 0) {
        errors[`item_${index}_price`] = 'Price must be greater than 0';
      }
    });
    
    // Tax and discount validation
    if (invoiceData.tax < 0 || invoiceData.tax > 100) {
      errors.tax = 'Tax must be between 0 and 100';
    }
    
    if (invoiceData.discount < 0 || invoiceData.discount > 100) {
      errors.discount = 'Discount must be between 0 and 100';
    }
    
    return errors;
  }

  // Validate receipt data
  validateReceipt(receiptData) {
    const errors = {};
    
    if (!receiptData.businessName?.trim()) {
      errors.businessName = 'Business name is required';
    }
    
    if (!receiptData.clientName?.trim()) {
      errors.clientName = 'Client name is required';
    }
    
    if (!receiptData.receiptNumber?.trim()) {
      errors.receiptNumber = 'Receipt number is required';
    }
    
    if (!receiptData.date) {
      errors.date = 'Receipt date is required';
    }
    
    if (!receiptData.amount || receiptData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    // Tax and discount validation
    if (receiptData.tax < 0 || receiptData.tax > 100) {
      errors.tax = 'Tax must be between 0 and 100';
    }
    
    if (receiptData.discount < 0 || receiptData.discount > 100) {
      errors.discount = 'Discount must be between 0 and 100';
    }
    
    return errors;
  }

  // Helper methods for validation state
  getFieldError(validationErrors, fieldName) {
    return validationErrors[fieldName];
  }

  hasFieldError(validationErrors, showValidation, fieldName) {
    return showValidation && validationErrors[fieldName];
  }

  // Scroll to first error field
  scrollToFirstError(errors) {
    const firstErrorField = Object.keys(errors)[0];
    const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      errorElement.focus();
    }
  }
}

export default new ValidationService();
