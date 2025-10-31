/**
 * Simple test script to verify Google Vision API is working
 */

const { ImageAnnotatorClient } = require('@google-cloud/vision');

async function testVisionAPI() {
  try {
    console.log('Testing Google Vision API...');
    
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
    console.error('Full error:', error);
  }
}

testVisionAPI();




