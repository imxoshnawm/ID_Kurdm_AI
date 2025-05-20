
/**
 * Handle forgot password link click
 * @param {Event} e - Click event
 */
function handleForgotPassword(e) {
  if (e) e.preventDefault();
  window.location.href = "Forgotpass.html";
}

/**
 * Initialize page
 */
function initializePage() {
  // Set direction to RTL as it's Kurdish only now
  document.body.setAttribute('dir', 'rtl');
  
  createParticles();
  createDataStreams();
  
  // Setup resize event listener
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 250);
  });
  
  // Setup forgot password link
  const forgotPasswordLink = document.querySelector('.forgot-password a');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);
