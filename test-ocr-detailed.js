/**
 * Detailed OCR Test Script
 * Tests with better error handling and logging
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const OCR_ENDPOINT = `${BACKEND_URL}/api/ocr/extract-text`;

// Better test image - a simple 2x2 pixel image that should work
const TEST_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVQIHWP8z8Dw/z8DAwMAGUADzN0HDQAAAABJRU5ErkJggg==';

async function testOCRDetailed() {
  console.log('=== Detailed OCR Test ===\n');
  
  console.log('Test image base64 length:', TEST_IMAGE_BASE64.length);
  console.log('Backend URL:', BACKEND_URL);
  console.log('OCR Endpoint:', OCR_ENDPOINT, '\n');
  
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

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()), '\n');

    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log('\n❌ Error Details:');
      console.log('   Error:', data.error);
      console.log('   Request ID:', data.requestId);
      console.log('\nCheck backend logs for more details.');
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    console.log('   Stack:', error.stack);
  }
}

testOCRDetailed().catch(console.error);



