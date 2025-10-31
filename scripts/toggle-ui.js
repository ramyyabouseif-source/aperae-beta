#!/usr/bin/env node

/**
 * UI Toggle Script
 * Easily switch between original and enhanced UI designs
 * 
 * Usage:
 *   node scripts/toggle-ui.js enhanced
 *   node scripts/toggle-ui.js original
 *   node scripts/toggle-ui.js status
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../src/config/uiConfig.ts');

const UI_VERSIONS = {
  original: 'original',
  enhanced: 'enhanced'
};

function readConfigFile() {
  try {
    return fs.readFileSync(CONFIG_FILE, 'utf8');
  } catch (error) {
    console.error('❌ Error reading config file:', error.message);
    process.exit(1);
  }
}

function writeConfigFile(content) {
  try {
    fs.writeFileSync(CONFIG_FILE, content, 'utf8');
    console.log('✅ Config file updated successfully');
  } catch (error) {
    console.error('❌ Error writing config file:', error.message);
    process.exit(1);
  }
}

function getCurrentVersion() {
  const content = readConfigFile();
  const match = content.match(/export const UI_VERSION: UIVersion = '([^']+)'/);
  return match ? match[1] : null;
}

function setVersion(version) {
  if (!UI_VERSIONS[version]) {
    console.error(`❌ Invalid version: ${version}`);
    console.log('Valid versions:', Object.keys(UI_VERSIONS).join(', '));
    process.exit(1);
  }

  const content = readConfigFile();
  const updatedContent = content.replace(
    /export const UI_VERSION: UIVersion = '[^']+'/,
    `export const UI_VERSION: UIVersion = '${version}'`
  );

  writeConfigFile(updatedContent);
  
  console.log(`🎨 UI switched to: ${version.toUpperCase()}`);
  console.log('🔄 Please restart your development server (npm start)');
}

function showStatus() {
  const currentVersion = getCurrentVersion();
  if (!currentVersion) {
    console.log('❌ Could not determine current UI version');
    return;
  }

  console.log(`🎨 Current UI version: ${currentVersion.toUpperCase()}`);
  
  if (currentVersion === 'enhanced') {
    console.log('✨ Enhanced features enabled:');
    console.log('   • Modern design system');
    console.log('   • Smooth animations');
    console.log('   • Enhanced wine cards');
    console.log('   • Hero sections');
    console.log('   • Micro-interactions');
  } else {
    console.log('📱 Original design active:');
    console.log('   • Clean, functional design');
    console.log('   • Simple interface');
    console.log('   • Original color scheme');
    console.log('   • Basic components');
  }
}

function showHelp() {
  console.log(`
🎛️  PocketSomm UI Toggle Script

Usage:
  node scripts/toggle-ui.js <command>

Commands:
  enhanced    Switch to enhanced UI design
  original    Switch to original UI design
  status      Show current UI version
  help        Show this help message

Examples:
  node scripts/toggle-ui.js enhanced
  node scripts/toggle-ui.js original
  node scripts/toggle-ui.js status

After switching, restart your development server:
  npm start
`);
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'enhanced':
    setVersion('enhanced');
    break;
  case 'original':
    setVersion('original');
    break;
  case 'status':
    showStatus();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    if (command) {
      console.error(`❌ Unknown command: ${command}`);
    }
    showHelp();
    process.exit(1);
}




