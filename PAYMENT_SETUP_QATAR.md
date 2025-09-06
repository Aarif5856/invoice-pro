# Invoice Pro - Qatar Payment Setup Guide

## Overview
Invoice Pro has been updated to support payment processing for Qatar-based operations using Payoneer as the primary payment provider.

## Payment Methods Available

### 1. Payoneer Direct (Recommended) 💳
- **How it works**: Direct transfer to your Payoneer account
- **Fees**: Small Payoneer processing fee
- **Activation Time**: Instant after confirmation
- **Best for**: International customers with Payoneer accounts

### 2. Wire Transfer (USD) 🏦  
- **How it works**: International wire transfer via Payoneer Global Payment Service
- **Bank Details**: Bank of America (SWIFT: BOFAUS3N)
- **Fees**: Bank charges may apply ($15-50 USD typically)
- **Activation Time**: 1-2 business days
- **Best for**: Corporate customers, large payments

### 3. Qatar Bank Transfer (QAR) 🇶🇦
- **How it works**: Direct transfer to Qatar National Bank account
- **Currency**: Qatar Riyal (QAR)
- **Fees**: No additional fees
- **Activation Time**: 2-6 hours during business hours
- **Best for**: Local Qatar customers

### 4. Cryptocurrency ₿
- **Supported**: Bitcoin, Ethereum, USDT (TRC20/ERC20)
- **Fees**: Network fees apply
- **Activation Time**: 1-2 hours after confirmation
- **Best for**: Tech-savvy customers preferring crypto

## Setup Required

### 1. Update PayoneerService.js
```javascript
// Your Payoneer account details
payoneerDetails: {
  email: 'your-payoneer-email@domain.com',
  accountId: 'YOUR_PAYONEER_ACCOUNT_ID'
}

// Your Qatar bank details  
localBankDetails: {
  bankName: 'Qatar National Bank',
  accountName: 'Your Business Name',
  accountNumber: 'YOUR_QNB_ACCOUNT_NUMBER',
  iban: 'QA58QNBA000000000000693123456',
  swiftCode: 'QNBAQAQA',
  email: 'payments@yourbusiness.com'
}
```

### 2. Configure Exchange Rates
The service automatically converts USD to QAR using approximate rate (1 USD = 3.64 QAR). Update this in production with real-time rates.

### 3. Manual Payment Verification
Currently set up for manual verification. All payment confirmations are processed manually by checking:
- Bank transfer confirmations
- Payoneer payment notifications
- Crypto transaction hashes

## Subscription Plans
- **Free**: 3 documents/month
- **Pro**: $9.99 USD/month (≈ 36 QAR)
- **Business**: $19.99 USD/month (≈ 73 QAR)

## User Flow
1. User selects a paid plan
2. System shows available payment methods for Qatar
3. User selects preferred payment method
4. System displays specific payment instructions
5. User completes payment and emails confirmation
6. Manual verification activates subscription

## Technical Implementation
- **Frontend**: React with inline payment method selection
- **Backend**: PayoneerService handles all payment processing
- **Analytics**: Google Analytics tracks payment events
- **Storage**: LocalStorage for pending activations (upgrade to database for production)

## Security Considerations
- No sensitive payment data stored locally
- All actual payments processed through verified external services
- Manual verification adds security layer
- Reference IDs prevent duplicate payments

## Next Steps for Production
1. Connect to real Payoneer API for automated processing
2. Implement webhook handlers for automatic activation
3. Add real-time exchange rate API
4. Set up proper backend database for payment tracking
5. Implement automated email notifications
6. Add payment status dashboard for admin

## Support
For payment issues, customers should email: payments@yourbusiness.com
Include Reference ID and payment confirmation details.

---
*Last updated: December 2024*
*Qatar-based Payoneer integration*
