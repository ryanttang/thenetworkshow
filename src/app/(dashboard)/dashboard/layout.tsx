import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";

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
      <div className="max-w-7xl mx-auto py-16 px-6 md:px-8 lg:px-12">
        {children}
      </div>
    </div>
  );
}
