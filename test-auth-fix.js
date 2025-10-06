#!/usr/bin/env node

/**
 * Test script to verify authentication fix
 * This script tests the authentication endpoint to ensure it's working properly
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXTAUTH_URL || 'https://thenetworkshow.vercel.app';

async function testAuthEndpoint() {
  console.log('🔍 Testing authentication endpoint...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  try {
    // Test 1: Check if NextAuth endpoints are accessible
    console.log('\n1️⃣ Testing NextAuth endpoints...');
    
    const endpoints = [
      '/api/auth/providers',
      '/api/auth/csrf',
      '/api/debug/env',
      '/api/debug/nextauth'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        console.log(`   ✅ ${endpoint}: ${response.status} ${response.statusText}`);
        
        if (endpoint === '/api/debug/env') {
          const data = await response.json();
          console.log('   📊 Environment check:', data.environment);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.message}`);
      }
    }
    
    // Test 2: Test credentials authentication
    console.log('\n2️⃣ Testing credentials authentication...');
    
    // First get CSRF token
    const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`);
    if (!csrfResponse.ok) {
      throw new Error(`Failed to get CSRF token: ${csrfResponse.status}`);
    }
    
    const csrfData = await csrfResponse.json();
    console.log(`   🔑 CSRF token obtained: ${csrfData.csrfToken ? 'Yes' : 'No'}`);
    
    // Test with demo credentials
    const testCredentials = {
      email: 'network_admin@example.com',
      password: 'admin123!',
      redirect: 'false',
      csrfToken: csrfData.csrfToken
    };
    
    const authResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(testCredentials)
    });
    
    console.log(`   🔐 Auth response: ${authResponse.status} ${authResponse.statusText}`);
    
    if (authResponse.status === 200) {
      console.log('   ✅ Authentication successful!');
    } else if (authResponse.status === 401) {
      console.log('   ❌ Authentication failed - 401 Unauthorized');
      console.log('   💡 This suggests the NEXTAUTH_SECRET or DATABASE_URL is not properly configured');
    } else {
      console.log(`   ⚠️  Unexpected response: ${authResponse.status}`);
    }
    
    // Test 3: Check environment variables
    console.log('\n3️⃣ Environment variable check...');
    const envResponse = await fetch(`${BASE_URL}/api/debug/env`);
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('   📋 Environment status:');
      Object.entries(envData.environment).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testAuthEndpoint()
  .then(() => {
    console.log('\n✅ Authentication test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Authentication test failed:', error.message);
    process.exit(1);
  });
