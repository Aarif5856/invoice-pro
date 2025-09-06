// Razorpay payment service - works well in Sri Lanka
class RazorpayService {
  constructor() {
    this.keyId = 'rzp_test_YOUR_KEY_ID'; // Replace with your Razorpay key
    this.plans = {
      pro: {
        planId: 'plan_pro_monthly',
        price: 999, // Amount in paise (9.99 USD = ~999 LKR * 100)
        currency: 'LKR',
        interval: 'monthly'
      },
      business: {
        planId: 'plan_business_monthly', 
        price: 1999, // Amount in paise (19.99 USD = ~1999 LKR * 100)
        currency: 'LKR',
        interval: 'monthly'
      }
    };
  }

  isRazorpayLoaded() {
    return typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined';
  }

  async createSubscription(planKey, userDetails) {
    if (!this.isRazorpayLoaded()) {
      throw new Error('Razorpay not loaded');
    }

    const plan = this.plans[planKey];
    if (!plan) {
      throw new Error(`Plan ${planKey} not found`);
    }

    const options = {
      key: this.keyId,
      subscription_id: plan.planId, // You'll get this from your backend
      name: 'Invoice Pro',
      description: `${planKey.toUpperCase()} Plan Subscription`,
      amount: plan.price,
      currency: plan.currency,
      handler: function(response) {
        console.log('Payment success:', response);
        // Handle successful payment
      },
      prefill: {
        name: userDetails.name || 'Invoice Pro User',
        email: userDetails.email || '',
        contact: userDetails.phone || ''
      },
      theme: {
        color: '#667eea'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  trackPaymentEvent(event, planKey, error = null) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `razorpay_${event}`, {
        plan: planKey,
        value: this.plans[planKey]?.price / 100 || 0,
        currency: 'LKR',
        error: error?.message || null
      });
    }
  }
}

export default new RazorpayService();
