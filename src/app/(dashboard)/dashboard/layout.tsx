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
      <div className="ml-64">
        <div className="max-w-7xl mx-auto py-8 px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
