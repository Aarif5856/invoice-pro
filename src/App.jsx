import React, { useState } from 'react';
import './App-modern.css';
import './styles/neon-effects.css';
import './styles/accessibility.css';
import Auth from './Auth';
import LandingHero from './components/LandingHero';
import Dashboard from './components/Dashboard';
import EnhancedInvoiceForm from './components/EnhancedInvoiceForm';
import { FreePlanLimitWarning } from './components/FreePlanLimitWarning';
import { ThemeSelector } from './components/ThemeSelector';
import { ThemeProvider, ThemeToggle } from './components/ThemeProvider';
import { AccessibilityProvider, AccessibilityPanel } from './components/AccessibilityProvider';
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
  PayPalService
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
  const [formType, setFormType] = useState('dashboard');
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
    PayPalService.trackPaymentEvent('success', plan);
  };

  const handlePaymentError = (plan, error) => {
    setPlanMessage(`❌ Payment failed for ${plan.toUpperCase()} plan. Please try again.`);
    setPaymentProcessing(prev => ({ ...prev, [plan]: false }));
    PayPalService.trackPaymentEvent('error', plan, error);
  };

  const handlePaymentCancel = (plan) => {
    setPlanMessage(`Payment cancelled for ${plan.toUpperCase()} plan.`);
    setPaymentProcessing(prev => ({ ...prev, [plan]: false }));
    setSelectedPlanForPayment(null); // Reset payment selection
    PayPalService.trackPaymentEvent('cancel', plan);
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
    <ThemeProvider>
      <AccessibilityProvider>
        <NeonThemeProvider>
          <div className="container">
        <NeonControls />
        <NeonFloatingParticles />
        <NeonMatrixRain />
        <NeonBackgroundOrbs />
        <NeonSoundToggle />
        <header className="header">
          <h1>Invoice & Receipt Generator</h1>
          <div className="header-actions">
            <ThemeToggle />
            {isAuthenticated && (
              <button onClick={handleLogout} className="logout-header-btn">
                Sign Out
              </button>
            )}
          </div>
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
            <button className={`nav-btn${formType === 'dashboard' ? ' active' : ''}`} onClick={() => setFormType('dashboard')}>
              📊 Dashboard
            </button>
            <button className={`nav-btn${formType === 'invoice' ? ' active' : ''}`} onClick={() => setFormType('invoice')}>
              📄 Create Invoice
            </button>
            <button className={`nav-btn${formType === 'receipt' ? ' active' : ''}`} onClick={() => setFormType('receipt')}>
              🧾 Create Receipt
            </button>
            <button className={`nav-btn${formType === 'drafts' ? ' active' : ''}`} onClick={() => setFormType('drafts')}>
              💾 Drafts ({savedDrafts.length})
            </button>
            <button className={`nav-btn${formType === 'history' ? ' active' : ''}`} onClick={() => setFormType('history')}>
              📋 History ({invoiceHistory.length})
            </button>
          </nav>

          <main className="main-content" id="main-content" tabIndex="-1">
            {formType === 'dashboard' ? (
              <Dashboard 
                subscriptionInfo={subscriptionInfo} 
                onNavigate={setFormType}
              />
            ) : (
            <section className="form-section">
              {formType === 'invoice' ? (
                <EnhancedInvoiceForm
                  invoice={invoice}
                  setInvoice={setInvoice}
                  onGenerate={(theme, isDraft) => {
                    setSelectedTheme(theme);
                    setIsDraftMode(isDraft);
                    generateAndUploadInvoice();
                  }}
                  validationErrors={validationErrors}
                  hasFieldError={hasFieldError}
                  getFieldError={getFieldError}
                  subscriptionInfo={subscriptionInfo}
                />
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

                    <div className={`form-field ${hasFieldError('clientName') ? 'has-error' : ''}`}>
                      <label className="field-label required" htmlFor="receiptClientName">Client Name</label>
                      <input
                        type="text"
                        id="receiptClientName"
                        placeholder="Enter client name"
                        value={receipt.clientName}
                        onChange={e => setReceipt({ ...receipt, clientName: e.target.value })}
                        className="form-input"
                        data-field="clientName"
                        onFocus={e => {
                          if (!e.target.value) {
                            setReceipt({ ...receipt, clientName: 'John Doe' });
                          }
                        }}
                      />
                      {hasFieldError('clientName') && (
                        <div className="error-message">{getFieldError('clientName')}</div>
                      )}
                    </div>

                    <div className="form-grid">
                      <div className={`form-field ${hasFieldError('receiptNumber') ? 'has-error' : ''}`}>
                        <label className="field-label required" htmlFor="receiptNumber">Receipt Number</label>
                        <div className="input-with-action">
                          <input
                            type="text"
                            id="receiptNumber"
                            placeholder="REC-001"
                            value={receipt.receiptNumber}
                            onChange={e => setReceipt({ ...receipt, receiptNumber: e.target.value })}
                            className="form-input"
                            data-field="receiptNumber"
                          />
                          <button
                            type="button"
                            onClick={() => setReceipt({ ...receipt, receiptNumber: InvoiceService.generateReceiptNumber() })}
                            className="btn btn-secondary btn-sm"
                            title="Generate New Number"
                          >
                            🔄
                          </button>
                        </div>
                        {hasFieldError('receiptNumber') && (
                          <div className="error-message">{getFieldError('receiptNumber')}</div>
                        )}
                      </div>

                      <div className={`form-field ${hasFieldError('date') ? 'has-error' : ''}`}>
                        <label className="field-label required" htmlFor="receiptDate">Receipt Date</label>
                        <input
                          type="date"
                          id="receiptDate"
                          value={receipt.date}
                          onChange={e => setReceipt({ ...receipt, date: e.target.value })}
                          className="form-input"
                          data-field="date"
                        />
                        {hasFieldError('date') && (
                          <div className="error-message">{getFieldError('date')}</div>
                        )}
                      </div>
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

                    <div className="form-grid">
                      <div className="form-field">
                        <label className="field-label" htmlFor="receiptTax">Tax (%)</label>
                        <input
                          type="number"
                          id="receiptTax"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0.00"
                          value={receipt.tax || ''}
                          onChange={e => setReceipt({ ...receipt, tax: Number(e.target.value) || 0 })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-field">
                        <label className="field-label" htmlFor="receiptDiscount">Discount (%)</label>
                        <input
                          type="number"
                          id="receiptDiscount"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0.00"
                          value={receipt.discount || ''}
                          onChange={e => setReceipt({ ...receipt, discount: Number(e.target.value) || 0 })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="receiptNotes">Notes</label>
                      <textarea
                        id="receiptNotes"
                        placeholder="Additional notes or payment method..."
                        value={receipt.notes}
                        onChange={e => setReceipt({ ...receipt, notes: e.target.value })}
                        className="form-input"
                        rows="3"
                      />
                    </div>

                    {/* Action buttons */}
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

                      <button
                        type="button"
                        onClick={generateAndUploadReceipt}
                        disabled={uploading}
                        className="btn btn-primary"
                        style={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          opacity: uploading ? 0.7 : 1,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {uploading ? '⏳ Generating...' : '📄 Generate PDF'}
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
                    <h3>👁️ Receipt Preview</h3>
                    <div className="preview-box">
                      <p><strong>{receipt.businessName || 'Business Name'}</strong></p>
                      <p>{receipt.businessContact || 'Business Contact'}</p>
                      <hr />
                      <p><strong>Receipt Number:</strong> {receipt.receiptNumber || 'REC-001'}</p>
                      <p><strong>Date:</strong> {receipt.date || new Date().toISOString().split('T')[0]}</p>
                      <p><strong>Client:</strong> {receipt.clientName || 'Client Name'}</p>
                      <hr />
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span><strong>Subtotal:</strong></span>
                        <span>${(receipt.amount || 0).toFixed(2)}</span>
                      </div>
                      {(receipt.tax > 0) && (
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span><strong>Tax ({receipt.tax}%):</strong></span>
                          <span>${((receipt.amount || 0) * (receipt.tax / 100)).toFixed(2)}</span>
                        </div>
                      )}
                      {(receipt.discount > 0) && (
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span><strong>Discount ({receipt.discount}%):</strong></span>
                          <span>-${((receipt.amount || 0) * (receipt.discount / 100)).toFixed(2)}</span>
                        </div>
                      )}
                      <hr />
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.2em', fontWeight: 'bold'}}>
                        <span><strong>Total:</strong></span>
                        <span>${(function() {
                          const amount = receipt.amount || 0;
                          const tax = (amount * (receipt.tax || 0)) / 100;
                          const discount = (amount * (receipt.discount || 0)) / 100;
                          return (amount + tax - discount).toFixed(2);
                        }())}</span>
                      </div>
                      {receipt.notes && (
                        <>
                          <hr />
                          <p><strong>Notes:</strong> {receipt.notes}</p>
                        </>
                      )}
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
            )}
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
      
      <AccessibilityPanel />
        </div>
      </NeonThemeProvider>
    </AccessibilityProvider>
  </ThemeProvider>
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
      const methods = PayPalService.getAvailablePaymentMethods();
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
      
      const result = await PayPalService.processPayment(
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
        
        // If this is a PayPal subscription, render the PayPal button
        if (result.requiresPayPalButton && window.paypal) {
          setTimeout(() => {
            const buttonContainer = document.getElementById(`paypal-button-${planKey}`);
            if (buttonContainer) {
              PayPalService.renderPayPalButton(
                `paypal-button-${planKey}`,
                planKey,
                (subscriptionInfo) => {
                  console.log('PayPal payment successful:', subscriptionInfo);
                  alert('🎉 Payment successful! Your account has been upgraded.');
                  // Update user plan
                  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                  userData.plan = planKey;
                  userData.subscription = subscriptionInfo;
                  localStorage.setItem('userData', JSON.stringify(userData));
                  // Reload page to reflect changes
                  window.location.reload();
                },
                (error) => {
                  console.error('PayPal payment error:', error);
                  alert('❌ Payment failed. Please try again.');
                },
                () => {
                  console.log('PayPal payment cancelled');
                  alert('Payment was cancelled.');
                }
              );
            }
          }, 100);
        }
        
        // Track payment event
        PayPalService.trackPaymentEvent('payment_method_selected', planKey, method.id);
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

              {/* PayPal Button Container */}
              {selectedMethod?.id === 'paypal' && (
                <div style={{marginTop:16}}>
                  <div style={{marginBottom:12,padding:12,background:'#fff3cd',borderRadius:8,border:'1px solid #ffeaa7'}}>
                    <strong style={{color:'#856404'}}>💳 Complete Payment with PayPal:</strong>
                    <div style={{fontSize:11,color:'#856404',marginTop:4}}>
                      Click the PayPal button below to complete your subscription
                    </div>
                  </div>
                  <div 
                    id={`paypal-button-${planKey}`}
                    style={{
                      minHeight: '50px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '10px',
                      border: '2px dashed #dee2e6',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: '#6c757d'
                    }}
                  >
                    Loading PayPal button...
                  </div>
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
