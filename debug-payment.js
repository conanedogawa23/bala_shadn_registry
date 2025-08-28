// Payment Debug Utility Script
// Run this in browser console on your payment pages to debug payment fetching issues

console.log('🔧 Payment Debug Utility Loaded');

// Function to test payment fetching
async function debugPaymentFetch(paymentId) {
  console.log('🔍 Debug: Testing payment fetch for ID:', paymentId);
  
  try {
    // Check if PaymentApiService is available
    if (typeof PaymentApiService === 'undefined') {
      console.error('❌ PaymentApiService not found. Make sure you\'re on a page that imports it.');
      return;
    }
    
    // Validate ID format
    const isValid = PaymentApiService.isValidPaymentId(paymentId);
    console.log('✅ ID Format Valid:', isValid);
    
    if (!isValid) {
      console.warn('⚠️ Invalid payment ID format. Expected MongoDB ObjectId (24 hex chars) or PAY-XXXXXXXX');
      return;
    }
    
    // Test the API call
    console.log('🚀 Making API request...');
    const result = await PaymentApiService.getPaymentById(paymentId);
    
    console.log('✅ Success! Payment data:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    
    // Provide specific debugging guidance
    if (error.message.includes('404')) {
      console.log('💡 Debugging tip: Payment not found. Try running listAllPaymentIds() to see available payments.');
    } else if (error.message.includes('400')) {
      console.log('💡 Debugging tip: Invalid ID format. Use MongoDB ObjectId (24 hex chars) or PAY-XXXXXXXX format.');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Debugging tip: Request timeout. Check if backend server is running.');
    } else if (error.message.includes('network')) {
      console.log('💡 Debugging tip: Network error. Check API URL and network connectivity.');
    }
    
    return null;
  }
}

// Function to list all available payment IDs
async function listAllPaymentIds() {
  console.log('📋 Fetching all available payment IDs...');
  
  try {
    const payments = await PaymentApiService.getAllPaymentIds();
    console.log('✅ Available payment IDs:');
    console.table(payments);
    
    if (payments.length === 0) {
      console.log('💡 No payments found. You may need to create some test payments first.');
    } else {
      console.log(`📊 Found ${payments.length} payments. Try using one of these IDs.`);
    }
    
    return payments;
  } catch (error) {
    console.error('❌ Error fetching payment list:', error);
    return [];
  }
}

// Function to test API connection
async function testApiConnection() {
  console.log('🌐 Testing API connection...');
  
  try {
    const response = await fetch(`${PaymentApiService.API_BASE_URL || 'https://4798fad6773c.ngrok-free.app/api/v1'}/payments?limit=1`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API connection successful!');
      console.log('📊 API Response:', data);
    } else {
      console.error('❌ API returned error:', data);
    }
  } catch (error) {
    console.error('❌ API connection failed:', error);
    console.log('💡 Check if backend server is running and API URL is correct.');
  }
}

// Make functions globally available
window.debugPaymentFetch = debugPaymentFetch;
window.listAllPaymentIds = listAllPaymentIds;
window.testApiConnection = testApiConnection;

console.log(`
📖 Available debug functions:
  • debugPaymentFetch(paymentId) - Test fetching a specific payment
  • listAllPaymentIds() - List all available payment IDs  
  • testApiConnection() - Test basic API connectivity

💡 Quick start:
  1. Run testApiConnection() to check API
  2. Run listAllPaymentIds() to see available payments
  3. Run debugPaymentFetch('payment-id-here') to test specific payment

🔧 Example usage:
  debugPaymentFetch('68a314ec1d0fb05214a794d4')  // MongoDB ObjectId
  debugPaymentFetch('PAY-001-2025-001')          // Payment ID format
`);
