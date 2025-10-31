/**
 * Test file for wine sorting functionality
 * This file can be run to verify that wine sorting works correctly
 */

import { 
  extractNumericPrice, 
  sortWinesByPriceDescending, 
  sortWinesForAPIMode,
  sortWinesForMockMode 
} from '../utils/wineSorting';

// Test data with various price formats
const testWines = [
  {
    wineName: "Expensive Wine",
    producer: "Producer A",
    vintage: "2020",
    pricePoint: "$200",
    rationale: "Test rationale",
    tastingNotes: "Test notes",
    servingGuidance: "Test guidance",
    confidenceScore: 95,
    expertRating: "95 (Wine Spectator)",
    retailerSuggestion: "Test retailer",
    image: "test.jpg",
    storytellingElements: "Test story"
  },
  {
    wineName: "Cheap Wine",
    producer: "Producer B",
    vintage: "2021",
    pricePoint: "$25",
    rationale: "Test rationale",
    tastingNotes: "Test notes",
    servingGuidance: "Test guidance",
    confidenceScore: 85,
    expertRating: "85 (Wine Spectator)",
    retailerSuggestion: "Test retailer",
    image: "test.jpg",
    storytellingElements: "Test story"
  },
  {
    wineName: "Mid Range Wine",
    producer: "Producer C",
    vintage: "2019",
    pricePoint: "$75",
    rationale: "Test rationale",
    tastingNotes: "Test notes",
    servingGuidance: "Test guidance",
    confidenceScore: 90,
    expertRating: "90 (Wine Spectator)",
    retailerSuggestion: "Test retailer",
    image: "test.jpg",
    storytellingElements: "Test story"
  },
  {
    wineName: "Unknown Price Wine",
    producer: "Producer D",
    vintage: "2022",
    pricePoint: "unknown",
    rationale: "Test rationale",
    tastingNotes: "Test notes",
    servingGuidance: "Test guidance",
    confidenceScore: 80,
    expertRating: "80 (Wine Spectator)",
    retailerSuggestion: "Test retailer",
    image: "test.jpg",
    storytellingElements: "Test story"
  },
  {
    wineName: "Range Price Wine",
    producer: "Producer E",
    vintage: "2018",
    pricePoint: "$45-60",
    rationale: "Test rationale",
    tastingNotes: "Test notes",
    servingGuidance: "Test guidance",
    confidenceScore: 88,
    expertRating: "88 (Wine Spectator)",
    retailerSuggestion: "Test retailer",
    image: "test.jpg",
    storytellingElements: "Test story"
  }
];

// Test functions
function testExtractNumericPrice() {
  console.log('🧪 Testing extractNumericPrice function...');
  
  const testCases = [
    { input: "$200", expected: 200 },
    { input: "$25", expected: 25 },
    { input: "$45-60", expected: 60 }, // Should use higher value
    { input: "unknown", expected: 0 },
    { input: "", expected: 0 },
    { input: "$1,500", expected: 1500 }, // With comma
    { input: "£100", expected: 100 }, // Different currency
  ];
  
  testCases.forEach(({ input, expected }) => {
    const result = extractNumericPrice(input);
    const passed = result === expected;
    console.log(`${passed ? '✅' : '❌'} "${input}" -> ${result} (expected: ${expected})`);
  });
}

function testSortWinesByPriceDescending() {
  console.log('\n🧪 Testing sortWinesByPriceDescending function...');
  
  const sorted = sortWinesByPriceDescending(testWines);
  
  console.log('Original order:', testWines.map(w => `${w.wineName}: ${w.pricePoint}`));
  console.log('Sorted order:', sorted.map(w => `${w.wineName}: ${w.pricePoint}`));
  
  // Verify order
  const prices = sorted.map(w => extractNumericPrice(w.pricePoint));
  const isCorrectlySorted = prices.every((price, index) => {
    if (index === 0) return true;
    return price <= prices[index - 1] || price === 0; // Unknown prices at end
  });
  
  console.log(`${isCorrectlySorted ? '✅' : '❌'} Wines are correctly sorted by price (descending)`);
}

function testSortWinesForAPIMode() {
  console.log('\n🧪 Testing sortWinesForAPIMode function...');
  
  const sorted = sortWinesForAPIMode(testWines);
  
  console.log('API Mode sorted order:', sorted.map(w => `${w.wineName}: ${w.pricePoint}`));
  
  // Should be same as descending sort
  const prices = sorted.map(w => extractNumericPrice(w.pricePoint));
  const isCorrectlySorted = prices.every((price, index) => {
    if (index === 0) return true;
    return price <= prices[index - 1] || price === 0;
  });
  
  console.log(`${isCorrectlySorted ? '✅' : '❌'} API Mode sorting works correctly`);
}

function testSortWinesForMockMode() {
  console.log('\n🧪 Testing sortWinesForMockMode function...');
  
  const sorted = sortWinesForMockMode(testWines);
  
  // Should maintain original order
  const isUnchanged = JSON.stringify(sorted) === JSON.stringify(testWines);
  
  console.log(`${isUnchanged ? '✅' : '❌'} Mock Mode maintains original order`);
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Wine Sorting Tests...\n');
  
  testExtractNumericPrice();
  testSortWinesByPriceDescending();
  testSortWinesForAPIMode();
  testSortWinesForMockMode();
  
  console.log('\n✨ All tests completed!');
}

// Export for use in other files
export {
  testExtractNumericPrice,
  testSortWinesByPriceDescending,
  testSortWinesForAPIMode,
  testSortWinesForMockMode,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}




