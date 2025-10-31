/**
 * Test script to verify Google Vision API setup with Google Cloud client library
 * Run this with: node test-vision-api.js
 */

const { ImageAnnotatorClient } = require('@google-cloud/vision');

async function testVisionAPI() {
  try {
    console.log('Testing Google Vision API with client library...');
    
    // Initialize the client
    const client = new ImageAnnotatorClient({
      projectId: 'pocketsomm-vision-api',
      keyFilename: './google-vision-key.json',
    });
    
    console.log('✅ Google Cloud Vision client initialized');
    
    // Test with a simple base64 image (1x1 pixel)
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    console.log('Testing text detection...');
    
    const [result] = await client.textDetection({
      image: {
        content: testImage,
      },
    });
    
    console.log('✅ Google Vision API is working correctly!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ENOENT')) {
      console.error('❌ JSON key file not found. Make sure google-vision-key.json is in the project root.');
    } else if (error.message.includes('authentication')) {
      console.error('❌ Authentication failed. Check your service account permissions.');
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

testVisionAPI();