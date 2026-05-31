import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  ttfb?: number; // Time to First Byte
  pageLoadTime?: number;
  resourceLoadTime?: number;
}

export const usePerformanceMonitoring = (onMetricsUpdate?: (metrics: PerformanceMetrics) => void) => {
  useEffect(() => {
    const metrics: PerformanceMetrics = {};

    // Measure Core Web Vitals using PerformanceObserver
    if ('PerformanceObserver' in window) {
      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries[0];
          if (fcpEntry) {
            metrics.fcp = Math.round(fcpEntry.startTime);
            console.log('[Performance] FCP:', metrics.fcp, 'ms');
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.error('[Performance] FCP observer error:', e);
      }

      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries[entries.length - 1] as any;
          if (lcpEntry) {
            metrics.lcp = Math.round(lcpEntry.renderTime || lcpEntry.loadTime);
            console.log('[Performance] LCP:', metrics.lcp, 'ms');
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.error('[Performance] LCP observer error:', e);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          metrics.cls = Math.round(clsValue * 1000) / 1000;
          console.log('[Performance] CLS:', metrics.cls);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.error('[Performance] CLS observer error:', e);
      }

      // First Input Delay (FID) / Interaction to Next Paint (INP)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fidEntry = entries[0];
          if (fidEntry) {
            metrics.fid = Math.round((fidEntry as any).processingDuration);
            console.log('[Performance] FID:', metrics.fid, 'ms');
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.error('[Performance] FID observer error:', e);
      }
    }

    // Measure Time to First Byte (TTFB)
    if ('performance' in window && 'timing' in window.performance) {
      const timing = window.performance.timing;
      const ttfb = timing.responseStart - timing.navigationStart;
      metrics.ttfb = ttfb;
      console.log('[Performance] TTFB:', ttfb, 'ms');
    }

    // Measure page load time
    window.addEventListener('load', () => {
      if ('performance' in window && 'timing' in window.performance) {
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        metrics.pageLoadTime = pageLoadTime;
        console.log('[Performance] Page Load Time:', pageLoadTime, 'ms');
        
        if (onMetricsUpdate) {
          onMetricsUpdate(metrics);
        }

        // Send metrics to analytics
        sendMetricsToAnalytics(metrics);
      }
    });

    // Measure resource load times
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const resources = window.performance.getEntriesByType('resource');
      const totalResourceTime = resources.reduce((sum, resource) => {
        return sum + (resource as any).duration;
      }, 0);
      metrics.resourceLoadTime = Math.round(totalResourceTime);
      console.log('[Performance] Totale Resource Load Time:', metrics.resourceLoadTime, 'ms');
    }

    // Monitor memory usage (Chrome only)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      console.log('[Performance] Memory Usage:', {
        usedJSHeapSize: Math.round(memoryInfo.usedJSHeapSize / 1048576) + ' MB',
        totalJSHeapSize: Math.round(memoryInfo.totalJSHeapSize / 1048576) + ' MB',
        jsHeapSizeLimit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576) + ' MB',
      });
    }

    // Monitor network information (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      console.log('[Performance] Network:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink + ' Mbps',
        rtt: connection.rtt + ' ms',
        saveData: connection.saveData,
      });
    }
  }, [onMetricsUpdate]);

  return {
    generateLighthouseReport: async () => {
      // This would typically be called server-side or via external API
      console.log('[Performance] Lighthouse report generation not available in browser');
    },
  };
};

// Send metrics to analytics service
async function sendMetricsToAnalytics(metrics: PerformanceMetrics) {
  try {
    await fetch('/api/analytics/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        metrics,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('[Performance] Failed to send metrics:', error);
  }
}

// Utility function to check Core Web Vitals thresholds
export const checkCoreWebVitalsThresholds = (metrics: PerformanceMetrics) => {
  const results = {
    fcp: metrics.fcp ? (metrics.fcp < 1800 ? 'good' : 'poor') : 'unknown',
    lcp: metrics.lcp ? (metrics.lcp < 2500 ? 'good' : 'poor') : 'unknown',
    cls: metrics.cls ? (metrics.cls < 0.1 ? 'good' : 'poor') : 'unknown',
    fid: metrics.fid ? (metrics.fid < 100 ? 'good' : 'poor') : 'unknown',
  };
  return results;
};
