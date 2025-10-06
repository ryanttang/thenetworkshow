#!/usr/bin/env node

/**
 * Comprehensive fix script for Supabase authentication issues
 * This script will fix all API endpoints that are using the anonymous key instead of service role key
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'src', 'app', 'api');

// Files that need to be fixed
const filesToFix = [
  'subscribers/route.ts',
  'videos/[id]/route.ts', 
  'contact/route.ts'
];

// Pattern to replace
const ANON_KEY_PATTERN = /process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!/g;
const SERVICE_ROLE_KEY_PATTERN = /process\.env\.SUPABASE_SERVICE_ROLE_KEY!/g;

// Import pattern to add
const IMPORT_TO_ADD = `import { supabaseRequest } from "@/lib/supabase-server";`;

function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  const fullPath = path.join(API_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Add import if not already present
  if (!content.includes('supabaseRequest')) {
    // Find the last import statement
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    if (importLines.length > 0) {
      const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
      const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
      content = content.slice(0, insertIndex) + IMPORT_TO_ADD + '\n' + content.slice(insertIndex);
    }
  }
  
  // Replace anonymous key with service role key in fetch calls
  content = content.replace(ANON_KEY_PATTERN, 'process.env.SUPABASE_SERVICE_ROLE_KEY');
  
  // Replace fetch calls with supabaseRequest calls
  content = content.replace(
    /await fetch\(`\$\{process\.env\.NEXT_PUBLIC_SUPABASE_URL\}\/rest\/v1\/([^`]+)`,\s*\{([^}]+)\}\);/g,
    (match, endpoint, options) => {
      // Extract method and body from options
      const methodMatch = options.match(/method:\s*['"`]([^'"`]+)['"`]/);
      const method = methodMatch ? methodMatch[1] : 'GET';
      
      const bodyMatch = options.match(/body:\s*([^,}]+)/);
      const body = bodyMatch ? bodyMatch[1] : undefined;
      
      const headersMatch = options.match(/headers:\s*\{([^}]+)\}/);
      const headers = headersMatch ? `{${headersMatch[1]}}` : '{}';
      
      let supabaseCall = `await supabaseRequest('${endpoint}', {\n      method: '${method}',\n      headers: ${headers}`;
      
      if (body) {
        supabaseCall += `,\n      body: ${body}`;
      }
      
      supabaseCall += '\n    }, true); // Use service role';
      
      return supabaseCall;
    }
  );
  
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Fixed ${filePath}`);
}

function main() {
  console.log('🔧 Fixing Supabase authentication issues in API endpoints...\n');
  
  filesToFix.forEach(fixFile);
  
  console.log('\n✅ All files have been fixed!');
  console.log('\n📋 Next steps:');
  console.log('1. Add SUPABASE_SERVICE_ROLE_KEY to your environment variables');
  console.log('2. Deploy your application');
  console.log('3. Test the API endpoints');
  
  console.log('\n🔑 To get your service role key:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the "service_role" key');
  console.log('5. Add it to your Vercel environment variables');
}

if (require.main === module) {
  main();
}

module.exports = { fixFile };
