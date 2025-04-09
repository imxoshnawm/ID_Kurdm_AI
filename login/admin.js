// ڕێکخستنەکانی Firebase - دروستکراوەتەوە
const firebaseConfig = {
  apiKey: "AIzaSyDIoNvW1wHk-5qlTGrnnlfMIGZfEN-ucg8",
  authDomain: "id-kurdm-ai.firebaseapp.com",
  projectId: "id-kurdm-ai",
  storageBucket: "id-kurdm-ai.appspot.com", // پاشگری دروستکراوەتەوە
  messagingSenderId: "500724816364",
  appId: "1:500724816364:web:0159636245557a07c7c8c9",
  measurementId: "G-TV21Q9H80V"
};

// دەستپێکردنی Firebase
let app, auth, db;

try {
// تاقیکردنەوەی دەستپێکردنی Firebase
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}
auth = firebase.auth();
db = firebase.firestore();
console.log("Firebase initialized successfully");
} catch (error) {
console.error("Firebase initialization error:", error);
alert("هەڵەیەک ڕوویدا لە دەستپێکردنی Firebase: " + error.message);
}

// گۆڕاوەکانی گشتی
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
try {
  initializeAdminPage();
  setupEventListeners();
  createParticles();
  createDataStreams();
} catch (error) {
  console.error("Initialization error:", error);
  showError("هەڵەیەک ڕوویدا لە دەستپێکردنی پەڕەکە: " + error.message);
}
});

/**
* دەستپێکردنی پەڕەی ئەدمین - چاککراوە بۆ باشتر مامەڵەکردن لەگەڵ هەڵەکان
*/
function initializeAdminPage() {
showLoading();

// پشکنینی لۆگین و دەسەڵاتی ئەدمین
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is logged in:", user.email);
    // پشکنینی ئایا بەکارهێنەرەکە ئەدمینە
    db.collection('users').doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          console.log("User data:", userData);
          
          if (userData.userType === 'admin') {
            // بەکارهێنەر ئەدمینە، نیشاندانی بەشەکە
            currentUser = {
              uid: user.uid,
              email: user.email,
              ...userData
            };
            hideLoading();
            loadAdminData();
            console.log("Admin access granted");
          } else {
            // بەکارهێنەر ئەدمین نییە، دەرکردن
            console.log("User is not admin");
            hideLoading();
            showError("ببورە، تۆ دەسەڵاتی ئەدمینت نییە.");
            setTimeout(() => redirectToLogin(), 2000);
          }
        } else {
          console.log("User document not found");
          hideLoading();
          showError("داتای بەکارهێنەر نەدۆزرایەوە.");
          setTimeout(() => redirectToLogin(), 2000);
        }
      })
      .catch((error) => {
        console.error("Error getting user document:", error);
        hideLoading();
        showError("کێشەیەک ڕوویدا لە پشکنینی بەکارهێنەر: " + error.message);
        setTimeout(() => redirectToLogin(), 3000);
      });
  } else {
    // بەکارهێنەر لۆگین نەکردووە، گەڕانەوە بۆ پەڕەی لۆگین
    console.log("No user logged in");
    hideLoading();
    showError("تکایە سەرەتا چوونەژوورەوە ئەنجام بدە");
    setTimeout(() => redirectToLogin(), 1500);
  }
}, (error) => {
  console.error("Auth state error:", error);
  hideLoading();
  showError("کێشەیەک ڕوویدا لە پشکنینی دۆخی چوونەژوورەوە: " + error.message);
  setTimeout(() => redirectToLogin(), 2000);
});
}

/**
* ڕێکخستنی گوێگرەکانی ڕووداو
*/
function setupEventListeners() {
try {
  // گوێگری تابەکان
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // گوێگری دەرچوون
  document.getElementById('logoutBtn').addEventListener('click', function() {
    auth.signOut().then(() => {
      redirectToLogin();
    }).catch(error => {
      console.error("Logout error:", error);
      showError("کێشەیەک ڕوویدا لە چوونەدەرەوە: " + error.message);
    });
  });
  
  // فۆرمی زیادکردنی ئەدمینی نوێ
  document.getElementById('addAdminForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const adminEmail = document.getElementById('adminEmail').value;
    addNewAdmin(adminEmail);
  });
  
  // فۆرمی زیادکردنی ناوەڕۆکی مێژووی نوێ
  document.getElementById('addHistoryContentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addNewHistoryContent();
  });
  
  // فۆرمی ڕێکخستنەکان
  document.getElementById('generalSettingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveGeneralSettings();
  });
  
  // گوێگری داخستنی مۆداڵەکان
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      modal.style.display = 'none';
    });
  });
  
  // گوێگری فۆرمی دەستکاریکردنی بەکارهێنەر
  document.getElementById('editUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveUserEdit();
  });
  
  // گوێگری دووگمەکانی مۆداڵی سڕینەوە
  document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    deleteUser();
  });
  
  document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
    document.getElementById('deleteUserModal').style.display = 'none';
  });
} catch (error) {
  console.error("Error setting up event listeners:", error);
  showError("کێشەیەک ڕوویدا لە ڕێکخستنی گوێگرەکان: " + error.message);
}
}

/**
* بارکردنی داتای پەڕەی ئەدمین
*/
function loadAdminData() {
console.log("Loading admin data...");
loadDashboardStats();
loadUsers();
loadSettings();
}

/**
* بارکردنی ئامارەکانی داشبۆرد - چاککراوە بۆ باشتر مامەڵەکردن لەگەڵ هەڵەکان
*/
function loadDashboardStats() {
showLoading();
console.log("Loading dashboard stats...");

// ژماردنی کۆی بەکارهێنەران
db.collection('users').get()
  .then((snapshot) => {
    document.getElementById('totalUsers').textContent = snapshot.size;
    console.log(`Total users: ${snapshot.size}`);
    
    // ژماردنی بەکارهێنەرانی نوێی 7 ڕۆژی ڕابردوو
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let newUserCount = 0;
    let activeUserCount = 0;
    
    snapshot.forEach((doc) => {
      const userData = doc.data();
      
      // بەکارهێنەری نوێ
      if (userData.createdAt && userData.createdAt.toDate() > oneWeekAgo) {
        newUserCount++;
      }
      
      // بەکارهێنەری چالاک - لە 30 ڕۆژی ڕابردوو
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      
      if (userData.lastLogin && userData.lastLogin.toDate() > oneMonthAgo) {
        activeUserCount++;
      }
    });
    
    document.getElementById('newUsers').textContent = newUserCount;
    document.getElementById('activeUsers').textContent = activeUserCount;
    console.log(`New users: ${newUserCount}, Active users: ${activeUserCount}`);
    
    // بارکردنی داتای سەردانەکان
    return db.collection('analytics').doc('pageViews').get();
  })
  .then((doc) => {
    if (doc.exists) {
      document.getElementById('pageViews').textContent = doc.data().total || 0;
      console.log(`Page views: ${doc.data().total || 0}`);
    } else {
      document.getElementById('pageViews').textContent = '0';
      console.log("No page views document found, defaulting to 0");
      // ئەگەر دۆکیومێنتەکە نەبوو با دروستی بکەین
      return db.collection('analytics').doc('pageViews').set({ total: 0 });
    }
  })
  .then(() => {
    hideLoading();
  })
  .catch((error) => {
    console.error("Error loading dashboard stats:", error);
    showError("کێشەیەک ڕوویدا لە بارکردنی ئامارەکان: " + error.message);
    hideLoading();
    
    // ڕێکخستنی بەهای سفر بۆ هەموو ئامارەکان لە کاتی هەڵەدا
    document.getElementById('pageViews').textContent = '0';
  });
}

/**
* بارکردنی لیستی بەکارهێنەران - چاککراوە بۆ باشتر مامەڵەکردن لەگەڵ هەڵەکان
*/
function loadUsers() {
showLoading();
console.log("Loading users list...");

db.collection('users').get()
  .then((snapshot) => {
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = '';
    
    if (snapshot.empty) {
      usersTableBody.innerHTML = '<tr><td colspan="5" class="empty-table">هیچ بەکارهێنەرێک نەدۆزرایەوە</td></tr>';
      console.log("No users found in database");
      hideLoading();
      return;
    }
    
    console.log(`Found ${snapshot.size} users`);
    snapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;
      
      const row = document.createElement('tr');
      
      // ناوی بەکارهێنەر
      const nameCell = document.createElement('td');
      nameCell.textContent = userData.fullName || 'بێ ناو';
      row.appendChild(nameCell);
      
      // ئیمەیڵ
      const emailCell = document.createElement('td');
      emailCell.textContent = userData.email || '';
      row.appendChild(emailCell);
      
      // جۆری بەکارهێنەر
      const typeCell = document.createElement('td');
      typeCell.textContent = userData.userType === 'admin' ? 'بەڕێوەبەر' : 'ئاسایی';
      row.appendChild(typeCell);
      
      // دوا چوونەژوورەوە
      const lastLoginCell = document.createElement('td');
      if (userData.lastLogin) {
        try {
          lastLoginCell.textContent = userData.lastLogin.toDate().toLocaleDateString('ku-IQ');
        } catch (error) {
          console.error("Error formatting date:", error);
          lastLoginCell.textContent = 'فۆرماتی بەروار نادروستە';
        }
      } else {
        lastLoginCell.textContent = 'نەزانراو';
      }
      row.appendChild(lastLoginCell);
      
      // کردارەکان
      const actionsCell = document.createElement('td');
      actionsCell.classList.add('table-actions');
      
      // دوگمەی دەستکاریکردن
      const editButton = document.createElement('button');
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.title = 'دەستکاریکردن';
      editButton.classList.add('action-button', 'edit-button');
      editButton.addEventListener('click', () => openEditUserModal(userId, userData));
      actionsCell.appendChild(editButton);
      
      // دوگمەی سڕینەوە (ئەگەر بەکارهێنەر ئەدمین نەبێت و ئەکاونتی خۆت نەبێت)
      if (userId !== currentUser.uid && userData.userType !== 'admin') {
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = 'سڕینەوە';
        deleteButton.classList.add('action-button', 'delete-button');
        deleteButton.addEventListener('click', () => openDeleteUserModal(userId, userData.email));
        actionsCell.appendChild(deleteButton);
      }
      
      row.appendChild(actionsCell);
      usersTableBody.appendChild(row);
    });
    
    hideLoading();
  })
  .catch((error) => {
    console.error("Error loading users:", error);
    showError("کێشەیەک ڕوویدا لە بارکردنی بەکارهێنەران: " + error.message);
    
    // نیشاندانی پەیامی نەبوونی داتا لە کاتی هەڵەدا
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = '<tr><td colspan="5" class="empty-table">کێشەیەک ڕوویدا لە بارکردنی داتا</td></tr>';
    hideLoading();
  });
}

/**
* بارکردنی ڕێکخستنەکان لە فایەرستۆر
*/
function loadSettings() {
showLoading();
console.log("Loading settings...");

db.collection('settings').doc('general').get()
  .then((doc) => {
    if (doc.exists) {
      const settings = doc.data();
      
      // پڕکردنەوەی فۆرمی ڕێکخستنەکان بە داتا
      document.getElementById('siteName').value = settings.siteName || 'ID Kurd AI';
      document.getElementById('defaultLanguage').value = settings.defaultLanguage || 'kurdish';
      document.getElementById('contactEmail').value = settings.contactEmail || '';
      
      console.log("Settings loaded successfully:", settings);
    } else {
      console.log("No settings document found, using defaults");
      // دروستکردنی ڕێکخستنە بنەڕەتییەکان ئەگەر نەبوون
      db.collection('settings').doc('general').set({
        siteName: 'ID Kurd AI',
        defaultLanguage: 'kurdish',
        contactEmail: '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    hideLoading();
  })
  .catch((error) => {
    console.error("Error loading settings:", error);
    showError("کێشەیەک ڕوویدا لە بارکردنی ڕێکخستنەکان: " + error.message);
    hideLoading();
  });
}

/**
* پاشەکەوتکردنی ڕێکخستنەکانی گشتی
*/
function saveGeneralSettings() {
showLoading();
console.log("Saving general settings...");

const settings = {
  siteName: document.getElementById('siteName').value,
  defaultLanguage: document.getElementById('defaultLanguage').value,
  contactEmail: document.getElementById('contactEmail').value,
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedBy: currentUser.uid
};

db.collection('settings').doc('general').set(settings)
  .then(() => {
    console.log("Settings saved successfully");
    hideLoading();
    showSuccess("ڕێکخستنەکان بە سەرکەوتوویی پاشەکەوتکران");
  })
  .catch((error) => {
    console.error("Error saving settings:", error);
    hideLoading();
    showError("کێشەیەک ڕوویدا لە پاشەکەوتکردنی ڕێکخستنەکان: " + error.message);
  });
}

/**
* زیادکردنی ئەدمینی نوێ
* @param {string} email - ئیمەیڵی بەکارهێنەری نوێ
*/
function addNewAdmin(email) {
showLoading();
console.log(`Adding new admin with email: ${email}`);

// گەڕان بۆ بەکارهێنەر بە ئیمەیڵ
db.collection('users').where('email', '==', email).get()
  .then((snapshot) => {
    if (snapshot.empty) {
      hideLoading();
      showError("ئەم ئیمەیڵە بوونی نییە لە سیستەمەکەدا");
      return;
    }
    
    // بەڕۆژکردنەوەی جۆری بەکارهێنەر بۆ ئەدمین
    const userDoc = snapshot.docs[0];
    return db.collection('users').doc(userDoc.id).update({
      userType: 'admin',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: currentUser.uid
    });
  })
  .then(() => {
    if (document.getElementById('adminEmail')) {
      document.getElementById('adminEmail').value = ''; // پاککردنەوەی فۆرم
    }
    
    // بەڕۆژکردنەوەی لیستی بەکارهێنەران
    loadUsers();
    
    console.log("Admin added successfully");
    hideLoading();
    showSuccess("بەڕێوەبەری نوێ بە سەرکەوتوویی زیادکرا");
  })
  .catch((error) => {
    console.error("Error adding admin:", error);
    hideLoading();
    showError("کێشەیەک ڕوویدا لە زیادکردنی بەڕێوەبەر: " + error.message);
  });
}

/**
* زیادکردنی ناوەڕۆکی مێژووی نوێ
*/
function addNewHistoryContent() {
showLoading();
console.log("Adding new history content");

// وەرگرتنی بەهاکان لە فۆرم
const title = document.getElementById('historyTitle').value;
const content = document.getElementById('historyContent').value;
const imageURL = document.getElementById('historyImageURL').value;
const tags = document.getElementById('historyTag').value.split(',')
  .map(tag => tag.trim())
  .filter(tag => tag.length > 0);

// زیادکردنی ناوەڕۆک بۆ کۆلێکشنی "historyContent"
db.collection('historyContent').add({
  title: title,
  content: content,
  imageURL: imageURL,
  tags: tags,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  createdBy: currentUser.uid,
  author: currentUser.fullName || currentUser.email,
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
})
.then(() => {
  // پاککردنەوەی فۆرم
  document.getElementById('historyTitle').value = '';
  document.getElementById('historyContent').value = '';
  document.getElementById('historyImageURL').value = '';
  document.getElementById('historyTag').value = '';
  
  console.log("History content added successfully");
  hideLoading();
  showSuccess("ناوەڕۆکی نوێ بە سەرکەوتوویی زیادکرا");
})
.catch((error) => {
  console.error("Error adding history content:", error);
  hideLoading();
  showError("کێشەیەک ڕوویدا لە زیادکردنی ناوەڕۆک: " + error.message);
});
}

/**
* کردنەوەی مۆداڵی دەستکاریکردنی بەکارهێنەر
* @param {string} userId - ناسنامەی بەکارهێنەر
* @param {Object} userData - داتای بەکارهێنەر
*/
function openEditUserModal(userId, userData) {
console.log(`Opening edit modal for user: ${userId}`);

// پڕکردنەوەی فۆرمەکە بە داتای ئێستا
document.getElementById('editUserId').value = userId;
document.getElementById('editFullName').value = userData.fullName || '';
document.getElementById('editEmail').value = userData.email || '';
document.getElementById('editUserType').value = userData.userType || 'standard';

// نیشاندانی مۆداڵ
document.getElementById('editUserModal').style.display = 'block';
}

/**
* پاشەکەوتکردنی گۆڕانکارییەکانی بەکارهێنەر
*/
function saveUserEdit() {
showLoading();

// وەرگرتنی بەهاکان لە فۆرم
const userId = document.getElementById('editUserId').value;
const fullName = document.getElementById('editFullName').value;
const userType = document.getElementById('editUserType').value;

console.log(`Saving user edit for user: ${userId}, name: ${fullName}, type: ${userType}`);

// بەڕۆژکردنەوەی داتای بەکارهێنەر
db.collection('users').doc(userId).update({
  fullName: fullName,
  userType: userType,
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedBy: currentUser.uid
})
.then(() => {
  // داخستنی مۆداڵ
  document.getElementById('editUserModal').style.display = 'none';
  
  // بەڕۆژکردنەوەی لیستی بەکارهێنەران
  loadUsers();
  
  console.log("User updated successfully");
  hideLoading();
  showSuccess("بەکارهێنەر بە سەرکەوتوویی بەڕۆژکرایەوە");
})
.catch((error) => {
  console.error("Error updating user:", error);
  hideLoading();
  showError("کێشەیەک ڕوویدا لە بەڕۆژکردنەوەی بەکارهێنەر: " + error.message);
});
}

/**
* کردنەوەی مۆداڵی سڕینەوەی بەکارهێنەر
* @param {string} userId - ناسنامەی بەکارهێنەر
* @param {string} userEmail - ئیمەیڵی بەکارهێنەر
*/
function openDeleteUserModal(userId, userEmail) {
console.log(`Opening delete modal for user: ${userId}, email: ${userEmail}`);

// پڕکردنەوەی ناسنامەی بەکارهێنەر لە فیڵدی شاراوە
document.getElementById('deleteUserId').value = userId;

// گۆڕینی تێکستی دڵنیابوونەوە لە مۆداڵەکە
const modalText = document.querySelector('#deleteUserModal p');
modalText.textContent = `ئایا دڵنیایت لە سڕینەوەی ئەم بەکارهێنەرە (${userEmail})؟ ئەم کردارە ناتوانرێت بگەڕێنرێتەوە.`;

// نیشاندانی مۆداڵ
document.getElementById('deleteUserModal').style.display = 'block';
}

/**
* سڕینەوەی بەکارهێنەر
*/
function deleteUser() {
showLoading();

// وەرگرتنی ناسنامەی بەکارهێنەر
const userId = document.getElementById('deleteUserId').value;
console.log(`Deleting user: ${userId}`);

// سڕینەوەی بەکارهێنەر
db.collection('users').doc(userId).delete()
  .then(() => {
    // داخستنی مۆداڵ
    document.getElementById('deleteUserModal').style.display = 'none';
    
    // بەڕۆژکردنەوەی لیستی بەکارهێنەران
    loadUsers();
    
    console.log("User deleted successfully");
    hideLoading();
    showSuccess("بەکارهێنەر بە سەرکەوتوویی سڕایەوە");
  })
  .catch((error) => {
    console.error("Error deleting user:", error);
    hideLoading();
    showError("کێشەیەک ڕوویدا لە سڕینەوەی بەکارهێنەر: " + error.message);
  });
}
/**
* گواستنەوە لە نێوان تابەکانی بەڕێوەبردن
* @param {string} tabId - ناسنامەی تاب
*/
function switchTab(tabId) {
  try {
    console.log(`Switching to tab: ${tabId}`);
    
    // چالاک و ناچالاک کردنی تابەکان
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    document.querySelector(`.admin-tab[data-tab="${tabId}"]`).classList.add('active');
    
    // شاردنەوەی هەموو ناوەڕۆکەکان و نیشاندانی تابی چالاک
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    
    // ئەگەر تابی بەکارهێنەران کرایەوە، بارکردنی داتای بەکارهێنەران
    if (tabId === 'users') {
      loadUsers();
    }
    // ئەگەر تابی داشبۆرد کرایەوە، بارکردنی ئامارەکان
    else if (tabId === 'dashboard') {
      loadDashboardStats();
    }
    // ئەگەر تابی ڕێکخستنەکان کرایەوە، بارکردنی ڕێکخستنەکان
    else if (tabId === 'settings') {
      loadSettings();
    }
  } catch (error) {
    console.error("Error switching tabs:", error);
    showError("کێشەیەک ڕوویدا لە گۆڕینی تاب: " + error.message);
  }
}

/**
 * نیشاندانی بارکردن
 */
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
}

/**
 * شاردنەوەی بارکردن
 */
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

/**
 * نیشاندانی پەیامی سەرکەوتن
 * @param {string} message - پەیامی سەرکەوتن
 */
function showSuccess(message) {
  const alert = document.getElementById('successAlert');
  alert.textContent = message;
  alert.style.display = 'block';
  
  // شاردنەوەی پەیام دوای 3 چرکە
  setTimeout(() => {
    alert.style.display = 'none';
  }, 3000);
}

/**
 * نیشاندانی پەیامی هەڵە
 * @param {string} message - پەیامی هەڵە
 */
function showError(message) {
  const alert = document.getElementById('errorAlert');
  alert.textContent = message;
  alert.style.display = 'block';
  
  // شاردنەوەی پەیام دوای 3 چرکە
  setTimeout(() => {
    alert.style.display = 'none';
  }, 3000);
}

/**
 * گەڕانەوە بۆ پەڕەی لۆگین
 */
function redirectToLogin() {
  window.location.href = 'index.html';
}

/**
 * دروستکردنی پارتیکڵەکان بۆ باکگراوند
 */
function createParticles() {
  try {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // ڕێکخستنی شوێن و قەبارەی ڕەندەم
      const size = Math.random() * 6 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const opacity = Math.random() * 0.8 + 0.2;
      const duration = Math.random() * 20 + 10;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.opacity = opacity;
      particle.style.animation = `float ${duration}s linear infinite`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      
      particlesContainer.appendChild(particle);
    }
  } catch (error) {
    console.error("Error creating particles:", error);
  }
}

/**
 * دروستکردنی ڕەوتی داتا بۆ باکگراوند
 */
function createDataStreams() {
  try {
    const streamsContainer = document.getElementById('data-streams');
    const streamCount = 15;
    
    for (let i = 0; i < streamCount; i++) {
      const stream = document.createElement('div');
      stream.classList.add('data-stream');
      
      // ڕێکخستنی شوێن و خێرایی ڕەندەم
      const posX = Math.random() * 100;
      const height = Math.random() * 15 + 5;
      const duration = Math.random() * 8 + 4;
      const delay = Math.random() * 5;
      
      stream.style.left = `${posX}%`;
      stream.style.height = `${height}vh`;
      stream.style.animation = `stream ${duration}s linear infinite`;
      stream.style.animationDelay = `${delay}s`;
      
      // زیادکردنی کۆدی بەیناری ڕەندەم
      const streamContent = document.createElement('div');
      streamContent.classList.add('stream-content');
      
      const binaryLength = Math.floor(Math.random() * 20) + 10;
      let binaryText = '';
      
      for (let j = 0; j < binaryLength; j++) {
        binaryText += Math.random() > 0.5 ? '1' : '0';
        if (j < binaryLength - 1) {
          binaryText += '<br>';
        }
      }
      
      streamContent.innerHTML = binaryText;
      stream.appendChild(streamContent);
      streamsContainer.appendChild(stream);
    }
  } catch (error) {
    console.error("Error creating data streams:", error);
  }
}

/**
 * چاودێریکردنی بارکردنی پەڕە بۆ ئامارەکان
 */
function incrementPageView() {
  try {
    // تەنها بۆ بەکارهێنەری لۆگین کراو
    if (auth.currentUser) {
      db.collection('analytics').doc('pageViews').update({
        total: firebase.firestore.FieldValue.increment(1),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(error => {
        console.error("Error incrementing page views:", error);
      });
    }
  } catch (error) {
    console.error("Error in incrementPageView:", error);
  }
}

// زیادکردنی چاودێریکردنی بارکردنی پەڕە
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    incrementPageView();
  }, 2000); // دواخستن بۆ دڵنیابوون لە تەواوبوونی بارکردنی پەڕە
});

/**
 * دەستپێکردنی سیستەمی هۆشداری ئەمنی - چاودێریکردنی هەوڵدانەکانی چوونەژوورەوە
 */
function initSecurityMonitoring() {
  try {
    // چاودێریکردنی هەوڵدانەکانی چوونەژوورەوە
    auth.onAuthStateChanged((user) => {
      if (user) {
        // تۆمارکردنی چوونەژوورەوەی سەرکەوتوو
        db.collection('users').doc(user.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          loginCount: firebase.firestore.FieldValue.increment(1)
        }).catch(error => {
          console.error("Error updating user login info:", error);
        });
      }
    });
  } catch (error) {
    console.error("Error initializing security monitoring:", error);
  }
}

// دەستپێکردنی سیستەمی هۆشداری ئەمنی
initSecurityMonitoring();

/**
 * بەڕۆژکردنەوەی دینامیکی ناوەڕۆکەکانی مێژوو
 * @param {string} searchTerm - وشەی گەڕان
 */
function searchHistoryContent(searchTerm) {
  showLoading();
  console.log(`Searching history content for: ${searchTerm}`);
  
  let query = db.collection('historyContent');
  
  // ئەگەر وشەی گەڕان بوونی هەبوو
  if (searchTerm && searchTerm.trim() !== '') {
    // گەڕان لە ناونیشان و ناوەڕۆک
    query = query.where('title', '>=', searchTerm)
             .where('title', '<=', searchTerm + '\uf8ff')
             .limit(20);
  }
  
  query.get()
    .then((snapshot) => {
      if (snapshot.empty) {
        console.log("No matching history content found");
        // نیشاندانی پەیام بۆ بەکارهێنەر
        showError("هیچ ناوەڕۆکێک نەدۆزرایەوە");
        hideLoading();
        return;
      }
      
      console.log(`Found ${snapshot.size} matching history content items`);
      // ئامادەکردنی ناوەڕۆکەکان بۆ نیشاندان لە UI
      const historyItems = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        historyItems.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          imageURL: data.imageURL,
          author: data.author,
          createdAt: data.createdAt ? data.createdAt.toDate() : null
        });
      });
      
      // نیشاندانی ناوەڕۆکەکان لە UI (پێویستە کۆدی HTML پێویست زیاد بکرێت)
      // displayHistoryItems(historyItems);
      
      hideLoading();
    })
    .catch((error) => {
      console.error("Error searching history content:", error);
      showError("کێشەیەک ڕوویدا لە گەڕانی ناوەڕۆک: " + error.message);
      hideLoading();
    });
}

/**
 * سڕینەوەی ناوەڕۆکی مێژوو
 * @param {string} contentId - ناسنامەی ناوەڕۆک
 */
function deleteHistoryContent(contentId) {
  showLoading();
  console.log(`Deleting history content: ${contentId}`);
  
  // سڕینەوەی ناوەڕۆک لە فایەرستۆر
  db.collection('historyContent').doc(contentId).delete()
    .then(() => {
      console.log("History content deleted successfully");
      hideLoading();
      showSuccess("ناوەڕۆک بە سەرکەوتوویی سڕایەوە");
      
      // تازەکردنەوەی لیستی ناوەڕۆکەکان
      // ئەم بەشە پێویستە کاتێک UI بۆ ناوەڕۆکەکان دروست دەکرێت کامڵ بکرێت
    })
    .catch((error) => {
      console.error("Error deleting history content:", error);
      hideLoading();
      showError("کێشەیەک ڕوویدا لە سڕینەوەی ناوەڕۆک: " + error.message);
    });
}

/**
 * دڵنیابوونەوە لە ڕێکخستنی پاراستنی داتا
 */
function ensureDataSecurity() {
  // دڵنیابوونەوە لە بوونی قفڵی ڕێکخستنەکان
  db.collection('settings').doc('security').get()
    .then((doc) => {
      if (!doc.exists) {
        // دروستکردنی ڕێکخستنە بنەڕەتییەکانی پاراستن
        db.collection('settings').doc('security').set({
          requireEmailVerification: true,
          maxLoginAttempts: 5,
          lockoutDuration: 30, // خولەک
          passwordResetTimeout: 24, // کاتژمێر
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: currentUser ? currentUser.uid : 'system'
        });
        console.log("Security settings initialized");
      }
    })
    .catch((error) => {
      console.error("Error ensuring data security:", error);
    });
}

// دەستپێکردنی سیستەمی پاراستنی داتا
setTimeout(() => {
  ensureDataSecurity();
}, 3000); // کاتێک پەڕە بارکرا، ئەم فەرمیە بە شێوەیەکی تایبەتی کار دەکات

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
