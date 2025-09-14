// Enhanced PayPal Payment Service
class PayPalPaymentService {
  constructor() {
    this.plans = {
      pro: {
        planId: 'P-5ML4271244454362WXNWU5NQ', // Your PayPal plan ID - replace with actual
        price: 9.99,
        currency: 'USD',
        interval: 'month'
      },
      business: {
        planId: 'P-1GJ4485785631323WXNWU6FA', // Your PayPal plan ID - replace with actual
        price: 19.99,
        currency: 'USD',
        interval: 'month'
      }
    };

    // Your PayPal account configuration
    this.paypalConfig = {
      clientId: 'Ad_yNvEmPw-oV_nad8eklAh4arhVTFxUIr1z_5KoF5dGPld0BmmbGFESkl1l3SrGEtdldnWDSvqa1anz', // Your PayPal Client ID
      currency: 'USD',
      environment: 'sandbox', // Change to 'production' for live payments
      businessName: 'Invoice Pro',
      businessEmail: 'your-paypal-email@example.com', // Replace with your actual PayPal email for manual payments
      returnUrl: `${window.location.origin}/payment-success`,
      cancelUrl: `${window.location.origin}/payment-cancelled`
    };
  }

  // Check if user is in Sri Lanka or restricted region
  isRestrictedRegion() {
    // You can implement geo-detection here
    return true; // Assume Sri Lanka for now
  }

  getAvailablePaymentMethods() {
    return [
      { 
        id: 'paypal', 
        name: 'PayPal', 
        recommended: true,
        description: 'Pay securely with PayPal account or credit card',
        fees: 'PayPal processing fees apply',
        icon: '💳'
      },
      { 
        id: 'paypal_direct', 
        name: 'PayPal Direct Transfer', 
        recommended: false,
        description: 'Send money directly to PayPal account',
        fees: 'Standard PayPal transfer fees',
        icon: '💰'
      },
      { 
        id: 'bank_transfer', 
        name: 'Bank Transfer', 
        recommended: false,
        description: 'Direct bank wire transfer',
        fees: 'Bank charges may apply',
        icon: '🏦'
      }
    ];
  }

  // Generate PayPal direct transfer instructions
  generatePayPalDirectInstructions(planKey, customerEmail) {
    const plan = this.plans[planKey];
    if (!plan) {
      throw new Error(`Plan ${planKey} not found`);
    }

    const referenceId = `INVPP-${planKey.toUpperCase()}-${Date.now()}`;
    
    return {
      referenceId,
      amount: plan.price,
      currency: plan.currency,
      paypalEmail: this.paypalConfig.businessEmail,
      instructions: [
        `Send $${plan.price} USD via PayPal to: ${this.paypalConfig.businessEmail}`,
        `Payment type: Friends & Family (to avoid fees) or Goods & Services`,
        `Reference: ${referenceId}`,
        `Your email: ${customerEmail}`,
        `Plan: ${planKey.toUpperCase()} subscription`,
        `After payment, email confirmation to: ${this.paypalConfig.businessEmail}`
      ],
      fees: 'PayPal fees may apply depending on payment method',
      activationTime: 'Usually within 2-4 hours after confirmation',
      note: 'Please include the reference ID in your PayPal payment note'
    };
  }

  generateBankTransferInstructions(planKey) {
    const plan = this.plans[planKey];
    if (!plan) {
      throw new Error(`Plan ${planKey} not found`);
    }

    const referenceId = `INVBANK-${planKey.toUpperCase()}-${Date.now()}`;
    
    return {
      referenceId,
      amount: plan.price,
      currency: 'USD',
      instructions: [
        `Wire transfer $${plan.price} USD to our business account`,
        `Reference: ${referenceId}`,
        `Contact support for bank details: ${this.paypalConfig.businessEmail}`,
        `Include reference ID in transfer description`,
        `Account will be activated within 24-48 hours`
      ],
      fees: 'Bank wire transfer fees apply',
      activationTime: '24-48 hours after payment confirmation',
      note: 'Contact support for detailed bank information'
    };
  }

  // Process payment based on method
  async processPayment(paymentMethod, planData, userInfo) {
    console.log('🚀 PayPalService.processPayment called with:', {
      paymentMethod,
      planData,
      userInfo
    });
    
    try {
      let result;
      switch (paymentMethod.id) {
        case 'paypal':
          console.log('💳 Processing PayPal Subscription...');
          result = await this.processPayPalSubscription(planData, userInfo);
          break;
        
        case 'paypal_direct':
          console.log('💰 Processing PayPal Direct Transfer...');
          result = await this.processPayPalDirect(planData, userInfo);
          break;
        
        case 'bank_transfer':
          console.log('🏦 Processing Bank Transfer...');
          result = await this.processBankTransfer(planData, userInfo);
          break;
        
        default:
          throw new Error(`Payment method not supported: ${paymentMethod.id}`);
      }
      
      console.log('✅ PayPalService payment result:', result);
      return result;
    } catch (error) {
      console.error('❌ Payment processing error in PayPalService:', error);
      throw error;
    }
  }

  // Process PayPal direct transfer
  async processPayPalDirect(planData, userInfo) {
    console.log('💰 Processing PayPal Direct Transfer:', { planData, userInfo });
    
    try {
      const instructions = this.generatePayPalDirectInstructions(planData.key, userInfo.email);
      console.log('📋 Generated PayPal instructions:', instructions);
      
      const result = {
        success: true,
        method: 'paypal_direct',
        instructions,
        nextStep: 'Show payment instructions to user'
      };
      
      console.log('✅ PayPal direct payment result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in processPayPalDirect:', error);
      throw error;
    }
  }

  // Process bank transfer
  async processBankTransfer(planData, userInfo) {
    const instructions = this.generateBankTransferInstructions(planData.key);
    return {
      success: true,
      method: 'bank_transfer',
      instructions,
      nextStep: 'Show bank transfer instructions to user'
    };
  }

  // Process PayPal subscription (integrated button)
  async processPayPalSubscription(planData, userInfo) {
    console.log('💳 Processing PayPal Subscription:', { planData, userInfo });
    
    try {
      // For PayPal subscription, we return configuration for the PayPal button
      const result = {
        success: true,
        method: 'paypal',
        requiresPayPalButton: true,
        planKey: planData.key,
        instructions: {
          title: 'PayPal Subscription',
          description: 'Complete your subscription with PayPal',
          amount: planData.price || this.plans[planData.key]?.price,
          currency: 'USD',
          note: 'You will be redirected to PayPal to complete the subscription'
        },
        nextStep: 'Render PayPal subscription button'
      };
      
      console.log('✅ PayPal subscription setup result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in processPayPalSubscription:', error);
      throw error;
    }
  }

  // For regions where PayPal works
  isPayPalLoaded() {
    return typeof window !== 'undefined' && typeof window.paypal !== 'undefined';
  }

  async createSubscription(planKey) {
    if (!this.isPayPalLoaded()) {
      throw new Error('PayPal SDK not loaded');
    }

    const plan = this.plans[planKey];
    if (!plan) {
      throw new Error(`Plan ${planKey} not found`);
    }

    return {
      plan_id: plan.planId,
      quantity: '1',
      subscriber: {
        name: {
          given_name: 'Invoice',
          surname: 'Pro User'
        }
      },
      application_context: {
        brand_name: 'Invoice Pro',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancelled`
      }
    };
  }

  renderPayPalButton(containerId, planKey, onSuccess, onError, onCancel) {
    if (!this.isPayPalLoaded()) {
      console.error('PayPal SDK not loaded');
      return;
    }

    const plan = this.plans[planKey];
    if (!plan) {
      console.error(`Plan ${planKey} not found`);
      return;
    }

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe',
        height: 40
      },
      createSubscription: async (data, actions) => {
        try {
          const subscriptionData = await this.createSubscription(planKey);
          return actions.subscription.create(subscriptionData);
        } catch (error) {
          console.error('Error creating subscription:', error);
          onError?.(error);
          throw error;
        }
      },
      onApprove: async (data, actions) => {
        try {
          const details = await actions.subscription.get();
          console.log('Subscription successful:', details);
          
          // Store subscription details
          const subscriptionInfo = {
            subscriptionId: data.subscriptionID,
            plan: planKey,
            status: 'active',
            startDate: new Date().toISOString(),
            paypalDetails: details
          };

          // Save to localStorage (in production, save to backend)
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          userData.subscription = subscriptionInfo;
          userData.plan = planKey;
          localStorage.setItem('userData', JSON.stringify(userData));

          onSuccess?.(subscriptionInfo);
        } catch (error) {
          console.error('Error processing subscription approval:', error);
          onError?.(error);
        }
      },
      onCancel: (data) => {
        console.log('Subscription cancelled:', data);
        onCancel?.(data);
      },
      onError: (error) => {
        console.error('PayPal error:', error);
        onError?.(error);
      }
    }).render(`#${containerId}`);
  }

  async cancelSubscription(subscriptionId) {
    // In production, this would make an API call to your backend
    // which would then call PayPal's API to cancel the subscription
    console.log('Cancelling subscription:', subscriptionId);
    
    // For now, just update localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.subscription) {
      userData.subscription.status = 'cancelled';
      userData.plan = 'free';
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    return { success: true };
  }

  getSubscriptionStatus() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData.subscription || null;
  }

  // Track payment events for analytics
  trackPaymentEvent(event, planKey, error = null) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `payment_${event}`, {
        plan: planKey,
        value: this.plans[planKey]?.price || 0,
        currency: 'USD',
        error: error?.message || null
      });
    }
  }
}

export default new PayPalPaymentService();
