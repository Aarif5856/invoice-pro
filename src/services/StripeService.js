// Stripe payment processing service for Sri Lanka
class StripeService {
  constructor() {
    this.plans = {
      pro: {
        priceId: 'price_pro_monthly', // Replace with your Stripe price ID
        price: 9.99,
        currency: 'usd',
        interval: 'month'
      },
      business: {
        priceId: 'price_business_monthly', // Replace with your Stripe price ID
        price: 19.99,
        currency: 'usd',
        interval: 'month'
      }
    };
  }

  isStripeLoaded() {
    return typeof window !== 'undefined' && typeof window.Stripe !== 'undefined';
  }

  async createCheckoutSession(planKey) {
    if (!this.isStripeLoaded()) {
      throw new Error('Stripe not loaded');
    }

    const plan = this.plans[planKey];
    if (!plan) {
      throw new Error(`Plan ${planKey} not found`);
    }

    // In production, this would call your backend API
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: plan.priceId,
        successUrl: `${window.location.origin}/payment-success?plan=${planKey}`,
        cancelUrl: `${window.location.origin}/payment-cancelled`,
      }),
    });

    const session = await response.json();
    return session;
  }

  async redirectToCheckout(planKey) {
    try {
      const stripe = window.Stripe('pk_test_YOUR_PUBLISHABLE_KEY'); // Replace with your key
      const session = await this.createCheckoutSession(planKey);
      
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  }

  // Track payment events
  trackPaymentEvent(event, planKey, error = null) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `stripe_${event}`, {
        plan: planKey,
        value: this.plans[planKey]?.price || 0,
        currency: 'USD',
        error: error?.message || null
      });
    }
  }
}

export default new StripeService();
