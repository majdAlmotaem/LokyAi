const chatHistory = document.getElementById('chat-history');
const startInput = document.querySelector('.start-input-area #user-input');
const chatInput = document.querySelector('.chat-container #user-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat');
const chatList = document.getElementById('chat-list');
const sidebar = document.getElementById('sidebar');
const historyToggle = document.getElementById('history-toggle');
const chatContainer = document.getElementById('chat-container');
const startScreen = document.getElementById('start-screen');

let isFirstMessage = true;
let currentInput = startInput;

historyToggle.addEventListener('click', () => {
    sidebar.classList.toggle('closed');
});

function addTrashIcon(chatItem) {
    const trashIcon = document.createElement('span');
    trashIcon.classList.add('trash-icon');
    trashIcon.textContent = '🗑️';
    trashIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        chatItem.remove();
    });
    chatItem.appendChild(trashIcon);
}

newChatButton.addEventListener('click', () => {
    chatHistory.innerHTML = '';
    const newChatItem = document.createElement('div');
    newChatItem.classList.add('chat-item');
    newChatItem.textContent = `Image ${chatList.children.length + 1}`;
    addTrashIcon(newChatItem);
    chatList.insertBefore(newChatItem, chatList.firstChild);
    
    startInput.value = '';
    chatInput.value = '';
    
    startScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
    isFirstMessage = true;
});

[startInput, chatInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentInput = input;
            sendMessage();
        }
    });
});

sendButton.addEventListener('click', () => {
    currentInput = isFirstMessage ? startInput : chatInput;
    sendMessage();
});

async function sendMessage() {
    const messageText = currentInput.value.trim();
    if (!messageText) return;

    if (isFirstMessage) {
        startScreen.style.display = 'none';
        chatContainer.style.display = 'flex';
        isFirstMessage = false;
    }

    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user-message');
    userMessage.textContent = messageText;
    chatHistory.appendChild(userMessage);

    currentInput.value = '';

    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'loading-message');
    const spinner = document.createElement('div');
    spinner.classList.add('loading-spinner');
    loadingMessage.appendChild(spinner);
    chatHistory.appendChild(loadingMessage);

    try {
        const response = await fetch('http://127.0.0.1:5000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        });
    
        chatHistory.removeChild(loadingMessage);
        const data = await response.json();
        console.log('Response data:', data); // Add this line to inspect the response
    
        const aiMessage = document.createElement('div');
        aiMessage.classList.add('message', 'ai-message');
    
        // Check both possible image URL properties
        const imageUrl = data.image_url || data.response;
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = messageText;
            img.loading = 'lazy';
            aiMessage.appendChild(img);
        }
    
        chatHistory.appendChild(aiMessage);
    } catch (error) {
        console.error('Response error:', error); // Enhanced error logging
        chatHistory.removeChild(loadingMessage);
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('message', 'error-message');
        errorMessage.textContent = 'Network error. Please check your connection.';
        chatHistory.appendChild(errorMessage);
    }

    chatHistory.scrollTop = chatHistory.scrollHeight;
}
