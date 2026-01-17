import api from './api';

// Dashboard API service
const dashboardService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent transactions
  getRecentTransactions: async (limit = 5) => {
    try {
      const response = await api.get(`/dashboard/transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  },

  // Get collection trends
  getCollectionTrends: async (days = 30) => {
    try {
      const response = await api.get(`/dashboard/trends?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching collection trends:', error);
      throw error;
    }
  },

  // Get payment methods breakdown
  getPaymentMethodsBreakdown: async () => {
    try {
      const response = await api.get('/dashboard/payment-methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods breakdown:', error);
      throw error;
    }
  }
};

export default dashboardService;
