import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Box, Container } from "@chakra-ui/react";
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
    <Box minH="100vh" bg="gray.50">
      <DashboardNav />
      <Box ml="250px">
        <Container maxW="7xl" py={8}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
