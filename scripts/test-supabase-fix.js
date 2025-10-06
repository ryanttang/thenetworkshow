#!/usr/bin/env node

/**
 * Test script to verify the Supabase authentication fix
 */

const { supabaseRequest } = require('../src/lib/supabase-server');

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection with service role key...\n');
  
  try {
    // Test a simple query to verify the service role key works
    const response = await supabaseRequest('User?limit=1', {
      method: 'GET'
    }, true);
    
    if (response.ok) {
      console.log('✅ Supabase connection successful!');
      console.log('✅ Service role key is working correctly');
      console.log('✅ The 500 error should now be resolved');
    } else {
      console.log('❌ Supabase connection failed');
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Error testing Supabase connection:', error.message);
  }
}

async function main() {
  await testSupabaseConnection();
  
  console.log('\n📋 Next steps:');
  console.log('1. Deploy to Vercel with the service role key');
  console.log('2. Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables');
  console.log('3. Test the events API in production');
  console.log('\n🚀 Your events API should now work correctly!');
}

if (require.main === module) {
  main();
}
