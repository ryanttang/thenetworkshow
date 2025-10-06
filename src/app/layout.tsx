import type { Metadata } from "next";
import Providers from "./providers";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import KeyboardShortcut from "@/components/ui/KeyboardShortcut";
import { OrganizationStructuredData, WebsiteStructuredData } from "@/components/seo/StructuredData";
import { Box, Image, ColorModeScript } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: {
    default: "The Network Show - Premier Cannabis Trade Show",
    template: "%s | The Network Show"
  },
  description: "Join The Network Show, the premier cannabis trade show connecting industry professionals, showcasing innovative products, and fostering business relationships in the cannabis industry.",
  keywords: [
    "cannabis trade show",
    "marijuana trade show",
    "cannabis industry",
    "cannabis networking",
    "cannabis business",
    "cannabis events",
    "cannabis expo",
    "cannabis conference",
    "cannabis professionals",
    "cannabis marketplace"
  ],
  authors: [{ name: "The Network Show" }],
  creator: "The Network Show",
  publisher: "The Network Show",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thenetworkshow.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "The Network Show - Premier Cannabis Trade Show",
    description: "Join The Network Show, the premier cannabis trade show connecting industry professionals, showcasing innovative products, and fostering business relationships in the cannabis industry.",
    url: 'https://thenetworkshow.com',
    siteName: 'The Network Show',
    images: [
      {
        url: '/network-photos.jpg',
        width: 1200,
        height: 630,
        alt: 'The Network Show - Premier Cannabis Trade Show',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "The Network Show - Premier Cannabis Trade Show",
    description: "Join The Network Show, the premier cannabis trade show connecting industry professionals, showcasing innovative products, and fostering business relationships in the cannabis industry.",
    images: ['/network-photos.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorModeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Changa+One:ital@0;1&family=SUSE+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/network-logo-white.png" />
        <link rel="apple-touch-icon" href="/network-logo-white.png" />
        <meta name="theme-color" content="#3c7d9f" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <OrganizationStructuredData />
        <WebsiteStructuredData />
      </head>
      <body>
        <Providers>
          <KeyboardShortcut />
          <Navbar />
          <Box width="100%" height={{ base: "220px", md: "260px", lg: "300px" }} overflow="hidden">
            <Image 
              src="/network-photos.jpg" 
              alt="The Network Show Banner" 
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
