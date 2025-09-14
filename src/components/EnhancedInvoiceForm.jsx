import React, { useState, useEffect } from 'react';
import { InvoiceService, ValidationService, StorageService, CurrencyService } from '../services';
import { ThemeSelector } from './ThemeSelector';
import './EnhancedInvoiceForm.css';

const EnhancedInvoiceForm = ({ 
  invoice, 
  setInvoice, 
  onGenerate, 
  validationErrors, 
  hasFieldError, 
  getFieldError,
  subscriptionInfo 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [clientTemplates, setClientTemplates] = useState([]);
  const [showClientTemplates, setShowClientTemplates] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('minimalist');
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  const currencies = CurrencyService.getCurrencies();
  const themes = InvoiceService.getThemes();

  const steps = [
    { id: 1, title: 'Business Info', icon: '🏢' },
    { id: 2, title: 'Client Details', icon: '👤' },
    { id: 3, title: 'Invoice Items', icon: '📝' },
    { id: 4, title: 'Summary & Generate', icon: '✨' }
  ];

  useEffect(() => {
    loadClientTemplates();
    if (autoSave) {
      const interval = setInterval(autoSaveInvoice, 30000); // Auto-save every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoSave, invoice]);

  const loadClientTemplates = () => {
    const templates = StorageService.getClientTemplates();
    setClientTemplates(templates);
  };

  const autoSaveInvoice = () => {
    if (invoice.businessName || invoice.clientName || invoice.items.some(item => item.description)) {
      StorageService.saveDraft(invoice, 'invoice');
      setLastSaved(new Date());
    }
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => 
      sum + (item.quantity || 0) * (item.price || 0), 0
    );
    const taxAmount = subtotal * (invoice.tax || 0) / 100;
    const discountAmount = subtotal * (invoice.discount || 0) / 100;
    const grandTotal = subtotal + taxAmount - discountAmount;

    return { subtotal, taxAmount, discountAmount, grandTotal };
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const items = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items });
  };

  const duplicateItem = (index) => {
    const item = { ...invoice.items[index] };
    const items = [...invoice.items];
    items.splice(index + 1, 0, item);
    setInvoice({ ...invoice, items });
  };

  const loadClientTemplate = (template) => {
    setInvoice({
      ...invoice,
      clientName: template.clientName,
      clientDetails: template.clientDetails
    });
    setShowClientTemplates(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return invoice.businessName.trim() !== '';
      case 2:
        return invoice.clientName.trim() !== '';
      case 3:
        return invoice.items.some(item => item.description.trim() !== '' && item.quantity > 0 && item.price > 0);
      default:
        return true;
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div 
          key={step.id}
          className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
          onClick={() => goToStep(step.id)}
        >
          <div className="step-number">
            {currentStep > step.id ? '✓' : step.icon}
          </div>
          <div className="step-title">{step.title}</div>
          {index < steps.length - 1 && <div className="step-connector"></div>}
        </div>
      ))}
    </div>
  );

  const renderBusinessInfoStep = () => (
    <div className="form-step">
      <div className="step-header">
        <h3 className="step-title">Business Information</h3>
        <p className="step-subtitle">Add your business details and branding</p>
      </div>

      <div className="form-grid">
        <div className={`form-field ${hasFieldError('businessName') ? 'has-error' : ''}`}>
          <label className="field-label required">Business Name</label>
          <input 
            type="text" 
            placeholder="Enter your business name" 
            value={invoice.businessName} 
            onChange={e => setInvoice({ ...invoice, businessName: e.target.value })} 
            className="form-input"
          />
          {hasFieldError('businessName') && (
            <div className="error-message">{getFieldError('businessName')}</div>
          )}
        </div>
        
        <div className="form-field">
          <label className="field-label">Business Contact</label>
          <textarea 
            placeholder="Email, phone, address" 
            value={invoice.businessContact} 
            onChange={e => setInvoice({ ...invoice, businessContact: e.target.value })} 
            className="form-input"
            rows="3"
          />
        </div>
      </div>

      <div className="logo-upload-section">
        <label className="field-label">Business Logo</label>
        <div className="logo-upload-container">
          {invoice.businessLogo ? (
            <div className="logo-preview">
              <img src={invoice.businessLogo} alt="Business Logo" className="logo-preview-image" />
              <div className="logo-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => document.getElementById('logo-input').click()}
                >
                  📷 Change Logo
                </button>
                <button
                  type="button"
                  className="btn btn-error"
                  onClick={() => setInvoice({ ...invoice, businessLogo: '' })}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              className="logo-upload-area"
              onClick={() => document.getElementById('logo-input').click()}
            >
              <div className="upload-icon">🏢</div>
              <div className="upload-text">
                <strong>Upload Business Logo</strong>
                <p>Drag & drop or click to select</p>
              </div>
            </div>
          )}
          <input
            id="logo-input"
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = ev => setInvoice({ ...invoice, businessLogo: ev.target.result });
                reader.readAsDataURL(file);
              }
            }}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="field-label">Currency</label>
          <select 
            value={invoice.currency} 
            onChange={e => setInvoice({ ...invoice, currency: e.target.value })} 
            className="form-input"
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="field-label">Theme</label>
          <ThemeSelector
            selectedTheme={selectedTheme}
            onThemeChange={setSelectedTheme}
            themes={themes}
          />
        </div>
      </div>
    </div>
  );

  const renderClientDetailsStep = () => (
    <div className="form-step">
      <div className="step-header">
        <h3 className="step-title">Client Information</h3>
        <p className="step-subtitle">Add details about who you're invoicing</p>
      </div>

      <div className="client-templates-section">
        <div className="templates-header">
          <h4>Quick Select</h4>
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowClientTemplates(!showClientTemplates)}
          >
            📋 Saved Clients ({clientTemplates.length})
          </button>
        </div>
        
        {showClientTemplates && (
          <div className="templates-grid">
            {clientTemplates.map(template => (
              <div 
                key={template.id} 
                className="template-card"
                onClick={() => loadClientTemplate(template)}
              >
                <div className="template-name">{template.name}</div>
                <div className="template-client">{template.clientName}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-grid">
        <div className={`form-field ${hasFieldError('clientName') ? 'has-error' : ''}`}>
          <label className="field-label required">Client Name</label>
          <input
            type="text"
            placeholder="Enter client or company name"
            value={invoice.clientName}
            onChange={e => setInvoice({ ...invoice, clientName: e.target.value })}
            className="form-input"
          />
          {hasFieldError('clientName') && (
            <div className="error-message">{getFieldError('clientName')}</div>
          )}
        </div>

        <div className="form-field">
          <label className="field-label">Client Details</label>
          <textarea
            placeholder="Address, phone, email, contact person..."
            value={invoice.clientDetails}
            onChange={e => setInvoice({ ...invoice, clientDetails: e.target.value })}
            className="form-input"
            rows="4"
          />
        </div>
      </div>

      <div className="form-grid">
        <div className={`form-field ${hasFieldError('invoiceNumber') ? 'has-error' : ''}`}>
          <label className="field-label required">Invoice Number</label>
          <div className="input-with-action">
            <input
              type="text"
              placeholder="INV-001"
              value={invoice.invoiceNumber}
              onChange={e => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
              className="form-input"
            />
            <button
              type="button"
              onClick={() => setInvoice({ ...invoice, invoiceNumber: InvoiceService.generateInvoiceNumber() })}
              className="btn btn-secondary btn-sm"
              title="Generate New Number"
            >
              🔄
            </button>
          </div>
          {hasFieldError('invoiceNumber') && (
            <div className="error-message">{getFieldError('invoiceNumber')}</div>
          )}
        </div>

        <div className="form-field">
          <label className="field-label required">Invoice Date</label>
          <input
            type="date"
            value={invoice.date}
            onChange={e => setInvoice({ ...invoice, date: e.target.value })}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-field">
        <label className="field-label">Due Date</label>
        <input
          type="date"
          value={invoice.dueDate}
          onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })}
          className="form-input"
        />
      </div>
    </div>
  );

  const renderInvoiceItemsStep = () => {
    const totals = calculateTotals();

    return (
      <div className="form-step">
        <div className="step-header">
          <h3 className="step-title">Invoice Items</h3>
          <p className="step-subtitle">Add products or services</p>
        </div>

        <div className="items-section">
          <div className="items-header">
            <h4>Items & Services</h4>
            <button 
              type="button" 
              onClick={addItem} 
              className="btn btn-primary btn-sm"
            >
              ➕ Add Item
            </button>
          </div>

          <div className="items-list">
            {invoice.items.map((item, index) => (
              <div key={index} className="item-card">
                <div className="item-header">
                  <span className="item-number">#{index + 1}</span>
                  <div className="item-actions">
                    <button
                      type="button"
                      onClick={() => duplicateItem(index)}
                      className="btn btn-ghost btn-sm"
                      title="Duplicate Item"
                    >
                      📋
                    </button>
                    {invoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="btn btn-error btn-sm"
                        title="Remove Item"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <div className="item-fields">
                  <div className={`form-field ${hasFieldError(`item_${index}_description`) ? 'has-error' : ''}`}>
                    <label className="field-label required">Description</label>
                    <input
                      type="text"
                      placeholder="Product or service description"
                      value={item.description}
                      onChange={e => {
                        const items = [...invoice.items];
                        items[index].description = e.target.value;
                        setInvoice({ ...invoice, items });
                      }}
                      className="form-input"
                    />
                    {hasFieldError(`item_${index}_description`) && (
                      <div className="error-message">{getFieldError(`item_${index}_description`)}</div>
                    )}
                  </div>

                  <div className="item-row">
                    <div className={`form-field ${hasFieldError(`item_${index}_quantity`) ? 'has-error' : ''}`}>
                      <label className="field-label required">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={e => {
                          const items = [...invoice.items];
                          items[index].quantity = Number(e.target.value) || 1;
                          setInvoice({ ...invoice, items });
                        }}
                        className="form-input"
                      />
                      {hasFieldError(`item_${index}_quantity`) && (
                        <div className="error-message">{getFieldError(`item_${index}_quantity`)}</div>
                      )}
                    </div>

                    <div className={`form-field ${hasFieldError(`item_${index}_price`) ? 'has-error' : ''}`}>
                      <label className="field-label required">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={item.price === 0 ? '' : item.price}
                        onChange={e => {
                          const items = [...invoice.items];
                          items[index].price = Number(e.target.value) || 0;
                          setInvoice({ ...invoice, items });
                        }}
                        className="form-input"
                      />
                      {hasFieldError(`item_${index}_price`) && (
                        <div className="error-message">{getFieldError(`item_${index}_price`)}</div>
                      )}
                    </div>

                    <div className="item-total">
                      <label className="field-label">Total</label>
                      <div className="total-display">
                        {CurrencyService.formatAmount((item.quantity || 0) * (item.price || 0), invoice.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isAdvancedMode && (
            <div className="advanced-options">
              <h4>Advanced Options</h4>
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">Tax (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                    value={invoice.tax === '' ? '' : invoice.tax}
                    onChange={e => setInvoice({ ...invoice, tax: Number(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                    value={invoice.discount === '' ? '' : invoice.discount}
                    onChange={e => setInvoice({ ...invoice, discount: Number(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Payment Terms</label>
                <textarea
                  placeholder="e.g., Net 30, Due on receipt..."
                  value={invoice.paymentTerms}
                  onChange={e => setInvoice({ ...invoice, paymentTerms: e.target.value })}
                  className="form-input"
                  rows="2"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Notes</label>
                <textarea
                  placeholder="Additional notes or terms..."
                  value={invoice.notes}
                  onChange={e => setInvoice({ ...invoice, notes: e.target.value })}
                  className="form-input"
                  rows="3"
                />
              </div>
            </div>
          )}

          <div className="totals-summary">
            <div className="totals-card">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{CurrencyService.formatAmount(totals.subtotal, invoice.currency)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="total-row">
                  <span>Tax ({invoice.tax}%):</span>
                  <span>{CurrencyService.formatAmount(totals.taxAmount, invoice.currency)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="total-row discount">
                  <span>Discount ({invoice.discount}%):</span>
                  <span>-{CurrencyService.formatAmount(totals.discountAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="total-row grand-total">
                <span>Grand Total:</span>
                <span>{CurrencyService.formatAmount(totals.grandTotal, invoice.currency)}</span>
              </div>
            </div>
          </div>

          <div className="advanced-toggle">
            <button
              type="button"
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              className="btn btn-ghost"
            >
              {isAdvancedMode ? '➖ Hide' : '➕ Show'} Advanced Options
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSummaryStep = () => {
    const totals = calculateTotals();

    return (
      <div className="form-step">
        <div className="step-header">
          <h3 className="step-title">Review & Generate</h3>
          <p className="step-subtitle">Review your invoice and generate PDF</p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h4>Business Information</h4>
            <div className="summary-content">
              <div className="summary-row">
                <strong>{invoice.businessName}</strong>
              </div>
              <div className="summary-row">{invoice.businessContact}</div>
            </div>
          </div>

          <div className="summary-card">
            <h4>Client Information</h4>
            <div className="summary-content">
              <div className="summary-row">
                <strong>{invoice.clientName}</strong>
              </div>
              <div className="summary-row">{invoice.clientDetails}</div>
            </div>
          </div>

          <div className="summary-card">
            <h4>Invoice Details</h4>
            <div className="summary-content">
              <div className="summary-row">
                <span>Invoice #:</span>
                <span>{invoice.invoiceNumber}</span>
              </div>
              <div className="summary-row">
                <span>Date:</span>
                <span>{invoice.date}</span>
              </div>
              {invoice.dueDate && (
                <div className="summary-row">
                  <span>Due Date:</span>
                  <span>{invoice.dueDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-card">
            <h4>Total Amount</h4>
            <div className="summary-content">
              <div className="summary-row grand-total">
                <span>Grand Total:</span>
                <span>{CurrencyService.formatAmount(totals.grandTotal, invoice.currency)}</span>
              </div>
              <div className="summary-row">
                <span>Items:</span>
                <span>{invoice.items.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="generation-options">
          <div className="options-header">
            <h4>Generation Options</h4>
          </div>

          <div className="options-grid">
            <div className="option-card">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={isDraftMode}
                  onChange={e => setIsDraftMode(e.target.checked)}
                />
                <span className="checkmark"></span>
                <div className="option-content">
                  <strong>Generate as Draft</strong>
                  <p>Adds watermark for review purposes</p>
                </div>
              </label>
            </div>

            <div className="option-card">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={e => setAutoSave(e.target.checked)}
                />
                <span className="checkmark"></span>
                <div className="option-content">
                  <strong>Auto-save Progress</strong>
                  <p>Automatically save as you work</p>
                </div>
              </label>
            </div>
          </div>

          {lastSaved && (
            <div className="auto-save-status">
              <span className="save-icon">💾</span>
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="enhanced-invoice-form">
      {renderStepIndicator()}
      
      <div className="form-container">
        {currentStep === 1 && renderBusinessInfoStep()}
        {currentStep === 2 && renderClientDetailsStep()}
        {currentStep === 3 && renderInvoiceItemsStep()}
        {currentStep === 4 && renderSummaryStep()}
        
        <div className="form-navigation">
          <div className="nav-left">
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={prevStep}
                className="btn btn-secondary"
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div className="nav-center">
            <div className="progress-indicator">
              Step {currentStep} of {steps.length}
            </div>
          </div>
          
          <div className="nav-right">
            {currentStep < steps.length ? (
              <button 
                type="button" 
                onClick={nextStep}
                className="btn btn-primary"
                disabled={!canProceedToNext()}
              >
                Next →
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => onGenerate(selectedTheme, isDraftMode)}
                className="btn btn-success btn-lg"
                disabled={subscriptionInfo.plan === 'free' && subscriptionInfo.usage.invoice >= subscriptionInfo.limits.invoice}
              >
                🚀 Generate Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInvoiceForm;
