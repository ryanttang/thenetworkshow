import { env, getEnvVar, isBuildTime } from './env';

// Google Analytics 4 integration
export class Analytics {
  private measurementId: string | null;
  private isEnabled: boolean;

  constructor() {
    // Use safe access during build time
    if (isBuildTime()) {
      this.measurementId = getEnvVar('GOOGLE_ANALYTICS_ID') || null;
      this.isEnabled = false; // Disable during build
    } else {
      this.measurementId = env.GOOGLE_ANALYTICS_ID || null;
      this.isEnabled = !!this.measurementId && env.NODE_ENV === 'production';
    }
  }

  // Track page views
  trackPageView(url: string, title?: string): void {
    if (!this.isEnabled) return;

    this.sendEvent('page_view', {
      page_title: title || document.title,
      page_location: url,
    });
  }

  // Track custom events
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.sendEvent(eventName, parameters);
  }

  // Track user authentication
  trackAuth(action: 'login' | 'logout' | 'signup', method?: string): void {
    this.trackEvent('auth', {
      action,
      method: method || 'email',
    });
  }

  // Track event interactions
  trackEventInteraction(action: 'view' | 'create' | 'edit' | 'delete', eventId?: string): void {
    this.trackEvent('event_interaction', {
      action,
      event_id: eventId,
    });
  }

  // Track gallery interactions
  trackGalleryInteraction(action: 'view' | 'upload' | 'delete', galleryId?: string): void {
    this.trackEvent('gallery_interaction', {
      action,
      gallery_id: galleryId,
    });
  }

  // Track file uploads
  trackUpload(type: 'image' | 'document', size: number, success: boolean): void {
    this.trackEvent('file_upload', {
      file_type: type,
      file_size: size,
      success,
    });
  }

  // Track search queries
  trackSearch(query: string, results: number): void {
    this.trackEvent('search', {
      search_term: query,
      results_count: results,
    });
  }

  // Track errors
  trackError(error: string, fatal: boolean = false): void {
    this.trackEvent('exception', {
      description: error,
      fatal,
    });
  }

  // Send event to Google Analytics
  private sendEvent(eventName: string, parameters?: Record<string, any>): void {
    if (typeof window === 'undefined' || !this.measurementId) return;

    try {
      // Use gtag if available
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, parameters);
      } else {
        // Fallback to fetch API
        fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=YOUR_API_SECRET`, {
          method: 'POST',
          body: JSON.stringify({
            client_id: this.getClientId(),
            events: [{
              name: eventName,
              params: parameters,
            }],
          }),
        }).catch(() => {
          // Silently fail if analytics is not available
        });
      }
    } catch (error) {
      // Silently fail if analytics fails
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Get or generate client ID
  private getClientId(): string {
    if (typeof window === 'undefined') return 'server';

    let clientId = localStorage.getItem('ga_client_id');
    if (!clientId) {
      clientId = 'GA1.2.' + Math.random().toString(36).substr(2, 9) + '.' + Math.floor(Date.now() / 1000);
      localStorage.setItem('ga_client_id', clientId);
    }
    return clientId;
  }
}

// Create analytics instance
export const analytics = new Analytics();

// React hook for analytics
export function useAnalytics() {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackEvent: analytics.trackEvent.bind(analytics),
    trackAuth: analytics.trackAuth.bind(analytics),
    trackEventInteraction: analytics.trackEventInteraction.bind(analytics),
    trackGalleryInteraction: analytics.trackGalleryInteraction.bind(analytics),
    trackUpload: analytics.trackUpload.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  // Start timing an operation
  startTiming(name: string): void {
    this.marks.set(name, performance.now());
  }

  // End timing and log the result
  endTiming(name: string, metadata?: Record<string, any>): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start time found for ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`, metadata);
    }

    return duration;
  }

  // Measure a function execution
  async measure<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.startTiming(name);
    try {
      const result = await fn();
      this.endTiming(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTiming(name, { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }
}

// Create performance monitor instance
export const performanceMonitor = new PerformanceMonitor();
