export class StorageService {
  
  // Client Templates Management
  saveClientTemplate(template) {
    try {
      const existingTemplates = this.getClientTemplates();
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem('clientTemplates', JSON.stringify(updatedTemplates));
      return newTemplate;
    } catch (error) {
      console.error('Failed to save client template:', error);
      throw new Error('Failed to save template');
    }
  }

  getClientTemplates() {
    try {
      const templates = localStorage.getItem('clientTemplates');
      return templates ? JSON.parse(templates) : [];
    } catch (error) {
      console.error('Failed to load client templates:', error);
      return [];
    }
  }

  deleteClientTemplate(templateId) {
    try {
      const existingTemplates = this.getClientTemplates();
      const updatedTemplates = existingTemplates.filter(template => template.id !== templateId);
      localStorage.setItem('clientTemplates', JSON.stringify(updatedTemplates));
      return updatedTemplates;
    } catch (error) {
      console.error('Failed to delete client template:', error);
      throw new Error('Failed to delete template');
    }
  }

  // Draft Management
  saveDraft(data, type) {
    try {
      const existingDrafts = this.getDrafts();
      const draft = {
        draftId: Date.now().toString(),
        type: type,
        title: type === 'invoice' 
          ? `Invoice ${data.invoiceNumber || 'Draft'}` 
          : `Receipt ${data.receiptNumber || 'Draft'}`,
        clientName: data.clientName,
        amount: type === 'invoice' 
          ? this.calculateSubtotal(data.items || [])
          : data.amount || 0,
        currency: data.currency || 'USD',
        savedAt: new Date().toISOString(),
        ...data
      };
      
      const updatedDrafts = [...existingDrafts, draft];
      localStorage.setItem('invoiceDrafts', JSON.stringify(updatedDrafts));
      return draft;
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw new Error('Failed to save draft');
    }
  }

  getDrafts() {
    try {
      const drafts = localStorage.getItem('invoiceDrafts');
      return drafts ? JSON.parse(drafts) : [];
    } catch (error) {
      console.error('Failed to load drafts:', error);
      return [];
    }
  }

  deleteDraft(draftId) {
    try {
      const existingDrafts = this.getDrafts();
      const updatedDrafts = existingDrafts.filter(draft => draft.draftId !== draftId);
      localStorage.setItem('invoiceDrafts', JSON.stringify(updatedDrafts));
      return updatedDrafts;
    } catch (error) {
      console.error('Failed to delete draft:', error);
      throw new Error('Failed to delete draft');
    }
  }

  // History Management
  addToHistory(data, type, filename) {
    try {
      const existingHistory = this.getHistory();
      const historyItem = {
        id: Date.now().toString(),
        type: type,
        filename: filename,
        clientName: data.clientName,
        amount: type === 'invoice' 
          ? this.calculateSubtotal(data.items || [])
          : data.amount || 0,
        currency: data.currency || 'USD',
        createdAt: new Date().toISOString(),
        data: data
      };
      
      const updatedHistory = [...existingHistory, historyItem];
      localStorage.setItem('invoiceHistory', JSON.stringify(updatedHistory));
      return historyItem;
    } catch (error) {
      console.error('Failed to add to history:', error);
      throw new Error('Failed to save to history');
    }
  }

  getHistory() {
    try {
      const history = localStorage.getItem('invoiceHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  // Helper method to calculate subtotal
  calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
  }

  // Clear all data (useful for reset functionality)
  clearAllData() {
    try {
      localStorage.removeItem('clientTemplates');
      localStorage.removeItem('invoiceDrafts');
      localStorage.removeItem('invoiceHistory');
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }

  // Export data for backup
  exportData() {
    try {
      return {
        clientTemplates: this.getClientTemplates(),
        drafts: this.getDrafts(),
        history: this.getHistory(),
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  }

  // Import data from backup
  importData(data) {
    try {
      if (data.clientTemplates) {
        localStorage.setItem('clientTemplates', JSON.stringify(data.clientTemplates));
      }
      if (data.drafts) {
        localStorage.setItem('invoiceDrafts', JSON.stringify(data.drafts));
      }
      if (data.history) {
        localStorage.setItem('invoiceHistory', JSON.stringify(data.history));
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Failed to import data');
    }
  }
}

export default new StorageService();
