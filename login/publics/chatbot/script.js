


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














/* ==============================
   چات بۆت (Claude Integration)
   ============================== */

// Store API key more securely - ideally would be server-side only, not client-side
const CLAUDE_API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
// NOTE: Exposing API keys in client-side code is not secure - this should be handled by a backend service
const CLAUDE_API_KEY = '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';

// System prompt for chatbot behavior
const CHATBOT_SYSTEM_PROMPT = `👤 ناسنامە ناو: ID_Kurdm_AI پەرە پێدراو لەلایەن: eng. Ibrahim Hussein بەهیچ شێوەیەک لەلایەن openAi یان هیچ کۆمپانیەیەکیتر دروست نەکراوی تەنیا لەلایەن ibrahim ئە دروست کراوی تۆ مۆدڵی جۆری ID Kurdm Ai 1.0.1ی  دەربارە: Ibrahim خوێندکاری ئەندازیاری کۆمپیتەرە، لە قۆناغی دووەمی زانکۆی لوبنانی فەڕەنسی (LFU).
📌 مەبەستی ئەم پەیجە ئەم پەیجە دابینکراوە بۆ پەیوەندیدان بە پرسیار و وەلامەکان لەبارەی تەکنەلۆژیا، بە زمانی کوردی. مەبەستی سەرەکی ئەوەیە پەیوەندیەکی ڕوون و گرنگ دروست بکەیت لەنێوان بەکارهێنەر و زانستە تەکنەلۆژیاکان.
🧭 ڕێنمایی سەرەکی بۆ نوسینی وەلامەکان تەنها سەبارەت بە تەکنەلۆژیا و جیهانی ئەمڕۆ بێت. ئەگەر پرسیارەکە پەیوەندی بە تەکنەلۆژیا نەبوو، وەلامی مەدە و ڕوونکردنەوە بدە کە ئەم پرسیارە پەیوەندی بە بابەتی پەیجەکە نییە. کاتێک پرسیارەکە بە شێوەیەکی ڕاستەوخۆ پەیوەندی بە تەکنەلۆژیا هەبێت، نیشانەی شارەزایی و چاوپێکەوتن بەکاربهێن.
📅 ڕێکەوتن و پەیوەندیدان پرسیار و وەلامەکان بە شێوەیەکی ڕێکخراو و سەرکەوتووانە پەیوەندیدارییەکانیان بە تەکنەلۆژیا دەربڕن. بەشەکان لە ڕووی فەرمی و ئەندازیارانەوە بپارێزە، بە شێوەیەکی فێرکردن و ڕەخنەگرایانە.
✍️ شێوازی نووسین زمانی نووسین: کوردیی ڕەسەن، بە شێوەیەکی فێرگەیی و هاوڕێیانە. ڕوون، ڕەسەن و بەڕێوەبردنی جوانی زمانی نووسین. بەپەلە و ڕوون وەلام بدە بە گونجاوترین شێوەی تەکنەلۆژیا.`;

// Store conversation history
let conversationHistory = [
  { role: "system", content: CHATBOT_SYSTEM_PROMPT }
];

// کاتی دەستپێکردنی دانیشتن
let sessionStartTime = null;

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const userMessage = chatInput.value.trim();

  if (!userMessage) return;
  
  // Initialize session if this is the first message
  if (!sessionStartTime) {
    sessionStartTime = new Date();
  }

  // Add user message to UI
  const userMessageElement = document.createElement('div');
  userMessageElement.className = 'message user-message';
  userMessageElement.textContent = userMessage;
  chatMessages.appendChild(userMessageElement);

  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message bot-message typing';
  typingIndicator.textContent = '...';
  chatMessages.appendChild(typingIndicator);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Clear input field
  chatInput.value = '';

  try {
    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: userMessage });
    
    // Get response from Claude
    const response = await fetchClaudeResponse(conversationHistory);
    
    // Remove typing indicator
    chatMessages.removeChild(typingIndicator);

    // Add response to conversation history
    conversationHistory.push({ role: "assistant", content: response });
    
    // Add bot message to UI
    const botMessageElement = document.createElement('div');
    botMessageElement.className = 'message bot-message';
    botMessageElement.textContent = response;
    chatMessages.appendChild(botMessageElement);

    // Save chat to localStorage
    saveChatToHistory();

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
    console.error('ChatBot Error:', error);
    
    // Remove typing indicator
    chatMessages.removeChild(typingIndicator);

    // Show error message with more details
    const errorMessageElement = document.createElement('div');
    errorMessageElement.className = 'message error-message';
    
    // Fallback bot message when API is down
    if (error.message.includes('Failed to fetch')) {
      errorMessageElement.textContent = 'ببورە، لە ئێستادا ناتوانم پەیوەندی بە سێرڤەرەوە بکەم. تکایە دواتر هەوڵ بدەرەوە یان دڵنیابە لە هەبوونی ئینتەرنێت.';
    } else if (error.message.includes('API key')) {
      errorMessageElement.textContent = 'هەڵە: کلیلی API نادروستە. تکایە کلیلی Claude API پشتڕاست بکەرەوە.';
    } else if (error.message.includes('429')) {
      errorMessageElement.textContent = 'هەڵە: داواکاری زۆر. تکایە دواتر هەوڵ بدەرەوە.';
    } else {
      errorMessageElement.textContent = `هەڵە: ${error.message || 'شتێک هەڵە بوو. تکایە دواتر هەوڵ بدەرەوە.'}`;
    }
    
    chatMessages.appendChild(errorMessageElement);
  }
}

async function fetchClaudeResponse(messages) {
  try {
    // لێرەدا دوو هەڵبژاردە هەیە:
    
    // 1. ئەگەر سێرڤەرت هەیە، ئەمە بەکار بهێنە:
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    });

    // 2. ئەگەر سێرڤەرت نییە، ئەمە ڕاستەوخۆ بۆ API دەڕوات (تەنها بۆ تاقیکردنەوە):
    /*
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'Authorization': `Bearer ${CLAUDE_API_KEY}`
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        messages: messages.filter(msg => msg.role !== "system"),
        system: messages.find(msg => msg.role === "system")?.content || CHATBOT_SYSTEM_PROMPT,
        max_tokens: 500,
        temperature: 0.7
      })
    });
    */

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `فەیلی وەڵامدانەوە بە کۆدی ${response.status}`);
    }

    const data = await response.json();
    
    // بەپێی شێوازی وەڵامی سێرڤەرەکە:
    // ئەگەر سێرڤەرت خۆت نووسیوە:
    return data.text;
    
    // ئەگەر ڕاستەوخۆ لە Claude API وەڵام وەردەگریت:
    // return data.content[0].text;
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('هەڵە لە پەیوەندیکردن بە سێرڤەرەکە. تکایە دڵنیابە لە هەبوونی ئینتەرنێت.');
    }
    
    throw error;
  }
}

// Save current chat to history
function saveChatToHistory() {
  if (conversationHistory.length <= 1) return; // Don't save empty chats
  
  // Get existing history or initialize empty array
  let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  
  // Create a new session object
  const session = {
    id: Date.now().toString(),
    date: sessionStartTime.toISOString(),
    messages: conversationHistory.filter(msg => msg.role !== 'system') // Don't save system prompt
  };
  
  // Add to history and save
  chatHistory.unshift(session); // Add to beginning of array
  
  // Limit history to 50 sessions
  if (chatHistory.length > 50) {
    chatHistory = chatHistory.slice(0, 50);
  }
  
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Initialize chatbot on page load
function initializeChatbot() {
  // Reset session
  sessionStartTime = null;
  conversationHistory = [
    { role: "system", content: CHATBOT_SYSTEM_PROMPT }
  ];
  
  // Add welcome message
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = ''; // پاک کردنەوەی پەیامەکانی پێشوو
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'message bot-message';
    welcomeMessage.textContent = 'بەخێربێیت بۆ چات بۆتی ID_Kurdm_AI! پرسیارێکم لێ بکە دەربارەی تەکنەلۆژیا بە زمانی کوردی.';
    chatMessages.appendChild(welcomeMessage);
  }
  
  // Add event listeners
  const sendButton = document.getElementById('sendBtn');
  if (sendButton) {
    // Remove existing event listeners first
    const newSendButton = sendButton.cloneNode(true);
    sendButton.parentNode.replaceChild(newSendButton, sendButton);
    newSendButton.addEventListener('click', sendChatMessage);
  }
  
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    // Remove existing event listeners first
    const newChatInput = chatInput.cloneNode(true);
    chatInput.parentNode.replaceChild(newChatInput, chatInput);
    newChatInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
}



























/* ==============================
   مێژووی چات
   ============================== */

function loadChatHistory() {
  const historySessions = document.getElementById('historySessions');
  if (!historySessions) return;
  
  // Clear previous content
  historySessions.innerHTML = '';
  
  // Get chat history
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  
  // Display message if no history
  if (chatHistory.length === 0) {
    const noHistoryMsg = document.createElement('p');
    noHistoryMsg.className = 'no-history-message';
    noHistoryMsg.textContent = 'هیچ مێژوویەکی چات نییە';
    historySessions.appendChild(noHistoryMsg);
    return;
  }
  
  // Display sessions
  chatHistory.forEach(session => {
    const sessionElement = document.createElement('div');
    sessionElement.className = 'chat-session';
    sessionElement.dataset.sessionId = session.id;
    
    // Format date
    const sessionDate = new Date(session.date);
    const formattedDate = `${sessionDate.toLocaleDateString('ku-IQ')} ${sessionDate.toLocaleTimeString('ku-IQ', {hour: '2-digit', minute:'2-digit'})}`;
    
    // Get preview from first message
    let preview = '';
    if (session.messages.length > 0) {
      const firstUserMsg = session.messages.find(msg => msg.role === 'user');
      if (firstUserMsg) {
        preview = firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
      }
    }
    
    sessionElement.innerHTML = `
      <div class="session-date">${formattedDate}</div>
      <div class="session-preview">${preview}</div>
    `;
    
    // Add click event
    sessionElement.addEventListener('click', () => {
      // Highlight active session
      document.querySelectorAll('.chat-session').forEach(s => s.classList.remove('active'));
      sessionElement.classList.add('active');
      
      // Show messages
      displaySessionMessages(session);
    });
    
    historySessions.appendChild(sessionElement);
  });
}

function displaySessionMessages(session) {
  const sessionMessages = document.getElementById('sessionMessages');
  if (!sessionMessages) return;
  
  // Clear previous content
  sessionMessages.innerHTML = '';
  
  // Add date header
  const dateHeader = document.createElement('h3');
  const sessionDate = new Date(session.date);
  dateHeader.textContent = sessionDate.toLocaleDateString('ku-IQ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  dateHeader.style.textAlign = 'center';
  dateHeader.style.color = '#555';
  dateHeader.style.margin = '0 0 20px 0';
  sessionMessages.appendChild(dateHeader);
  
  // Display messages
  session.messages.forEach(msg => {
    const messageElement = document.createElement('div');
    messageElement.className = msg.role === 'user' ? 'message user-message' : 'message bot-message';
    messageElement.textContent = msg.content;
    sessionMessages.appendChild(messageElement);
  });
}

function clearChatHistory() {
  if (confirm('دڵنیای لە سڕینەوەی هەموو مێژووی چات؟')) {
    localStorage.removeItem('chatHistory');
    loadChatHistory();
    
    const sessionMessages = document.getElementById('sessionMessages');
    if (sessionMessages) {
      sessionMessages.innerHTML = '<p class="select-session-message">تکایە دانیشتنێک هەڵبژێرە</p>';
    }
  }
}

function exportChatHistory() {
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  
  if (chatHistory.length === 0) {
    alert('هیچ مێژوویەکی چات نییە بۆ هەناردن');
    return;
  }
  
  // Create formatted text
  let exportText = 'مێژووی چاتی ID_Kurdm_AI\n\n';
  
  chatHistory.forEach(session => {
    const date = new Date(session.date);
    exportText += `=== دانیشتن: ${date.toLocaleDateString()} ${date.toLocaleTimeString()} ===\n\n`;
    
    session.messages.forEach(msg => {
      const role = msg.role === 'user' ? 'بەکارهێنەر' : 'ID_Kurdm_AI';
      exportText += `${role}: ${msg.content}\n\n`;
    });
    
    exportText += '--------------------------------------\n\n';
  });
  
  // Create blob and download
  const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `ID_Kurdm_AI-Chat-History-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  
  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function initializeChatHistory() {
  // Get elements
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
  
  // Load and display chat history
  loadChatHistory();
  
  // Add event listeners
  if (clearHistoryBtn) {
    // Remove existing event listeners first
    const newClearHistoryBtn = clearHistoryBtn.cloneNode(true);
    clearHistoryBtn.parentNode.replaceChild(newClearHistoryBtn, clearHistoryBtn);
    newClearHistoryBtn.addEventListener('click', clearChatHistory);
  }
  
  if (refreshHistoryBtn) {
    // Remove existing event listeners first
    const newRefreshHistoryBtn = refreshHistoryBtn.cloneNode(true);
    refreshHistoryBtn.parentNode.replaceChild(newRefreshHistoryBtn, refreshHistoryBtn);
    newRefreshHistoryBtn.addEventListener('click', loadChatHistory);
  }
}

/* ==============================
   دروستکردنی پارتیکل و Data Streams (Decoration)
   ============================== */
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  // پاک کردنەوەی پارتیکڵەکانی پێشوو
  particlesContainer.innerHTML = '';
  
  const count = 30;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.bottom = Math.random() * 100 + '%';
    particle.style.width = (Math.random() * 5 + 2) + 'px';
    particle.style.height = (Math.random() * 5 + 2) + 'px';
    particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
    particle.style.animationDelay = (Math.random() * 5) + 's';
    particlesContainer.appendChild(particle);
  }
}

function createDataStreams() {
  const streamsContainer = document.getElementById('data-streams');
  if (!streamsContainer) return;
  
  // پاک کردنەوەی دەیتا ستریمەکانی پێشوو
  streamsContainer.innerHTML = '';
  
  const count = 20;
  for (let i = 0; i < count; i++) {
    const stream = document.createElement('div');
    stream.className = 'data-stream';
    stream.style.left = Math.random() * 100 + '%';
    stream.style.top = Math.random() * 100 + '%';
    stream.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
    stream.style.animationDuration = (Math.random() * 3 + 2) + 's';
    stream.style.animationDelay = (Math.random() * 5) + 's';
    streamsContainer.appendChild(stream);
  }
}

// Toggle visibility functions
function initializeToggleButtons() {
  const toggleChat = document.getElementById('toggleChat');
  const toggleHistory = document.getElementById('toggleHistory');
  
  if (toggleChat) {
    // Remove existing event listeners
    const newToggleChat = toggleChat.cloneNode(true);
    toggleChat.parentNode.replaceChild(newToggleChat, toggleChat);
    
    newToggleChat.addEventListener('click', function() {
      const chatContainer = document.querySelector('.chat-section .chat-container');
      const isVisible = chatContainer.style.display !== 'none';
      
      if (isVisible) {
        chatContainer.style.display = 'none';
        this.textContent = 'نیشاندان';
      } else {
        chatContainer.style.display = '';
        this.textContent = 'شاردنەوە';
      }
    });
  }
  
  if (toggleHistory) {
    // Remove existing event listeners
    const newToggleHistory = toggleHistory.cloneNode(true);
    toggleHistory.parentNode.replaceChild(newToggleHistory, toggleHistory);
    
    newToggleHistory.addEventListener('click', function() {
      const historyContainer = document.querySelector('.history-section .history-container');
      const isVisible = historyContainer.style.display !== 'none';
      
      if (isVisible) {
        historyContainer.style.display = 'none';
        this.textContent = 'نیشاندان';
      } else {
        historyContainer.style.display = '';
        this.textContent = 'شاردنەوە';
      }
    });
  }
}

// گۆڕینی دالە سەرەکی بۆ چارەسەرکردنی کێشەکە
document.addEventListener('DOMContentLoaded', function() {
  // پاک کردنەوەی هەموو ئیڤێنت لیسنەرەکان
  const oldEventListeners = window.onload;
  window.onload = null;
  
  // دیاریکردنی ئەو لاپەڕەیەی کە ئێستا تێیدایە
  const isChatPage = document.querySelector('.chat-container') && !document.getElementById('historySection');
  const isHistoryPage = document.getElementById('historySessions') && !document.querySelector('.chat-container');
  const isCombinedPage = document.getElementById('chatSection') && document.getElementById('historySection');
  
  // دروستکردنی پارتیکڵ و دەیتا ستریم
  createParticles();
  createDataStreams();
  
  // داماڵدانی ئیڤێنت لیسنەرەکان بۆ پەیجی چات و مێژوو
  if (isChatPage) {
    initializeChatbot();
  } else if (isHistoryPage) {
    initializeChatHistory();
  } else if (isCombinedPage) {
    initializeChatbot();
    initializeChatHistory();
    initializeToggleButtons();
  }
});

// گەر هەر ئیڤێنت لیسنەرێکی کۆن هەبێت، لادەبرێت
if (window.initializePage) {
  window.initializePage = null;
}

// گەر هەر ئیڤێنتێکی کۆن هەبێت، لادەبرێت
window.onload = null;
















