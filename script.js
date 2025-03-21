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

function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') return;

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user-message');
    userMessage.textContent = messageText;
    chatHistory.appendChild(userMessage);

    // Clear input field
    userInput.value = '';

    // Scroll to the bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'ai-message', 'typing-indicator');
    typingIndicator.textContent = 'AI is typing...';
    chatHistory.appendChild(typingIndicator);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Simulate AI response after a delay
    setTimeout(() => {
        chatHistory.removeChild(typingIndicator);

        const aiMessage = document.createElement('div');
        aiMessage.classList.add('message', 'ai-message');
        aiMessage.textContent = 'This is a cool AI response!';
        chatHistory.appendChild(aiMessage);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 1000);
}
