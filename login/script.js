/**
 * Switch between login and register tabs
 * @param {string} tabId - Tab identifier ('login' or 'register')
 */
function switchTab(tabId) {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const tabIndicator = document.querySelector('.tab-indicator');

  // Remove active class from all tabs and contents
  tabs.forEach(tab => tab.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));

  // Add active class to selected tab and content
  if (tabId === 'register') {
    tabs[1].classList.add('active');
    tabContents[1].classList.add('active');
    tabIndicator.style.left = '50%';
  } else {
    tabs[0].classList.add('active');
    tabContents[0].classList.add('active');
    tabIndicator.style.left = '0';
  }
}

/**
 * Create floating particles for background effect
 */
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  particlesContainer.innerHTML = '';
  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 25 : 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    const size = Math.random() * 10 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    
    particlesContainer.appendChild(particle);
  }
}

/**
 * Create AI data streams for background effect
 */
function createDataStreams() {
  const streamsContainer = document.getElementById('data-streams');
  if (!streamsContainer) return;
  
  streamsContainer.innerHTML = '';
  const isMobile = window.innerWidth <= 768;
  const streamCount = isMobile ? 10 : 20;

  for (let i = 0; i < streamCount; i++) {
    const stream = document.createElement('div');
    stream.classList.add('data-stream');
    
    stream.style.left = `${Math.random() * 100}%`;
    stream.style.top = `${Math.random() * 100}%`;
    const rotation = Math.random() * 360;
    stream.style.transform = `rotate(${rotation}deg)`;
    stream.style.animationDelay = `${Math.random() * 3}s`;
    
    streamsContainer.appendChild(stream);
  }
}

/**
 * Handle window resize for particles and streams
 */
function handleResize() {
  createParticles();
  createDataStreams();
}

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
