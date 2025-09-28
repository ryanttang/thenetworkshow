'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      analytics.trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalyticsScript() {
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  if (!measurementId || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  );
}
