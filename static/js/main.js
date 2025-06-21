// This script will run once the entire HTML document has been fully loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const problemInput = document.getElementById('problemInput');
    const getHintBtn = document.getElementById('getHintBtn');
    const chatBox = document.querySelector('.chat-box');
    const contextInput = document.getElementById('contextInput');
    const inputArea = document.getElementById('inputArea');
    const newProblemArea = document.getElementById('newProblemArea');
    const newProblemBtn = document.getElementById('newProblemBtn');
    const anotherHintBtn = document.getElementById('anotherHintBtn');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    const timerDisplay = document.getElementById('timer');
    const startTimerBtn = document.getElementById('startTimer');
    const resetTimerBtn = document.getElementById('resetTimer');
    const particlesToggle = document.getElementById('particlesToggle');
    const particlesCanvas = document.getElementById('particlesCanvas');
    const promptBtns = document.querySelectorAll('.prompt-btn');

    // --- State Management ---
    let currentProblem = '';
    let currentContext = '';
    let conversationHistory = []; // Store all previous hints and responses

    // --- Timer Management ---
    let timerInterval = null;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let savedTime = 25 * 60; // Save the last edited time
    let isRunning = false;

    // --- Particles Management ---
    let particlesActive = false;
    let animationId = null;
    let particles = [];
    const ctx = particlesCanvas.getContext('2d');

    // Code symbols for particles
    const codeSymbols = ['{}', '[]', '()', '<>', '//', '/*', '*/', '=>', '&&', '||', '++', '--', '==', '!=', '+=', '-=', '*=', '/=', '%=', '<<', '>>', '&', '|', '^', '~', '!', '?', ':', ';', '=', '+', '-', '*', '/', '%', '.', ',', '_', '$', '#', '@'];

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.symbol = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
            this.size = Math.random() * 20 + 10;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            // Wrap around screen edges
            if (this.x < -50) this.x = window.innerWidth + 50;
            if (this.x > window.innerWidth + 50) this.x = -50;
            if (this.y < -50) this.y = window.innerHeight + 50;
            if (this.y > window.innerHeight + 50) this.y = -50;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;
            ctx.font = `${this.size}px 'Courier New', monospace`;
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function parseTimeInput(input) {
        // Handle various input formats: "25:00", "25", "25.5", "1500" (seconds)
        const trimmed = input.trim();
        
        // Format: MM:SS
        if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
            const [minutes, seconds] = trimmed.split(':').map(Number);
            if (seconds < 60) {
                return minutes * 60 + seconds;
            }
        }
        
        // Format: MM (minutes only)
        if (/^\d+$/.test(trimmed)) {
            const minutes = parseInt(trimmed);
            if (minutes > 0 && minutes <= 999) {
                return minutes * 60;
            }
        }
        
        // Format: MM.SS (decimal minutes)
        if (/^\d+\.\d+$/.test(trimmed)) {
            const minutes = parseFloat(trimmed);
            if (minutes > 0 && minutes <= 999) {
                return Math.round(minutes * 60);
            }
        }
        
        // Format: SSSS (seconds only)
        if (/^\d{3,4}$/.test(trimmed)) {
            const seconds = parseInt(trimmed);
            if (seconds > 0 && seconds <= 3600) { // Max 1 hour
                return seconds;
            }
        }
        
        return null; // Invalid format
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeLeft);
    }

    function handleTimerEdit() {
        const input = timerDisplay.textContent;
        const newTimeInSeconds = parseTimeInput(input);
        
        if (newTimeInSeconds !== null) {
            // Stop timer if running
            if (isRunning) {
                clearInterval(timerInterval);
                isRunning = false;
                startTimerBtn.textContent = 'start';
                startTimerBtn.classList.remove('running');
            }
            
            timeLeft = newTimeInSeconds;
            savedTime = newTimeInSeconds; // Save the new time as the reset time
            updateTimerDisplay();
        } else {
            // Invalid input, revert to current time
            updateTimerDisplay();
        }
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startTimerBtn.textContent = 'pause';
            startTimerBtn.classList.add('running');
            
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startTimerBtn.textContent = 'start';
                    startTimerBtn.classList.remove('running');
                    timeLeft = savedTime; // Reset to saved time instead of 25:00
                    updateTimerDisplay();
                    
                    // Optional: Add notification or sound here
                    if (Notification.permission === 'granted') {
                        new Notification('Pomodoro Complete!', {
                            body: 'Time to take a break!',
                            icon: '/favicon.ico'
                        });
                    }
                }
            }, 1000);
        } else {
            // Pause timer
            clearInterval(timerInterval);
            isRunning = false;
            startTimerBtn.textContent = 'start';
            startTimerBtn.classList.remove('running');
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = savedTime; // Reset to saved time instead of 25:00
        startTimerBtn.textContent = 'start';
        startTimerBtn.classList.remove('running');
        updateTimerDisplay();
    }

    // --- Theme Management ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
        } else {
            themeIcon.textContent = '🌙';
        }
    }

    /**
     * A reusable function to add a new message to the chatBox.
     * @param {string} text - The text content of the message.
     * @param {string} sender - The sender of the message, either 'user' or 'bot'.
     * @returns {HTMLElement} - The newly created message div, so we can modify it later if needed.
     */
    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender);

        // Handle newlines in messages for display
        messageDiv.innerHTML = text.replace(/\n/g, '<br>'); // Use innerHTML for <br> tags

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        return messageDiv;
    }

    // Helper to enable/disable input and button
    function setInputState(disabled) {
        problemInput.disabled = disabled;
        getHintBtn.disabled = disabled;
        if (!disabled) {
            problemInput.focus();
        }
    }

    // Helper to switch between input and new problem modes
    function showNewProblemMode() {
        inputArea.style.display = 'none';
        newProblemArea.style.display = 'flex';
    }

    function showInputMode() {
        inputArea.style.display = 'flex';
        newProblemArea.style.display = 'none';
        problemInput.value = ''; // Clear the input
        contextInput.value = ''; // Clear the context
        problemInput.focus(); // Focus on the input
        
        // Reset conversation state
        currentProblem = '';
        currentContext = '';
        conversationHistory = [];
    }

    /**
     * Function to request another hint for the same problem
     */
    async function handleAnotherHint() {
        if (!currentProblem) {
            return; // No current problem to get another hint for
        }

        // Disable the another hint button to prevent multiple clicks
        anotherHintBtn.disabled = true;
        
        // Display a loading message
        const loadingMessage = displayMessage('Thinking...', 'bot');
        loadingMessage.classList.add('loading');

        try {
            // Prepare request with conversation history
            const requestBody = { 
                problemName: currentProblem,
                context: currentContext,
                conversationHistory: conversationHistory,
                requestType: 'another_hint'
            };
            
            const response = await fetch('/get_hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                displayMessage(`Error: ${errorData.error || 'Something went wrong.'}`, 'bot');
                return;
            }

            const data = await response.json();

            // Remove loading message
            loadingMessage.remove();
            
            // Display the new hint
            let botResponse = data.hint;
            displayMessage(botResponse, 'bot');

            // Store this interaction in conversation history
            conversationHistory.push({
                userInput: currentProblem,
                context: currentContext,
                botResponse: botResponse
            });

        } catch (error) {
            loadingMessage.remove();
            console.error('Error fetching another hint:', error);
            displayMessage("Oops! I couldn't reach the server. Please ensure the backend is running.", 'bot');
        } finally {
            anotherHintBtn.disabled = false; // Re-enable the button
        }
    }

    /**
     * This function contains the main logic that runs when the user asks for a hint.
     * It is now an 'async' function because it will use 'await' for the fetch API call.
     */
    async function handleHintRequest() {
        const userInput = problemInput.value.trim();
        const context = contextInput.value.trim();
        
        if (!userInput) {
            return; // Don't send empty messages
        }

        // 1. Display the user's own message in the chat box.
        displayMessage(userInput, 'user');

        // 2. Disable controls and display a loading message.
        setInputState(true);
        const loadingMessage = displayMessage('Thinking...', 'bot');
        loadingMessage.classList.add('loading');

        try {
            // 3. Make the actual API call to our Flask backend
            const requestBody = { 
                problemName: userInput,
                requestType: 'first_hint'
            };
            if (context) {
                requestBody.context = context;
            }
            
            const response = await fetch('/get_hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            // Check if the response was successful (HTTP status 200-299)
            if (!response.ok) {
                // If not successful, parse the error message from the backend
                const errorData = await response.json();
                displayMessage(`Error: ${errorData.error || 'Something went wrong.'}`, 'bot');
                return; // Stop execution
            }

            // 4. Parse the JSON response from the backend
            const data = await response.json();

            // 5. Remove the loading message
            loadingMessage.remove(); 
            
            // 6. Display the bot's actual response
            let botResponse = data.hint;
            displayMessage(botResponse, 'bot');

            // 7. Check if the problem was recognized
            if (botResponse.toLowerCase().includes("i'm not familiar with that problem")) {
                // Problem not recognized - keep input visible and don't save to context
                showInputMode(); // Keep input visible
                // Don't store in conversation history or set current problem
            } else {
                // Problem recognized - switch to new problem mode and save context
                showNewProblemMode();
                currentProblem = userInput;
                currentContext = context;
                
                // Store this interaction in conversation history
                conversationHistory.push({
                    userInput: userInput,
                    context: context,
                    botResponse: botResponse
                });
            }

        } catch (error) {
            // 8. Handle network errors (e.g., server not running, connection issues)
            loadingMessage.remove(); // Remove loading message even on network error
            console.error('Error fetching hint:', error);
            displayMessage("Oops! I couldn't reach the server. Please ensure the backend is running.", 'bot');
        } finally {
            // This block always runs after try/catch, regardless of success or error
            setInputState(false); // Re-enable input and button
        }
    }

    // --- Event Listeners ---
    getHintBtn.addEventListener('click', handleHintRequest);

    problemInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents default behavior (like form submission)
            handleHintRequest();
        }
    });

    // New problem button event listener
    newProblemBtn.addEventListener('click', showInputMode);
    
    // Another hint button event listener
    anotherHintBtn.addEventListener('click', handleAnotherHint);

    // Theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);

    // Timer event listeners
    startTimerBtn.addEventListener('click', startTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    
    // Timer edit event listeners
    timerDisplay.addEventListener('blur', handleTimerEdit);
    timerDisplay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            timerDisplay.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            updateTimerDisplay(); // Revert changes
            timerDisplay.blur();
        }
    });

    // Particles toggle event listener
    particlesToggle.addEventListener('click', toggleParticles);

    // Window resize handler for particles
    window.addEventListener('resize', () => {
        if (particlesActive) {
            initParticles();
        }
    });

    // --- Initial Setup ---
    initTheme(); // Initialize theme on page load
    updateTimerDisplay(); // Initialize timer display
    initParticles(); // Initialize particles
    initParticlesState(); // Initialize particles state
    setInputState(false); // Ensure input/button are enabled and focused on load
    promptBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            let promptText = '';
            if (btn.dataset.prompt === 'hint') promptText = 'Can I get a hint for my problem?';
            if (btn.dataset.prompt === 'analyze') promptText = 'Can you analyze my code?';
            if (btn.dataset.prompt === 'suggest') promptText = 'Can you suggest a related problem?';
            problemInput.value = promptText; // Set input value to the prompt text
            handleHintRequest(); // Then trigger the request
        });
    });

    function initParticlesState() {
        const savedState = localStorage.getItem('particlesActive');
        if (savedState === 'true') {
            particlesActive = true;
            particlesCanvas.classList.add('active');
            particlesToggle.classList.add('active');
            animateParticles();
        }
    }

    function initParticles() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
        
        // Create particles
        particles = [];
        const particleCount = Math.min(200, Math.floor((window.innerWidth * window.innerHeight) / 5000));
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        if (!particlesActive) return;

        ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        animationId = requestAnimationFrame(animateParticles);
    }

    function toggleParticles() {
        particlesActive = !particlesActive;
        
        if (particlesActive) {
            particlesCanvas.classList.add('active');
            particlesToggle.classList.add('active');
            animateParticles();
        } else {
            particlesCanvas.classList.remove('active');
            particlesToggle.classList.remove('active');
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
        
        // Save preference
        localStorage.setItem('particlesActive', particlesActive);
    }
}); 