export class CurrencyService {
  constructor() {
    this.currencies = [
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'GBP', symbol: '£', name: 'British Pound' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
      { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
      { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
      { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
      { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' }
    ];
  }

  // Get all available currencies
  getCurrencies() {
    return this.currencies;
  }

  // Get currency symbol by code
  getCurrencySymbol(currencyCode) {
    const currency = this.currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  }

  // Get currency name by code
  getCurrencyName(currencyCode) {
    const currency = this.currencies.find(c => c.code === currencyCode);
    return currency ? currency.name : 'US Dollar';
  }

  // Format amount with currency symbol
  formatAmount(amount, currencyCode = 'USD') {
    const symbol = this.getCurrencySymbol(currencyCode);
    return `${symbol}${(amount || 0).toFixed(2)}`;
  }

  // Validate currency code
  isValidCurrency(currencyCode) {
    return this.currencies.some(c => c.code === currencyCode);
  }

  // Get currency by code
  getCurrency(currencyCode) {
    return this.currencies.find(c => c.code === currencyCode);
  }

  // Add new currency (for future extensibility)
  addCurrency(currency) {
    if (!currency.code || !currency.symbol || !currency.name) {
      throw new Error('Currency must have code, symbol, and name');
    }
    
    if (this.isValidCurrency(currency.code)) {
      throw new Error('Currency already exists');
    }
    
    this.currencies.push(currency);
    return currency;
  }
}

export default new CurrencyService();
