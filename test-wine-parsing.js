/**
 * Test script for wine list parsing logic
 * Tests the extractWineFromLine function with various real-world examples
 */

// Simulate the extractWineFromLine function logic for testing
// This is a simplified version focusing on the parsing patterns

const testCases = [
  // Example from user's request
  {
    input: "Ca Del Bosco, Cuvee' Prestige Ed 45 NV - Franciacorta DOCG",
    category: "Sparkling",
    expected: {
      wineName: "Ca Del Bosco, Cuvee' Prestige Ed 45 NV - Franciacorta DOCG",
      producer: "Ca' del Bosco",
      vintage: "NV",
      region: "Franciacorta DOCG",
      description: "Region: Franciacorta DOCG"
    }
  },
  // Italian producer examples
  {
    input: "G.D Vajra, Barolo 'Albe' 2019",
    category: "Red Wine",
    expected: {
      wineName: "G.D Vajra, Barolo 'Albe' 2019",
      producer: "G.D Vajra",
      vintage: "2019",
      region: "Barolo DOCG",
      description: "Region: Barolo DOCG"
    }
  },
  {
    input: "'Novecento' - Chianti Classico Riserva",
    category: "Red Wine",
    expected: {
      wineName: "'Novecento' - Chianti Classico Riserva",
      producer: "Unknown Producer",
      vintage: "NV",
      region: "Chianti Classico DOCG",
      description: "Region: Chianti Classico DOCG"
    }
  },
  // Grape percentage examples
  {
    input: "Sangiovese 95%, Canaiolo 3%, Colorino 2% - Chianti Classico DOCG",
    category: "Red Wine",
    expected: {
      wineName: "Sangiovese 95%, Canaiolo 3%, Colorino 2% - Chianti Classico DOCG",
      producer: "Unknown Producer",
      vintage: "NV",
      description: "Region: Chianti Classico DOCG. Grape Blend: Sangiovese 95%, Canaiolo 3%, Colorino 2%"
    }
  },
  // With prices
  {
    input: "Barolo 'Albe' 2019 - C.D Vajra $85",
    category: "Red Wine",
    expected: {
      wineName: "Barolo 'Albe' 2019 - C.D Vajra",
      producer: "C.D Vajra",
      vintage: "2019",
      description: "Region: Barolo DOCG"
    }
  },
  // French examples
  {
    input: "Domaine Leflaive, Puligny-Montrachet Premier Cru 2020",
    category: "White Wine",
    expected: {
      wineName: "Domaine Leflaive, Puligny-Montrachet Premier Cru 2020",
      producer: "Domaine Leflaive",
      vintage: "2020",
      description: "Region: Puligny-Montrachet Premier Cru"
    }
  },
  // Complex blend example
  {
    input: "Chard 75%, P. Noir 15%, Bianco 10% - Franciacorta DOCG",
    category: "Sparkling",
    expected: {
      wineName: "Chard 75%, P. Noir 15%, Bianco 10% - Franciacorta DOCG",
      producer: "Unknown Producer",
      vintage: "NV",
      description: "Region: Franciacorta DOCG. Grape Blend: Chard 75%, P. Noir 15%, Bianco 10%"
    }
  },
  // Simple format
  {
    input: "Pinot Noir 2021",
    category: "Red Wine",
    expected: {
      wineName: "Pinot Noir 2021",
      producer: "Unknown Producer",
      vintage: "2021",
      description: undefined
    }
  },
  // With serving style
  {
    input: "Prosecco DOCG $12/glass",
    category: "Sparkling",
    expected: {
      wineName: "Prosecco DOCG",
      producer: "Unknown Producer",
      vintage: "NV",
      servingStyle: "glass",
      description: "Region: Prosecco DOCG"
    }
  }
];

// Simplified parsing function for testing (mimics the actual logic)
function parseWineLine(line, category) {
  // Remove prices
  let wineText = line.replace(/\$\s*[\d,]+(?:\.\d{2})?/g, '').trim();
  wineText = wineText.replace(/\s+\d{2,3}\s*$/g, (match, num) => {
    const numValue = parseInt(num);
    if (numValue >= 1900 && numValue <= 2099) return match;
    if (numValue >= 5 && numValue <= 500) return '';
    return match;
  }).trim();
  wineText = wineText.replace(/\$\d+\s*\/(?:glass|btl|bottle)/gi, '').trim();
  wineText = wineText.replace(/\b(glass|bottle|by the glass|by the bottle)\b/gi, '').trim();
  
  const fullWineNameOriginal = wineText.replace(/\s+/g, ' ').trim();
  
  // Extract vintage
  const vintageMatch = wineText.match(/\b(19|20)\d{2}\b/);
  const vintage = vintageMatch ? vintageMatch[0] : 'NV';
  
  // Extract appellations
  const appellationPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+DOCG?|AOC|IGT|AVA|DOP|DO|DOQ|VdP|VdT))\b/g;
  const regionMatches = fullWineNameOriginal.match(appellationPattern);
  
  // Extract producer
  const producerMatch = fullWineNameOriginal.match(/^([A-Z][A-Za-z'.\s-]+?),\s+(.+)$/);
  let producer = producerMatch ? producerMatch[1].trim() : 'Unknown Producer';
  
  // Normalize producer
  if (producer !== 'Unknown Producer') {
    producer = producer.replace(/\bCa\s+del\b/gi, "Ca' del");
    producer = producer.replace(/\s+/g, ' ').trim();
  }
  
  // Extract grape percentages
  const grapePercentagePattern = /([A-Za-z]+(?:\s+[A-Za-z]+)*(?:\s+[A-Z][a-z]+)*)\s+\d+%/g;
  const grapeMatches = wineText.match(grapePercentagePattern);
  
  // Build description
  let description = '';
  if (regionMatches && regionMatches.length > 0) {
    description = `Region: ${regionMatches.join(', ')}`;
  }
  if (grapeMatches && grapeMatches.length > 0) {
    if (description) {
      description += `. Grape Blend: ${grapeMatches.join(', ')}`;
    } else {
      description = `Grape Blend: ${grapeMatches.join(', ')}`;
    }
  }
  
  // Determine serving style
  let servingStyle = 'both';
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes('/glass') || lowerLine.includes('by the glass')) {
    servingStyle = 'glass';
  } else if (lowerLine.includes('/btl') || lowerLine.includes('/bottle') || lowerLine.includes('by the bottle')) {
    servingStyle = 'bottle';
  }
  
  return {
    wineName: fullWineNameOriginal,
    producer,
    vintage,
    servingStyle,
    category: category || 'Wine',
    description: description || undefined
  };
}

// Run tests
console.log('=== Wine Parsing Test Suite ===\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase.input}"`);
  console.log(`Category: ${testCase.category}`);
  
  const result = parseWineLine(testCase.input, testCase.category);
  const expected = testCase.expected;
  
  let testPassed = true;
  const issues = [];
  
  // Check each expected field
  if (expected.wineName && result.wineName !== expected.wineName) {
    testPassed = false;
    issues.push(`wineName: expected "${expected.wineName}", got "${result.wineName}"`);
  }
  
  if (expected.producer && result.producer !== expected.producer) {
    testPassed = false;
    issues.push(`producer: expected "${expected.producer}", got "${result.producer}"`);
  }
  
  if (expected.vintage && result.vintage !== expected.vintage) {
    testPassed = false;
    issues.push(`vintage: expected "${expected.vintage}", got "${result.vintage}"`);
  }
  
  if (expected.servingStyle && result.servingStyle !== expected.servingStyle) {
    testPassed = false;
    issues.push(`servingStyle: expected "${expected.servingStyle}", got "${result.servingStyle}"`);
  }
  
  if (expected.description) {
    if (!result.description || !result.description.includes(expected.description.split(': ')[1])) {
      testPassed = false;
      issues.push(`description: expected to include "${expected.description}", got "${result.description}"`);
    }
  }
  
  if (testPassed) {
    console.log('✅ PASSED');
    passed++;
  } else {
    console.log('❌ FAILED');
    issues.forEach(issue => console.log(`   - ${issue}`));
    failed++;
  }
  
  console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
  console.log('');
});

console.log('=== Test Results ===');
console.log(`Total: ${testCases.length}`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ❌`);
console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

