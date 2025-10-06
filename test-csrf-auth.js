#!/usr/bin/env node

/**
 * Comprehensive CSRF and Authentication Test
 * This script tests the CSRF token handling and authentication flow
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXTAUTH_URL || 'https://thenetworkshow.vercel.app';

async function testCSRFAuth() {
  console.log('🔍 Testing CSRF and Authentication flow...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  try {
    // Test 1: Check CSRF endpoint
    console.log('\n1️⃣ Testing CSRF token generation...');
    const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`);
    
    if (!csrfResponse.ok) {
      throw new Error(`CSRF endpoint failed: ${csrfResponse.status}`);
    }
    
    const csrfData = await csrfResponse.json();
    console.log(`   ✅ CSRF token obtained: ${csrfData.csrfToken ? 'Yes' : 'No'}`);
    console.log(`   📏 Token length: ${csrfData.csrfToken?.length || 0}`);
    
    // Test 2: Check providers endpoint
    console.log('\n2️⃣ Testing providers endpoint...');
    const providersResponse = await fetch(`${BASE_URL}/api/auth/providers`);
    
    if (!providersResponse.ok) {
      throw new Error(`Providers endpoint failed: ${providersResponse.status}`);
    }
    
    const providersData = await providersResponse.json();
    console.log(`   ✅ Providers available: ${Object.keys(providersData).join(', ')}`);
    
    // Test 3: Test credentials authentication with proper CSRF
    console.log('\n3️⃣ Testing credentials authentication...');
    
    // Create a session to get proper cookies
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`);
    const cookies = sessionResponse.headers.get('set-cookie') || '';
    
    console.log(`   🍪 Cookies received: ${cookies ? 'Yes' : 'No'}`);
    
    // Test with demo credentials and proper headers
    const authResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (compatible; AuthTest/1.0)',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/signin`
      },
      body: new URLSearchParams({
        email: 'network_admin@example.com',
        password: 'admin123!',
        redirect: 'false',
        csrfToken: csrfData.csrfToken
      })
    });
    
    console.log(`   🔐 Auth response: ${authResponse.status} ${authResponse.statusText}`);
    console.log(`   📋 Response headers:`, Object.fromEntries(authResponse.headers.entries()));
    
    if (authResponse.status === 200) {
      console.log('   ✅ Authentication successful!');
      const responseText = await authResponse.text();
      console.log(`   📄 Response body: ${responseText.substring(0, 200)}...`);
    } else if (authResponse.status === 401) {
      console.log('   ❌ Authentication failed - 401 Unauthorized');
      console.log('   💡 This suggests CSRF token validation or credentials issue');
      
      // Try to get more details
      const errorText = await authResponse.text();
      console.log(`   📄 Error response: ${errorText}`);
    } else if (authResponse.status === 302) {
      console.log('   🔄 Redirect response (expected for successful auth)');
      const location = authResponse.headers.get('location');
      console.log(`   📍 Redirect location: ${location}`);
    } else {
      console.log(`   ⚠️  Unexpected response: ${authResponse.status}`);
      const responseText = await authResponse.text();
      console.log(`   📄 Response: ${responseText}`);
    }
    
    // Test 4: Check environment variables
    console.log('\n4️⃣ Environment variable check...');
    const envResponse = await fetch(`${BASE_URL}/api/debug/env`);
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('   📋 Environment status:');
      Object.entries(envData.environment).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
      });
    }
    
    // Test 5: Check NextAuth configuration
    console.log('\n5️⃣ NextAuth configuration check...');
    const nextAuthResponse = await fetch(`${BASE_URL}/api/debug/nextauth`);
    if (nextAuthResponse.ok) {
      const nextAuthData = await nextAuthResponse.json();
      console.log('   ⚙️  NextAuth config:');
      console.log(`      Providers: ${nextAuthData.data?.authOptions?.providers?.length || 0}`);
      console.log(`      Session strategy: ${nextAuthData.data?.authOptions?.session?.strategy}`);
      console.log(`      Debug mode: ${nextAuthData.data?.authOptions?.debug}`);
      console.log(`      Trust host: ${nextAuthData.data?.authOptions?.trustHost}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCSRFAuth()
  .then(() => {
    console.log('\n✅ CSRF and Authentication test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ CSRF and Authentication test failed:', error.message);
    process.exit(1);
  });
