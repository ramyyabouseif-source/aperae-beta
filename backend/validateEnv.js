// Base required environment variables
const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'REFRESH_SECRET'
];

// Only require Anthropic API key if not in mock mode
if (process.env.MOCK_MODE !== 'true') {
  requiredEnvVars.push('ANTHROPIC_API_KEY');
}

console.log('🔍 Validating environment variables...');

// Log mock mode status
if (process.env.MOCK_MODE === 'true') {
  console.log('🤖 Mock mode enabled - Anthropic API key not required');
} else {
  console.log('🔑 Production mode - Anthropic API key required');
}

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
  console.log(`✅ ${envVar} is configured`);
});

// Check for placeholder values (only if Anthropic key is required)
if (process.env.MOCK_MODE !== 'true' && process.env.ANTHROPIC_API_KEY) {
  const placeholderPatterns = [
    'sk-ant-your-claude-api-key-here',
    'sk-ant-placeholder',
    'your-api-key-here',
    'sk-ant-removed_for_security'
  ];

  if (placeholderPatterns.includes(process.env.ANTHROPIC_API_KEY)) {
    console.error('❌ Anthropic API key not configured properly - still using placeholder');
    process.exit(1);
  }
}

console.log('✅ All environment variables validated successfully');