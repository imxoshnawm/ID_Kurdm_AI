/**
 * Initialize particles and data streams for menu page
 */
function initializeMenuAnimations() {
  if (typeof createParticles === 'function') {
    createParticles();
  }
  
  if (typeof createDataStreams === 'function') {
    createDataStreams();
  }
}

/**
 * Initialize menu page
 */
function initializeMenuPage() {
  // Set direction to RTL for Kurdish
  document.body.setAttribute('dir', 'rtl');
  
  // Initialize animations
  initializeMenuAnimations();
  
  // Setup resize handler for animations
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initializeMenuAnimations, 250);
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMenuPage);