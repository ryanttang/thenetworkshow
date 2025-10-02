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
  name = "THC Members Only Club",
  description = "Premiere cannabis social club in Southern California offering exclusive events, member benefits, and community coordination.",
  url = "https://thcmembersonlyclub.com",
  logo = "https://thcmembersonlyclub.com/thc-logo.png",
  address = {
    addressLocality: "Southern California",
    addressRegion: "CA",
    addressCountry: "US",
  },
  contactPoint = {
    contactType: "customer service",
    email: "info@thcmembersonlyclub.com",
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
      "https://instagram.com/thcmembersonlyclub",
    ],
    foundingDate: "2024",
    areaServed: {
      "@type": "State",
      name: "California",
    },
    serviceType: "Cannabis Social Club",
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
      name: "THC Members Only Club",
      url: "https://thcmembersonlyclub.com",
    },
    offers,
    image: event.heroImage?.variants?.hero?.webpUrl || "https://thcmembersonlyclub.com/thcmembers-banner.png",
    url: `https://thcmembersonlyclub.com/events/${event.slug}`,
    keywords: [
      "cannabis event",
      "marijuana event",
      "cannabis social gathering",
      "weed event",
      "cannabis meetup",
      event.title.toLowerCase(),
      event.city?.toLowerCase() || "",
      event.state?.toLowerCase() || "",
    ].filter(Boolean).join(", "),
    audience: {
      "@type": "Audience",
      audienceType: "Cannabis enthusiasts and community members",
    },
    category: "Cannabis Social Event",
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
  name = "THC Members Only Club",
  description = "Premiere cannabis social club in Southern California",
  url = "https://thcmembersonlyclub.com",
  potentialAction = {
    "@type": "SearchAction",
    target: "https://thcmembersonlyclub.com/events?q={search_term_string}",
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
      name: "THC Members Only Club",
      logo: {
        "@type": "ImageObject",
        url: "https://thcmembersonlyclub.com/thc-logo.png",
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
