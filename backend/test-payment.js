// Test script to simulate M-PESA payment
const axios = require('axios');

const testPayment = async () => {
  const paymentData = {
    TransactionType: "Pay Bill",
    TransID: `TEST${Date.now()}`,
    TransTime: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
    TransAmount: "2500",
    BusinessShortCode: "600966",
    BillRefNumber: "STU001",
    InvoiceNumber: "",
    OrgAccountBalance: "50000.00",
    ThirdPartyTransID: "",
    MSISDN: "254712345678",
    FirstName: "JOHN",
    MiddleName: "DOE",
    LastName: "SMITH"
  };

  try {
    console.log('📤 Sending test payment to M-PESA confirmation endpoint...');
    console.log('Payment Data:', JSON.stringify(paymentData, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/mobile/confirmation', paymentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response:', response.data);
    console.log('\n🎉 Test payment sent successfully!');
    console.log('Check your dashboard for the live update!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testPayment();
