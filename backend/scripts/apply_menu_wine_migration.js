/**
 * Apply Menu Wine Table Migration
 * Executes the SQL migration to create the menu_wines table
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Reading migration SQL file...');
    const migrationPath = path.join(__dirname, '../prisma/migrations/manual_add_menu_wine_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing migration SQL (only creating menu_wines table - existing tables are safe)...');
    
    // Execute the entire SQL script as-is (using IF NOT EXISTS for safety)
    // This only creates new objects and won't affect existing tables
    console.log('Executing CREATE TABLE IF NOT EXISTS for menu_wines...');
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log('✅ Migration applied successfully!');
    console.log('The menu_wines table has been created.');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    
    // Check if table already exists (that's okay)
    if (error.message && error.message.includes('already exists')) {
      console.log('ℹ️  Table already exists - migration may have already been applied.');
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

