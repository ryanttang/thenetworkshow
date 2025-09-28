import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    step: "start",
    duration: 0,
    success: false,
    errors: [],
    warnings: [],
    data: {}
  };

  try {
    const body = await request.json();
    const { email, password } = body;
    
    debugInfo.step = "request_parsed";
    debugInfo.data.email = email;
    debugInfo.data.hasPassword = !!password;

    // Step 1: Environment check
    debugInfo.step = "environment_check";
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV
    };
    debugInfo.data.environment = envCheck;

    if (!process.env.DATABASE_URL) {
      debugInfo.errors.push("DATABASE_URL not configured");
      return NextResponse.json(debugInfo);
    }

    // Step 2: Database connection test
    debugInfo.step = "database_connection";
    try {
      await prisma.$queryRaw`SELECT 1`;
      debugInfo.data.databaseConnected = true;
    } catch (dbError) {
      debugInfo.errors.push(`Database connection failed: ${dbError}`);
      debugInfo.data.databaseConnected = false;
      return NextResponse.json(debugInfo);
    }

    // Step 3: User lookup
    debugInfo.step = "user_lookup";
    if (!email || !password) {
      debugInfo.errors.push("Missing email or password");
      return NextResponse.json(debugInfo);
    }

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() }
    });
    
    debugInfo.data.userFound = !!user;
    if (user) {
      debugInfo.data.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPassword: !!user.hashedPassword,
        passwordLength: user.hashedPassword?.length || 0
      };
    } else {
      debugInfo.errors.push(`User not found: ${email}`);
      return NextResponse.json(debugInfo);
    }

    // Step 4: Password verification
    debugInfo.step = "password_verification";
    if (!user.hashedPassword) {
      debugInfo.errors.push("User has no password set");
      return NextResponse.json(debugInfo);
    }

    const isValidPassword = await compare(password, user.hashedPassword);
    debugInfo.data.passwordValid = isValidPassword;
    
    if (!isValidPassword) {
      debugInfo.errors.push("Invalid password");
      return NextResponse.json(debugInfo);
    }

    // Step 5: NextAuth session test
    debugInfo.step = "nextauth_session_test";
    try {
      const session = await getServerSession(authOptions);
      debugInfo.data.currentSession = session ? {
        user: session.user,
        expires: session.expires
      } : null;
    } catch (sessionError) {
      debugInfo.warnings.push(`Session check failed: ${sessionError}`);
    }

    // Step 6: Auth options validation
    debugInfo.step = "auth_options_validation";
    const authConfig = {
      providers: authOptions.providers?.length || 0,
      sessionStrategy: authOptions.session?.strategy,
      useSecureCookies: authOptions.useSecureCookies,
      debug: authOptions.debug
    };
    debugInfo.data.authConfig = authConfig;

    // Step 7: Cookie test
    debugInfo.step = "cookie_test";
    const cookies = request.headers.get('cookie');
    debugInfo.data.cookies = {
      present: !!cookies,
      nextAuthCsrf: cookies?.includes('next-auth.csrf-token') || false,
      nextAuthSession: cookies?.includes('next-auth.session-token') || false,
      cookieCount: cookies?.split(';').length || 0
    };

    // Step 8: Headers analysis
    debugInfo.step = "headers_analysis";
    const headers = {
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      host: request.headers.get('host'),
      contentType: request.headers.get('content-type')
    };
    debugInfo.data.headers = headers;

    // Success
    debugInfo.step = "success";
    debugInfo.success = true;
    debugInfo.data.authenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

  } catch (error) {
    debugInfo.step = "error";
    debugInfo.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    debugInfo.data.errorStack = error instanceof Error ? error.stack : null;
  } finally {
    debugInfo.duration = Date.now() - startTime;
  }

  return NextResponse.json(debugInfo, { 
    status: debugInfo.success ? 200 : 400 
  });
}

export async function GET() {
  return NextResponse.json({
    message: "Sign-in debug endpoint",
    usage: "POST with { email, password } to debug sign-in flow",
    timestamp: new Date().toISOString()
  });
}
