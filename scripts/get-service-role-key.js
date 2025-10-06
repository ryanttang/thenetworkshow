#!/usr/bin/env node

/**
 * Script to help get the Supabase service role key
 * This script will guide you through getting the service role key from Supabase dashboard
 */

console.log('🔑 Supabase Service Role Key Setup');
console.log('=====================================\n');

console.log('To fix the 500 error in your events API, you need to add the Supabase service role key to your environment variables.\n');

console.log('📋 Steps to get your service role key:');
console.log('1. Go to your Supabase project dashboard: https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings > API');
console.log('4. Copy the "service_role" key (NOT the anon key)');
console.log('5. Add it to your environment variables\n');

console.log('🔧 For local development:');
console.log('Add this line to your .env file:');
console.log('SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"\n');

console.log('🚀 For production (Vercel):');
console.log('1. Go to your Vercel dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings > Environment Variables');
console.log('4. Add SUPABASE_SERVICE_ROLE_KEY with your service role key\n');

console.log('⚠️  Important:');
console.log('- The service role key bypasses Row Level Security (RLS)');
console.log('- Keep it secure and never expose it in client-side code');
console.log('- Only use it for server-side operations\n');

console.log('✅ After adding the key, redeploy your application and the events API should work correctly.');
