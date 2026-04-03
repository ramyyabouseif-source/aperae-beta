/**
 * Simple OCR Test Script
 * Tests the OCR endpoint step by step
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const OCR_ENDPOINT = `${BACKEND_URL}/api/ocr/extract-text`;

// Small test image (1x1 pixel PNG in base64)
const TEST_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testOCR() {
  console.log('=== OCR Endpoint Test ===\n');
  
  // Step 1: Check if backend is running
  console.log('Step 1: Checking if backend is accessible...');
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend is running');
      console.log(`   Mock Mode: ${healthData.mockMode || 'unknown'}`);
      console.log(`   Vision Status: ${healthData.dependencies?.googleVision?.status || 'unknown'}`);
      console.log(`   Vision Message: ${healthData.dependencies?.googleVision?.message || 'unknown'}\n`);
    } else {
      console.log('❌ Backend health check failed:', healthResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ Cannot reach backend:', error.message);
    console.log(`   Make sure backend is running on ${BACKEND_URL}`);
    return;
  }

  // Step 2: Test OCR endpoint with a simple image
  console.log('Step 2: Testing OCR endpoint...');
  try {
    const response = await fetch(OCR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: TEST_IMAGE_BASE64,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ OCR endpoint responded successfully');
      console.log(`   Mock Data: ${data.mock ? 'YES' : 'NO'}`);
      console.log(`   Text: "${data.text}"`);
      console.log(`   Confidence: ${data.confidence}`);
      
      if (data.mock) {
        console.log('\n⚠️  WARNING: Backend is returning MOCK data');
        console.log('   Google Vision API is not configured or not available');
        console.log('   Check your environment variables:');
        console.log('   - GOOGLE_CLOUD_PROJECT_ID');
        console.log('   - GOOGLE_CLOUD_CLIENT_EMAIL');
        console.log('   - GOOGLE_CLOUD_PRIVATE_KEY');
        console.log('   OR set GOOGLE_APPLICATION_CREDENTIALS');
        console.log('   OR set MOCK_MODE=false to test with real API');
      } else {
        console.log('\n✅ Google Vision API is working!');
      }
    } else {
      console.log('❌ OCR endpoint returned error:', response.status);
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Failed to call OCR endpoint:', error.message);
    console.log('   Make sure the endpoint is correct:', OCR_ENDPOINT);
  }
}

// Run the test
testOCR().catch(console.error);



