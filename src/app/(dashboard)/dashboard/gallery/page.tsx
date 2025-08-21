"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import GalleryManagement from "@/components/gallery/GalleryManagement";

interface Event {
  id: string;
  title: string;
  slug: string;
}

interface GalleryImage {
  id: string;
  title?: string | null;
  caption?: string | null;
  tags: string[];
  sortOrder: number;
  image: {
    id: string;
    variants: any;
    width: number;
    height: number;
  };
  createdAt: string;
}

interface Gallery {
  id: string;
  name: string;
  description?: string | null;
  tags: string[];
  event?: Event | null;
  images: GalleryImage[];
  isPublic: boolean;
  createdAt: string;
}

export default function GalleryManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user?.email) {
      router.push("/signin");
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch events and galleries in parallel
      const [eventsRes, galleriesRes] = await Promise.all([
        fetch("/api/events?owner=me"),
        fetch("/api/galleries")
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }

      if (galleriesRes.ok) {
        const galleriesData = await galleriesRes.json();
        setGalleries(galleriesData.galleries || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading galleries...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return null; // Will redirect in useEffect
  }

  return (
    <GalleryManagement 
      events={events} 
      galleries={galleries} 
      onRefresh={refreshData}
    />
  );
}
