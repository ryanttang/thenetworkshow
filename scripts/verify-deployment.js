#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

console.log('🔍 Verifying deployment...');

// Configuration
const config = {
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  timeout: 10000,
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: config.timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test health endpoint
async function testHealthEndpoint() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await makeRequest(`${config.baseUrl}/api/health`);
    
    if (response.status === 200) {
      const healthData = JSON.parse(response.data);
      console.log('✅ Health check passed');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Database: ${healthData.database.status}`);
      console.log(`   Environment: ${healthData.environment}`);
      
      if (healthData.environment_variables.status === 'incomplete') {
        console.log('⚠️  Missing environment variables:', healthData.environment_variables.missing);
      }
      
      return true;
    } else {
      console.log('❌ Health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

// Test main page
async function testMainPage() {
  try {
    console.log('🏠 Testing main page...');
    const response = await makeRequest(config.baseUrl);
    
    if (response.status === 200) {
      console.log('✅ Main page accessible');
      return true;
    } else {
      console.log('❌ Main page failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Main page error:', error.message);
    return false;
  }
}

// Test security headers
async function testSecurityHeaders() {
  try {
    console.log('🔒 Testing security headers...');
    const response = await makeRequest(config.baseUrl);
    
    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy',
      'content-security-policy',
      'strict-transport-security'
    ];
    
    const missingHeaders = requiredHeaders.filter(header => 
      !response.headers[header] && !response.headers[header.toLowerCase()]
    );
    
    if (missingHeaders.length === 0) {
      console.log('✅ Security headers present');
      return true;
    } else {
      console.log('⚠️  Missing security headers:', missingHeaders);
      return false;
    }
  } catch (error) {
    console.log('❌ Security headers test error:', error.message);
    return false;
  }
}

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('🗄️  Testing database connection...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' });
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

// Main verification function
async function verifyDeployment() {
  console.log(`🌐 Testing deployment at: ${config.baseUrl}`);
  console.log('');

  const tests = [
    { name: 'Health Endpoint', fn: testHealthEndpoint },
    { name: 'Main Page', fn: testMainPage },
    { name: 'Security Headers', fn: testSecurityHeaders },
    { name: 'Database Connection', fn: testDatabaseConnection },
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.log(`❌ ${test.name} error:`, error.message);
      results.push({ name: test.name, passed: false });
    }
    console.log('');
  }

  // Summary
  console.log('📊 Deployment Verification Summary:');
  console.log('=====================================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log('');
  console.log(`Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 Deployment verification successful!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.');
    process.exit(1);
  }
}

// Run verification
verifyDeployment().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
