(function() {
  // Configuration
  const CONFIG = {
    apiUrl: new URL(document.currentScript.src).origin,
    shop: new URLSearchParams(new URL(document.currentScript.src).search).get('shop') || 'shopify-user',
    widgetId: 'ai-sales-agent-widget',
    storageKey: 'ai_sales_agent_session'
  };

  // Safe storage that works in sandboxed environments
  const SafeStorage = {
    data: {},
    
    getItem: function(key) {
      // Try localStorage first
      try {
        return localStorage.getItem(key);
      } catch (e) {
        // Fallback to in-memory storage
        return this.data[key] || null;
      }
    },
    
    setItem: function(key, value) {
      // Try localStorage first
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // Fallback to in-memory storage
        this.data[key] = value;
      }
    }
  };

  // Get or create session ID
  function getSessionId() {
    let sessionId = SafeStorage.getItem(CONFIG.storageKey);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      SafeStorage.setItem(CONFIG.storageKey, sessionId);
    }
    return sessionId;
  }

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement("div");
    widget.id = CONFIG.widgetId;
    widget.innerHTML = `
      <style>
        #ai-sales-agent-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          z-index: 9999;
        }

        #ai-sales-agent-widget * {
          box-sizing: border-box;
        }

        .ai-widget-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .ai-widget-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .ai-widget-button:active {
          transform: scale(0.95);
        }

        .ai-widget-container {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          max-width: calc(100vw - 40px);
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
          z-index: 10000;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ai-widget-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ai-widget-header-title {
          font-weight: 600;
          font-size: 14px;
        }

        .ai-widget-header-subtitle {
          font-size: 12px;
          opacity: 0.9;
          margin-top: 4px;
        }

        .ai-widget-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f8f9fa;
        }

        .ai-widget-message {
          display: flex;
          gap: 8px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ai-widget-message.user {
          justify-content: flex-end;
        }

        .ai-widget-message-content {
          max-width: 70%;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.4;
        }

        .ai-widget-message.ai .ai-widget-message-content {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
        }

        .ai-widget-message.user .ai-widget-message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .ai-widget-typing {
          display: flex;
          gap: 4px;
          padding: 10px 12px;
        }

        .ai-widget-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: typing 1.4s infinite;
        }

        .ai-widget-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .ai-widget-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { opacity: 0.5; }
          30% { opacity: 1; }
        }

        .ai-widget-input-area {
          padding: 12px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
          background: white;
        }

        .ai-widget-input {
          flex: 1;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          max-height: 100px;
        }

        .ai-widget-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }

        .ai-widget-send {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .ai-widget-send:hover {
          opacity: 0.9;
        }

        .ai-widget-send:active {
          transform: scale(0.95);
        }

        .ai-widget-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .ai-widget-container {
            width: calc(100vw - 40px);
            height: 60vh;
            max-height: 500px;
          }

          .ai-widget-message-content {
            max-width: 85%;
          }
        }
      </style>

      <button class="ai-widget-button" id="ai-widget-toggle" title="Chat with us">
        💬
      </button>
    `;

    document.body.appendChild(widget);
    setupEventListeners();
  }

  // Setup event listeners
  function setupEventListeners() {
    const toggleButton = document.getElementById('ai-widget-toggle');
    
    if (toggleButton) {
      toggleButton.addEventListener('click', function() {
        openChat();
      });
    }
  }

  // Open chat window
  function openChat() {
    let container = document.getElementById('ai-widget-container');
    
    if (container) {
      container.style.display = 'flex';
      return;
    }

    const widget = document.getElementById(CONFIG.widgetId);
    container = document.createElement('div');
    container.id = 'ai-widget-container';
    container.className = 'ai-widget-container';

    const sessionId = getSessionId();

    container.innerHTML = `
      <div class="ai-widget-header">
        <div>
          <div class="ai-widget-header-title">AI Sales Agent</div>
          <div class="ai-widget-header-subtitle">Ask about our products</div>
        </div>
        <button class="ai-widget-close" id="ai-widget-close">✕</button>
      </div>
      <div class="ai-widget-messages" id="ai-widget-messages"></div>
      <div class="ai-widget-input-area">
        <input 
          type="text" 
          class="ai-widget-input" 
          id="ai-widget-input" 
          placeholder="Type your message..."
          autocomplete="off"
        />
        <button class="ai-widget-send" id="ai-widget-send">Send</button>
      </div>
    `;

    widget.appendChild(container);

    // Add initial message
    const messagesDiv = document.getElementById('ai-widget-messages');
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'ai-widget-message ai';
    welcomeMsg.innerHTML = `<div class="ai-widget-message-content">👋 Hi! I'm your AI sales assistant. How can I help you find the perfect product today?</div>`;
    messagesDiv.appendChild(welcomeMsg);

    // Setup close button
    document.getElementById('ai-widget-close').addEventListener('click', closeChat);

    // Setup input and send
    const input = document.getElementById('ai-widget-input');
    const sendBtn = document.getElementById('ai-widget-send');

    const sendMessage = async () => {
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'ai-widget-message user';
      userMsg.innerHTML = `<div class="ai-widget-message-content">${escapeHtml(message)}</div>`;
      messagesDiv.appendChild(userMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      input.value = '';
      sendBtn.disabled = true;

      // Show typing indicator
      const typingDiv = document.createElement('div');
      typingDiv.className = 'ai-widget-message ai';
      typingDiv.innerHTML = `
        <div class="ai-widget-typing">
          <div class="ai-widget-typing-dot"></div>
          <div class="ai-widget-typing-dot"></div>
          <div class="ai-widget-typing-dot"></div>
        </div>
      `;
      messagesDiv.appendChild(typingDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      try {
        // Send message to backend
        const response = await fetch("https://shopify-sales-bot--kaziubaid05.replit.app/api/chat", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            shop: CONFIG.shop,
            sessionId: sessionId
          })
        });

        const data = await response.json();

        // Remove typing indicator
        messagesDiv.removeChild(typingDiv);

        // Add AI response
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-widget-message ai';
        aiMsg.innerHTML = `<div class="ai-widget-message-content">${escapeHtml(data.response || 'Sorry, I could not process that. Please try again.')}</div>`;
        messagesDiv.appendChild(aiMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

      } catch (error) {
        console.error('Chat error:', error);
        messagesDiv.removeChild(typingDiv);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'ai-widget-message ai';
        errorMsg.innerHTML = `<div class="ai-widget-message-content">Sorry, I'm having trouble connecting. Please try again.</div>`;
        messagesDiv.appendChild(errorMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }

      sendBtn.disabled = false;
      input.focus();
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    input.focus();
  }

  // Close chat window
  function closeChat() {
    const container = document.getElementById('ai-widget-container');
    if (container) {
      container.style.display = 'none';
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
