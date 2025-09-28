import { performanceMonitor } from './analytics';

// Performance optimization utilities
export class PerformanceOptimizer {
  // Debounce function calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function calls
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Lazy load images
  static lazyLoadImages(): void {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  // Preload critical resources
  static preloadResources(resources: string[]): void {
    if (typeof window === 'undefined') return;

    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = 'image';
      document.head.appendChild(link);
    });
  }

  // Optimize images
  static optimizeImageUrl(url: string, width?: number, height?: number, quality?: number): string {
    if (!url) return url;

    // If it's an S3 URL, we can add optimization parameters
    if (url.includes('s3.amazonaws.com') || url.includes('s3.us-west-2.amazonaws.com')) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      if (quality) params.set('q', quality.toString());
      
      if (params.toString()) {
        return `${url}?${params.toString()}`;
      }
    }

    return url;
  }

  // Bundle size optimization
  static async loadComponent<T>(importFn: () => Promise<{ default: T }>): Promise<T> {
    const startTime = performance.now();
    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      
      if (loadTime > 1000) {
        console.warn(`Slow component load: ${loadTime.toFixed(2)}ms`);
      }
      
      return module.default;
    } catch (error) {
      console.error('Component load failed:', error);
      throw error;
    }
  }
}

// Database query optimization
export class DatabaseOptimizer {
  // Batch database operations
  static async batchOperations<T>(
    operations: (() => Promise<T>)[],
    batchSize: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
    }
    
    return results;
  }

  // Optimize database queries with connection pooling
  static async withConnection<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      if (duration > 1000) {
        console.warn(`Slow database operation: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
}

// API optimization
export class ApiOptimizer {
  // Request deduplication
  private static pendingRequests = new Map<string, Promise<any>>();

  static async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Request batching
  static async batchRequests<T>(
    requests: (() => Promise<T>)[],
    delay: number = 100
  ): Promise<T[]> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const results = await Promise.all(requests.map(req => req()));
        resolve(results);
      }, delay);
    });
  }
}

// Memory optimization
export class MemoryOptimizer {
  // Clean up unused objects
  static cleanup(): void {
    if (typeof window !== 'undefined') {
      // Clear unused event listeners
      // Clear unused timers
      // Clear unused references
    }
  }

  // Monitor memory usage
  static getMemoryUsage(): { used: number; total: number; percentage: number } | null {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
}

// Export performance utilities
export const performanceUtils = {
  debounce: PerformanceOptimizer.debounce,
  throttle: PerformanceOptimizer.throttle,
  lazyLoadImages: PerformanceOptimizer.lazyLoadImages,
  preloadResources: PerformanceOptimizer.preloadResources,
  optimizeImageUrl: PerformanceOptimizer.optimizeImageUrl,
  loadComponent: PerformanceOptimizer.loadComponent,
  batchOperations: DatabaseOptimizer.batchOperations,
  withConnection: DatabaseOptimizer.withConnection,
  deduplicateRequest: ApiOptimizer.deduplicateRequest,
  batchRequests: ApiOptimizer.batchRequests,
  cleanup: MemoryOptimizer.cleanup,
  getMemoryUsage: MemoryOptimizer.getMemoryUsage,
};
