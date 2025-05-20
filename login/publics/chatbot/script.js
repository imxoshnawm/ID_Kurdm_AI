// Constants
const CHATBOT_SYSTEM_PROMPT = `👤 ناسنامە ناو: ID_Kurdm_AI پەرە پێدراو لەلایەن: eng. Ibrahim Hussein بەهیچ شێوەیەک لەلایەن openAi یان هیچ کۆمپانیەیەکیتر دروست نەکراوی تەنیا لەلایەن ibrahim ئە دروست کراوی تۆ مۆدڵی جۆری ID Kurdm Ai 1.0.1ی دەربارە: Ibrahim خوێندکاری ئەندازیاری کۆمپیتەرە، لە قۆناغی دووەمی زانکۆی لوبنانی فەڕەنسی (LFU). 📌 مەبەستی ئەم پەیجە ئەم پەیجە دابینکراوە بۆ پەیوەندیدان بە پرسیار و وەلامەکان لەبارەی تەکنەلۆژیا، بە زمانی کوردی. مەبەستی سەرەکی ئەوەیە پەیوەندیەکی ڕوون و گرنگ دروست بکەیت لەنێوان بەکارهێنەر و زانستە تەکنەلۆژیاکان. 🧭 ڕێنمایی سەرەکی بۆ نوسینی وەلامەکان تەنها سەبارەت بە تەکنەلۆژیا و جیهانی ئەمڕۆ بێت. ئەگەر پرسیارەکە پەیوەندی بە تەکنەلۆژیا نەبوو، وەلامی مەدە و ڕوونکردنەوە بدە کە ئەم پرسیارە پەیوەندی بە بابەتی پەیجەکە نییە. کاتێک پرسیارەکە بە شێوەیەکی ڕاستەوخۆ پەیوەندی بە تەکنەلۆژیا هەبێت، نیشانەی شارەزایی و چاوپێکەوتن بەکاربهێن. 📅 ڕێکەوتن و پەیوەندیدان پرسیار و وەلامەکان بە شێوەیەکی ڕێکخراو و سەرکەوتووانە پەیوەندیدارییەکانیان بە تەکنەلۆژیا دەربڕن. بەشەکان لە ڕووی فەرمی و ئەندازیارانەوە بپارێزە، بە شێوەیەکی فێرکردن و ڕەخنەگرایانە. ✍️ شێوازی نووسین زمانی نووسین: کوردیی ڕەسەن، بە شێوەیەکی فێرگەیی و هاوڕێیانە. ڕوون، ڕەسەن و بەڕێوەبردنی جوانی زمانی نووسین. بەپەلە و ڕوون وەلام بدە بە گونجاوترین شێوەی تەکنەلۆژیا.`;

// *** کۆدی چاککراو: تێبینی API key کێشەکەیە ***
// بژاردە ١: API KEY ـی ڕاستت بەکاربهێنە

// بژاردە ٢: کۆدەکە بگۆڕە بۆ شیوازێکی سادەتر بێ API

const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-3.5-turbo";
const LOCAL_STORAGE_KEY = "chatHistory";

// DOM Elements
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");
const historySessions = document.getElementById("historySessions");
const sessionMessages = document.getElementById("sessionMessages");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");
const toggleChat = document.getElementById("toggleChat");
const toggleHistory = document.getElementById("toggleHistory");
const chatSection = document.getElementById("chatSection");
const historySection = document.getElementById("historySection");
const noHistoryMessage = document.querySelector(".no-history-message");
const selectSessionMessage = document.querySelector(".select-session-message");

// Variables
let currentSessionId = generateSessionId();
let chatHistory = loadChatHistory();
let activeSessionId = null;

// Background Effects
initializeBackgroundEffects();

// Make sure the DOM elements are properly loaded first
document.addEventListener("DOMContentLoaded", function() {
    // Verify the button exists
    const sendBtn = document.getElementById("sendBtn");
    const chatInput = document.getElementById("chatInput");

    if (!sendBtn || !chatInput) {
        console.error("Send button or chat input not found!");
        return;
    }
    
    // Add event listeners with error handling
    sendBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent form submission if within a form
handleSendMessage();
    });

    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
e.preventDefault(); // Prevent default enter behavior
            handleSendMessage();
        }
    });
    
    // Modified handleSendMessage function
async function handleSendMessage() {
    const userMessage = chatInput.value.trim();
    
    if (!userMessage) {
            console.log("Empty message, ignoring...");
return;
}
    
try {
    // Display user message
    appendMessage(userMessage, "user");
    chatInput.value = ""; // Clear input
    
    // Show typing indicator
    const botMessageElement = appendMessage("...", "bot", true);
    
            // Get bot response
        const botResponse = await getChatbotResponse(userMessage);
        
        // Update UI
        botMessageElement.textContent = botResponse;
        botMessageElement.classList.remove("typing");
        
        // Save to history
        saveMessageToHistory(userMessage, botResponse);
        updateHistoryUI();
        
    } catch (error) {
        console.error("Error:", error);
    }
    }
});

// Main Functions
async function getChatbotResponse(userMessage) {
        try {
        console.log("Attempting API call...");
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: CHATBOT_SYSTEM_PROMPT },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            console.error(`API Error Code: ${response.status}`);
            console.error(`API Error Message: ${await response.text()}`);
            return getLocalResponse(userMessage);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
                console.error("API Error Details:", error);
        return getLocalResponse(userMessage);
    }
}

// *** کۆدی چاککراو: ئەم فەنکشنە زیاد بکە ***
// ئەمە وەڵامی ناوەکی دەدات کاتێک کە API کار ناکات
function getLocalResponse(message) {
    // وەڵامە ساکارەکان
    const responses = {
        "سڵاو": "سڵاو! چۆن دەتوانم یارمەتیت بدەم سەبارەت بە تەکنەلۆژیا؟",
        "چۆنی": "من باشم، سوپاس بۆ پرسینەکەت. چۆن دەتوانم یارمەتیت بدەم لە بواری تەکنەلۆژیا؟",
        "default": "ببوورە، ئێستا ناتوانم پەیوەندی بکەم بە سێرڤەری زیرەکی دەستکردەوە. تکایە دواتر هەوڵ بدەوە یان پرسیارێکی سادە بپرسە."
    };
    
    // وشەکان بە پیتی بچووک بکە و بەراوردی بکە
    const lowerMessage = message.toLowerCase();
    
    // بگەڕێ بۆ وەڵامی گونجاو
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key.toLowerCase())) {
            return value;
        }
    }
    
    // ئەگەر هیچ وەڵامێک نەدۆزرایەوە، وەڵامی پێشبینیکراو بگەڕێنەوە
    return responses.default;
}

// UI Helper Functions
function appendMessage(text, sender, isTyping = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    
    if (isTyping) {
        messageDiv.classList.add("typing");
    }
    
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    
    return messageDiv;
}

function displayWelcomeMessage() {
    const welcomeMessage = "سڵاو! من ID_Kurdm_AI م، پەرەپێدراو لەلایەن مامۆستا Ibrahim Hussein. چۆن دەتوانم یارمەتیت بدەم سەبارەت بە تەکنەلۆژیا؟";
    appendMessage(welcomeMessage, "bot");
}

function toggleSection(container, button) {
    if (container.style.display === "none") {
        container.style.display = "block";
        button.textContent = "شاردنەوە";
    } else {
        container.style.display = "none";
        button.textContent = "نیشاندان";
    }
}

// History Management Functions
function saveMessageToHistory(userMessage, botResponse) {
    const timestamp = new Date().toISOString();
    
    // Check if current session exists
    let sessionExists = false;
    for (const session of chatHistory) {
        if (session.id === currentSessionId) {
            // Add messages to existing session
            session.messages.push({
                timestamp,
                user: userMessage,
                bot: botResponse
            });
            sessionExists = true;
            break;
        }
    }
    
    // Create new session if needed
    if (!sessionExists) {
        chatHistory.push({
            id: currentSessionId,
            startTime: timestamp,
            messages: [{
                timestamp,
                user: userMessage,
                bot: botResponse
            }]
        });
    }
    
    // Save to local storage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chatHistory));
}

function loadChatHistory() {
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedHistory ? JSON.parse(storedHistory) : [];
}

function updateHistoryUI() {
    // Clear current sessions list
    historySessions.innerHTML = "";
    
    if (chatHistory.length === 0) {
        // Show no history message
        noHistoryMessage.style.display = "block";
        return;
    } else {
        noHistoryMessage.style.display = "none";
    }
    
    // Sort sessions by timestamp (newest first)
    chatHistory.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    // Create session elements
    chatHistory.forEach(session => {
        const sessionEl = document.createElement("div");
        sessionEl.classList.add("history-session");
        if (session.id === activeSessionId) {
            sessionEl.classList.add("active");
        }
        
        // Format date for display
        const sessionDate = new Date(session.startTime);
        const dateFormatted = `${sessionDate.toLocaleDateString('ku-IQ')} ${sessionDate.toLocaleTimeString('ku-IQ')}`;
        
        // Get first message as preview
        const previewText = session.messages[0].user.length > 30 
            ? session.messages[0].user.substring(0, 30) + "..." 
            : session.messages[0].user;
        
        sessionEl.innerHTML = `
            <div class="session-header">
                <span class="session-date">${dateFormatted}</span>
                <span class="message-count">${session.messages.length} پەیام</span>
            </div>
            <div class="session-preview">${previewText}</div>
        `;
        
        // Add click event
        sessionEl.addEventListener("click", () => {
            displaySessionMessages(session.id);
            
            // Update active session
            document.querySelectorAll(".history-session").forEach(el => {
                el.classList.remove("active");
            });
            sessionEl.classList.add("active");
            activeSessionId = session.id;
        });
        
        historySessions.appendChild(sessionEl);
    });
}

function displaySessionMessages(sessionId) {
    // Hide select message
    selectSessionMessage.style.display = "none";
    
    // Clear current messages
    sessionMessages.innerHTML = "";
    
    // Find the session
    const session = chatHistory.find(s => s.id === sessionId);
    if (!session) return;
    
    // Create header
    const headerEl = document.createElement("div");
    headerEl.classList.add("session-header-detail");
    
    const sessionDate = new Date(session.startTime);
    const dateFormatted = `${sessionDate.toLocaleDateString('ku-IQ')} ${sessionDate.toLocaleTimeString('ku-IQ')}`;
    
    headerEl.innerHTML = `
        <h3>دانیشتن: ${dateFormatted}</h3>
        <button class="delete-session-btn" id="deleteSession_${sessionId}">
            <i class="fas fa-trash"></i> سڕینەوە
        </button>
    `;
    sessionMessages.appendChild(headerEl);
    
    // Add delete event
    document.getElementById(`deleteSession_${sessionId}`).addEventListener("click", () => {
        deleteSession(sessionId);
    });
    
    // Display messages
    session.messages.forEach(msg => {
        const messageTime = new Date(msg.timestamp).toLocaleTimeString('ku-IQ');
        
        // User message
        const userMsgEl = document.createElement("div");
        userMsgEl.classList.add("history-message", "user");
        userMsgEl.innerHTML = `
            <div class="message-header">
                <span class="message-sender">تۆ</span>
                <span class="message-time">${messageTime}</span>
            </div>
            <div class="message-content">${msg.user}</div>
        `;
        sessionMessages.appendChild(userMsgEl);
        
        // Bot message
        const botMsgEl = document.createElement("div");
        botMsgEl.classList.add("history-message", "bot");
        botMsgEl.innerHTML = `
            <div class="message-header">
                <span class="message-sender">ID_Kurdm_AI</span>
                <span class="message-time">${messageTime}</span>
            </div>
            <div class="message-content">${msg.bot}</div>
        `;
        sessionMessages.appendChild(botMsgEl);
    });
    
    // Scroll to top
    sessionMessages.scrollTop = 0;
}

function deleteSession(sessionId) {
    if (confirm("ئایا دڵنیایت دەتەوێت ئەم دانیشتنە بسڕیتەوە؟")) {
        // Remove from history
        chatHistory = chatHistory.filter(session => session.id !== sessionId);
        
        // Save to local storage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chatHistory));
        
        // Reset active session if needed
        if (activeSessionId === sessionId) {
            activeSessionId = null;
            sessionMessages.innerHTML = "";
            selectSessionMessage.style.display = "block";
        }
        
        // Update history UI
        updateHistoryUI();
    }
}

function clearHistory() {
    if (confirm("ئایا دڵنیایت دەتەوێت هەموو مێژووی چات بسڕیتەوە؟")) {
        chatHistory = [];
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        
        // Reset UI
        historySessions.innerHTML = "";
        sessionMessages.innerHTML = "";
        noHistoryMessage.style.display = "block";
        selectSessionMessage.style.display = "block";
        activeSessionId = null;
    }
}

function refreshHistory() {
    chatHistory = loadChatHistory();
    updateHistoryUI();
    
    // Reset session display
    if (activeSessionId) {
        displaySessionMessages(activeSessionId);
    } else {
        sessionMessages.innerHTML = "";
        selectSessionMessage.style.display = "block";
    }
}

// Background Effect Functions
function initializeBackgroundEffects() {
    createDataStreams();
    createParticles();
}

function createDataStreams() {
    const dataStreamsContainer = document.getElementById('data-streams');
    const numStreams = 10;
    
    for (let i = 0; i < numStreams; i++) {
        const stream = document.createElement('div');
        stream.classList.add('data-stream');
        
        // Random parameters
        const delay = Math.random() * 5;
        const duration = 5 + Math.random() * 10;
        const left = Math.random() * 100;
        
        // Apply styling
        stream.style.left = `${left}%`;
        stream.style.animationDelay = `${delay}s`;
        stream.style.animationDuration = `${duration}s`;
        
        dataStreamsContainer.appendChild(stream);
    }
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const numParticles = 50;
    
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random parameters
        const size = 1 + Math.random() * 3;
        const opacity = 0.1 + Math.random() * 0.4;
        const delay = Math.random() * 10;
        const duration = 15 + Math.random() * 20;
        const left = Math.random() * 100;
        
        // Apply styling
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = opacity;
        particle.style.left = `${left}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Utility Functions
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}