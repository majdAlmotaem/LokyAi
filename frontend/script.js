const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat');
const chatList = document.getElementById('chat-list');
const sidebar = document.getElementById('sidebar');
const chatContainer = document.querySelector('.chat-container');

// Function to add trash icon to chat items
function addTrashIcon(chatItem) {
    const trashIcon = document.createElement('span');
    trashIcon.classList.add('trash-icon');
    trashIcon.textContent = '🗑️';
    trashIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent chat item click from triggering
        chatItem.remove();
    });
    chatItem.appendChild(trashIcon);
}

// Initialize existing chat items with trash icons
document.querySelectorAll('.chat-item').forEach(addTrashIcon);

// New chat functionality (clears current chat)
newChatButton.addEventListener('click', () => {
    chatHistory.innerHTML = '';
    const newChatItem = document.createElement('div');
    newChatItem.classList.add('chat-item');
    newChatItem.textContent = `Chat ${chatList.children.length + 1}`;
    addTrashIcon(newChatItem); // Add trash icon to new chat item
    chatList.insertBefore(newChatItem, chatList.firstChild);
});

// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Send message on Enter key press
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') return;

    // Display user message
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user-message');
    userMessage.textContent = messageText;
    chatHistory.appendChild(userMessage);

    // Clear input and show loading
    userInput.value = '';
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'ai-message');
    loadingMessage.textContent = 'Generating image...';
    chatHistory.appendChild(loadingMessage);

    try {
        const response = await fetch('http://127.0.0.1:5000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        });

        // Remove loading message
        chatHistory.removeChild(loadingMessage);

        if (response.ok && response.headers.get('content-type').includes('image')) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('message', 'ai-message');
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.classList.add('generated-image');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            imageContainer.appendChild(img);
            chatHistory.appendChild(imageContainer);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('message', 'ai-message');
        errorMessage.textContent = 'Image generation in progress. Please wait for the model to finish loading.';
        chatHistory.appendChild(errorMessage);
    }

    chatHistory.scrollTop = chatHistory.scrollHeight;
}