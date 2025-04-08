// Translation dictionary for Menu
const menuTranslations = {
  english: {
    pageTitle: "ID Kurd AI - Menu",
    mainTitle: "ID Kurd AI Menu",
    aboutSection: "About Developer",
    aboutDescription: "Information about the creator and purpose of this project",
    translatorSection: "Kurdish - English Translator",
    translatorDescription: "Automatic translation between Kurdish and English languages",
    chatbotSection: "Chatbot",
    chatbotDescription: "Talk to the smart ID Kurd AI chatbot in Kurdish",
    historySection: "History of Kurdistan",
    historyDescription: "Learn about the history of Kurdistan and its people",
    kurdishBtn: "Kurdish",
    englishBtn: "English",
    footerText: "© 2025 ID Kurd AI - All Rights Reserved",
    designNote: "ID Kurd AI - A Kurdish project for artificial intelligence technology",
    homeLink: "Home",
    aboutLink: "About",
    translatorLink: "Translator",
    chatbotLink: "Chatbot",
    historyLink: "History"
  },
  kurdish: {
    pageTitle: "ئای دی کورد - مینوو",
    mainTitle: "مینووی ئای دی کورد",
    aboutSection: "دەربارەی پەرەپێدەر",
    aboutDescription: "زانیاری لەسەر دروستکەر و مەبەستی ئەم پڕۆژەیە",
    translatorSection: "وەرگێڕی کوردی - ئینگلیزی",
    translatorDescription: "وەرگێڕی ئۆتۆماتیکی نێوان زمانی کوردی و ئینگلیزی",
    chatbotSection: "چات بۆت",
    chatbotDescription: "قسە لەگەڵ ئای دی کورد بۆتی زیرەک بە زمانی کوردی",
    historySection: "مێژووی کوردستان",
    historyDescription: "فێربوونی مێژووی کوردستان و گەلەکەی",
    kurdishBtn: "کوردی",
    englishBtn: "English",
    footerText: "© ٢٠٢٥ ئای دی کورد - هەموو مافەکان پارێزراون",
    designNote: "ئای دی کورد - پڕۆژەیەکی کوردی بۆ تەکنۆلۆژیای زیرەکی دەستکرد",
    homeLink: "سەرەکی",
    aboutLink: "دەربارە",
    translatorLink: "وەرگێڕ",
    chatbotLink: "چات بۆت",
    historyLink: "مێژوو"
  }
};

// Update menu language function
function updateMenuLanguage(lang) {
  // Update the current language
  currentLanguage = lang;
  
  // Update page title
  document.title = menuTranslations[lang].pageTitle;
  
  // Update main heading
  const mainHeading = document.querySelector('.container.section h2');
  if (mainHeading) mainHeading.textContent = menuTranslations[lang].mainTitle;
  
  // Update menu items
  const menuItems = document.querySelectorAll('.menu-item');
  if (menuItems.length >= 4) {
    // About section
    menuItems[0].querySelector('h3').textContent = menuTranslations[lang].aboutSection;
    menuItems[0].querySelector('p').textContent = menuTranslations[lang].aboutDescription;
    
    // Translator section
    menuItems[1].querySelector('h3').textContent = menuTranslations[lang].translatorSection;
    menuItems[1].querySelector('p').textContent = menuTranslations[lang].translatorDescription;
    
    // Chatbot section
    menuItems[2].querySelector('h3').textContent = menuTranslations[lang].chatbotSection;
    menuItems[2].querySelector('p').textContent = menuTranslations[lang].chatbotDescription;
    
    // History section
    menuItems[3].querySelector('h3').textContent = menuTranslations[lang].historySection;
    menuItems[3].querySelector('p').textContent = menuTranslations[lang].historyDescription;
  }
  
  // Update navigation menu
  const navLinks = document.querySelectorAll('nav#menu ul li a');
  if (navLinks.length >= 5) {
    navLinks[0].textContent = menuTranslations[lang].homeLink;
    navLinks[1].textContent = menuTranslations[lang].aboutLink;
    navLinks[2].textContent = menuTranslations[lang].translatorLink;
    navLinks[3].textContent = menuTranslations[lang].chatbotLink;
    navLinks[4].textContent = menuTranslations[lang].historyLink;
  }
  
  // Update language buttons
  const langButtons = document.querySelectorAll('.lang-btn');
  if (langButtons.length >= 2) {
    langButtons[0].textContent = menuTranslations[lang].kurdishBtn;
    langButtons[1].textContent = menuTranslations[lang].englishBtn;
  }
  
  // Update design note
  const designNote = document.querySelector('.design-note');
  if (designNote) designNote.textContent = menuTranslations[lang].designNote;
  
  // Update footer
  const footer = document.querySelector('footer p');
  if (footer) footer.textContent = menuTranslations[lang].footerText;
  
  // Update active language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (lang === 'kurdish') {
    document.querySelectorAll('.lang-btn')[0].classList.add('active');
  } else {
    document.querySelectorAll('.lang-btn')[1].classList.add('active');
  }
  
  // Save language preference
  localStorage.setItem('preferredLanguage', lang);
}

// Menu page initialization
function initializeMenuPage() {
  // Create animated particles and data streams
  createParticles();
  createDataStreams();
  
  // Add event listeners to language buttons
  const langButtons = document.querySelectorAll('.lang-btn');
  if (langButtons.length >= 2) {
    langButtons[0].addEventListener('click', () => updateMenuLanguage('kurdish'));
    langButtons[1].addEventListener('click', () => updateMenuLanguage('english'));
  }
  
  // Add hover effects for menu items
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Restore preferred language
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'kurdish';
  updateMenuLanguage(savedLanguage);
}

// Execute when DOM is loaded for menu page
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the menu page
  if (document.querySelector('.menu-grid')) {
    initializeMenuPage();
  }
});

// Add animation to menu items when scrolling into view
function animateOnScroll() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}

// Initialize menu items with starting animation state
function setupMenuAnimations() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  
  // Trigger animation shortly after page load
  setTimeout(animateOnScroll, 300);
}

// Add this to initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupMenuAnimations);
} else {
  setupMenuAnimations();
}