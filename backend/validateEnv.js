// Base required environment variables
const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'REFRESH_SECRET'
];

// Only require OpenAI API key if not in mock mode
if (process.env.MOCK_MODE !== 'true') {
  requiredEnvVars.push('OPENAI_API_KEY');
}

console.log('🔍 Validating environment variables...');

// Log mock mode status
if (process.env.MOCK_MODE === 'true') {
  console.log('🤖 Mock mode enabled - OpenAI API key not required');
} else {
  console.log('🔑 Production mode - OpenAI API key required');
}

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
  console.log(`✅ ${envVar} is configured`);
});

// Check for placeholder values (only if OpenAI key is required)
if (process.env.MOCK_MODE !== 'true' && process.env.OPENAI_API_KEY) {
  const placeholderPatterns = [
    'sk-your-openai-api-key-here',
    'sk-placeholder',
    'your-api-key-here',
    'sk-removed_for_security'
  ];

  if (placeholderPatterns.includes(process.env.OPENAI_API_KEY)) {
    console.error('❌ OpenAI API key not configured properly - still using placeholder');
    process.exit(1);
  }
}

console.log('✅ All environment variables validated successfully');