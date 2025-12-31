/**
 * Database Connection Test Script
 * Tests the connection to Supabase PostgreSQL database
 * 
 * Usage: node test-db-connection.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env file');
    console.error('   Please add DATABASE_URL to backend/.env');
    process.exit(1);
  }

  // Mask password in connection string for logging
  const maskedUrl = process.env.DATABASE_URL.replace(
    /:([^:@]+)@/,
    ':****@'
  );
  console.log(`📋 Connection string: ${maskedUrl}\n`);

  const prisma = new PrismaClient({
    log: ['error'],
  });

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    await prisma.$connect();
    console.log('   ✅ Connected to database\n');

    // Test 2: Simple query
    console.log('2️⃣ Testing query capability...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('   ✅ Query executed successfully\n');

    // Test 3: Check if wine_recommendations table exists
    console.log('3️⃣ Checking wine_recommendations table...');
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wine_recommendations'
      ) as exists;
    `;
    
    if (tableCheck[0].exists) {
      console.log('   ✅ wine_recommendations table exists\n');
      
      // Test 4: Count rows (if any)
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM wine_recommendations;
      `;
      console.log(`   📊 Current row count: ${countResult[0].count}\n`);
    } else {
      console.log('   ⚠️  wine_recommendations table not found');
      console.log('   💡 This is okay if you just created the table\n');
    }

    // Test 5: Check indexes
    console.log('4️⃣ Checking indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'wine_recommendations';
    `;
    
    if (indexes.length > 0) {
      console.log(`   ✅ Found ${indexes.length} index(es):`);
      indexes.forEach(idx => {
        console.log(`      - ${idx.indexname}`);
      });
      console.log('');
    } else {
      console.log('   ⚠️  No indexes found (this is okay if table is new)\n');
    }

    // Success summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL TESTS PASSED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 Database connection is working correctly!');
    console.log('   You can now proceed with database integration.\n');

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ CONNECTION TEST FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.error('Error details:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}\n`);

    // Provide helpful error messages
    if (error.message.includes('authentication failed')) {
      console.error('💡 TROUBLESHOOTING:');
      console.error('   - Check if your password is correct');
      console.error('   - Verify special characters are URL-encoded');
      console.error('   - Try resetting your database password in Supabase\n');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('💡 TROUBLESHOOTING:');
      console.error('   - Check your internet connection');
      console.error('   - Verify the hostname in DATABASE_URL is correct\n');
    } else if (error.message.includes('timeout')) {
      console.error('💡 TROUBLESHOOTING:');
      console.error('   - Check your internet connection');
      console.error('   - Verify Supabase is accessible\n');
    } else {
      console.error('💡 TROUBLESHOOTING:');
      console.error('   - Verify DATABASE_URL format is correct');
      console.error('   - Check Supabase dashboard for connection issues');
      console.error('   - Ensure your IP is allowed (if IP restrictions enabled)\n');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database\n');
  }
}

// Run the test
testConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});













