document.addEventListener('DOMContentLoaded', () => {
    const problemInput = document.getElementById('problemInput');
    const getHintBtn = document.getElementById('getHintBtn');
    const loadingMessage = document.getElementById('loadingMessage');
    const responseContainer = document.getElementById('response');

    async function getHint() {
        const problemName = problemInput.value.trim();
        
        if (!problemName) {
            responseContainer.textContent = 'Please enter a problem name or number.';
            return;
        }

        // Show loading state
        getHintBtn.disabled = true;
        loadingMessage.classList.remove('hidden');
        responseContainer.textContent = '';

        try {
            const response = await fetch('/get-hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ problem_name: problemName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get hint');
            }

            responseContainer.textContent = data.hint;
        } catch (error) {
            responseContainer.textContent = error.message;
        } finally {
            // Reset loading state
            getHintBtn.disabled = false;
            loadingMessage.classList.add('hidden');
        }
    }

    // Event listeners
    getHintBtn.addEventListener('click', getHint);
    problemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            getHint();
        }
    });
}); 