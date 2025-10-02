import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";

// Force dynamic rendering for dashboard
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
}
