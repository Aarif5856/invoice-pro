// Subscription management service for freemium model
export class SubscriptionService {
  
  // Plan definitions
  static PLANS = {
    FREE: 'free',
    PRO: 'pro', 
    BUSINESS: 'business'
  };

  // Plan limits and features
  static PLAN_LIMITS = {
    free: {
      invoicesPerMonth: 3,
      receiptsPerMonth: 3,
      themes: ['minimalist'],
      watermark: true,
      clientStorage: 10,
      features: ['Basic PDF generation', 'Email support']
    },
    pro: {
      invoicesPerMonth: -1, // unlimited
      receiptsPerMonth: -1, // unlimited  
      themes: ['minimalist', 'corporate', 'creative'],
      watermark: false,
      clientStorage: 500,
      features: ['Unlimited invoices', 'All themes', 'No watermark', 'Priority support', 'Client management']
    },
    business: {
      invoicesPerMonth: -1, // unlimited
      receiptsPerMonth: -1, // unlimited
      themes: ['minimalist', 'corporate', 'creative'],
      watermark: false,
      clientStorage: -1, // unlimited
      multiUser: true,
      apiAccess: true,
      customBranding: true,
      features: ['Everything in Pro', 'Multi-user accounts', 'API access', 'Custom branding', 'White-label options']
    }
  };

  // Plan pricing
  static PLAN_PRICING = {
    free: { monthly: 0, yearly: 0 },
    pro: { monthly: 9.99, yearly: 99.99 }, // 2 months free
    business: { monthly: 19.99, yearly: 199.99 } // 2 months free
  };

  // Get user's current plan from localStorage
  static getCurrentPlan() {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return userData.plan || this.PLANS.FREE;
    } catch {
      return this.PLANS.FREE;
    }
  }

  // Get user's current usage
  static getCurrentUsage() {
    try {
      const usage = JSON.parse(localStorage.getItem('userUsage') || '{}');
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Reset usage if new month
      if (usage.month !== currentMonth || usage.year !== currentYear) {
        const resetUsage = {
          month: currentMonth,
          year: currentYear,
          invoicesCreated: 0,
          receiptsCreated: 0
        };
        localStorage.setItem('userUsage', JSON.stringify(resetUsage));
        return resetUsage;
      }
      
      return usage;
    } catch {
      return {
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        invoicesCreated: 0,
        receiptsCreated: 0
      };
    }
  }

  // Check if user can create invoice/receipt
  static canCreateDocument(type = 'invoice') {
    const plan = this.getCurrentPlan();
    const usage = this.getCurrentUsage();
    const limits = this.PLAN_LIMITS[plan];
    
    console.log('🔍 Usage Check:', {
      plan,
      type,
      currentUsage: usage,
      limits: limits
    });
    
    if (plan === this.PLANS.FREE) {
      const currentCount = type === 'invoice' ? usage.invoicesCreated : usage.receiptsCreated;
      const limit = type === 'invoice' ? limits.invoicesPerMonth : limits.receiptsPerMonth;
      
      console.log(`📊 Free plan check: ${currentCount}/${limit} ${type}s used this month`);
      
      return currentCount < limit;
    }
    
    console.log('✅ Pro/Business plan - unlimited usage');
    return true; // Pro and Business have unlimited
  }

  // Increment usage counter
  static incrementUsage(type = 'invoice') {
    const usage = this.getCurrentUsage();
    
    if (type === 'invoice') {
      usage.invoicesCreated++;
    } else {
      usage.receiptsCreated++;
    }
    
    localStorage.setItem('userUsage', JSON.stringify(usage));
    return usage;
  }

  // Check if user can use specific theme
  static canUseTheme(theme) {
    const plan = this.getCurrentPlan();
    const allowedThemes = this.PLAN_LIMITS[plan].themes;
    return allowedThemes.includes(theme) || allowedThemes.includes('all');
  }

  // Check if watermark should be added
  static shouldAddWatermark() {
    const plan = this.getCurrentPlan();
    return this.PLAN_LIMITS[plan].watermark || false;
  }

  // Get remaining documents for current month
  static getRemainingDocuments(type = 'invoice') {
    const plan = this.getCurrentPlan();
    const usage = this.getCurrentUsage();
    const limits = this.PLAN_LIMITS[plan];
    
    if (plan !== this.PLANS.FREE) {
      return -1; // unlimited
    }
    
    const currentCount = type === 'invoice' ? usage.invoicesCreated : usage.receiptsCreated;
    const limit = type === 'invoice' ? limits.invoicesPerMonth : limits.receiptsPerMonth;
    
    return Math.max(0, limit - currentCount);
  }

  // Upgrade user plan
  static upgradePlan(newPlan, paymentInfo = null) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    userData.plan = newPlan;
    userData.upgradeDate = new Date().toISOString();
    
    if (paymentInfo) {
      userData.subscription = {
        ...paymentInfo,
        status: 'active',
        nextBilling: this.getNextBillingDate(paymentInfo.interval)
      };
    }
    
    localStorage.setItem('userData', JSON.stringify(userData));
    return userData;
  }

  // Get next billing date
  static getNextBillingDate(interval = 'monthly') {
    const date = new Date();
    if (interval === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString();
  }

  // Get plan features for display
  static getPlanFeatures(plan) {
    return this.PLAN_LIMITS[plan].features || [];
  }

  // Get plan pricing for display
  static getPlanPrice(plan, interval = 'monthly') {
    return this.PLAN_PRICING[plan]?.[interval] || 0;
  }

  // Check if user is on free plan
  static isFreePlan() {
    return this.getCurrentPlan() === this.PLANS.FREE;
  }

  // Get upgrade suggestions
  static getUpgradeSuggestion() {
    const usage = this.getCurrentUsage();
    const plan = this.getCurrentPlan();
    
    if (plan === this.PLANS.FREE) {
      const invoiceLimit = this.PLAN_LIMITS.free.invoicesPerMonth;
      const receiptLimit = this.PLAN_LIMITS.free.receiptsPerMonth;
      
      if (usage.invoicesCreated >= invoiceLimit || usage.receiptsCreated >= receiptLimit) {
        return {
          title: "You've reached your monthly limit!",
          message: "Upgrade to Pro for unlimited invoices and receipts",
          suggestedPlan: this.PLANS.PRO
        };
      }
      
      if (usage.invoicesCreated >= invoiceLimit * 0.8) {
        return {
          title: "Almost at your limit",
          message: "Consider upgrading to Pro for unlimited access",
          suggestedPlan: this.PLANS.PRO
        };
      }
    }
    
    return null;
  }
}

// Export both the class and an instance
export { SubscriptionService };
export default SubscriptionService;
