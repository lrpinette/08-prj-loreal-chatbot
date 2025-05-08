/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

/* System prompt for the chatbot */
const systemPrompt = `
You are a helpful assistant specialized in L’Oréal products, skincare routines, and beauty recommendations. 
Only answer questions related to L’Oréal and its offerings. If a question is unrelated, politely respond with:
"I'm sorry, I can only assist with questions about L’Oréal products, routines, and beauty-related topics. Please ask something related."
`;

/* Array to track the conversation context */
const context = [
  { role: "system", content: systemPrompt } // Start with the system prompt
];

/* Function to append messages to the chat window */
function appendMessage(content, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("msg", sender); // 'user' or 'ai'
  messageDiv.textContent = content;
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Display user message in the chat window
  appendMessage(userMessage, "user");

  // Add user message to the context
  context.push({ role: "user", content: userMessage });

  // Clear the input field
  userInput.value = "";

  // Display a loading message while waiting for the API response
  const loadingMessage = document.createElement("div");
  loadingMessage.classList.add("msg", "ai");
  loadingMessage.textContent = "Typing...";
  chatWindow.appendChild(loadingMessage);

  try {
    // Send request to the Cloudflare Worker endpoint
    const response = await fetch("https://sweet-recipe-b45e.leorpinette.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: context, // Include the full conversation context
      }),
    });

    // Parse the response
    const data = await response.json();

    // Check if the response contains the expected structure
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiMessage = data.choices[0].message.content;

      // Add AI message to the context
      context.push({ role: "assistant", content: aiMessage });

      // Replace the loading message with the AI's response
      loadingMessage.remove();
      appendMessage(aiMessage, "ai");
    } else {
      throw new Error("Unexpected API response structure");
    }
  } catch (error) {
    // Handle errors and display an error message
    loadingMessage.remove();
    appendMessage("Sorry, something went wrong. Please try again.", "ai");
    console.error("Error:", error);
  }
});
