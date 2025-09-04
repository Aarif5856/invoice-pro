import React, { useState } from 'react';
import { SubscriptionService } from '../services/SubscriptionService';
import './Pricing.css';

const Pricing = ({ onPlanSelect, currentPlan = 'free' }) => {
  const [billingInterval, setBillingInterval] = useState('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      yearlyPrice: 0,
      popular: false,
      features: [
        '3 invoices per month',
        '3 receipts per month',
        'Basic theme',
        'Email support',
        'Watermarked PDFs'
      ],
      limitations: [
        'Limited to 3 documents/month',
        'Watermarked PDFs',
        'Basic theme only'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Best for freelancers & small businesses',
      price: 9.99,
      yearlyPrice: 99.99,
      popular: true,
      features: [
        'Unlimited invoices & receipts',
        'All premium themes',
        'No watermarks',
        'Client management',
        'Priority support',
        'PDF customization',
        'Export history'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For growing businesses & teams',
      price: 19.99,
      yearlyPrice: 199.99,
      popular: false,
      features: [
        'Everything in Pro',
        'Multi-user accounts',
        'API access',
        'Custom branding',
        'White-label options',
        'Advanced analytics',
        'Dedicated support'
      ]
    }
  ];

  const handlePlanSelect = (planId) => {
    if (planId === 'free') {
      // Handle free plan selection
      SubscriptionService.upgradePlan('free');
      onPlanSelect && onPlanSelect(planId);
    } else {
      // Handle paid plan selection (integrate with Stripe later)
      console.log(`Selected ${planId} plan`);
      onPlanSelect && onPlanSelect(planId);
    }
  };

  const formatPrice = (monthly, yearly) => {
    if (billingInterval === 'yearly') {
      return yearly === 0 ? 'Free' : `$${yearly}/year`;
    }
    return monthly === 0 ? 'Free' : `$${monthly}/month`;
  };

  const getYearlySavings = (monthly, yearly) => {
    if (monthly === 0 || yearly === 0) return 0;
    const monthlyTotal = monthly * 12;
    return Math.round(((monthlyTotal - yearly) / monthlyTotal) * 100);
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h2>Choose Your Plan</h2>
        <p>Start free, upgrade when you're ready</p>
        
        <div className="billing-toggle">
          <button 
            className={billingInterval === 'monthly' ? 'active' : ''}
            onClick={() => setBillingInterval('monthly')}
          >
            Monthly
          </button>
          <button 
            className={billingInterval === 'yearly' ? 'active' : ''}
            onClick={() => setBillingInterval('yearly')}
          >
            Yearly
            <span className="savings-badge">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="pricing-grid">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className={`pricing-card ${plan.popular ? 'popular' : ''} ${currentPlan === plan.id ? 'current' : ''}`}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            {currentPlan === plan.id && <div className="current-badge">Current Plan</div>}
            
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              
              <div className="plan-price">
                <span className="price">
                  {formatPrice(plan.price, plan.yearlyPrice)}
                </span>
                {billingInterval === 'yearly' && plan.price > 0 && (
                  <span className="savings">
                    Save {getYearlySavings(plan.price, plan.yearlyPrice)}%
                  </span>
                )}
              </div>
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <span className="feature-check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {plan.limitations && (
              <ul className="plan-limitations">
                {plan.limitations.map((limitation, index) => (
                  <li key={index} className="limitation-item">
                    <span className="limitation-icon">⚠</span>
                    {limitation}
                  </li>
                ))}
              </ul>
            )}

            <button 
              className={`plan-button ${currentPlan === plan.id ? 'current' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
              disabled={currentPlan === plan.id}
            >
              {currentPlan === plan.id ? 'Current Plan' : 
               plan.id === 'free' ? 'Get Started Free' : 
               `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-faq">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I change plans anytime?</h4>
            <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div className="faq-item">
            <h4>What happens to my data if I downgrade?</h4>
            <p>Your data is always safe. You'll keep access to all previously created invoices and receipts.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer refunds?</h4>
            <p>Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
