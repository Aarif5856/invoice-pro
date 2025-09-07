import React, { useState } from 'react';
import './App-modern.css';
import './styles/neon-effects.css';
import Auth from './Auth';
import LandingHero from './components/LandingHero';
import { FreePlanLimitWarning } from './components/FreePlanLimitWarning';
import { ThemeSelector } from './components/ThemeSelector';
import { NeonThemeProvider, NeonControls } from './contexts/NeonThemeContext';
import { 
  NeonFloatingParticles, 
  NeonMatrixRain, 
  NeonBackgroundOrbs, 
  NeonSoundToggle 
} from './components/NeonEffects';
import { 
  InvoiceService, 
  ValidationService, 
  StorageService, 
  CurrencyService,
  FirebaseService,
  AnalyticsService,
  PayoneerService
} from './services';
import { SubscriptionService } from './services/SubscriptionService';

// Helper functions now delegated to services
const getCurrentDate = () => InvoiceService.getCurrentDate();
const getCurrentDateTime = () => InvoiceService.getCurrentDateTime();
const generateInvoiceNumber = () => InvoiceService.generateInvoiceNumber();
const generateReceiptNumber = () => InvoiceService.generateReceiptNumber();

// Initial templates now use service methods
const initialInvoice = InvoiceService.createInitialInvoice();
const initialReceipt = InvoiceService.createInitialReceipt();

function App() {
  const [formType, setFormType] = useState('invoice');
  const [invoice, setInvoice] = useState(initialInvoice);
  const [receipt, setReceipt] = useState(initialReceipt);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start with false, require manual login
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout state
  const [user, setUser] = useState(null); // Store user data from authentication
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  
  // Client templates functionality
  const [clientTemplates, setClientTemplates] = useState([]);
  const [showClientTemplates, setShowClientTemplates] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  // Advanced features state
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'invoice', 'receipt', 'draft'
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  
  // Theme and styling options
  const [selectedTheme, setSelectedTheme] = useState('minimalist');
  const [isDraftMode, setIsDraftMode] = useState(false);

  // Get data from services
  const currencies = CurrencyService.getCurrencies();
  const themes = InvoiceService.getThemes();
  
  // Get subscription info for UI display
  const [subscriptionInfo, setSubscriptionInfo] = useState(() => SubscriptionService.getSubscriptionInfo());
  const [showPlans, setShowPlans] = useState(false); // toggle plan selection UI
  const [planMessage, setPlanMessage] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState({});
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null); // track which plan is selected for payment
  const [showFreePlanWarning, setShowFreePlanWarning] = useState(false); // Free plan warning modal
  
  // Update subscription info when usage changes
  const updateSubscriptionInfo = () => {
    setSubscriptionInfo(SubscriptionService.getSubscriptionInfo());
  };

  const handleUpgrade = (plan) => {
    try {
      if (plan === subscriptionInfo.plan) return; // no change
      
      // For free plan, allow immediate switch
      if (plan === 'free') {
        const userDataRaw = localStorage.getItem('userData') || '{}';
        const userData = JSON.parse(userDataRaw);
        userData.plan = plan;
        userData.planChangedAt = new Date().toISOString();
        localStorage.setItem('userData', JSON.stringify(userData));
        updateSubscriptionInfo();
        setPlanMessage(`Plan updated to ${plan.toUpperCase()} successfully.`);
        AnalyticsService.planUpgradeSuccess(plan, subscriptionInfo.plan);
        return;
      }
      
      // For paid plans, show payment processing message
      setPlanMessage(`Select your preferred payment method for ${plan.toUpperCase()} plan:`);
      setSelectedPlanForPayment(plan); // Set the plan for payment selection
      AnalyticsService.planUpgradeSuccess(plan, subscriptionInfo.plan);
    } catch (e) {
      setPlanMessage('Failed to update plan.');
    }
  };

  const handlePaymentSuccess = (plan, subscriptionInfo) => {
    updateSubscriptionInfo();
    setPlanMessage(`🎉 Successfully upgraded to ${plan.toUpperCase()} plan! Welcome to unlimited features.`);
    setPaymentProcessing(prev => ({ ...prev, [plan]: false }));
    setSelectedPlanForPayment(null); // Reset payment selection
    PayoneerService.trackPaymentEvent('success', plan);
  };

  const handlePaymentError = (plan, error) => {
    setPlanMessage(`❌ Payment failed for ${plan.toUpperCase()} plan. Please try again.`);
    setPaymentProcessing(prev => ({ ...prev, [plan]: false }));
    PayoneerService.trackPaymentEvent('error', plan, error);
  };

  const handlePaymentCancel = (plan) => {
    setPlanMessage(`Payment cancelled for ${plan.toUpperCase()} plan.`);
    setPaymentProcessing(prev => ({ ...prev, [plan]: false }));
    setSelectedPlanForPayment(null); // Reset payment selection
    PayoneerService.trackPaymentEvent('cancel', plan);
  };  // Validation functions delegated to ValidationService
  const validateInvoice = (invoiceData) => ValidationService.validateInvoice(invoiceData);
  const validateReceipt = (receiptData) => ValidationService.validateReceipt(receiptData);
  const getFieldError = (fieldName) => ValidationService.getFieldError(validationErrors, fieldName);
  const hasFieldError = (fieldName) => ValidationService.hasFieldError(validationErrors, showValidation, fieldName);

  // Currency helper functions delegated to CurrencyService
  const getCurrencySymbol = (currencyCode) => CurrencyService.getCurrencySymbol(currencyCode);
  const formatAmount = (amount, currencyCode = 'USD') => CurrencyService.formatAmount(amount, currencyCode);

  // Draft management functions delegated to StorageService
  const saveDraft = async (data, type) => {
    try {
      const draft = StorageService.saveDraft(data, type);
      setSavedDrafts(StorageService.getDrafts());
      setUploadMessage('💾 Draft saved successfully!');
      setTimeout(() => setUploadMessage(''), 3000);
      return draft;
    } catch (error) {
      console.error('Error saving draft:', error);
      setUploadMessage('❌ Error saving draft');
    }
  };

  const loadDraft = (draftData) => {
    if (draftData.type === 'invoice') {
      setInvoice({ ...draftData, isDraft: false });
      setFormType('invoice');
    } else {
      setReceipt({ ...draftData, isDraft: false });
      setFormType('receipt');
    }
    setUploadMessage('💾 Draft loaded successfully!');
    setTimeout(() => setUploadMessage(''), 3000);
  };

  const deleteDraft = (draftId) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      StorageService.deleteDraft(draftId);
      setSavedDrafts(StorageService.getDrafts());
      setUploadMessage('💾 Draft deleted');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  // Invoice history management delegated to StorageService
  const addToHistory = (data, type, filename) => {
    StorageService.addToHistory(data, type, filename);
    setInvoiceHistory(StorageService.getHistory());
  };

  // Export functions delegated to InvoiceService
  const generateShareableLink = async (data, type) => {
    try {
      const link = await InvoiceService.generateShareableLink(data, type);
      setShareableLink(link);
      setUploadMessage('💾 Shareable link generated!');
      return link;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      setUploadMessage('❌ Error generating link');
    }
  };

  const copyShareableLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      setUploadMessage('💾 Link copied to clipboard!');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  const emailInvoice = (data, type) => {
    InvoiceService.emailDocument(data, type);
  };

  // Load saved data on component mount using StorageService
  React.useEffect(() => {
    // Load client templates
    setClientTemplates(StorageService.getClientTemplates());
    
    // Load drafts
    setSavedDrafts(StorageService.getDrafts());
    
    // Load history
    setInvoiceHistory(StorageService.getHistory());
  }, []);

  // Load client templates from localStorage on component mount
  React.useEffect(() => {
    const savedTemplates = localStorage.getItem('clientTemplates');
    if (savedTemplates) {
      setClientTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Client template functions delegated to StorageService
  const saveClientTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const currentData = formType === 'invoice' ? invoice : receipt;
    
    if (!currentData.clientName.trim()) {
      alert('Please enter client information before saving');
      return;
    }

    try {
      const template = {
        name: newTemplateName,
        clientName: currentData.clientName,
        clientDetails: currentData.clientDetails
      };

      StorageService.saveClientTemplate(template);
      setClientTemplates(StorageService.getClientTemplates());
      
      setNewTemplateName('');
      setShowSaveTemplate(false);
      alert('Client template saved successfully!');
    } catch (error) {
      alert('Failed to save template');
    }
  };

  const loadClientTemplate = (template) => {
    if (formType === 'invoice') {
      setInvoice(prev => ({
        ...prev,
        clientName: template.clientName,
        clientDetails: template.clientDetails
      }));
    } else {
      setReceipt(prev => ({
        ...prev,
        clientName: template.clientName,
        clientDetails: template.clientDetails
      }));
    }
    setShowClientTemplates(false);
  };

  const deleteClientTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      StorageService.deleteClientTemplate(templateId);
      setClientTemplates(StorageService.getClientTemplates());
    }
  };

  const handleLogout = async (event) => {
    console.log('🔓 LOGOUT PROCESS STARTED');
    console.log('Current isAuthenticated state:', isAuthenticated);
    
    // Prevent any default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Event prevented and propagation stopped');
    }
    
    // Set logout state to prevent Auth component from auto-authenticating
    console.log('Setting isLoggingOut to true');
    setIsLoggingOut(true);
    
    // Immediately set authentication to false
    console.log('Setting isAuthenticated to false');
    setIsAuthenticated(false);
    console.log('✅ isAuthenticated set to false');
    
    try {
      console.log('Calling FirebaseService.signOut()');
      await FirebaseService.signOut();
      console.log('✅ FirebaseService.signOut() completed successfully');
    } catch (error) {
      console.error('❌ Error during FirebaseService.signOut():', error);
      // Even if Firebase fails, keep user logged out
    }
    
    // Reset logout state after a brief delay
    setTimeout(() => {
      console.log('Resetting isLoggingOut to false');
      setIsLoggingOut(false);
      console.log('🏁 LOGOUT PROCESS COMPLETED');
    }, 500);
  };

  const subtotal = items => InvoiceService.calculateInvoiceTotals(items, 0, 0).subtotal;

  const generateAndUploadInvoice = async () => {
    AnalyticsService.docGenerationStart('invoice');
    setUploading(true);
    try {
      const result = await InvoiceService.generateInvoicePDF(invoice, selectedTheme, isDraftMode);
      setUploadMessage('✅ Professional invoice generated and downloaded successfully!');
      AnalyticsService.docGenerationSuccess('invoice', subscriptionInfo.plan);
      
      // Update state with latest data
      setSavedDrafts(StorageService.getDrafts());
      setInvoiceHistory(StorageService.getHistory());
      
      // Update subscription info to reflect new usage
      updateSubscriptionInfo();
      
    } catch (error) {
      if (error.message === 'Validation failed') {
        const errors = ValidationService.validateInvoice(invoice);
        setValidationErrors(errors);
        setShowValidation(true);
        setUploadMessage('❌ Please fix the validation errors before generating PDF');
        AnalyticsService.docGenerationError('invoice', 'validation');
        
        // Scroll to first error
        ValidationService.scrollToFirstError(errors);
      } else if (error.message.includes('limit reached')) {
        // Show free plan warning instead of just text message
        setShowFreePlanWarning(true);
        AnalyticsService.limitHit('invoice', subscriptionInfo.plan);
      } else {
        console.error('Invoice generation failed:', error);
        setUploadMessage('❌ Failed to generate invoice. Please try again.');
        AnalyticsService.docGenerationError('invoice', 'other');
      }
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMessage(''), 5000);
    }
  };

  const generateAndUploadReceipt = async () => {
    AnalyticsService.docGenerationStart('receipt');
    setUploading(true);
    try {
      const result = await InvoiceService.generateReceiptPDF(receipt, selectedTheme, isDraftMode);
      setUploadMessage('✅ Professional receipt generated and downloaded successfully!');
      AnalyticsService.docGenerationSuccess('receipt', subscriptionInfo.plan);
      
      // Update state with latest data
      setSavedDrafts(StorageService.getDrafts());
      setInvoiceHistory(StorageService.getHistory());
      
      // Update subscription info to reflect new usage
      updateSubscriptionInfo();
      
    } catch (error) {
      if (error.message === 'Validation failed') {
        const errors = ValidationService.validateReceipt(receipt);
        setValidationErrors(errors);
        setShowValidation(true);
        setUploadMessage('❌ Please fix the validation errors before generating PDF');
        AnalyticsService.docGenerationError('receipt', 'validation');
        
        // Scroll to first error
        ValidationService.scrollToFirstError(errors);
      } else if (error.message.includes('limit reached')) {
        // Show free plan warning instead of just text message
        setShowFreePlanWarning(true);
        AnalyticsService.limitHit('receipt', subscriptionInfo.plan);
      } else {
        console.error('Receipt generation failed:', error);
        setUploadMessage('❌ Failed to generate receipt. Please try again.');
        AnalyticsService.docGenerationError('receipt', 'other');
      }
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMessage(''), 5000);
    }
  };

  return (
    <NeonThemeProvider>
      <div className="container">
        <NeonControls />
        <NeonFloatingParticles />
        <NeonMatrixRain />
        <NeonBackgroundOrbs />
        <NeonSoundToggle />
        <header className="header">
          <h1>Invoice & Receipt Generator</h1>
          {isAuthenticated && (
            <button onClick={handleLogout} className="logout-header-btn">
              Sign Out
            </button>
          )}
        </header>

      {!isAuthenticated ? (
        <>
          <LandingHero />
          <main className="main-content">
            <Auth 
              onAuthChange={setIsAuthenticated} 
              onUserChange={setUser}
              isLoggingOut={isLoggingOut} 
            />
          </main>
        </>
      ) : (
        <>
          {/* Subscription Plan Status Section */}
          <div className="subscription-status-banner" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            margin: '0 20px 20px 20px',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div>
                <h3 style={{
                  margin: '0 0 5px 0',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  🆓 Free Plan - Monthly Usage
                </h3>
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  opacity: 0.9
                }}>
                  {subscriptionInfo.usage.invoice + subscriptionInfo.usage.receipt}/{subscriptionInfo.limits.totalDocuments} documents used this month
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center'
              }}>
                <div style={{
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  minWidth: '80px'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: subscriptionInfo.usage.invoice >= subscriptionInfo.limits.invoice ? '#ffeb3b' : '#fff'
                  }}>
                    {subscriptionInfo.usage.invoice}/{subscriptionInfo.limits.invoice}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Invoices</div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  minWidth: '80px'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: subscriptionInfo.usage.receipt >= subscriptionInfo.limits.receipt ? '#ffeb3b' : '#fff'
                  }}>
                    {subscriptionInfo.usage.receipt}/{subscriptionInfo.limits.receipt}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Receipts</div>
                </div>
                
                <button
                  className="upgrade-btn enhanced-upgrade"
                  onClick={() => { 
                    AnalyticsService.planUpgradeClick('view_plans', subscriptionInfo.plan); 
                    setShowPlans(!showPlans);
                  }}
                >
                  {subscriptionInfo.plan === 'free' ? (
                    <>
                      <span className="upgrade-icon">💎</span>
                      <span className="upgrade-text">Upgrade to Pro</span>
                      <span className="upgrade-price">$9.99/mo</span>
                    </>
                  ) : (
                    <>
                      <span className="upgrade-icon">🛠</span>
                      <span className="upgrade-text">Manage Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {(subscriptionInfo.usage.invoice >= subscriptionInfo.limits.invoice || 
              subscriptionInfo.usage.receipt >= subscriptionInfo.limits.receipt) && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: 'rgba(255,235,59,0.2)',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                ⚠️ You've reached your monthly limit for some document types. Upgrade to Pro for unlimited access!
              </div>
            )}
          </div>

          {showPlans && (
            <div style={{
              margin: '0 20px 25px 20px',
              background: '#ffffff',
              borderRadius: '18px',
              padding: '28px 24px 32px',
              boxShadow: '0 6px 28px rgba(0,0,0,0.08)',
              border: '1px solid #eef2f7'
            }}>
              <h3 style={{margin:'0 0 20px 0',fontSize:20,fontWeight:700,color:'#1f2735',textAlign:'center'}}>
                Choose Your Plan
              </h3>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap: '22px'}}>
                {/* FREE PLAN CARD */}
                <PlanCard
                  title="Free"
                  accent="#667eea"
                  current={subscriptionInfo.plan === 'free'}
                  priceText="$0"
                  bulletPoints={[
                    '3 Invoices / month',
                    '3 Receipts / month',
                    '1 Theme',
                    'Watermark on PDFs'
                  ]}
                  actionLabel={subscriptionInfo.plan === 'free' ? 'Current Plan' : 'Switch'}
                  disabled={subscriptionInfo.plan === 'free'}
                  onSelect={() => { AnalyticsService.planUpgradeClick('free', subscriptionInfo.plan); handleUpgrade('free'); }}
                  planKey="free"
                  showPayment={false}
                  user={user}
                  onCancelPayment={() => setSelectedPlanForPayment(null)}
                />
                {/* PRO PLAN CARD */}
                <PlanCard
                  title="Pro"
                  accent="#00A884"
                  highlight
                  current={subscriptionInfo.plan === 'pro'}
                  priceText="$9.99/mo"
                  bulletPoints={[
                    'Unlimited invoices & receipts',
                    'All themes',
                    'No watermark',
                    'Priority support'
                  ]}
                  actionLabel={subscriptionInfo.plan === 'pro' ? 'Current Plan' : (subscriptionInfo.plan === 'free' ? 'Upgrade' : 'Switch')}
                  disabled={subscriptionInfo.plan === 'pro'}
                  onSelect={() => { AnalyticsService.planUpgradeClick('pro', subscriptionInfo.plan); handleUpgrade('pro'); }}
                  planKey="pro"
                  showPayment={selectedPlanForPayment === 'pro'}
                  user={user}
                  onCancelPayment={() => setSelectedPlanForPayment(null)}
                />
                {/* BUSINESS PLAN CARD */}
                <PlanCard
                  title="Business"
                  accent="#8B5CF6"
                  current={subscriptionInfo.plan === 'business'}
                  priceText="$19.99/mo"
                  bulletPoints={[
                    'Everything in Pro',
                    'Multi-user access',
                    'API access',
                    'Custom branding'
                  ]}
                  actionLabel={subscriptionInfo.plan === 'business' ? 'Current Plan' : 'Upgrade'}
                  disabled={subscriptionInfo.plan === 'business'}
                  onSelect={() => { AnalyticsService.planUpgradeClick('business', subscriptionInfo.plan); handleUpgrade('business'); }}
                  planKey="business"
                  showPayment={selectedPlanForPayment === 'business'}
                  user={user}
                  onCancelPayment={() => setSelectedPlanForPayment(null)}
                />
              </div>
              {planMessage && (
                <div style={{marginTop:20,fontSize:14,fontWeight:500,color:'#1a1f29'}}>{planMessage}</div>
              )}
            </div>
          )}

          <nav className="nav">
            <button className={`nav-btn${formType === 'invoice' ? ' active' : ''}`} onClick={() => setFormType('invoice')}>Create Invoice</button>
            <button className={`nav-btn${formType === 'receipt' ? ' active' : ''}`} onClick={() => setFormType('receipt')}>Create Receipt</button>
            <button className={`nav-btn${formType === 'drafts' ? ' active' : ''}`} onClick={() => setFormType('drafts')}>
              💾 Drafts ({savedDrafts.length})
            </button>
            <button className={`nav-btn${formType === 'history' ? ' active' : ''}`} onClick={() => setFormType('history')}>
              📋 History ({invoiceHistory.length})
            </button>
          </nav>

          <main className="main-content">
            <section className="form-section">
              {formType === 'invoice' ? (
                <>
                  <h2>Create Invoice</h2>
                  
                  {/* Invoice form without problematic submit button */}
                  <div>
                    <div className={`form-field ${hasFieldError('businessName') ? 'has-error' : ''}`}>
                      <label className="field-label required" htmlFor="businessName">Business Name</label>
                      <input 
                        type="text" 
                        id="businessName"
                        placeholder="Enter your business name" 
                        value={invoice.businessName} 
                        onChange={e => setInvoice({ ...invoice, businessName: e.target.value })} 
                        className="form-input"
                        data-field="businessName"
                      />
                      {hasFieldError('businessName') && (
                        <div className="error-message">{getFieldError('businessName')}</div>
                      )}
                    </div>
                    
                    <div className="form-field">
                      <label className="field-label" htmlFor="businessContact">Business Contact Info</label>
                      <input 
                        type="text" 
                        id="businessContact"
                        placeholder="Email, phone, address" 
                        value={invoice.businessContact} 
                        onChange={e => setInvoice({ ...invoice, businessContact: e.target.value })} 
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="currency">Currency</label>
                      <select 
                        id="currency"
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
                      <ThemeSelector
                        selectedTheme={selectedTheme}
                        onThemeChange={setSelectedTheme}
                        themes={themes}
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        <input
                          type="checkbox"
                          checked={isDraftMode}
                          onChange={e => setIsDraftMode(e.target.checked)}
                          className="draft-checkbox"
                        />
                        📝 Generate as Draft (adds watermark)
                      </label>
                    </div>

                    <div className="logo-upload-section">
                      <label className="logo-upload-label">Business Logo</label>
                      <div className="logo-upload-container">
                        {invoice.businessLogo ? (
                          <div className="logo-preview">
                            <img src={invoice.businessLogo} alt="Business Logo" className="logo-preview-image" />
                            <div className="logo-actions">
                              <button
                                type="button"
                                className="change-logo-btn"
                                onClick={() => document.getElementById('logo-input-invoice').click()}
                              >
                                📷 Change Logo
                              </button>
                              <button
                                type="button"
                                className="remove-logo-btn"
                                onClick={() => setInvoice({ ...invoice, businessLogo: '' })}
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="logo-upload-area"
                            onClick={() => document.getElementById('logo-input-invoice').click()}
                          >
                            <div className="logo-upload-icon">🏢</div>
                            <div className="logo-upload-text">
                              <strong>Upload Business Logo</strong>
                              <p>Tap to select an image file</p>
                            </div>
                          </div>
                        )}
                        <input
                          id="logo-input-invoice"
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

                    <div className={`form-field ${hasFieldError('invoiceNumber') ? 'has-error' : ''}`}>
                      <label className="field-label required" htmlFor="invoiceNumber">Invoice Number</label>
                      <div className="number-generator">
                        <input
                          type="text"
                          id="invoiceNumber"
                          placeholder="Enter invoice number"
                          value={invoice.invoiceNumber}
                          onChange={e => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                          className="form-input"
                          data-field="invoiceNumber"
                        />
                        <button
                          type="button"
                          onClick={() => setInvoice({ ...invoice, invoiceNumber: generateInvoiceNumber() })}
                          className="add-btn"
                          title="Generate New Invoice Number"
                        >
                          🔄
                        </button>
                      </div>
                      {hasFieldError('invoiceNumber') && (
                        <div className="error-message">{getFieldError('invoiceNumber')}</div>
                      )}
                    </div>

                    <div className={`form-field ${hasFieldError('date') ? 'has-error' : ''}`}>
                      <label className="field-label required" htmlFor="date">Invoice Date</label>
                      <input
                        type="date"
                        id="date"
                        placeholder="Invoice Date"
                        value={invoice.date}
                        onChange={e => setInvoice({ ...invoice, date: e.target.value })}
                        className="form-input"
                        title="Invoice Date"
                        data-field="date"
                      />
                      {hasFieldError('date') && (
                        <div className="error-message">{getFieldError('date')}</div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="dueDate">Due Date</label>
                      <input
                        type="date"
                        id="dueDate"
                        placeholder="Due Date"
                        value={invoice.dueDate}
                        onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })}
                        className="form-input"
                        title="Due Date"
                      />
                    </div>

                    <div className={`form-field ${hasFieldError('clientName') ? 'has-error' : ''}`}>
                      <label className="field-label required" htmlFor="clientName">Client Name</label>
                      <input
                        type="text"
                        id="clientName"
                        placeholder="Enter client name"
                        value={invoice.clientName}
                        onChange={e => setInvoice({ ...invoice, clientName: e.target.value })}
                        className="form-input"
                        data-field="clientName"
                      />
                      {hasFieldError('clientName') && (
                        <div className="error-message">{getFieldError('clientName')}</div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="clientDetails">Client Details</label>
                      <textarea
                        id="clientDetails"
                        placeholder="Client address, phone, email, etc."
                        value={invoice.clientDetails}
                        onChange={e => setInvoice({ ...invoice, clientDetails: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    {/* Items Section */}
                    <div className="items-section">
                      <label className="field-label required">Items</label>
                      {invoice.items.map((item, idx) => (
                        <div key={idx} className="item-row">
                          <div className={`form-group ${hasFieldError(`item_${idx}_description`) ? 'has-error' : ''}`}>
                            <label className="field-label required">Description</label>
                            <input
                              type="text"
                              placeholder="Description"
                              value={item.description}
                              onChange={e => {
                                const items = [...invoice.items];
                                items[idx].description = e.target.value;
                                setInvoice({ ...invoice, items });
                              }}
                              className="form-input"
                              data-field={`item_${idx}_description`}
                            />
                            {hasFieldError(`item_${idx}_description`) && (
                              <div className="error-message">{getFieldError(`item_${idx}_description`)}</div>
                            )}
                          </div>

                          <div className={`form-group ${hasFieldError(`item_${idx}_quantity`) ? 'has-error' : ''}`}>
                            <label className="field-label required">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={e => {
                                const v = e.target.value;
                                const items = [...invoice.items];
                                items[idx].quantity = v === '' ? 0 : Number(v);
                                if (items[idx].quantity === 0) {
                                  items[idx].quantity = 1;
                                }
                                setInvoice({ ...invoice, items });
                              }}
                              className="form-input small"
                              data-field={`item_${idx}_quantity`}
                            />
                            {hasFieldError(`item_${idx}_quantity`) && (
                              <div className="error-message">{getFieldError(`item_${idx}_quantity`)}</div>
                            )}
                          </div>

                          <div className={`form-group ${hasFieldError(`item_${idx}_price`) ? 'has-error' : ''}`}>
                            <label className="field-label required">Price</label>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="Price"
                              value={item.price === 0 ? '' : item.price}
                              onChange={e => {
                                const v = e.target.value;
                                const items = [...invoice.items];
                                items[idx].price = v === '' ? 0 : Number(v);
                                setInvoice({ ...invoice, items });
                              }}
                              className="form-input small"
                              data-field={`item_${idx}_price`}
                            />
                            {hasFieldError(`item_${idx}_price`) && (
                              <div className="error-message">{getFieldError(`item_${idx}_price`)}</div>
                            )}
                          </div>

                          <button type="button" className="remove-btn" onClick={() => {
                            const items = invoice.items.filter((_, i) => i !== idx);
                            setInvoice({ ...invoice, items });
                          }}>Remove</button>
                        </div>
                      ))}
                      <button type="button" className="add-btn" onClick={() => setInvoice({ ...invoice, items: [...invoice.items, { description: '', quantity: 1, price: 0 }] })}>Add Item</button>
                    </div>

                    <div className={`form-field ${hasFieldError('tax') ? 'has-error' : ''}`}>
                      <label className="field-label" htmlFor="tax">Tax (%)</label>
                      <input
                        type="number"
                        id="tax"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Enter tax percentage"
                        value={invoice.tax === '' ? '' : invoice.tax}
                        onChange={e => {
                          const v = e.target.value;
                          setInvoice({ ...invoice, tax: v === '' ? '' : Number(v) });
                        }}
                        className="form-input"
                        data-field="tax"
                      />
                      {hasFieldError('tax') && (
                        <div className="error-message">{getFieldError('tax')}</div>
                      )}
                    </div>

                    <div className={`form-field ${hasFieldError('discount') ? 'has-error' : ''}`}>
                      <label className="field-label" htmlFor="discount">Discount (%)</label>
                      <input
                        type="number"
                        id="discount"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Enter discount percentage"
                        value={invoice.discount === '' ? '' : invoice.discount}
                        onChange={e => {
                          const v = e.target.value;
                          setInvoice({ ...invoice, discount: v === '' ? '' : Number(v) });
                        }}
                        className="form-input"
                        data-field="discount"
                      />
                      {hasFieldError('discount') && (
                        <div className="error-message">{getFieldError('discount')}</div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="paymentTerms">Payment Terms</label>
                      <textarea
                        id="paymentTerms"
                        placeholder="e.g., Net 30, Due on receipt, 2/10 Net 30"
                        value={invoice.paymentTerms}
                        onChange={e => setInvoice({ ...invoice, paymentTerms: e.target.value })}
                        className="form-input"
                        rows="2"
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="notes">Notes</label>
                      <textarea
                        id="notes"
                        placeholder="Additional notes or terms"
                        value={invoice.notes}
                        onChange={e => setInvoice({ ...invoice, notes: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    {/* Action buttons - removed problematic submit button */}
                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() => saveDraft(invoice, 'invoice')}
                        className="draft-btn"
                      >
                        💾 Save Draft
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowExportOptions(!showExportOptions)}
                        className="export-btn"
                      >
                        📤 Export Options
                      </button>
                    </div>

                    {showExportOptions && (
                      <div className="export-options">
                        <h4>Export Options</h4>
                        <div className="export-buttons">
                          <button
                            type="button"
                            onClick={() => emailInvoice(invoice, 'invoice')}
                            className="export-option-btn"
                          >
                            📧 Email Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => generateShareableLink(invoice, 'invoice')}
                            className="export-option-btn"
                          >
                            🔗 Generate Link
                          </button>
                          {shareableLink && (
                            <button
                              type="button"
                              onClick={copyShareableLink}
                              className="export-option-btn"
                            >
                              📋 Copy Link
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="preview-section">
                    <h3>Invoice Preview</h3>
                    <div className="preview-box">
                      <div className="preview-logo-section">
                        {invoice.businessLogo ? (
                          <img
                            src={invoice.businessLogo}
                            alt="Business Logo"
                            className="preview-logo"
                          />
                        ) : (
                          <div className="preview-logo-placeholder">
                            🏢 No Logo Uploaded
                          </div>
                        )}
                      </div>
                      <p><strong>{invoice.businessName}</strong></p>
                      <p>{invoice.businessContact}</p>
                      <hr />
                      <p><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
                      <p><strong>Date:</strong> {invoice.date}</p>
                      {invoice.dueDate && <p><strong>Due Date:</strong> {invoice.dueDate}</p>}
                      <p><strong>Client:</strong> {invoice.clientName}</p>
                      <p>{invoice.clientDetails}</p>

                      <table className="preview-table">
                        <thead>
                          <tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                          {invoice.items.map((item, idx) => (
                            <tr key={idx}><td>{item.description}</td><td>{item.quantity}</td><td>${(item.price || 0).toFixed(2)}</td><td>${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td></tr>
                          ))}
                        </tbody>
                      </table>

                      <p><strong>Subtotal:</strong> ${subtotal(invoice.items).toFixed(2)}</p>
                      <p><strong>Tax ({invoice.tax}%):</strong> ${(subtotal(invoice.items) * (invoice.tax || 0) / 100).toFixed(2)}</p>
                      <p><strong>Discount ({invoice.discount}%):</strong> -${(subtotal(invoice.items) * (invoice.discount || 0) / 100).toFixed(2)}</p>
                      <p><strong>Grand Total:</strong> ${(subtotal(invoice.items) + subtotal(invoice.items) * (invoice.tax || 0) / 100 - subtotal(invoice.items) * (invoice.discount || 0) / 100).toFixed(2)}</p>
                      <p><strong>Notes:</strong> {invoice.notes}</p>
                    </div>
                  </div>
                  
                  {/* Working Export & Save PDF Button */}
                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="export-btn"
                      tabIndex={0}
                      disabled={uploading || (subscriptionInfo.plan === 'free' && subscriptionInfo.usage.invoice >= subscriptionInfo.limits.invoice)}
                      onClick={generateAndUploadInvoice}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          generateAndUploadInvoice();
                        }
                      }}
                    >Export & Save PDF</button>
                    {uploadMessage && <div style={{ marginTop: 8, fontSize: 13 }}>{uploadMessage}</div>}
                  </div>
                </>
              ) : formType === 'receipt' ? (
                <>
                  <h2>Create Receipt</h2>
                  
                  {/* Receipt form without problematic submit button */}
                  <div>
                    <div className={`form-field ${hasFieldError('businessName') ? 'has-error' : ''}`}>
                      <label className="field-label required" htmlFor="receiptBusinessName">Business Name</label>
                      <input
                        type="text"
                        id="receiptBusinessName"
                        placeholder="Enter your business name"
                        value={receipt.businessName}
                        onChange={e => setReceipt({ ...receipt, businessName: e.target.value })}
                        className="form-input"
                        data-field="businessName"
                      />
                      {hasFieldError('businessName') && (
                        <div className="error-message">{getFieldError('businessName')}</div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="receiptBusinessContact">Business Contact Info</label>
                      <input
                        type="text"
                        id="receiptBusinessContact"
                        placeholder="Email, phone, address"
                        value={receipt.businessContact}
                        onChange={e => setReceipt({ ...receipt, businessContact: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="receiptCurrency">Currency</label>
                      <select
                        id="receiptCurrency"
                        value={receipt.currency}
                        onChange={e => setReceipt({ ...receipt, currency: e.target.value })}
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
                      <ThemeSelector
                        selectedTheme={selectedTheme}
                        onThemeChange={setSelectedTheme}
                        themes={themes}
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        <input
                          type="checkbox"
                          checked={isDraftMode}
                          onChange={e => setIsDraftMode(e.target.checked)}
                          className="draft-checkbox"
                        />
                        📝 Generate as Draft (adds watermark)
                      </label>
                    </div>

                    <div className={`form-field ${hasFieldError('amount') ? 'has-error' : ''}`}>
                      <label className="field-label required" htmlFor="receiptAmount">Amount</label>
                      <input
                        type="number"
                        id="receiptAmount"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter receipt amount"
                        value={receipt.amount === '' ? '' : receipt.amount}
                        onChange={e => {
                          const v = e.target.value;
                          setReceipt({ ...receipt, amount: v === '' ? '' : Number(v) });
                        }}
                        className="form-input"
                        data-field="amount"
                      />
                      {hasFieldError('amount') && (
                        <div className="error-message">{getFieldError('amount')}</div>
                      )}
                    </div>

                    {/* Action buttons - removed problematic submit button */}
                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() => saveDraft(receipt, 'receipt')}
                        className="draft-btn"
                      >
                        💾 Save Draft
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowExportOptions(!showExportOptions)}
                        className="export-btn"
                      >
                        📤 Export Options
                      </button>
                    </div>

                    {showExportOptions && (
                      <div className="export-options">
                        <h4>Export Options</h4>
                        <div className="export-buttons">
                          <button
                            type="button"
                            onClick={() => emailInvoice(receipt, 'receipt')}
                            className="export-option-btn"
                          >
                            📧 Email Receipt
                          </button>
                          <button
                            type="button"
                            onClick={() => generateShareableLink(receipt, 'receipt')}
                            className="export-option-btn"
                          >
                            🔗 Generate Link
                          </button>
                          {shareableLink && (
                            <button
                              type="button"
                              onClick={copyShareableLink}
                              className="export-option-btn"
                            >
                              📋 Copy Link
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="preview-section">
                    <h3>Receipt Preview</h3>
                    <div className="preview-box">
                      <p><strong>{receipt.businessName}</strong></p>
                      <p>{receipt.businessContact}</p>
                      <hr />
                      <p><strong>Receipt Number:</strong> {receipt.receiptNumber}</p>
                      <p><strong>Date:</strong> {receipt.date}</p>
                      <p><strong>Client:</strong> {receipt.clientName}</p>
                      <p>{receipt.clientDetails}</p>
                      <p><strong>Amount:</strong> ${(receipt.amount || 0).toFixed(2)}</p>
                      <p><strong>Notes:</strong> {receipt.notes}</p>
                    </div>
                  </div>
                  
                  {/* Working Export & Save PDF Button */}
                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="export-btn"
                      tabIndex={0}
                      disabled={uploading || (subscriptionInfo.plan === 'free' && subscriptionInfo.usage.receipt >= subscriptionInfo.limits.receipt)}
                      onClick={generateAndUploadReceipt}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          generateAndUploadReceipt();
                        }
                      }}
                    >Export & Save PDF</button>
                    {uploadMessage && <div style={{ marginTop: 8, fontSize: 13 }}>{uploadMessage}</div>}
                  </div>
                </>
              ) : formType === 'drafts' ? (
                <>
                  <h2>💾 Saved Drafts</h2>
                  <div className="drafts-section">
                    {savedDrafts.length === 0 ? (
                      <div className="empty-state">
                        <p>No drafts saved yet. Create an invoice or receipt and save as draft.</p>
                      </div>
                    ) : (
                      <div className="drafts-grid">
                        {savedDrafts.map(draft => (
                          <div key={draft.draftId} className="draft-card">
                            <div className="draft-header">
                              <h4>{draft.title}</h4>
                              <span className={`draft-type ${draft.type}`}>
                                {draft.type.toUpperCase()}
                              </span>
                            </div>
                            <div className="draft-details">
                              <p><strong>Client:</strong> {draft.clientName || 'N/A'}</p>
                              <p><strong>Amount:</strong> {formatAmount(
                                draft.type === 'invoice' ? 
                                  subtotal(draft.items || []) :
                                  draft.amount || 0,
                                draft.currency
                              )}</p>
                              <p><strong>Saved:</strong> {new Date(draft.savedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="draft-actions">
                              <button
                                onClick={() => loadDraft(draft)}
                                className="load-draft-btn"
                              >
                                📝 Load Draft
                              </button>
                              <button
                                onClick={() => deleteDraft(draft.draftId)}
                                className="delete-draft-btn"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : formType === 'history' ? (
                <>
                  <h2>📋 Invoice & Receipt History</h2>
                  <div className="history-section">
                    <div className="history-filters">
                      <label>Filter by type:</label>
                      <select
                        value={historyFilter}
                        onChange={e => setHistoryFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All Documents</option>
                        <option value="invoice">Invoices Only</option>
                        <option value="receipt">Receipts Only</option>
                      </select>
                    </div>

                    {invoiceHistory.length === 0 ? (
                      <div className="empty-state">
                        <p>No documents generated yet. Create and download your first invoice or receipt.</p>
                      </div>
                    ) : (
                      <div className="history-list">
                        {invoiceHistory
                          .filter(item => historyFilter === 'all' || item.type === historyFilter)
                          .map(item => (
                          <div key={item.id} className="history-item">
                            <div className="history-icon">
                              {item.type === 'invoice' ? '📄' : '🧾'}
                            </div>
                            <div className="history-details">
                              <h4>{item.filename}</h4>
                              <p><strong>Client:</strong> {item.clientName || 'N/A'}</p>
                              <p><strong>Amount:</strong> {formatAmount(item.amount, item.currency)}</p>
                              <p><strong>Generated:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="history-actions">
                              <button
                                onClick={() => {
                                  if (item.type === 'invoice') {
                                    setInvoice(item.data);
                                    setFormType('invoice');
                                  } else {
                                    setReceipt(item.data);
                                    setFormType('receipt');
                                  }
                                }}
                                className="view-btn"
                              >
                                👁️ View
                              </button>
                              <button
                                onClick={() => emailInvoice(item.data, item.type)}
                                className="email-btn"
                              >
                                📧 Email
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </section>
          </main>
        </>
      )}

      {/* Free Plan Limit Warning Modal */}
      {showFreePlanWarning && (
        <FreePlanLimitWarning
          currentUsage={{
            invoice: subscriptionInfo.usage.invoice,
            receipt: subscriptionInfo.usage.receipt
          }}
          limits={{
            invoice: subscriptionInfo.limits.invoice,
            receipt: subscriptionInfo.limits.receipt
          }}
          planType={subscriptionInfo.plan}
          onUpgrade={() => {
            setShowFreePlanWarning(false);
            setShowPlans(true);
          }}
        />
      )}

      <footer className="footer">
        <p>&copy; 2025 InvoicePro. All rights reserved.</p>
      </footer>
    </div>
    </NeonThemeProvider>
  );
}

export default App;

/* ========= Plan Card Component (inline for brevity) ========= */
function PlanCard({ title, accent, priceText, bulletPoints, actionLabel, onSelect, disabled, current, highlight, planKey, showPayment, user, onCancelPayment }) {
  const [paymentMethods, setPaymentMethods] = React.useState([]);
  const [selectedMethod, setSelectedMethod] = React.useState(null);
  const [showInstructions, setShowInstructions] = React.useState(false);
  const [paymentInstructions, setPaymentInstructions] = React.useState(null);
  
  React.useEffect(() => {
    if (showPayment && planKey !== 'free') {
      const methods = PayoneerService.getAvailablePaymentMethods();
      setPaymentMethods(methods);
    }
  }, [showPayment, planKey]);

  const handlePaymentMethodSelect = async (method) => {
    console.log('🔥 Payment method selected:', method);
    setSelectedMethod(method);
    
    try {
      // Get user email from Firebase auth or use a default
      const userEmail = user?.email || 'customer@example.com';
      console.log('📧 Using email:', userEmail);
      console.log('💰 Plan data:', { key: planKey, price: planKey === 'pro' ? 9.99 : 19.99 });
      
      const result = await PayoneerService.processPayment(
        method, 
        { key: planKey, price: planKey === 'pro' ? 9.99 : 19.99 },
        { email: userEmail }
      );
      
      console.log('✅ Payment processing result:', result);
      
      if (result.success) {
        console.log('📋 Setting payment instructions:', result.instructions);
        setPaymentInstructions(result.instructions);
        setShowInstructions(true);
        console.log('🎯 Instructions should now be visible');
        
        // Track payment event
        PayoneerService.trackPaymentEvent('payment_method_selected', planKey, method.id);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      alert(`Error processing payment: ${error.message}. Please try again.`);
    }
  };

  return (
    <div style={{
      flex: '1 1 260px',
      background: '#fff',
      borderRadius: '16px',
      padding: '22px 20px 26px',
      position: 'relative',
      boxShadow: highlight ? '0 10px 30px -6px rgba(102,126,234,0.35)' : '0 4px 18px rgba(0,0,0,0.07)',
      border: highlight ? `2px solid ${accent}` : '1px solid #e5e9f2',
      transform: highlight ? 'translateY(-4px)' : 'none'
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h4 style={{margin:0,fontSize:18,fontWeight:700,color:'#1f2735'}}>{title}</h4>
        {current && <span style={{background:accent,color:'#fff',padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>CURRENT</span>}
      </div>
      <div style={{margin:'10px 0 14px',fontSize:26,fontWeight:700,color:accent}}>{priceText}</div>
      <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:8,fontSize:13}}>
        {bulletPoints.map((pt,i)=>(
          <li key={i} style={{display:'flex',alignItems:'center',gap:6,color:'#2d3a4d'}}>
            <span style={{fontSize:14,color:accent}}>✔</span>
            <span>{pt}</span>
          </li>
        ))}
      </ul>
      
      {showPayment && planKey !== 'free' ? (
        <div style={{marginTop:18}}>
          {!showInstructions ? (
            <div>
              <h5 style={{margin:'0 0 10px',fontSize:14,fontWeight:600,color:'#1f2735'}}>Choose Payment Method:</h5>
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method)}
                  style={{
                    width:'100%',
                    margin:'4px 0',
                    padding:'8px 12px',
                    background: method.recommended ? accent : '#f8f9fa',
                    color: method.recommended ? '#fff' : '#333',
                    border: method.recommended ? 'none' : '1px solid #ddd',
                    borderRadius:8,
                    cursor:'pointer',
                    fontSize:12,
                    fontWeight:500,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'space-between'
                  }}
                >
                  <span>{method.icon} {method.name}</span>
                  {method.recommended && <span style={{fontSize:10}}>⭐</span>}
                </button>
              ))}
              <button
                onClick={onCancelPayment}
                style={{
                  width:'100%',
                  margin:'8px 0 0 0',
                  padding:'8px 12px',
                  background:'#f8f9fa',
                  color:'#666',
                  border:'1px solid #ddd',
                  borderRadius:8,
                  cursor:'pointer',
                  fontSize:12,
                  fontWeight:500
                }}
              >
                ← Cancel Payment
              </button>
            </div>
          ) : (
            <div style={{fontSize:12,lineHeight:1.4}}>
              <h5 style={{margin:'0 0 12px',fontSize:14,fontWeight:600,color:'#1f2735',borderBottom:'1px solid #eee',paddingBottom:8}}>
                {selectedMethod?.name} Payment Instructions
              </h5>
              
              {paymentInstructions?.referenceId && (
                <div style={{background:'#e8f4ff',padding:12,borderRadius:8,marginBottom:12,border:'1px solid #bee5eb'}}>
                  <strong style={{color:'#0066cc'}}>Reference ID:</strong> 
                  <span style={{fontFamily:'monospace',marginLeft:8,color:'#333'}}>{paymentInstructions.referenceId}</span>
                  <div style={{fontSize:10,color:'#666',marginTop:4}}>Save this reference ID for your records</div>
                </div>
              )}

              {paymentInstructions?.amount && (
                <div style={{background:'#fff3cd',padding:12,borderRadius:8,marginBottom:12,border:'1px solid #ffeaa7'}}>
                  <strong style={{color:'#856404'}}>Amount:</strong> 
                  <span style={{fontSize:16,fontWeight:'bold',marginLeft:8,color:'#856404'}}>
                    ${paymentInstructions.amount} {paymentInstructions.currency || 'USD'}
                  </span>
                </div>
              )}

              {paymentInstructions?.payoneerEmail && (
                <div style={{background:'#d4edda',padding:12,borderRadius:8,marginBottom:12,border:'1px solid #c3e6cb'}}>
                  <strong style={{color:'#155724'}}>Send to:</strong> 
                  <span style={{fontFamily:'monospace',marginLeft:8,color:'#155724'}}>{paymentInstructions.payoneerEmail}</span>
                </div>
              )}

              {paymentInstructions?.instructions && paymentInstructions.instructions.length > 0 && (
                <div style={{marginBottom:12}}>
                  <strong style={{display:'block',marginBottom:8,color:'#1f2735'}}>Instructions:</strong>
                  {paymentInstructions.instructions.map((instruction, i) => (
                    <div key={i} style={{
                      margin:'6px 0',
                      padding:'8px 12px',
                      background: i === 0 ? '#f8f9fa' : '#ffffff',
                      border:'1px solid #e9ecef',
                      borderRadius:6,
                      fontSize:11
                    }}>
                      <span style={{marginRight:8,color:accent}}>•</span>
                      {instruction}
                    </div>
                  ))}
                </div>
              )}

              {paymentInstructions?.activationTime && (
                <div style={{marginTop:12,padding:10,background:'#e8f5e8',borderRadius:6,fontSize:11,border:'1px solid #c3e6cb'}}>
                  <strong style={{color:'#155724'}}>⏱ Activation Time:</strong> 
                  <span style={{marginLeft:8,color:'#155724'}}>{paymentInstructions.activationTime}</span>
                </div>
              )}

              {paymentInstructions?.fees && (
                <div style={{marginTop:8,padding:10,background:'#fff3cd',borderRadius:6,fontSize:11,border:'1px solid #ffeaa7'}}>
                  <strong style={{color:'#856404'}}>💰 Fees:</strong> 
                  <span style={{marginLeft:8,color:'#856404'}}>{paymentInstructions.fees}</span>
                </div>
              )}

              <div style={{marginTop:16,display:'flex',gap:8}}>
                <button
                  onClick={() => {setShowInstructions(false); setSelectedMethod(null); setPaymentInstructions(null);}}
                  style={{
                    flex:1,
                    background:'#6c757d',
                    color:'#fff',
                    border:'none',
                    padding:'10px',
                    borderRadius:8,
                    cursor:'pointer',
                    fontSize:12,
                    fontWeight:500
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    const instructions = paymentInstructions?.instructions?.join('\n') || '';
                    const fullText = `Payment Instructions for ${selectedMethod?.name}\n\nReference ID: ${paymentInstructions?.referenceId}\nAmount: $${paymentInstructions?.amount} ${paymentInstructions?.currency || 'USD'}\n\n${instructions}`;
                    navigator.clipboard.writeText(fullText).then(() => alert('Instructions copied to clipboard!'));
                  }}
                  style={{
                    flex:1,
                    background:accent,
                    color:'#fff',
                    border:'none',
                    padding:'10px',
                    borderRadius:8,
                    cursor:'pointer',
                    fontSize:12,
                    fontWeight:500
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          disabled={disabled}
          onClick={onSelect}
          style={{
            marginTop:18,
            width:'100%',
            background: disabled ? '#d3d8e2' : accent,
            color:'#fff',
            border:'none',
            padding:'12px 14px',
            borderRadius:10,
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontWeight:600,
            fontSize:14,
            letterSpacing:'.3px'
          }}
        >{actionLabel}</button>
      )}
    </div>
  );
}

/* ========= Handlers appended after component declarations for clarity ========= */
// We declare helper functions on prototype of App? Simpler: since this file is large, we attach them to window then call inside component? Instead, minimal approach: define below and hoist via function declarations? Not needed.
