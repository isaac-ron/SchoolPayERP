const axios = require('axios');
const crypto = require('crypto');

/**
 * Bank Service - Handles integration with multiple Kenyan banks
 * Supports: Equity Bank (Jenga API), KCB Bank, Co-operative Bank
 */

class BankService {
  constructor() {
    this.tokenCache = new Map(); // Cache bank tokens
  }

  /**
   * Get bank service instance based on provider
   */
  getBankProvider(provider) {
    switch (provider) {
      case 'EQUITY':
        return new EquityBankService();
      case 'KCB':
        return new KCBBankService();
      case 'COOP':
        return new CoopBankService();
      default:
        throw new Error(`Unsupported bank provider: ${provider}`);
    }
  }

  /**
   * Process incoming bank webhook notification
   */
  async processWebhook(provider, payload, school) {
    const bankProvider = this.getBankProvider(provider);
    return await bankProvider.processWebhook(payload, school);
  }

  /**
   * Validate webhook signature/authenticity
   */
  validateWebhook(provider, payload, signature, school) {
    const bankProvider = this.getBankProvider(provider);
    return bankProvider.validateWebhook(payload, signature, school);
  }

  /**
   * Fetch recent transactions from bank (for reconciliation)
   */
  async fetchTransactions(provider, school, fromDate, toDate) {
    const bankProvider = this.getBankProvider(provider);
    return await bankProvider.fetchTransactions(school, fromDate, toDate);
  }

  /**
   * Register webhook callback URL with bank
   */
  async registerWebhook(provider, school, callbackUrl) {
    const bankProvider = this.getBankProvider(provider);
    return await bankProvider.registerWebhook(school, callbackUrl);
  }
}

/**
 * ========================================
 * EQUITY BANK (Jenga API) Implementation
 * ========================================
 */
class EquityBankService {
  constructor() {
    this.baseUrl = process.env.EQUITY_API_URL || 'https://uat.jengahq.io'; // Use production URL in prod
    this.tokenCache = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth token for Equity Jenga API
   */
  async getAccessToken(school) {
    // Check cache
    if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.tokenCache;
    }

    try {
      const credentials = school.bankIntegration.credentials;
      const auth = Buffer.from(`${credentials.consumerKey}:${credentials.consumerSecret}`).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/identity/v2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.tokenCache = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Subtract 1 min buffer
      
      return this.tokenCache;
    } catch (error) {
      console.error('Equity token error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Equity Bank');
    }
  }

  /**
   * Process Equity Bank webhook notification
   */
  async processWebhook(payload, school) {
    console.log('Processing Equity Bank webhook:', payload);

    // Parse Equity notification format
    const {
      transactionReference,
      amount,
      accountNumber, // Customer's reference (admission number)
      senderName,
      senderMobile,
      timestamp
    } = payload;

    return {
      transactionId: transactionReference,
      amount: parseFloat(amount),
      reference: accountNumber,
      paidBy: senderName,
      phoneNumber: senderMobile,
      timestamp: new Date(timestamp),
      source: 'BANK_TRANSFER',
      provider: 'EQUITY',
      rawPayload: payload
    };
  }

  /**
   * Validate Equity webhook signature
   */
  validateWebhook(payload, signature, school) {
    const secret = school.bankIntegration.credentials.apiSecret;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }

  /**
   * Fetch recent transactions for reconciliation
   */
  async fetchTransactions(school, fromDate, toDate) {
    try {
      const token = await this.getAccessToken(school);
      const credentials = school.bankIntegration.credentials;

      const response = await axios.post(
        `${this.baseUrl}/transaction/v2/accounts/transactions/query`,
        {
          accountNumber: credentials.accountNumber,
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.transactions || [];
    } catch (error) {
      console.error('Equity fetch error:', error.response?.data || error.message);
      throw new Error('Failed to fetch Equity Bank transactions');
    }
  }

  /**
   * Register webhook with Equity Bank
   */
  async registerWebhook(school, callbackUrl) {
    try {
      const token = await this.getAccessToken(school);
      
      const response = await axios.post(
        `${this.baseUrl}/transaction/v2/webhooks/subscribe`,
        {
          accountNumber: school.bankIntegration.credentials.accountNumber,
          callbackUrl: callbackUrl,
          eventType: 'CREDIT'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Equity webhook registration error:', error.response?.data || error.message);
      throw new Error('Failed to register Equity Bank webhook');
    }
  }
}

/**
 * ========================================
 * KCB BANK Implementation
 * ========================================
 */
class KCBBankService {
  constructor() {
    this.baseUrl = process.env.KCB_API_URL || 'https://uat.api.kcbbankgroup.com'; // Use production URL in prod
    this.tokenCache = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token for KCB API
   */
  async getAccessToken(school) {
    if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.tokenCache;
    }

    try {
      const credentials = school.bankIntegration.credentials;

      const response = await axios.post(
        `${this.baseUrl}/v1/token`,
        {
          grant_type: 'client_credentials',
          client_id: credentials.apiKey,
          client_secret: credentials.apiSecret
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      this.tokenCache = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
      
      return this.tokenCache;
    } catch (error) {
      console.error('KCB token error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with KCB Bank');
    }
  }

  /**
   * Process KCB Bank webhook notification
   */
  async processWebhook(payload, school) {
    console.log('Processing KCB Bank webhook:', payload);

    // Parse KCB notification format
    const {
      transaction_reference,
      transaction_amount,
      account_reference, // Customer's admission number
      sender_name,
      sender_phone,
      transaction_date
    } = payload;

    return {
      transactionId: transaction_reference,
      amount: parseFloat(transaction_amount),
      reference: account_reference,
      paidBy: sender_name,
      phoneNumber: sender_phone,
      timestamp: new Date(transaction_date),
      source: 'BANK_TRANSFER',
      provider: 'KCB',
      rawPayload: payload
    };
  }

  /**
   * Validate KCB webhook signature
   */
  validateWebhook(payload, signature, school) {
    const secret = school.bankIntegration.credentials.apiSecret;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('base64');
    
    return hash === signature;
  }

  /**
   * Fetch recent transactions
   */
  async fetchTransactions(school, fromDate, toDate) {
    try {
      const token = await this.getAccessToken(school);
      const credentials = school.bankIntegration.credentials;

      const response = await axios.get(
        `${this.baseUrl}/v1/accounts/${credentials.accountNumber}/transactions`,
        {
          params: {
            from_date: fromDate.toISOString().split('T')[0],
            to_date: toDate.toISOString().split('T')[0]
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.transactions || [];
    } catch (error) {
      console.error('KCB fetch error:', error.response?.data || error.message);
      throw new Error('Failed to fetch KCB Bank transactions');
    }
  }

  /**
   * Register webhook with KCB
   */
  async registerWebhook(school, callbackUrl) {
    try {
      const token = await this.getAccessToken(school);
      
      const response = await axios.post(
        `${this.baseUrl}/v1/webhooks`,
        {
          account_number: school.bankIntegration.credentials.accountNumber,
          callback_url: callbackUrl,
          event_types: ['credit']
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('KCB webhook registration error:', error.response?.data || error.message);
      throw new Error('Failed to register KCB Bank webhook');
    }
  }
}

/**
 * ========================================
 * CO-OPERATIVE BANK Implementation
 * ========================================
 */
class CoopBankService {
  constructor() {
    this.baseUrl = process.env.COOP_API_URL || 'https://developer.co-opbank.co.ke:9443'; // Use production URL in prod
    this.tokenCache = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token for Co-op Bank API
   */
  async getAccessToken(school) {
    if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.tokenCache;
    }

    try {
      const credentials = school.bankIntegration.credentials;
      const auth = Buffer.from(`${credentials.consumerKey}:${credentials.consumerSecret}`).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.tokenCache = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
      
      return this.tokenCache;
    } catch (error) {
      console.error('Co-op token error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Co-operative Bank');
    }
  }

  /**
   * Process Co-op Bank webhook notification
   */
  async processWebhook(payload, school) {
    console.log('Processing Co-op Bank webhook:', payload);

    // Parse Co-op notification format
    const {
      TransactionID,
      TransAmount,
      BillRefNumber, // Customer's admission number
      SenderName,
      MSISDN,
      TransTime
    } = payload;

    return {
      transactionId: TransactionID,
      amount: parseFloat(TransAmount),
      reference: BillRefNumber,
      paidBy: SenderName,
      phoneNumber: MSISDN,
      timestamp: new Date(TransTime),
      source: 'BANK_TRANSFER',
      provider: 'COOP',
      rawPayload: payload
    };
  }

  /**
   * Validate Co-op webhook signature
   */
  validateWebhook(payload, signature, school) {
    const secret = school.bankIntegration.credentials.apiSecret;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }

  /**
   * Fetch recent transactions
   */
  async fetchTransactions(school, fromDate, toDate) {
    try {
      const token = await this.getAccessToken(school);
      const credentials = school.bankIntegration.credentials;

      const response = await axios.post(
        `${this.baseUrl}/AccountBalance/1.0.0/AccountMiniStatement`,
        {
          AccountNumber: credentials.accountNumber,
          StartDate: fromDate.toISOString().split('T')[0],
          EndDate: toDate.toISOString().split('T')[0]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.Transactions || [];
    } catch (error) {
      console.error('Co-op fetch error:', error.response?.data || error.message);
      throw new Error('Failed to fetch Co-op Bank transactions');
    }
  }

  /**
   * Register webhook with Co-op Bank
   */
  async registerWebhook(school, callbackUrl) {
    try {
      const token = await this.getAccessToken(school);
      
      const response = await axios.post(
        `${this.baseUrl}/Notifications/Subscribe`,
        {
          AccountNumber: school.bankIntegration.credentials.accountNumber,
          CallbackUrl: callbackUrl,
          NotificationType: 'CREDIT'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Co-op webhook registration error:', error.response?.data || error.message);
      throw new Error('Failed to register Co-op Bank webhook');
    }
  }
}

// Export singleton instance
module.exports = new BankService();
