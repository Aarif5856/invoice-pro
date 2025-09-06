// PayPal payment processing service
class PayPalService {
  constructor() {
    this.plans = {
      pro: {
        planId: 'P-2UF78835G6983834MNL6MI2A', // Replace with actual PayPal plan ID
        price: 9.99,
        currency: 'USD',
        interval: 'month'
      },
      business: {
        planId: 'P-5ML55832H6983834MNL6MQLA', // Replace with actual PayPal plan ID
        price: 19.99,
        currency: 'USD',
        interval: 'month'
      }
    };
  }

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

export default new PayPalService();
