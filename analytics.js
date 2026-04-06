// Vercel Web Analytics initialization
// This script injects the Vercel Analytics tracking code
(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  // Initialize the analytics queue
  window.va = window.va || function() {
    (window.vaq = window.vaq || []).push(arguments);
  };
  
  // Inject the Vercel Analytics script
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  
  script.onerror = function() {
    console.log('[Vercel Web Analytics] Failed to load. Enable Web Analytics in your Vercel project settings.');
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
