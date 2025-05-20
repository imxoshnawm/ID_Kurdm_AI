


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
  const loginContainer = document.querySelector('.login-container');
  if (loginContainer && window.firebaseAuth) {
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'چوونەدەرەوە لە هەژمار';
    logoutButton.classList.add('logout-button');
    logoutButton.addEventListener('click', function() {
      logoutUser();
    });
    loginContainer.appendChild(logoutButton);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Function to handle user logout
function logoutUser() {
  const auth = window.firebaseAuth;
  
  if (auth) {
    auth.signOut().then(() => {
      // Successful logout - redirect to login page
      window.location.href = "../../index.html"; // or adjust path based on your structure
    }).catch((error) => {
      console.error("Error signing out: ", error);
      alert("هەڵەیەک ڕوویدا لە کاتی چوونەدەرەوە");
    });
  } else {
    console.error("Firebase auth not initialized");
    // Fallback if auth isn't available
    window.location.href = "../../index.html";
  }
}

// Add this to your initialization function
function initializeLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
  
  // Update logout button text based on language
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'kurdish';
  const logoutText = document.getElementById('logout-text');
  if (logoutText) {
    logoutText.textContent = menuTranslations[savedLanguage].logoutBtn;
  }
}

// Call this function when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Other initialization code...
  initializeLogout();
});