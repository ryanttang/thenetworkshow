import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    success: false,
    errors: [],
    data: {}
  };

  try {
    // Get CSRF token
    const csrfResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/csrf`, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    debugInfo.data.csrfResponse = {
      status: csrfResponse.status,
      statusText: csrfResponse.statusText,
      ok: csrfResponse.ok
    };

    if (csrfResponse.ok) {
      const csrfData = await csrfResponse.json();
      debugInfo.data.csrfToken = csrfData.csrfToken;
      debugInfo.data.csrfTokenLength = csrfData.csrfToken?.length || 0;
    } else {
      debugInfo.errors.push(`CSRF endpoint returned ${csrfResponse.status}`);
    }

    // Test credentials signin with CSRF
    if (debugInfo.data.csrfToken) {
      const signinResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: new URLSearchParams({
          email: 'admin@example.com',
          password: 'admin123!',
          redirect: 'false',
          csrfToken: debugInfo.data.csrfToken
        })
      });

      debugInfo.data.signinResponse = {
        status: signinResponse.status,
        statusText: signinResponse.statusText,
        ok: signinResponse.ok,
        headers: Object.fromEntries(signinResponse.headers.entries())
      };

      if (signinResponse.status === 302) {
        debugInfo.data.redirectLocation = signinResponse.headers.get('location');
      }
    }

    debugInfo.success = true;

  } catch (error) {
    debugInfo.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return NextResponse.json(debugInfo, { 
    status: debugInfo.success ? 200 : 400 
  });
}
