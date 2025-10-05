import { Event } from "@/types";
import { format } from "date-fns";

interface OrganizationStructuredDataProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
}

export function OrganizationStructuredData({
  name = "The Network Show",
  description = "Premier cannabis trade show connecting industry professionals, showcasing innovative products, and fostering business relationships in the cannabis industry.",
  url = "https://thenetworkshow.com",
  logo = "https://thenetworkshow.com/network-logo-white.png",
  address = {
    addressLocality: "Southern California",
    addressRegion: "CA",
    addressCountry: "US",
  },
  contactPoint = {
    contactType: "customer service",
    email: "info@thenetworkshow.com",
  },
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url,
    logo,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    contactPoint: {
      "@type": "ContactPoint",
      ...contactPoint,
    },
    sameAs: [
      "https://instagram.com/thenetworkshow",
    ],
    foundingDate: "2024",
    areaServed: {
      "@type": "State",
      name: "California",
    },
    serviceType: "Cannabis Trade Show",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface EventStructuredDataProps {
  event: Event;
}

export function EventStructuredData({ event }: EventStructuredDataProps) {
  const startDate = new Date(event.startAt);
  const endDate = event.endAt ? new Date(event.endAt) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

  const location = event.locationName ? {
    "@type": "Place",
    name: event.locationName,
    address: {
      "@type": "PostalAddress",
      streetAddress: event.locationName,
      addressLocality: event.city || "",
      addressRegion: event.state || "",
      addressCountry: "US",
    },
  } : undefined;

  const offers = event.ticketUrl ? {
    "@type": "Offer",
    url: event.ticketUrl,
    availability: "https://schema.org/InStock",
    validFrom: new Date().toISOString(),
    priceCurrency: "USD",
    category: event.buttonType === 'BUY_TICKETS' ? 'Tickets' : 'RSVP',
  } : undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || `Join us for ${event.title}, an exclusive cannabis event.`,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location,
    organizer: {
      "@type": "Organization",
      name: "The Network Show",
      url: "https://thenetworkshow.com",
    },
    offers,
    image: event.heroImage?.variants?.hero?.webpUrl || "https://thenetworkshow.com/network-photos.jpg",
    url: `https://thenetworkshow.com/events/${event.slug}`,
    keywords: [
      "cannabis trade show",
      "marijuana trade show",
      "cannabis industry event",
      "cannabis business event",
      "cannabis networking",
      event.title.toLowerCase(),
      event.city?.toLowerCase() || "",
      event.state?.toLowerCase() || "",
    ].filter(Boolean).join(", "),
    audience: {
      "@type": "Audience",
      audienceType: "Cannabis industry professionals and business leaders",
    },
    category: "Cannabis Trade Show Event",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface WebsiteStructuredDataProps {
  name?: string;
  description?: string;
  url?: string;
  potentialAction?: {
    "@type": string;
    target: string;
    "query-input": string;
  };
}

export function WebsiteStructuredData({
  name = "The Network Show",
  description = "Premier cannabis trade show connecting industry professionals",
  url = "https://thenetworkshow.com",
  potentialAction = {
    "@type": "SearchAction",
    target: "https://thenetworkshow.com/events?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url,
    potentialAction,
    publisher: {
      "@type": "Organization",
      name: "The Network Show",
      logo: {
        "@type": "ImageObject",
        url: "https://thenetworkshow.com/network-logo-white.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
