import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    success: false,
    errors: [],
    data: {}
  };

  try {
    // Test 1: Auth options validation
    debugInfo.data.authOptions = {
      providers: authOptions.providers?.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type
      })) || [],
      session: authOptions.session,
      callbacks: Object.keys(authOptions.callbacks || {}),
      pages: authOptions.pages,
      debug: authOptions.debug,
      useSecureCookies: authOptions.useSecureCookies
    };

    // Test 2: Environment variables
    debugInfo.data.environment = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: !!process.env.DATABASE_URL
    };

    // Test 3: Session check
    try {
      const session = await getServerSession(authOptions);
      debugInfo.data.session = session ? {
        user: session.user,
        expires: session.expires
      } : null;
    } catch (sessionError) {
      debugInfo.errors.push(`Session check failed: ${sessionError}`);
    }

    // Test 4: Request headers
    debugInfo.data.requestHeaders = {
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      host: request.headers.get('host'),
      cookie: request.headers.get('cookie') ? 'present' : 'missing'
    };

    // Test 5: CSRF token check
    try {
      const csrfResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/csrf`, {
        method: 'GET',
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      });
      
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        debugInfo.data.csrf = {
          available: true,
          token: csrfData.csrfToken ? 'present' : 'missing'
        };
      } else {
        debugInfo.data.csrf = {
          available: false,
          status: csrfResponse.status
        };
      }
    } catch (csrfError) {
      debugInfo.errors.push(`CSRF check failed: ${csrfError}`);
    }

    // Test 6: Providers endpoint
    try {
      const providersResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/providers`, {
        method: 'GET',
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      });
      
      if (providersResponse.ok) {
        const providersData = await providersResponse.json();
        debugInfo.data.providers = providersData;
      } else {
        debugInfo.data.providers = {
          error: `Failed to fetch providers: ${providersResponse.status}`
        };
      }
    } catch (providersError) {
      debugInfo.errors.push(`Providers check failed: ${providersError}`);
    }

    debugInfo.success = true;

  } catch (error) {
    debugInfo.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return NextResponse.json(debugInfo, { 
    status: debugInfo.success ? 200 : 400 
  });
}
