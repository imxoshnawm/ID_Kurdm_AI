// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDIoNvW1wHk-5qlTGrnnlfMIGZfEN-ucg8",
    authDomain:  "id-kurdm-ai.firebaseapp.com",
    projectId: "id-kurdm-ai",
    storageBucket: "id-kurdm-ai.firebasestorage.app",
    messagingSenderId: "500724816364",
    appId: "1:500724816364:web:0159636245557a07c7c8c9"
  };
  
  // Initialize Firebase
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.firestore();
  } else {
    console.error("Firebase SDK is not loaded properly!");
  }