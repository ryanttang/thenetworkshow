import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Box } from "@chakra-ui/react";

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
    <Box minH="100vh" bg="gray.50">
      <DashboardNav />
      <Box maxW="7xl" mx="auto" py={{ base: 4, md: 6, lg: 8 }} px={{ base: 4, md: 6, lg: 8, xl: 12 }}>
        {children}
      </Box>
    </Box>
  );
}
