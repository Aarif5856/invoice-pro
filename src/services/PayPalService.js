// Multi-payment service for Sri Lanka users
class PaymentService {
  constructor() {
    this.plans = {
      pro: {
        planId: 'YOUR_ACTUAL_PRO_PLAN_ID',
        price: 9.99,
        lkrPrice: 3000, // Approximate LKR equivalent
        currency: 'USD',
        interval: 'month'
      },
      business: {
        planId: 'YOUR_ACTUAL_BUSINESS_PLAN_ID',
        price: 19.99,
        lkrPrice: 6000, // Approximate LKR equivalent
        currency: 'USD',
        interval: 'month'
      }
    };

    // Sri Lankan bank details for local transfers
    this.bankDetails = {
      bankName: 'Commercial Bank of Ceylon',
      accountName: 'Your Business Name',
      accountNumber: 'XXXX-XXXX-XXXX-XXXX',
      branch: 'Colombo Main Branch',
      swiftCode: 'CCEYLKLX',
      email: 'payments@invoicepro.tech'
    };
  }

  // Check if user is in Sri Lanka or restricted region
  isRestrictedRegion() {
    // You can implement geo-detection here
    return true; // Assume Sri Lanka for now
  }

  getAvailablePaymentMethods() {
    if (this.isRestrictedRegion()) {
      return [
        { id: 'bank_transfer', name: 'Bank Transfer (LKR)', recommended: true },
        { id: 'wise', name: 'Wise (formerly TransferWise)', recommended: false },
        { id: 'crypto', name: 'Cryptocurrency', recommended: false },
        { id: 'remitly', name: 'Remitly', recommended: false }
      ];
    } else {
      return [
        { id: 'paypal', name: 'PayPal', recommended: true },
        { id: 'stripe', name: 'Credit Card', recommended: true },
        { id: 'bank_transfer', name: 'Bank Transfer', recommended: false }
      ];
    }
  }

  generateBankTransferInstructions(planKey) {
    const plan = this.plans[planKey];
    if (!plan) {
      throw new Error(`Plan ${planKey} not found`);
    }

    const referenceId = `INV-${planKey.toUpperCase()}-${Date.now()}`;
    
    return {
      referenceId,
      amount: plan.lkrPrice,
      currency: 'LKR',
      bankDetails: this.bankDetails,
      instructions: [
        `Transfer LKR ${plan.lkrPrice.toLocaleString()} to the account below`,
        `Reference: ${referenceId}`,
        `Email payment slip to: ${this.bankDetails.email}`,
        `Include your account email in the transfer description`,
        `Account will be activated within 24 hours of payment confirmation`
      ],
      note: 'This is a manual process. Please allow 24 hours for activation.'
    };
  }

  // Alternative payment methods for Sri Lanka
  getWisePaymentLink(planKey) {
    const plan = this.plans[planKey];
    return `https://wise.com/send?amount=${plan.price}&currency=USD&recipient=your-wise-account`;
  }

  getCryptoPaymentDetails(planKey) {
    const plan = this.plans[planKey];
    return {
      btcAddress: 'bc1qYourBitcoinAddress',
      ethAddress: '0xYourEthereumAddress', 
      usdtAddress: 'YourUSDTTRC20Address',
      amount: plan.price,
      currency: 'USD',
      note: 'Send payment confirmation screenshot to payments@invoicepro.tech'
    };
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

export default new PaymentService();
