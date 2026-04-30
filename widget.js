(function () {
  // Configuration
  const CONFIG = {
    apiUrl: new URL(document.currentScript.src).origin,
    shop: new URLSearchParams(new URL(document.currentScript.src).search).get('shop') || 'shopify-user',
    widgetId: 'ai-sales-agent-widget',
    storageKey: 'ai_sales_agent_session'
  };

  // Get or create session ID
  function getSessionId() {
    let sessionId = localStorage.getItem(CONFIG.storageKey);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(CONFIG.storageKey, sessionId);
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

        .ai-widget-container {
          width: 380px;
          max-width: 100vw;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
          display: flex;
          flex-direction: column;
          overflow: hidden;
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
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .ai-widget-message.user .ai-widget-message-content {
          background: #667eea;
          color: white;
          border-bottom-right-radius: 2px;
        }

        .ai-widget-message.bot .ai-widget-message-content {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
          border-bottom-left-radius: 2px;
        }

        .ai-widget-typing {
          display: flex;
          gap: 4px;
          padding: 10px 14px;
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
          0%, 60%, 100% {
            opacity: 0.5;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }

        .ai-widget-input-area {
          padding: 12px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
        }

        .ai-widget-input {
          flex: 1;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          max-height: 100px;
        }

        .ai-widget-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .ai-widget-send {
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .ai-widget-send:hover:not(:disabled) {
          background: #5568d3;
        }

        .ai-widget-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ai-widget-toggle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .ai-widget-toggle:hover {
          transform: scale(1.1);
        }

        .ai-widget-hidden {
          display: none !important;
        }

        @media (max-width: 480px) {
          .ai-widget-container {
            width: calc(100vw - 16px);
            height: 60vh;
            max-height: 500px;
          }

          .ai-widget-message-content {
            max-width: 85%;
          }
        }
      </style>

      <button class="ai-widget-toggle" id="ai-widget-toggle" title="Chat with AI Sales Agent">💬</button>

      <div class="ai-widget-container ai-widget-hidden" id="ai-widget-container">
        <div class="ai-widget-header">
          <div>
            <div class="ai-widget-header-title">AI Sales Agent</div>
            <div class="ai-widget-header-subtitle">We're here to help</div>
          </div>
          <button class="ai-widget-close" id="ai-widget-close">✕</button>
        </div>

        <div class="ai-widget-messages" id="ai-widget-messages"></div>

        <div class="ai-widget-input-area">
          <input
            type="text"
            class="ai-widget-input"
            id="ai-widget-input"
            placeholder="Ask me anything..."
            autocomplete="off"
          />
          <button class="ai-widget-send" id="ai-widget-send">Send</button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    setupEventListeners();
    sendInitialMessage();
  }

  // Setup event listeners
  function setupEventListeners() {
    const toggle = document.getElementById('ai-widget-toggle');
    const close = document.getElementById('ai-widget-close');
    const container = document.getElementById('ai-widget-container');
    const sendBtn = document.getElementById('ai-widget-send');
    const input = document.getElementById('ai-widget-input');

    toggle.addEventListener('click', () => {
      container.classList.toggle('ai-widget-hidden');
      if (!container.classList.contains('ai-widget-hidden')) {
        input.focus();
      }
    });

    close.addEventListener('click', () => {
      container.classList.add('ai-widget-hidden');
    });

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Send initial greeting
  function sendInitialMessage() {
    const messagesDiv = document.getElementById('ai-widget-messages');
    const greeting = document.createElement('div');
    greeting.className = 'ai-widget-message bot';
    greeting.innerHTML = `
      <div class="ai-widget-message-content">
        👋 Hi there! I'm here to help you find the perfect product. What are you looking for today?
      </div>
    `;
    messagesDiv.appendChild(greeting);
  }

  // Send message
  async function sendMessage() {
    const input = document.getElementById('ai-widget-input');
    const sendBtn = document.getElementById('ai-widget-send');
    const messagesDiv = document.getElementById('ai-widget-messages');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-widget-message user';
    userMsg.innerHTML = `<div class="ai-widget-message-content">${escapeHtml(message)}</div>`;
    messagesDiv.appendChild(userMsg);

    // Clear input
    input.value = '';
    input.focus();

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-widget-message bot';
    typingDiv.innerHTML = `
      <div class="ai-widget-typing">
        <div class="ai-widget-typing-dot"></div>
        <div class="ai-widget-typing-dot"></div>
        <div class="ai-widget-typing-dot"></div>
      </div>
    `;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Disable send button
    sendBtn.disabled = true;

    try {
      const response = await fetch(`${CONFIG.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          sessionId: getSessionId(),
          shop: CONFIG.shop
        })
      });

      const data = await response.json();

      // Remove typing indicator
      typingDiv.remove();

      // Add bot response
      const botMsg = document.createElement('div');
      botMsg.className = 'ai-widget-message bot';
      botMsg.innerHTML = `<div class="ai-widget-message-content">${escapeHtml(data.reply || 'Sorry, I had trouble processing that.')}</div>`;
      messagesDiv.appendChild(botMsg);

    } catch (error) {
      console.error('Chat error:', error);
      typingDiv.remove();

      const errorMsg = document.createElement('div');
      errorMsg.className = 'ai-widget-message bot';
      errorMsg.innerHTML = `<div class="ai-widget-message-content">Sorry, I'm having trouble connecting. Please try again.</div>`;
      messagesDiv.appendChild(errorMsg);
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    sendBtn.disabled = false;
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
