/**
 * Firebase Configuration - دامەزراندنی پەیوەندی فایەربەیس
 * Global variables to store Firebase authentication and database references
 */
let auth;
let db;
let currentUser;

/**
 * Initialize Firebase admin functionality
 */
function initializeAdmin() {
  // Initialize Firebase if it hasn't been initialized already
  if (typeof firebase !== 'undefined') {
    // Get Firebase auth and database references
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Check authentication state
    auth.onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in
        currentUser = user;
        console.log("User authenticated:", user.email);
        checkAdminStatus(user.uid);
        loadDashboardData();
        loadUsers();
      } else {
        // User is not signed in, redirect to login
        console.log("No authenticated user found, redirecting to login");
        window.location.href = 'login.html';
      }
    });
    
    // Initialize background animations
    if (typeof createParticles === 'function') {
      createParticles();
    }
    if (typeof createDataStreams === 'function') {
      createDataStreams();
    }
    
    // Add event listeners for tabs
    const tabButtons = document.querySelectorAll('.admin-tab');
    tabButtons.forEach(tab => {
      tab.addEventListener('click', function() {
        switchAdminTab(this.getAttribute('data-tab'));
      });
    });
    
    // Add event listeners for forms
    setupFormListeners();
    
    // Add event listeners for modals
    setupModalListeners();
    
    // Add event listener for logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }
    
    // Resize handler for animations
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 250);
    });
  } else {
    console.error("Firebase is not defined. Check Firebase SDK loading.");
    showErrorAlert("هەڵەیەک ڕوویدا لە بارکردنی کتێبخانەی Firebase");
  }
}

/**
 * Setup all form listeners
 */
function setupFormListeners() {
  const addAdminForm = document.getElementById('addAdminForm');
  if (addAdminForm) {
    addAdminForm.addEventListener('submit', handleAddAdmin);
  }
  
  const addHistoryContentForm = document.getElementById('addHistoryContentForm');
  if (addHistoryContentForm) {
    addHistoryContentForm.addEventListener('submit', handleAddHistoryContent);
  }
  
  const generalSettingsForm = document.getElementById('generalSettingsForm');
  if (generalSettingsForm) {
    generalSettingsForm.addEventListener('submit', handleSaveSettings);
  }
}

/**
 * Check if user is an admin
 * @param {string} userId - Firebase user ID
 */
async function checkAdminStatus(userId) {
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (!userDoc.exists || userDoc.data().userType !== 'admin') {
    showErrorAlert('تۆ مۆڵەتی بەڕێوەبەرت نییە');
    setTimeout(() => {
      window.location.href = 'login.html'; // ← ڕێگەی ڕاست بنووسە
    }, 2000);
    return false;
  }
  return true;
}

/**
 * Update user's last login timestamp
 * @param {string} userId - Firebase user ID
 */
async function updateLastLogin(userId) {
  try {
    await db.collection('users').doc(userId).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Updated last login timestamp");
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

/**
 * Load dashboard data from Firebase
 */
async function loadDashboardData() {
  if (!db) {
    console.error("Firestore not initialized");
    return;
  }
  
  showLoading();
  try {
    // Get total users count
    const usersSnapshot = await db.collection('users').get();
    const totalUsersElement = document.getElementById('totalUsers');
    if (totalUsersElement) {
      totalUsersElement.textContent = usersSnapshot.size;
    }
    
    // Get new users in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Convert to Firestore timestamp
    const sevenDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(sevenDaysAgo);
    
    const newUsersSnapshot = await db.collection('users')
      .where('createdAt', '>=', sevenDaysAgoTimestamp)
      .get();
    
    const newUsersElement = document.getElementById('newUsers');
    if (newUsersElement) {
      newUsersElement.textContent = newUsersSnapshot.size;
    }
    
    // Get active users (users who logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Convert to Firestore timestamp
    const thirtyDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(thirtyDaysAgo);
    
    const activeUsersSnapshot = await db.collection('users')
      .where('lastLogin', '>=', thirtyDaysAgoTimestamp)
      .get();
    
    const activeUsersElement = document.getElementById('activeUsers');
    if (activeUsersElement) {
      activeUsersElement.textContent = activeUsersSnapshot.size;
    }
    
    // For page views (placeholder - integrate with analytics in production)
    const pageViewsElement = document.getElementById('pageViews');
    if (pageViewsElement) {
      pageViewsElement.textContent = '0';
      
      // Try to get page views from settings if available
      try {
        const settingsDoc = await db.collection('settings').doc('analytics').get();
        if (settingsDoc.exists && settingsDoc.data().pageViews) {
          pageViewsElement.textContent = settingsDoc.data().pageViews.toString();
        }
      } catch (error) {
        console.log('No analytics settings found');
      }
    }
    
    hideLoading();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showErrorAlert('هەڵەیەک ڕوویدا لە بارکردنی داتای داشبۆرد');
    hideLoading();
  }
}

/**
 * Load users from Firebase
 */
async function loadUsers() {
  if (!db) {
    console.error("Firestore not initialized");
    return;
  }
  
  showLoading();
  try {
    const usersSnapshot = await db.collection('users').get();
    const usersTableBody = document.getElementById('usersTableBody');
    if (!usersTableBody) {
      console.error("Users table body element not found");
      hideLoading();
      return;
    }
    
    usersTableBody.innerHTML = '';
    
    if (usersSnapshot.empty) {
      usersTableBody.innerHTML = '<tr><td colspan="5">هیچ بەکارهێنەرێک نەدۆزرایەوە</td></tr>';
      hideLoading();
      return;
    }
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const userRow = document.createElement('tr');
      
      // Format last login date
      let lastLogin = 'N/A';
      if (userData.lastLogin) {
        if (userData.lastLogin.toDate) {
          // Handle Firestore Timestamp objects
          lastLogin = userData.lastLogin.toDate().toLocaleDateString('ku');
        } else if (userData.lastLogin.seconds) {
          // Handle raw timestamp data
          lastLogin = new Date(userData.lastLogin.seconds * 1000).toLocaleDateString('ku');
        } else if (userData.lastLogin instanceof Date) {
          // Handle Date objects
          lastLogin = userData.lastLogin.toLocaleDateString('ku');
        }
      }
      
      userRow.innerHTML = `
        <td>${userData.fullName || 'N/A'}</td>
        <td>${userData.email || 'N/A'}</td>
        <td>${userData.userType === 'admin' ? 'بەڕێوەبەر' : 'ئاسایی'}</td>
        <td>${lastLogin}</td>
        <td>
          <button class="edit-user" data-id="${doc.id}" data-name="${userData.fullName || ''}" data-email="${userData.email || ''}" data-type="${userData.userType || 'standard'}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-user" data-id="${doc.id}" data-email="${userData.email || ''}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      usersTableBody.appendChild(userRow);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-user').forEach(button => {
      button.addEventListener('click', function() {
        openEditUserModal(this.dataset.id, this.dataset.name, this.dataset.email, this.dataset.type);
      });
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
      button.addEventListener('click', function() {
        openDeleteUserModal(this.dataset.id, this.dataset.email);
      });
    });
    
    hideLoading();
  } catch (error) {
    console.error('Error loading users:', error);
    showErrorAlert('هەڵەیەک ڕوویدا لە بارکردنی بەکارهێنەران');
    hideLoading();
  }
}

/**
 * Switch between admin tabs
 * @param {string} tabId - ID of the tab to display
 */
function switchAdminTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab content
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.classList.add('active');
  } else {
    console.error(`Tab content with ID ${tabId} not found`);
  }
  
  // Add active class to selected tab button
  const selectedTabButton = document.querySelector(`.admin-tab[data-tab="${tabId}"]`);
  if (selectedTabButton) {
    selectedTabButton.classList.add('active');
  } else {
    console.error(`Tab button for ${tabId} not found`);
  }
  
  // Load data for the selected tab
  if (tabId === 'users') {
    loadUsers();
  } else if (tabId === 'dashboard') {
    loadDashboardData();
  } else if (tabId === 'settings') {
    loadSettings();
  }
}

/**
 * Load settings from Firestore
 */
async function loadSettings() {
  if (!db) {
    console.error("Firestore not initialized");
    return;
  }
  
  showLoading();
  try {
    const settingsDoc = await db.collection('settings').doc('general').get();
    
    if (settingsDoc.exists) {
      const settingsData = settingsDoc.data();
      
      // Fill settings form
      const siteNameInput = document.getElementById('siteName');
      const defaultLanguageInput = document.getElementById('defaultLanguage');
      const contactEmailInput = document.getElementById('contactEmail');
      
      if (siteNameInput) siteNameInput.value = settingsData.siteName || 'ID Kurd AI';
      if (defaultLanguageInput) defaultLanguageInput.value = settingsData.defaultLanguage || 'kurdish';
      if (contactEmailInput) contactEmailInput.value = settingsData.contactEmail || '';
    }
    
    hideLoading();
  } catch (error) {
    console.error('Error loading settings:', error);
    showErrorAlert('هەڵەیەک ڕوویدا لە بارکردنی ڕێکخستنەکان');
    hideLoading();
  }
}

/**
 * Handle adding a new admin
 * @param {Event} e - Form submit event
 */
async function handleAddAdmin(e) {
  e.preventDefault();
  const adminEmail = document.getElementById('adminEmail').value;
  const userQuery = await db.collection('users').where('email', '==', adminEmail).get();
  
  if (!userQuery.empty) {
    await db.collection('users').doc(userQuery.docs[0].id).update({
      userType: 'admin' // ← ئیمەیڵەکە بکە بە ئەدمین
    });
    showSuccessAlert('بەسەرکەوتوویی ئەدمین زیادکرا!');
  }
}

/**
 * Handle adding new history content
 * @param {Event} e - Form submit event
 */
async function handleAddHistoryContent(e) {
  e.preventDefault();
  const title = document.getElementById("historyTitle").value;
  const tags = document.getElementById("historyTag").value.split(",").map(tag => tag.trim());
  const content = document.getElementById("historyContent").value;
  const imageURL = document.getElementById("historyImageURL").value;

  try {
    await db.collection("history").add({
      title: title,
      tags: tags,
      content: content,
      imageURL: imageURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: currentUser.uid // ← دڵنیابە لەوەی currentUser بوونی هەیە
    });
    showSuccessAlert("بابەت بە سەرکەوتوویی زیادکرا!");
  } catch (error) {
    console.error("هەڵە لە زیادکردنی بابەت:", error);
    showErrorAlert("هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵبدەوە.");
  }
}

/**
 * Handle saving general settings
 * @param {Event} e - Form submit event
 */
async function handleSaveSettings(e) {
  e.preventDefault();
  if (!db || !currentUser) {
    console.error("Firestore not initialized or user not logged in");
    showErrorAlert('هەڵەیەک ڕوویدا لە پاشەکەوتکردنی ڕێکخستنەکان');
    return;
  }
  
  showLoading();
  
  const siteNameInput = document.getElementById('siteName');
  const defaultLanguageInput = document.getElementById('defaultLanguage');
  const contactEmailInput = document.getElementById('contactEmail');
  
  if (!siteNameInput || !defaultLanguageInput || !contactEmailInput) {
    console.error("One or more settings inputs not found");
    hideLoading();
    return;
  }
  
  const siteName = siteNameInput.value;
  const defaultLanguage = defaultLanguageInput.value;
  const contactEmail = contactEmailInput.value;
  
  try {
    await db.collection('settings').doc('general').set({
      siteName: siteName,
      defaultLanguage: defaultLanguage,
      contactEmail: contactEmail,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: currentUser.uid
    });
    
    showSuccessAlert('ڕێکخستنەکان بە سەرکەوتوویی پاشەکەوتکران');
    hideLoading();
  } catch (error) {
    console.error('Error saving settings:', error);
    showErrorAlert('هەڵەیەک ڕوویدا لە پاشەکەوتکردنی ڕێکخستنەکان');
    hideLoading();
  }
}

/**
 * Open edit user modal
 * @param {string} userId - User ID
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} userType - User type (admin or standard)
 */
function openEditUserModal(userId, name, email, userType) {
  const modal = document.getElementById('editUserModal');
  if (!modal) {
    console.error("Edit user modal not found");
    return;
  }
  
  const userIdInput = document.getElementById('editUserId');
  const nameInput = document.getElementById('editFullName');
  const emailInput = document.getElementById('editEmail');
  const typeInput = document.getElementById('editUserType');
  
  if (!userIdInput || !nameInput || !emailInput || !typeInput) {
    console.error("One or more edit user form inputs not found");
    return;
  }
  
  userIdInput.value = userId;
  nameInput.value = name;
  emailInput.value = email;
  typeInput.value = userType;
  
  modal.style.display = 'block';
}

/**
 * Open delete user modal
 * @param {string} userId - User ID
 * @param {string} email - User's email
 */
function openDeleteUserModal(userId, email) {
  const modal = document.getElementById('deleteUserModal');
  if (!modal) {
    console.error("Delete user modal not found");
    return;
  }
  
  const userIdInput = document.getElementById('deleteUserId');
  if (!userIdInput) {
    console.error("Delete user ID input not found");
    return;
  }
  
  userIdInput.value = userId;
  
  // Update modal message to include user email
  const modalMessage = document.querySelector('#deleteUserModal p');
  if (modalMessage) {
    modalMessage.textContent = `ئایا دڵنیایت لە سڕینەوەی بەکارهێنەر ${email}؟ ئەم کردارە ناتوانرێت بگەڕێنرێتەوە.`;
  }
  
  modal.style.display = 'block';
}

/**
 * Set up modal event listeners
 */
function setupModalListeners() {
  // Close modals when clicking on X
  document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  });
  
  // Edit user form submission
  const editUserForm = document.getElementById('editUserForm');
  if (editUserForm) {
    editUserForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      showLoading();
      
      const userId = document.getElementById('editUserId').value;
      const fullName = document.getElementById('editFullName').value;
      const userType = document.getElementById('editUserType').value;
      
      try {
        await db.collection('users').doc(userId).update({
          fullName: fullName,
          userType: userType
        });
        
        document.getElementById('editUserModal').style.display = 'none';
        showSuccessAlert('زانیاری بەکارهێنەر بە سەرکەوتوویی نوێکرایەوە');
        loadUsers();
      } catch (error) {
        console.error('Error updating user:', error);
        showErrorAlert('هەڵەیەک ڕوویدا لە نوێکردنەوەی زانیاری بەکارهێنەر');
        hideLoading();
      }
    });
  }
  
  // Delete user confirmation
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async function() {
      showLoading();
      const userId = document.getElementById('deleteUserId').value;
      
      try {
        await db.collection('users').doc(userId).delete();
        document.getElementById('deleteUserModal').style.display = 'none';
        showSuccessAlert('بەکارهێنەر بە سەرکەوتوویی سڕایەوە');
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showErrorAlert('هەڵەیەک ڕوویدا لە سڕینەوەی بەکارهێنەر');
        hideLoading();
      }
    });
  }
  
  // Cancel delete button
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', function() {
      document.getElementById('deleteUserModal').style.display = 'none';
    });
  }
}

/**
 * Handle resize event
 */
function handleResize() {
  if (typeof createParticles === 'function') {
    createParticles();
  }
  
  if (typeof createDataStreams === 'function') {
    createDataStreams();
  }
}

/**
 * Show loading spinner
 */
function showLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'flex';
  }
}

/**
 * Hide loading spinner
 */
function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
}

/**
 * Show success alert
 * @param {string} message - Success message to display
 */
function showSuccessAlert(message) {
  const successAlert = document.getElementById('successAlert');
  if (successAlert) {
    successAlert.textContent = message;
    successAlert.style.display = 'block';
    
    setTimeout(() => {
      successAlert.style.display = 'none';
    }, 5000);
  }
}

/**
 * Show error alert
 * @param {string} message - Error message to display
 */
function showErrorAlert(message) {
  const errorAlert = document.getElementById('errorAlert');
  if (errorAlert) {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    
    setTimeout(() => {
      errorAlert.style.display = 'none';
    }, 5000);
  }
}

/**
 * Logout user
 */
function logout() {
  if (!auth) {
    console.error("Firebase Auth not initialized");
    return;
  }
  
  auth.signOut()
    .then(() => {
      window.location.href = 'login.html';
    })
    .catch(error => {
      console.error('Error signing out:', error);
      showErrorAlert('هەڵەیەک ڕوویدا لە چوونەدەرەوە');
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAdmin);