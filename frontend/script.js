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
const modelSelector = document.getElementById('model-selector');
const mainContent = document.querySelector('.main-content');
const uploadButton = document.getElementById('upload-button');
const uploadButtonChat = document.getElementById('upload-button-chat');
const imageUpload = document.getElementById('image-upload');
const imageUploadChat = document.getElementById('image-upload-chat');

let isFirstMessage = true;
let currentInput = startInput;
let selectedModel = "stabilityai/stable-diffusion-xl-base-1.0"; // Default model
let uploadedImage = null; // Store the uploaded image as base64

// Function to auto-resize textarea
function autoResizeTextarea(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to match content (scrollHeight)
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Add auto-resize event listeners to both textareas
[startInput, chatInput].forEach(textarea => {
    // Initial resize
    autoResizeTextarea(textarea);
    
    // Resize on input
    textarea.addEventListener('input', function() {
        autoResizeTextarea(this);
    });
    
    // Handle Enter key (send on Enter, new line on Shift+Enter)
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default newline
            currentInput = this;
            sendMessage();
        }
    });
});

// Listen for model changes
modelSelector.addEventListener('change', function() {
    selectedModel = this.value;
    console.log(`Model changed to: ${selectedModel}`);
    
    // Update placeholder text based on selected model
    const placeholderText = selectedModel === "nitrosocke/Ghibli-Diffusion" 
        ? "Describe an image in Studio Ghibli style..." 
        : "Describe an image...";
    
    startInput.placeholder = placeholderText;
    chatInput.placeholder = placeholderText;
    
    // Show upload buttons for all models (removed model-specific condition)
    uploadButton.style.display = 'flex';
    uploadButtonChat.style.display = 'flex';
    
    // Clear any uploaded image when changing models
    uploadedImage = null;
});

// Initially show upload buttons for all models
uploadButton.style.display = 'flex';
uploadButtonChat.style.display = 'flex';

// Handle image upload
uploadButton.addEventListener('click', () => {
    imageUpload.click();
});

uploadButtonChat.addEventListener('click', () => {
    imageUploadChat.click();
});

// Process the selected image
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Only allow image files
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = e.target.result;
        
        // Show a notification that image is ready
        const currentTextarea = isFirstMessage ? startInput : chatInput;
        currentTextarea.placeholder = "Image ready! Add a description or leave blank...";
    };
    reader.readAsDataURL(file);
}

imageUpload.addEventListener('change', handleImageUpload);
imageUploadChat.addEventListener('change', handleImageUpload);

console.log("History toggle:", historyToggle);
console.log("Sidebar:", sidebar);
console.log("Main content:", mainContent);
// Replace your current toggle function with this one
historyToggle.addEventListener('click', function() {
    // Check current state
    const isSidebarClosed = sidebar.classList.contains('closed');
    
    // Toggle based on current state
    if (isSidebarClosed) {
        // If sidebar is closed, open it
        sidebar.classList.remove('closed');
        mainContent.classList.add('shifted');
        console.log("Opening sidebar");
    } else {
        // If sidebar is open, close it
        sidebar.classList.add('closed');
        mainContent.classList.remove('shifted');
        console.log("Closing sidebar");
    }
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
    // Reset textarea heights
    autoResizeTextarea(startInput);
    autoResizeTextarea(chatInput);
    
    // Clear uploaded image
    uploadedImage = null;
    
    startScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
    isFirstMessage = true;
});

sendButton.addEventListener('click', () => {
    currentInput = isFirstMessage ? startInput : chatInput;
    sendMessage();
});

// Add this function to smoothly scroll to the bottom of chat history
function scrollToBottom() {
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
        const scrollHeight = chatHistory.scrollHeight;
        const currentScroll = chatHistory.scrollTop + chatHistory.clientHeight;
        
        // Only auto-scroll if user is already near the bottom (within 300px)
        // This prevents interrupting if they're reading previous messages
        if (scrollHeight - currentScroll < 300) {
            chatHistory.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
            });
        }
    });
}

// Update the sendMessage function to use the new scrolling function
async function sendMessage() {
    const messageText = currentInput.value.trim();
    
    // If there's an uploaded image, we can proceed even without text
    const hasUploadedImage = uploadedImage !== null;
    
    // Only proceed if there's text or we have an uploaded image
    if (!messageText && !hasUploadedImage) return;

    if (isFirstMessage) {
        startScreen.style.display = 'none';
        chatContainer.style.display = 'flex';
        isFirstMessage = false;
    }

    // Create user message element
    const userMessage = document.createElement('div');
    
    // If there's an uploaded image, add it to the message
    if (uploadedImage) {
        userMessage.classList.add('message', 'user-message-with-image');
        
        // Add text if provided
        if (messageText) {
            const textSpan = document.createElement('span');
            textSpan.textContent = messageText;
            userMessage.appendChild(textSpan);
        } else {
            const textSpan = document.createElement('span');
            textSpan.textContent = "Transform this image";
            userMessage.appendChild(textSpan);
        }
        
        // Add the image
        const img = document.createElement('img');
        img.src = uploadedImage;
        img.alt = "Uploaded image";
        userMessage.appendChild(img);
    } else {
        userMessage.classList.add('message', 'user-message');
        userMessage.textContent = messageText;
    }
    
    chatHistory.appendChild(userMessage);
    
    // Scroll after adding user message
    scrollToBottom();

    currentInput.value = '';
    // Reset textarea heights
    autoResizeTextarea(currentInput);
    
    // Reset placeholder
    currentInput.placeholder = selectedModel === "nitrosocke/Ghibli-Diffusion" 
        ? "Describe an image in Studio Ghibli style..." 
        : "Describe an image...";

    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'loading-message');
    const spinner = document.createElement('div');
    spinner.classList.add('loading-spinner');
    loadingMessage.appendChild(spinner);
    chatHistory.appendChild(loadingMessage);
    
    // Scroll after adding loading message
    scrollToBottom();

    try {
        let response;
        
        if (uploadedImage) {
            // Use img2img endpoint for any model when image is uploaded
            response = await fetch('http://127.0.0.1:5000/img2img', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: messageText || "transform this image",
                    image: uploadedImage,
                    model: selectedModel,  // Send the selected model
                    strength: 0.6  // Fixed strength value
                })
            });
            
            // Clear the uploaded image after sending
            uploadedImage = null;
            
        } else {
            // Use regular text-to-image endpoint
            response = await fetch('http://127.0.0.1:5000/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: messageText,
                    model: selectedModel
                })
            });
        }
        
        // Rest of the function remains the same...

    
        chatHistory.removeChild(loadingMessage);
        
        // Create blob from the response
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
    
        const aiMessage = document.createElement('div');
        aiMessage.classList.add('message', 'ai-message');
    
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = messageText || "Generated image";
        img.loading = 'lazy';
        
        // Add an onload event to scroll after the image loads
        img.onload = scrollToBottom;
        
        aiMessage.appendChild(img);
        chatHistory.appendChild(aiMessage);
        
        // Scroll immediately after adding AI message (will also scroll again after image loads)
        scrollToBottom();
    } catch (error) {
        console.error('Response error:', error);
        chatHistory.removeChild(loadingMessage);
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('message', 'error-message');
        errorMessage.textContent = 'Network error. Please check your connection.';
        chatHistory.appendChild(errorMessage);
        
        // Scroll after adding error message
        scrollToBottom();
    }
}

// Also add scroll to bottom when window is resized
window.addEventListener('resize', scrollToBottom);
