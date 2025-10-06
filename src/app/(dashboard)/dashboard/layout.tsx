import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - internal util for runtime guard
import { isRedirectError } from "next/dist/client/components/redirect";

// Force dynamic rendering for dashboard
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await getServerAuthSession();
    
    if (!session?.user?.email) {
      redirect("/signin");
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="max-w-7xl mx-auto py-4 md:py-6 lg:py-8 px-4 md:px-6 lg:px-8 xl:px-12">
          {children}
        </div>
      </div>
    );
  } catch (error) {
    try {
      if (isRedirectError?.(error)) {
        throw error;
      }
    } catch (_) {}

    try {
      const digest = (error as any)?.digest;
      const payload = {
        message: (error as Error)?.message,
        name: (error as Error)?.name,
        stack: (error as Error)?.stack,
        digest,
        pathname: "/dashboard",
        timestamp: new Date().toISOString(),
        extra: { phase: "dashboard-layout-catch" }
      };
      const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_SITE_URL || "https://thenetworkshow.vercel.app");
      await fetch(`${origin}/api/debug/error-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch {}
    throw error;
  }
}
