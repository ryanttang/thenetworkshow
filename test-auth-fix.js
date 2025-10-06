#!/usr/bin/env node

/**
 * Authentication Fix Verification Script
 * Tests the authentication system after applying the pgbouncer fix
 */

const https = require('https');

const BASE_URL = 'https://thenetworkshow.vercel.app';

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  try {
    const result = await makeRequest('/api/health');
    console.log(`   Status: ${result.status}`);
    console.log(`   Database: ${result.data.database?.status || 'unknown'}`);
    
    if (result.data.status === 'healthy' && result.data.database?.status === 'connected') {
      console.log('   ✅ Health check passed');
      return true;
    } else {
      console.log('   ❌ Health check failed');
      console.log(`   Error: ${result.data.database?.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
    return false;
  }
}

async function testNextAuthConfig() {
  console.log('🔍 Testing NextAuth configuration...');
  try {
    const result = await makeRequest('/api/debug/nextauth');
    console.log(`   Status: ${result.status}`);
    
    if (result.status === 200 && result.data.success) {
      console.log('   ✅ NextAuth configuration is valid');
      console.log(`   Providers: ${result.data.data.authOptions?.providers?.length || 0}`);
      console.log(`   Environment: NEXTAUTH_SECRET=${result.data.data.environment?.NEXTAUTH_SECRET ? 'Set' : 'Missing'}`);
      console.log(`   Database: ${result.data.data.environment?.DATABASE_URL ? 'Connected' : 'Disconnected'}`);
      return true;
    } else {
      console.log('   ❌ NextAuth configuration failed');
      console.log(`   Errors: ${result.data.errors?.join(', ') || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ NextAuth configuration test failed:', error.message);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('🔍 Testing environment variables...');
  try {
    const result = await makeRequest('/api/debug/env');
    console.log(`   Status: ${result.status}`);
    
    if (result.status === 200) {
      const env = result.data.environment;
      console.log(`   NODE_ENV: ${env.NODE_ENV}`);
      console.log(`   DATABASE_URL: ${env.DATABASE_URL}`);
      console.log(`   NEXTAUTH_URL: ${env.NEXTAUTH_URL}`);
      console.log(`   NEXTAUTH_SECRET: ${env.NEXTAUTH_SECRET}`);
      console.log(`   VERCEL_URL: ${env.VERCEL_URL}`);
      
      if (env.DATABASE_URL === '✅ Set' && env.NEXTAUTH_SECRET === '✅ Set') {
        console.log('   ✅ Environment variables are properly configured');
        return true;
      } else {
        console.log('   ❌ Environment variables are missing');
        return false;
      }
    } else {
      console.log('   ❌ Environment variables test failed');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Environment variables test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Authentication Fix Verification\n');
  
  const healthOk = await testHealthEndpoint();
  console.log('');
  
  const nextAuthOk = await testNextAuthConfig();
  console.log('');
  
  const envOk = await testEnvironmentVariables();
  console.log('');
  
  console.log('📊 Test Results:');
  console.log(`   Health Endpoint: ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   NextAuth Config: ${nextAuthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Environment: ${envOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  if (healthOk && nextAuthOk && envOk) {
    console.log('🎉 All tests passed! Authentication should be working.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Try signing in at https://thenetworkshow.vercel.app/signin');
    console.log('2. Use demo credentials: network_admin@example.com / admin123!');
    console.log('3. Should redirect to /dashboard on success');
  } else {
    console.log('❌ Some tests failed. Authentication may still have issues.');
    console.log('');
    console.log('Troubleshooting steps:');
    console.log('1. Check if Supabase database is paused and resume it');
    console.log('2. Update DATABASE_URL in Vercel to bypass pgbouncer:');
    console.log('   Add ?pgbouncer=false&sslmode=require to connection string');
    console.log('3. Redeploy the application after updating environment variables');
  }
}

main().catch(console.error);