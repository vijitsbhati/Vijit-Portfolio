// Vercel Speed Insights initialization
// This script injects the Vercel Speed Insights tracking code for Core Web Vitals monitoring
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  // Initialize the Speed Insights queue
  window.si = window.si || function() {
    (window.siq = window.siq || []).push(arguments);
  };
  
  // Inject the Vercel Speed Insights script
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load. Enable Speed Insights in your Vercel project settings.');
  };
  
  // Append script to head
  if (document.head) {
    document.head.appendChild(script);
  } else {
    // If head is not available yet, wait for DOM ready
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  }
})();
