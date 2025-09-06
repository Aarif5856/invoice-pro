// Local payment service for Sri Lanka
class LocalPaymentService {
  constructor() {
    this.plans = {
      pro: {
        price: 3000, // LKR
        currency: 'LKR',
        usdPrice: 9.99
      },
      business: {
        price: 6000, // LKR
        currency: 'LKR', 
        usdPrice: 19.99
      }
    };
    
    // Your Sri Lankan bank details
    this.bankDetails = {
      bankName: 'Commercial Bank of Ceylon',
      accountName: 'Your Business Name',
      accountNumber: 'XXXX-XXXX-XXXX',
      branch: 'Colombo Branch',
      swiftCode: 'CCEYLKLX'
    };
  }

  generatePaymentInstructions(planKey) {
    const plan = this.plans[planKey];
    if (!plan) {
      throw new Error(`Plan ${planKey} not found`);
    }

    const referenceId = `INV-${planKey.upper()}-${Date.now()}`;
    
    return {
      referenceId,
      amount: plan.price,
      currency: plan.currency,
      bankDetails: this.bankDetails,
      instructions: [
        `Transfer LKR ${plan.price} to the account details below`,
        `Use reference: ${referenceId}`,
        `Send payment confirmation to: payments@yourdomain.com`,
        `Include your email address in the transfer description`
      ],
      qrCode: this.generateQRCode(plan.price, referenceId)
    };
  }

  generateQRCode(amount, reference) {
    // Generate QR code for mobile banking
    return `upi://pay?pa=yourbank@upi&pn=InvoicePro&am=${amount}&cu=LKR&tn=${reference}`;
  }

  // For cryptocurrency payments (alternative)
  getCryptoPaymentDetails(planKey) {
    const plan = this.plans[planKey];
    return {
      btcAddress: '1YourBitcoinAddress',
      ethAddress: '0xYourEthereumAddress',
      usdtAddress: 'YourUSDTAddress',
      amount: plan.usdPrice,
      currency: 'USD'
    };
  }

  trackPaymentEvent(event, planKey, method = 'bank_transfer') {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `local_payment_${event}`, {
        plan: planKey,
        method: method,
        value: this.plans[planKey]?.price || 0,
        currency: 'LKR'
      });
    }
  }
}

export default new LocalPaymentService();
