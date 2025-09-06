// Payoneer payment service for Qatar
class PayoneerService {
  constructor() {
    this.plans = {
      pro: {
        price: 9.99,
        currency: 'USD',
        qrPrice: 36, // Approximate QAR equivalent (1 USD ≈ 3.6 QAR)
        interval: 'month'
      },
      business: {
        price: 19.99,
        currency: 'USD',
        qrPrice: 72, // Approximate QAR equivalent
        interval: 'month'
      }
    };

    // Your Qatar Payoneer account details
    this.payoneerDetails = {
      email: '5856music@gmail.com', // Your approved Payoneer email
      receiverName: 'Mohamed Aarif Abdul Majeed', // As registered in Payoneer
      customerId: '98977720', // Your Payoneer Customer ID
      country: 'Qatar',
      currency: 'USD',
      // Payoneer Global Payment Service details (you'll get these after approval)
      globalPaymentService: {
        usd: {
          bankName: 'First Century Bank',
          accountNumber: 'Your USD Account Number', // From Payoneer dashboard
          routingNumber: 'Your Routing Number', // From Payoneer dashboard
          swiftCode: 'FCBKUS33',
          beneficiaryName: 'Your Name',
          beneficiaryAddress: 'Your Qatar Address'
        }
      }
    };

    // Qatar local bank details (backup method)
    this.qatarBankDetails = {
      bankName: 'Qatar National Bank (QNB)',
      accountName: 'Your Business Name',
      accountNumber: 'XXXX-XXXX-XXXX-XXXX', // Replace with your QNB account
      iban: 'QA XX QNBA XXXX XXXX XXXX XXXX XXXX XX', // Replace with your IBAN
      swiftCode: 'QNBAQAQA',
      branch: 'Doha Main Branch',
      email: '5856music@gmail.com' // Your email for payment confirmations
    };
  }

  // Check available payment methods for Qatar
  getAvailablePaymentMethods() {
    return [
      { 
        id: 'payoneer_direct', 
        name: 'Payoneer (Recommended)', 
        recommended: true,
        description: 'Send money directly to Payoneer account - instant',
        fees: 'Small Payoneer fee applies',
        icon: '💳'
      },
      { 
        id: 'payoneer_gps', 
        name: 'Wire Transfer (USD)', 
        recommended: true,
        description: 'Bank wire to Payoneer Global Payment Service',
        fees: 'Bank charges may apply',
        icon: '🏦'
      },
      { 
        id: 'qatar_bank_transfer', 
        name: 'Qatar Bank Transfer (QAR)', 
        recommended: false,
        description: 'Direct transfer to Qatar bank account',
        fees: 'No additional fees',
        icon: '🇶🇦'
      },
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        recommended: false,
        description: 'Bitcoin, Ethereum, USDT',
        fees: 'Network fees apply',
        icon: '₿'
      }
    ];
  }

  // Generate Payoneer direct payment instructions  
  generatePayoneerDirectPaymentInstructions(planKey, customerEmail) {
    const plan = this.plans[planKey];
    if (!plan) {
      throw new Error(`Plan ${planKey} not found`);
    }

    const referenceId = `INV-${planKey.toUpperCase()}-${Date.now()}`;
    
    return {
      referenceId,
      amount: plan.price,
      currency: plan.currency,
      payoneerEmail: this.payoneerDetails.email,
      paymentInstructions: [
        `Send $${plan.price} USD via Payoneer to: ${this.payoneerDetails.email}`,
        `Reference: ${referenceId}`,
        `Your email: ${customerEmail}`,
        `Plan: ${planKey.toUpperCase()}`,
        `After payment, email confirmation to: ${this.localBankDetails.email}`
      ],
      fees: 'Small Payoneer fee applies',
      activationTime: 'Instant after confirmation'
    };
  }

  // Generate Qatar bank transfer instructions (local customers)
  generateQatarBankTransferInstructions(planKey, customerEmail) {
    const plan = this.plans[planKey];
    if (!plan) {
      throw new Error(`Plan ${planKey} not found`);
    }

    const referenceId = `INVQAR-${planKey.toUpperCase()}-${Date.now()}`;
    const amountQAR = Math.round(plan.price * 3.64); // USD to QAR approximate rate
    
    return {
      referenceId,
      amount: amountQAR,
      currency: 'QAR',
      bankDetails: this.localBankDetails,
      instructions: [
        `Transfer QAR ${amountQAR.toLocaleString()} to the account below:`,
        `Bank: ${this.localBankDetails.bankName}`,
        `Account Name: ${this.localBankDetails.accountName}`,
        `Account Number: ${this.localBankDetails.accountNumber}`,
        `IBAN: ${this.localBankDetails.iban}`,
        `Reference: ${referenceId}`,
        `Send payment confirmation to: ${this.localBankDetails.email}`,
        `Include your email (${customerEmail}) in transfer description`
      ],
      activationTime: '2-6 hours during business hours',
      note: 'Manual verification process. Account activated after payment confirmation.'
    };
  }

  // Generate wire transfer instructions (Payoneer Global Payment Service)
  generateWireTransferInstructions(planKey, customerEmail) {
    const plan = this.plans[planKey];
    const referenceId = `INVWIRE-${planKey.toUpperCase()}-${Date.now()}`;
    
    return {
      referenceId,
      amount: plan.price,
      currency: 'USD',
      bankDetails: {
        bankName: 'Bank of America, N.A.',
        beneficiary: 'Payoneer Inc.',
        beneficiaryAddress: '150 W 30th St, New York, NY 10001',
        swiftCode: 'BOFAUS3N',
        accountNumber: '898060030',
        finalCredit: this.payoneerDetails.email
      },
      instructions: [
        `Wire Transfer $${plan.price} USD to Payoneer Global Payment Service:`,
        `Bank Name: Bank of America, N.A.`,
        `Beneficiary: Payoneer Inc.`,
        `Beneficiary Address: 150 W 30th St, New York, NY 10001`,
        `SWIFT Code: BOFAUS3N`,
        `Account Number: 898060030`,
        `Reference: ${referenceId} - ${customerEmail}`,
        `Final Credit to: ${this.payoneerDetails.email}`,
        `Purpose: Software Subscription - Invoice Pro ${planKey.toUpperCase()}`,
        `Email wire confirmation to: ${this.localBankDetails.email}`
      ],
      fees: 'Bank charges may apply (typically $15-50 USD)',
      activationTime: '1-2 business days',
      note: 'International wire transfer via Payoneer Global Payment Service'
    };
  }

  // Cryptocurrency payment details
  generateCryptoPaymentInstructions(planKey) {
    const plan = this.plans[planKey];
    const referenceId = `INVCRYPTO-${planKey.toUpperCase()}-${Date.now()}`;
    
    return {
      referenceId,
      amount: plan.price,
      currency: 'USD',
      addresses: {
        bitcoin: '1YourBitcoinAddressHere',
        ethereum: '0xYourEthereumAddressHere',
        usdt_trc20: 'YourUSDTTRC20AddressHere',
        usdt_erc20: '0xYourUSDTERC20AddressHere'
      },
      instructions: [
        `Send exactly $${plan.price} USD equivalent to any address above`,
        `Use Reference: ${referenceId}`,
        `Send transaction hash/screenshot to: ${this.localBankDetails.email}`,
        `Include your account email in the message`
      ],
      rates: 'Use current market rates (coinmarketcap.com)',
      activationTime: '1-2 hours after confirmation'
    };
  }

  // Process payment based on method
  async processPayment(paymentMethod, planData, userInfo) {
    try {
      switch (paymentMethod.id) {
        case 'payoneer_direct':
          return await this.processPayoneerDirectPayment(planData, userInfo);
        
        case 'payoneer_gps':
          return await this.processWireTransfer(planData, userInfo);
        
        case 'qatar_bank_transfer':
          return await this.processQatarBankTransfer(planData, userInfo);
        
        case 'crypto':
          return await this.processCryptoPayment(planData, userInfo);
        
        default:
          throw new Error('Payment method not supported');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  // Process Payoneer direct payment
  async processPayoneerDirectPayment(planData, userInfo) {
    const instructions = this.generatePayoneerDirectPaymentInstructions(planData.key, userInfo.email);
    return {
      success: true,
      method: 'payoneer_direct',
      instructions,
      nextStep: 'Show payment instructions to user'
    };
  }

  // Process wire transfer via Payoneer GPS
  async processWireTransfer(planData, userInfo) {
    const instructions = this.generateWireTransferInstructions(planData.key, userInfo.email);
    return {
      success: true,
      method: 'payoneer_gps',
      instructions,
      nextStep: 'Show wire transfer instructions to user'
    };
  }

  // Process Qatar bank transfer
  async processQatarBankTransfer(planData, userInfo) {
    const instructions = this.generateQatarBankTransferInstructions(planData.key, userInfo.email);
    return {
      success: true,
      method: 'qatar_bank_transfer',
      instructions,
      nextStep: 'Show Qatar bank transfer instructions to user'
    };
  }

  // Process cryptocurrency payment
  async processCryptoPayment(planData, userInfo) {
    const instructions = this.generateCryptoPaymentInstructions(planData.key);
    return {
      success: true,
      method: 'crypto',
      instructions,
      nextStep: 'Show cryptocurrency payment instructions to user'
    };
  }

  // Manual subscription activation (for all payment methods)
  async activateSubscription(referenceId, planKey, userEmail, paymentMethod) {
    try {
      // Store activation request (in production, this would go to your backend)
      const activationRequest = {
        referenceId,
        planKey,
        userEmail,
        paymentMethod,
        requestedAt: new Date().toISOString(),
        status: 'pending_verification',
        amount: this.plans[planKey].price
      };

      // Save to localStorage (in production, save to backend)
      const pendingActivations = JSON.parse(localStorage.getItem('pendingActivations') || '[]');
      pendingActivations.push(activationRequest);
      localStorage.setItem('pendingActivations', JSON.stringify(pendingActivations));

      // Send email notification (simulate)
      console.log('Activation request submitted:', activationRequest);
      
      return {
        success: true,
        referenceId,
        message: 'Payment instructions sent. Account will be activated after payment verification.',
        estimatedActivationTime: this.getActivationTime(paymentMethod)
      };
    } catch (error) {
      console.error('Error submitting activation request:', error);
      throw error;
    }
  }

  getActivationTime(paymentMethod) {
    const times = {
      payoneer_direct: 'Instant after confirmation',
      payoneer_gps: '1-2 business days',
      qatar_bank_transfer: '2-6 hours',
      crypto: '1-2 hours'
    };
    return times[paymentMethod] || '24 hours';
  }

  // Track payment events for analytics
  trackPaymentEvent(event, planKey, method, error = null) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `payment_${event}`, {
        plan: planKey,
        method: method,
        value: this.plans[planKey]?.price || 0,
        currency: 'USD',
        error: error?.message || null
      });
    }
  }
}

export default new PayoneerService();
