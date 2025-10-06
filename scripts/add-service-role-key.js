#!/usr/bin/env node

/**
 * Script to add Supabase service role key to environment
 * This script will help you add the service role key to your .env file
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env');

function addServiceRoleKey() {
  console.log('🔑 Adding Supabase service role key to environment...\n');
  
  // Check if .env file exists
  if (!fs.existsSync(ENV_FILE)) {
    console.log('❌ .env file not found. Please create one first.');
    return;
  }
  
  // Read current .env content
  let content = fs.readFileSync(ENV_FILE, 'utf8');
  
  // Check if service role key already exists
  if (content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY already exists in .env file');
    return;
  }
  
  // Add service role key
  const serviceRoleKey = 'SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY_HERE"';
  
  // Add it after the existing Supabase variables
  if (content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    content = content.replace(
      /(NEXT_PUBLIC_SUPABASE_ANON_KEY="[^"]+")/,
      `$1\n${serviceRoleKey}`
    );
  } else {
    content += `\n${serviceRoleKey}\n`;
  }
  
  // Write back to file
  fs.writeFileSync(ENV_FILE, content);
  
  console.log('✅ Added SUPABASE_SERVICE_ROLE_KEY to .env file');
  console.log('\n📋 Next steps:');
  console.log('1. Replace "YOUR_SERVICE_ROLE_KEY_HERE" with your actual service role key');
  console.log('2. Get your service role key from: https://supabase.com/dashboard');
  console.log('3. Go to Settings > API and copy the "service_role" key');
  console.log('4. Add the same key to your Vercel environment variables');
  console.log('5. Redeploy your application');
}

function main() {
  addServiceRoleKey();
}

if (require.main === module) {
  main();
}

module.exports = { addServiceRoleKey };
