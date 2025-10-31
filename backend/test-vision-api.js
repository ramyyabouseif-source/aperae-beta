/**
 * Test script to verify Google Vision API setup
 * Run this with: node test-vision-api.js
 */

// Load environment variables
require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;

async function testVisionAPI() {
  try {
    console.log('Testing Google Vision API...');
    console.log('API Key:', API_KEY ? 'Present' : 'Missing');
    
    if (!API_KEY) {
      console.error('❌ EXPO_PUBLIC_GOOGLE_VISION_API_KEY not found in .env file');
      console.error('Please add: EXPO_PUBLIC_GOOGLE_VISION_API_KEY=your-actual-api-key');
      return;
    }
    
    console.log('API Key (first 10 chars):', API_KEY.substring(0, 10) + '...');
    
    // Test with a simple image (you can replace this with a base64 image)
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // 1x1 pixel image
    
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: testImage,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });
    
    if (response.ok) {
      console.log('✅ Google Vision API is working correctly!');
      console.log('Status:', response.status);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVisionAPI();
