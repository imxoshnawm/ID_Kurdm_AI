// Configuration
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // تکایە کلیلی API ی خۆت لێرە دابنێ
const DEFAULT_SOURCE_LANG = 'kurdish';
const DEFAULT_TARGET_LANG = 'english';

// Maximum chunk length for long text translation
const maxChunkLength = 5000;

// DOM elements
const elements = {
  sourceText: document.getElementById('sourceText'),
  translatedText: document.getElementById('translatedText'),
  translateBtn: document.getElementById('translateBtn'),
  swapLanguages: document.getElementById('swapLanguages'),
  sourceLanguageLabel: document.getElementById('sourceLanguageLabel'),
  targetLanguageLabel: document.getElementById('targetLanguageLabel'),
  clearSource: document.getElementById('clearSource'),
  copyTranslated: document.getElementById('copyTranslated'),
  historyItems: document.getElementById('historyItems')
};

// State
let currentState = {
  sourceLang: DEFAULT_SOURCE_LANG,
  targetLang: DEFAULT_TARGET_LANG,
  translationHistory: []
};

// Function to split text into smaller chunks for translation
function splitText(text) {
  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = "";
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxChunkLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  
  if (chunks.length === 0) {
    for (let i = 0; i < text.length; i += maxChunkLength) {
      chunks.push(text.substr(i, maxChunkLength));
    }
  }
  return chunks;
}

// Google Translate API
async function translateWithGoogleAPI(text, sourceLang, targetLang) {
  // Convert language codes to what Google Translate API expects
  const googleSourceLang = sourceLang === 'kurdish' ? 'ckb' : 'en';
  const googleTargetLang = targetLang === 'kurdish' ? 'ckb' : 'en';
  
  const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: googleSourceLang,
        target: googleTargetLang,
        format: 'text'
      })
    });
    
    if (!response.ok) throw new Error('Google Translate API error');
    
    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Google Translate API error:", error);
    throw error;
  }
}

// LibreTranslate
async function translateWithLibreTranslate(text, sourceLang, targetLang) {
  const libreSourceLang = sourceLang === 'kurdish' ? 'ckb' : 'en';
  const libreTargetLang = targetLang === 'kurdish' ? 'ckb' : 'en';
  
  const apiUrl = 'https://libretranslate.com/translate';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: libreSourceLang,
        target: libreTargetLang
      })
    });
    
    if (!response.ok) throw new Error('LibreTranslate API error');
    
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("LibreTranslate API error:", error);
    throw error;
  }
}

// MyMemory
async function translateMyMemory(text, sourceLang, targetLang) {
  const myMemorySourceLang = sourceLang === 'kurdish' ? 'ckb' : 'en';
  const myMemoryTargetLang = targetLang === 'kurdish' ? 'ckb' : 'en';
  const email = `test${Math.floor(Math.random() * 1000)}@example.com`;
  
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${myMemorySourceLang}|${myMemoryTargetLang}&de=${email}`
    );
    
    if (!response.ok) throw new Error('MyMemory API error');
    
    const data = await response.json();
    return data.responseData?.translatedText;
  } catch (error) {
    console.error("MyMemory API error:", error);
    throw error;
  }
}

// Function for translating long text with fallbacks
async function translateLongText(text, sourceLang, targetLang) {
  if (!text.trim()) return "";
  
  const chunks = splitText(text);
  let translatedChunks = [];
  
  for (const chunk of chunks) {
    try {
      // Try Google Translate first
      const translated = await translateWithGoogleAPI(chunk, sourceLang, targetLang);
      translatedChunks.push(translated);
    } catch (error) {
      try {
        // Fallback to LibreTranslate
        const translated = await translateWithLibreTranslate(chunk, sourceLang, targetLang);
        translatedChunks.push(translated);
      } catch (fallbackError) {
        try {
          // Final fallback to MyMemory
          const translated = await translateMyMemory(chunk, sourceLang, targetLang);
          translatedChunks.push(translated || chunk);
        } catch (finalError) {
          // If all APIs fail, fall back to the dictionary
          const dictTranslated = performDictionaryTranslation(chunk, sourceLang, targetLang);
          translatedChunks.push(dictTranslated);
        }
      }
    }
  }
  
  // Return the joined translated chunks
  return translatedChunks.join(" ");
}

// Load saved state from local storage
function loadSavedState() {
  const savedState = localStorage.getItem('translatorState');
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      currentState = { ...currentState, ...parsedState };
      
      // Update UI to reflect saved state
      updateLanguageLabels();
      loadTranslationHistory();
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }
}

// Save current state to local storage
function saveState() {
  localStorage.setItem('translatorState', JSON.stringify(currentState));
}

// Update language labels in the UI
function updateLanguageLabels() {
  elements.sourceLanguageLabel.textContent = currentState.sourceLang === 'kurdish' ? 'کوردی' : 'ئینگلیزی';
  elements.targetLanguageLabel.textContent = currentState.targetLang === 'kurdish' ? 'کوردی' : 'ئینگلیزی';
}

// Translation dictionary for basic words (as fallback)
const translationDictionary = {
  kurdishToEnglish: {
    'سڵاو': 'hello',
    'بەخێربێی': 'welcome',
    'زۆر سوپاس': 'thank you very much',
    'بەڵێ': 'yes',
    'نەخێر': 'no',
    'ناو': 'name',
    'چۆنی': 'how are you',
    'ئەز': 'I',
    'تۆ': 'you',
    'ئەو': 'he/she',
    'ئێمە': 'we',
    'ئێوە': 'you (plural)',
    'ئەوان': 'they',
    'باش': 'good',
    'خراپ': 'bad',
    'گەورە': 'big',
    'بچووک': 'small',
    'کورد': 'Kurd',
    'کوردستان': 'Kurdistan',
    'ئینگلیزی': 'English',
    'وەرگێڕان': 'translate/translation',
    'زمان': 'language',
    'کوردی': 'Kurdish',
    'چات بۆت': 'chatbot',
    'مێژوو': 'history',
    'تەکنۆلۆژیا': 'technology',
    'زیرەکی دەستکرد': 'artificial intelligence',
  },
  englishToKurdish: {
    'hello': 'سڵاو',
    'welcome': 'بەخێربێی',
    'thank you': 'سوپاس',
    'thank you very much': 'زۆر سوپاس',
    'yes': 'بەڵێ',
    'no': 'نەخێر',
    'name': 'ناو',
    'how are you': 'چۆنی',
    'i': 'ئەز',
    'you': 'تۆ',
    'he': 'ئەو',
    'she': 'ئەو',
    'we': 'ئێمە',
    'you (plural)': 'ئێوە',
    'they': 'ئەوان',
    'good': 'باش',
    'bad': 'خراپ',
    'big': 'گەورە',
    'small': 'بچووک',
    'kurd': 'کورد',
    'kurdistan': 'کوردستان',
    'english': 'ئینگلیزی',
    'translate': 'وەرگێڕان',
    'translation': 'وەرگێڕان',
    'language': 'زمان',
    'kurdish': 'کوردی',
    'chatbot': 'چات بۆت',
    'history': 'مێژوو',
    'technology': 'تەکنۆلۆژیا',
    'artificial intelligence': 'زیرەکی دەستکرد',
  }
};

// Fallback dictionary translation
function performDictionaryTranslation(text, sourceLang, targetLang) {
  // Determine which dictionary to use
  const dictionary = sourceLang === 'kurdish' ? 
    translationDictionary.kurdishToEnglish : 
    translationDictionary.englishToKurdish;
  
  // Normalize text to lowercase for case-insensitive matching
  let normalizedText = text.toLowerCase();
  
  // Check if exact match exists in dictionary
  if (dictionary[normalizedText]) {
    return dictionary[normalizedText];
  }
  
  // Split text into words and try to translate each word
  let words = text.split(/\s+/);
  let translated = [];
  
  for (let word of words) {
    // Try to find the word in the dictionary (case insensitive)
    let normalizedWord = word.toLowerCase();
    let translatedWord = dictionary[normalizedWord] || word;
    translated.push(translatedWord);
  }
  
  // Check for multi-word phrases (after word-by-word translation)
  for (let phrase in dictionary) {
    if (phrase.includes(' ')) {
      const regex = new RegExp('\\b' + phrase + '\\b', 'gi');
      normalizedText = normalizedText.replace(regex, dictionary[phrase]);
    }
  }
  
  // If the entire text matched a phrase, return that translation
  if (normalizedText !== text.toLowerCase() && !normalizedText.includes(' ')) {
    return normalizedText;
  }
  
  // Otherwise return the word-by-word translation
  return translated.join(' ');
}

// Function to translate text
async function translateText() {
  const sourceText = elements.sourceText.value.trim();
  
  if (!sourceText) {
    showNotification('تکایە دەقێک بنووسە بۆ وەرگێڕان', 'warning');
    return;
  }
  
  // Show loading indicator
  elements.translatedText.value = 'وەرگێڕان...';
  elements.translateBtn.disabled = true;
  
  try {
    // Use the API-based translation function
    const translatedText = await translateLongText(
      sourceText, 
      currentState.sourceLang, 
      currentState.targetLang
    );
    
    // Clean up any HTML entities in translation
    const cleanTranslation = translatedText
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    // Display translated text
    elements.translatedText.value = cleanTranslation;
    
    // Add to history
    addToHistory(sourceText, cleanTranslation);
    
    showNotification('وەرگێڕان تەواو بوو', 'success');
  } catch (error) {
    console.error("Translation error:", error);
    elements.translatedText.value = currentState.sourceLang === 'kurdish' 
      ? "❌ هەڵە ڕوویدا لە وەرگێڕان" 
      : "❌ Translation error occurred";
    showNotification('هەڵە لە وەرگێڕاندا ڕوویدا', 'error');
  } finally {
    // Re-enable translate button
    elements.translateBtn.disabled = false;
  }
}

// Add translation to history
function addToHistory(source, translated) {
  // Create history item
  const historyItem = {
    id: Date.now(),
    source,
    translated,
    sourceLang: currentState.sourceLang,
    targetLang: currentState.targetLang,
    timestamp: new Date().toISOString()
  };
  
  // Add to state
  currentState.translationHistory.unshift(historyItem);
  
  // Keep only the last 20 items
  if (currentState.translationHistory.length > 20) {
    currentState.translationHistory.pop();
  }
  
  // Save to local storage
  saveState();
  
  // Update history display
  displayHistoryItems();
}

// Display history items in the UI
function displayHistoryItems() {
  elements.historyItems.innerHTML = '';
  
  if (currentState.translationHistory.length === 0) {
    elements.historyItems.innerHTML = '<div class="empty-history">هیچ مێژوویەک نییە</div>';
    return;
  }
  
  currentState.translationHistory.forEach(item => {
    const historyItemEl = document.createElement('div');
    historyItemEl.className = 'history-item';
    historyItemEl.dataset.id = item.id;
    
    historyItemEl.innerHTML = `
      <div class="history-item-header">
        <span class="timestamp">${new Date(item.timestamp).toLocaleString()}</span>
        <span class="languages">${item.sourceLang === 'kurdish' ? 'کوردی' : 'ئینگلیزی'} → ${item.targetLang === 'kurdish' ? 'کوردی' : 'ئینگلیزی'}</span>
      </div>
      <div class="source">${item.source}</div>
      <div class="target">${item.translated}</div>
    `;
    
    historyItemEl.addEventListener('click', () => {
      // Fill in the source text area with this history item's text
      elements.sourceText.value = item.source;
      elements.translatedText.value = item.translated;
      
      // Scroll to the translator
      document.querySelector('.translator').scrollIntoView({ behavior: 'smooth' });
    });
    
    elements.historyItems.appendChild(historyItemEl);
  });
}

// Swap languages
function swapLanguages() {
  const temp = currentState.sourceLang;
  currentState.sourceLang = currentState.targetLang;
  currentState.targetLang = temp;
  
  // Swap text areas content if both have text
  if (elements.sourceText.value && elements.translatedText.value) {
    const tempText = elements.sourceText.value;
    elements.sourceText.value = elements.translatedText.value;
    elements.translatedText.value = tempText;
  }
  
  // Update UI
  updateLanguageLabels();
  
  // Save state
  saveState();
  
  // Show notification
  showNotification('زمانەکان گۆڕدران', 'info');
}

// Clear source text
function clearSource() {
  elements.sourceText.value = '';
  elements.sourceText.focus();
}

// Copy translated text
function copyTranslated() {
  const text = elements.translatedText.value;
  
  if (!text) {
    showNotification('هیچ دەقێک نییە بۆ کۆپیکردن', 'warning');
    return;
  }
  
  navigator.clipboard.writeText(text)
    .then(() => {
      showNotification('دەق کۆپی کرا', 'success');
    })
    .catch(() => {
      showNotification('کۆپیکردن سەرکەوتوو نەبوو', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
  // Check if notification container exists, create if not
  let notificationContainer = document.querySelector('.notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add to container
  notificationContainer.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    
    setTimeout(() => {
      notification.remove();
      
      // Remove container if empty
      if (notificationContainer.children.length === 0) {
        notificationContainer.remove();
      }
    }, 300);
  }, 3000);
}

// Load translation history
function loadTranslationHistory() {
  displayHistoryItems();
}

// Auto-detect language function
function autoDetectLanguage(text) {
  // Function to detect if text contains Sorani Kurdish characters
  function isTextSorani(text) {
    const soraniChars = /[\u0626\u0686\u0695\u0627\u06C6\u0648\u06CE\u06D5]/;
    return soraniChars.test(text);
  }

  // Function to detect if text is English
  function isTextEnglish(text) {
    const englishChars = /^[A-Za-z\s.,?!0-9]+$/;
    return englishChars.test(text);
  }

  if (isTextSorani(text)) {
    return 'kurdish';
  } else if (isTextEnglish(text)) {
    return 'english';
  }
  
  // Default to current source language if can't detect
  return currentState.sourceLang;
}

// Initialize app
function initTranslator() {
  // Load saved state
  loadSavedState();
  
  // Event listeners
  elements.translateBtn.addEventListener('click', translateText);
  elements.swapLanguages.addEventListener('click', swapLanguages);
  elements.clearSource.addEventListener('click', clearSource);
  elements.copyTranslated.addEventListener('click', copyTranslated);
  
  // Add event listener for enter key in source text
  elements.sourceText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      translateText();
      e.preventDefault(); // Prevent adding a new line
    }
  });
  
  // Auto-detect language after typing
  elements.sourceText.addEventListener('input', function() {
    if (elements.sourceText.value.length > 10) {  
      const detectedLang = autoDetectLanguage(elements.sourceText.value);
      
      // Update the current state if language detected is different
      if (detectedLang !== currentState.sourceLang) {
        currentState.sourceLang = detectedLang;
        currentState.targetLang = detectedLang === 'kurdish' ? 'english' : 'kurdish';
        updateLanguageLabels();
        saveState();
      }
    }
  });
  
  // Show welcome message
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTranslator);

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .notification {
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out forwards;
    min-width: 200px;
    text-align: center;
  }
  
  .notification-success {
    background-color: var(--kurdish-green, #3AAA35);
  }
  
  .notification-error {
    background-color: var(--kurdish-red, #ED1C24);
  }
  
  .notification-warning {
    background-color: var(--kurdish-yellow, #FFCB05);
    color: #333;
  }
  
  .notification-info {
    background-color: #3498db;
  }
  
  .notification.fade-out {
    animation: fadeOut 0.3s ease-in forwards;
  }
  
  /* Enhanced history styles */
  .history-item {
    padding: 12px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .history-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .history-item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.8em;
    color: #666;
  }
  
  .history-item .source {
    font-weight: bold;
    margin-bottom: 4px;
    padding-bottom: 4px;
    border-bottom: 1px dashed #ddd;
  }
  
  .history-item .target {
    color: #337ab7;
  }
  
  .empty-history {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
  }
  
  /* Animations */
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notificationStyles);




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
