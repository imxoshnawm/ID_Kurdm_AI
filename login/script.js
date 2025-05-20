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
 * Shows user is already logged in message
 * @param {Object} user - Firebase user object
 */
function showLoggedInMessage(user) {
  const loginContainer = document.querySelector('.container');
  if (loginContainer) {
    // If already logged-in message exists, don't add another one
    if (!document.querySelector('.already-logged-in')) {
      const alreadyLoggedInMsg = document.createElement('div');
      alreadyLoggedInMsg.classList.add('already-logged-in');
      alreadyLoggedInMsg.innerHTML = `
        <p>تۆ پێشتر چوویتە ژوورەوە وەک: ${user.email}</p>
        <div class="action-buttons">
          <button id="continue-btn" class="btn">بەردەوام بوون</button>
          <button id="signout-btn" class="btn btn-secondary">چوونەدەرەوە</button>
        </div>
      `;
      
      loginContainer.insertBefore(alreadyLoggedInMsg, loginContainer.firstChild);
      
      document.getElementById('continue-btn').addEventListener('click', function() {
        window.location.href = 'publics/menu.html';
      });
      
      document.getElementById('signout-btn').addEventListener('click', function() {
        window.firebaseAuth.signOut().then(() => {
          window.location.reload();
        }).catch(error => {
          console.error('Error signing out:', error);
        });
      });
    }
  }
}

/**
 * Initialize page
 */
function initializePage() {
  // Set direction to RTL as it's Kurdish only now
  document.body.setAttribute('dir', 'rtl');
  
  // Create animations
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
  
  // Check if on login page and handle authenticated users
  if (window.location.pathname.includes('login.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    const auth = window.firebaseAuth;
    
    if (auth) {
      auth.onAuthStateChanged(function(user) {
        if (user) {
          // Instead of automatically redirecting, show message with options
          showLoggedInMessage(user);
          
          // Hide the login and register forms
          const tabs = document.querySelector('.tabs');
          const tabContents = document.querySelector('.tab-contents');
          
          if (tabs) tabs.style.display = 'none';
          if (tabContents) tabContents.style.display = 'none';
        }
      });
    }
  }
}

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

/**
 * Check if user is authenticated
 * For pages requiring authentication
 */
function checkAuthentication() {
  // Skip authentication check if on login page
  if (window.location.pathname.includes('login.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    return;
  }
  
  // Get Firebase auth reference
  const auth = window.firebaseAuth;
  
  if (auth) {
    auth.onAuthStateChanged(function(user) {
      if (!user) {
        // User is not signed in, redirect to login
        window.location.href = '../login.html';
      }
    });
  } else {
    console.error('Firebase Auth not initialized');
  }
}

/**
 * Log user out
 * For menu and other pages
 */
function logoutUser() {
  const auth = window.firebaseAuth;
  
  if (auth) {
    auth.signOut()
      .then(() => {
        window.location.href = '../login.html';
      })
      .catch(error => {
        console.error('Error signing out:', error);
        alert('هەڵەیەک ڕوویدا لە چوونەدەرەوە');
      });
  }
}

/**
 * Load user profile data
 * For profile related pages
 */
async function loadUserProfile() {
  const auth = window.firebaseAuth;
  const db = window.firebaseDb;
  
  if (auth && db) {
    const user = auth.currentUser;
    
    if (user) {
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          
          // Fill profile form or display user data
          const profileNameElement = document.getElementById('profile-name');
          const profileEmailElement = document.getElementById('profile-email');
          
          if (profileNameElement) {
            profileNameElement.textContent = userData.fullName || 'بەکارهێنەر';
          }
          
          if (profileEmailElement) {
            profileEmailElement.textContent = userData.email || user.email;
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }
  }
}

/**
 * Add history view tracking
 * For history page
 */
function trackHistoryView(historyId) {
  const auth = window.firebaseAuth;
  const db = window.firebaseDb;
  
  if (auth && db && historyId) {
    const user = auth.currentUser;
    
    if (user) {
      // Track view in user's history
      db.collection('users').doc(user.uid)
        .collection('historyViews').add({
          historyId: historyId,
          viewedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .catch(error => {
          console.error('Error tracking history view:', error);
        });
    }
  }
}

/**
 * Load history items from Firebase
 * For history page
 */
async function loadHistoryItems() {
  const db = window.firebaseDb;
  const historyContainer = document.querySelector('.history-container');
  
  if (db && historyContainer) {
    try {
      const historySnapshot = await db.collection('history')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      
      if (historySnapshot.empty) {
        historyContainer.innerHTML = '<p>هیچ بابەتێک نەدۆزرایەوە.</p>';
        return;
      }
      
      historySnapshot.forEach(doc => {
        const historyData = doc.data();
        const historySection = document.createElement('div');
        historySection.classList.add('history-section');
        historySection.setAttribute('data-id', doc.id);
        
        // Create tags HTML
        let tagsHTML = '';
        if (historyData.tags && historyData.tags.length > 0) {
          historyData.tags.forEach(tag => {
            tagsHTML += `<div class="info-tag">${tag}</div>`;
          });
        }
        
        // Create image HTML
        let imageHTML = '';
        if (historyData.imageURL) {
          imageHTML = `
            <div class="history-image-container">
              <img src="${historyData.imageURL}" alt="${historyData.title}" class="history-image">
            </div>
          `;
        }
        
        historySection.innerHTML = `
          <h3>${historyData.title}</h3>
          ${tagsHTML}
          <p>${historyData.content}</p>
          ${imageHTML}
        `;
        
        historyContainer.appendChild(historySection);
        
        // Track history view
        trackHistoryView(doc.id);
      });
    } catch (error) {
      console.error('Error loading history items:', error);
      historyContainer.innerHTML = '<p>هەڵەیەک ڕوویدا لە بارکردنی بابەتەکان.</p>';
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if it's a menu page
  const menuElement = document.getElementById('menu');
  if (menuElement) {
    initializeMenuPage();
    
    // Add logout button to menu if not exists
    if (!document.getElementById('logout-btn')) {
      const logoutItem = document.createElement('li');
      logoutItem.innerHTML = '<a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> چوونەدەرەوە</a>';
      menuElement.querySelector('ul').appendChild(logoutItem);
      
      document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
      });
    }
  } else {
    // For login and register pages
    initializePage();
  }
  
  // Check if it's a history page
  const historyContainer = document.querySelector('.history-container');
  if (historyContainer) {
    loadHistoryItems();
  }
  
  // Check if it's a profile page
  const profileElement = document.getElementById('profile-container');
  if (profileElement) {
    loadUserProfile();
  }
});


document.addEventListener('DOMContentLoaded', function() {
  // Form login event listener
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Form register event listener
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');
  
  if (!email || !password) {
    if (errorElement) errorElement.textContent = 'تکایە ئیمەیڵ و وشەی نهێنی بنووسە';
    return;
  }
  
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    
    // Check if user is admin and redirect accordingly
    const user = firebase.auth().currentUser;
    if (user) {
      const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
      
      if (userDoc.exists && userDoc.data().userType === 'admin') {
        // Redirect to admin page
        window.location.href = 'admin.html';
      } else {
        // Redirect to regular user menu
        window.location.href = 'publics/menu.html';
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    if (errorElement) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorElement.textContent = 'ئیمەیڵ یان وشەی نهێنی هەڵەیە';
      } else {
        errorElement.textContent = 'هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەوە';
      }
    }
  }
}

// Handle register
async function handleRegister(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('register-fullname').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorElement = document.getElementById('register-error');
  
  if (!fullName || !email || !password) {
    if (errorElement) errorElement.textContent = 'تکایە هەموو خانەکان پڕ بکەوە';
    return;
  }
  
  try {
    // Create user with email and password
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Add user to Firestore
    await firebase.firestore().collection('users').doc(user.uid).set({
      fullName: fullName,
      email: email,
      userType: 'standard', // Default user type
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Redirect to menu page
    window.location.href = 'publics/menu.html';
  } catch (error) {
    console.error('Registration error:', error);
    if (errorElement) {
      if (error.code === 'auth/email-already-in-use') {
        errorElement.textContent = 'ئیمەیڵەکە پێشتر تۆمارکراوە';
      } else if (error.code === 'auth/weak-password') {
        errorElement.textContent = 'وشەی نهێنی لاوازە، تکایە وشەیەکی بەهێزتر بنووسە';
      } else {
        errorElement.textContent = 'هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەوە';
      }
    }
  }
}