/**
 * Complete OCR Test - Tests everything step by step
 */

const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function testComplete() {
  console.log('=== Complete OCR Troubleshooting Test ===\n');
  
  // Test 1: Backend Health
  console.log('Test 1: Backend Health Check');
  console.log('─'.repeat(50));
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Backend is running');
      console.log(`   Port: ${BACKEND_URL.split(':').pop()}`);
      console.log(`   Mock Mode: ${health.mockMode}`);
      console.log(`   Vision Status: ${health.dependencies?.googleVision?.status || 'unknown'}`);
      console.log(`   Vision Message: ${health.dependencies?.googleVision?.message || 'unknown'}`);
      
      if (health.dependencies?.googleVision?.status !== 'healthy') {
        console.log('\n⚠️  WARNING: Google Vision is not properly configured');
        console.log('   The OCR endpoint will return mock data');
      }
    } else {
      console.log('❌ Backend health check failed:', healthResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ Cannot reach backend:', error.message);
    console.log(`   Make sure backend is running: npm run backend`);
    return;
  }
  
  console.log('\n');
  
  // Test 2: OCR Endpoint with Valid Image
  console.log('Test 2: OCR Endpoint Test');
  console.log('─'.repeat(50));
  
  // Create a simple test image (tiny PNG with some text would be ideal, but using 1x1 for now)
  const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/ocr/extract-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: testImage,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ OCR endpoint is accessible');
      console.log(`   Response received: ${response.status}`);
      console.log(`   Mock Data: ${data.mock ? 'YES ⚠️' : 'NO ✅'}`);
      console.log(`   Text Extracted: "${data.text?.substring(0, 50) || 'empty'}..."`);
      console.log(`   Confidence: ${data.confidence || 0}`);
      console.log(`   Request ID: ${data.requestId}`);
      
      if (data.mock) {
        console.log('\n⚠️  Using MOCK data - Google Vision API not configured');
      } else if (!data.text || data.text.length === 0) {
        console.log('\n⚠️  No text detected (this might be normal for a 1x1 pixel image)');
      } else {
        console.log('\n✅ Google Vision API is working correctly!');
      }
    } else {
      console.log('❌ OCR endpoint error:', response.status);
      console.log('   Error:', data.error || 'Unknown error');
      console.log('   Error Message:', data.errorMessage || 'Not provided');
      console.log('   Error Code:', data.errorCode || 'Not provided');
      console.log('   Request ID:', data.requestId);
      
      if (data.errorMessage) {
        console.log('\n💡 Error Details:');
        console.log(`   ${data.errorMessage}`);
        
        if (data.errorMessage.includes('credentials')) {
          console.log('\n   → Check Google Cloud credentials');
        } else if (data.errorMessage.includes('permission')) {
          console.log('\n   → Check Google Cloud API permissions');
        } else if (data.errorMessage.includes('invalid')) {
          console.log('\n   → Check image format and base64 encoding');
        }
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
  
  console.log('\n');
  
  // Test 3: Frontend Configuration
  console.log('Test 3: Frontend Configuration Check');
  console.log('─'.repeat(50));
  
  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasApiUrl = envContent.includes('EXPO_PUBLIC_API_URL');
    console.log(`   EXPO_PUBLIC_API_URL configured: ${hasApiUrl ? 'YES ✅' : 'NO ⚠️'}`);
    
    if (!hasApiUrl) {
      console.log('\n   → Add to .env:');
      console.log(`     EXPO_PUBLIC_API_URL=${BACKEND_URL}`);
    }
  } else {
    console.log('⚠️  .env file not found');
    console.log('   → Create .env file with:');
    console.log(`     EXPO_PUBLIC_API_URL=${BACKEND_URL}`);
  }
  
  console.log('\n');
  console.log('=== Test Complete ===');
  console.log('\nNext Steps:');
  console.log('1. If backend test failed → Fix backend/Google Vision configuration');
  console.log('2. If backend returns mock data → Configure Google Vision credentials');
  console.log('3. If backend works but frontend fails → Check frontend API URL and image conversion');
}

testComplete().catch(console.error);



