// --- Voice-to-Text Functionality ---
document.addEventListener('DOMContentLoaded', function() {
    // Get references to HTML elements related to voice input
    const chatInput = document.getElementById('chat-input'); // Input field where voice transcript will go
    const voiceButton = document.getElementById('voice-button'); // Button to trigger voice input

    // Variables for speech recognition
    let recognition; // Speech recognition object
    let listening = false; // Flag to track if voice recognition is active

    // Check if the browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // Create a new speech recognition object
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false; // Disable continuous recognition (single phrase)
        recognition.lang = 'en-US'; // Set the language for recognition

        // Event listener: when speech recognition starts
        recognition.onstart = () => {
            voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>'; // Change microphone icon
            listening = true; // Set listening flag to true
        };

        // Event listener: when speech recognition gets a result
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript; // Get the transcribed text
            chatInput.value = transcript; // Set the input field's value to the transcript
            listening = false; // Set listening flag to false
            recognition.stop(); // Stop speech recognition
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>'; // Reset microphone icon
        };

        // Event listener: when speech recognition encounters an error
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error); // Log the error
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>'; // Reset microphone icon
            listening = false; // Set listening flag to false
        };

        // Event listener: when speech recognition ends
        recognition.onend = () => {
            if (listening) { // Check if listening was active
                voiceButton.innerHTML = '<i class="fas fa-microphone"></i>'; // Reset microphone icon
                listening = false; // Set listening flag to false
            }
        };

        // Event listener: when the voice button is clicked
        voiceButton.addEventListener('click', () => {
            if (listening) { // If currently listening, stop recognition
                recognition.stop();
            } else { // If not listening, start recognition
                recognition.start();
            }
        });
    } else {
        // If speech recognition is not supported, disable the voice button
        voiceButton.disabled = true;
        voiceButton.innerHTML = 'Voice not supported';
    }
});

// --- Chat API Interaction and Message Display ---
document.addEventListener('DOMContentLoaded', function() {
    // Get references to HTML elements related to chat functionality
    const chatInput = document.getElementById('chat-input'); // Input field for text messages
    const sendButton = document.getElementById('send-button'); // Button to send messages
    const chatMessages = document.getElementById('chat-messages'); // Area to display chat messages

    // API keys and model ID
    const COHERE_API_KEY = "ea5Z9Xyc0uf3EWWuvvNvoKcE4WDVMPxLSGJTs467"; // Your Cohere API key
    const MODEL_ID = "command-xlarge-nightly"; // Cohere model ID for chat

    // Event listener: when the send button is clicked
    sendButton.addEventListener('click', sendMessage);

    // Event listener: when Enter key is pressed in the input field
    chatInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            sendMessage(); // Send message when Enter is pressed
        }
    });

    // Function to send a message to the Cohere API and display the response
    async function sendMessage() {
        const message = chatInput.value.trim(); // Get the message from the input field
        if (!message) return; // If the message is empty, do nothing

        displayMessage("user", message); // Display the user's message in the chat
        chatInput.value = ""; // Clear the input field

        try {
            // Send a request to the Cohere chat API
            const response = await fetch("https://api.cohere.ai/v1/chat", {
                headers: {
                    Authorization: `Bearer ${COHERE_API_KEY}`, // Add API key to headers
                    "Content-Type": "application/json", // Set content type to JSON
                },
                method: "POST", // Use POST method
                body: JSON.stringify({
                    model: MODEL_ID, // Specify the model to use
                    message: message, // Send the user's message
                    max_tokens: 150, // Limit the response length
                }),
            });

            const result = await response.json(); // Parse the JSON response

            // Check if the response contains a valid chat message
            if (result && result.text) {
                displayMessage("bot", result.text); // Display the bot's message
            } else if (result.message) {
                displayMessage("bot", `Error: ${result.message}`); // Display an error message
            } else {
                displayMessage("bot", "Sorry, I couldn't generate a response."); // Display a generic error message
            }
        } catch (error) {
            console.error("API error:", error); // Log any API errors
            displayMessage("bot", "An error occurred while processing your request."); // Display an error message
        }
    }

    // Function to display a message in the chat area
    function displayMessage(sender, message) {
        const messageDiv = document.createElement("div"); // Create a new div for the message
        messageDiv.classList.add("message", sender); // Add classes for styling
        messageDiv.textContent = message; // Set the message text
        chatMessages.appendChild(messageDiv); // Add the message to the chat area
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }
});