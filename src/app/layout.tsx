import type { Metadata } from "next";
import Providers from "./providers";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import KeyboardShortcut from "@/components/ui/KeyboardShortcut";
import { Box, Image } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "THC Members Only Club",
  description: "A modern events management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <KeyboardShortcut />
          <Navbar />
          <Box width="100%" height={{ base: "120px", md: "160px", lg: "200px" }} overflow="hidden">
            <Image 
              src="/thcmembers-banner.png" 
              alt="THC Members Only Club Banner" 
              width="100%" 
              height="100%" 
              objectFit="cover"
            />
          </Box>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
