# app.py

# New imports for environment variables and Gemini API
import os
import re
import html
from dotenv import load_dotenv
import google.generativeai as genai

from flask import Flask, request, jsonify, render_template

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API with your API key
# genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
# Using getenv for clarity and consistency
genai.configure(api_key=os.getenv("GEMINI_API_KEY")) # os.getenv is safer, returns None if not found

# Initialize the Generative Model (using the model that worked with curl)
# Set temperature to 0.0 for less creative, more direct answers based on instructions
model = genai.GenerativeModel(
    'gemini-2.0-flash', # Using the model that worked for you
    generation_config={
        "temperature": 0.0, # Make the AI less creative and more focused on following instructions
        # "max_output_tokens": 150, # Optional: you can add this to limit response length
    }
)

app = Flask(__name__)

# --- Security Functions ---
def sanitize_input(text):
    """Sanitize user input to prevent prompt injection"""
    if not text:
        return ""
    
    # Decode HTML entities
    text = html.unescape(text)
    
    # Remove or escape dangerous patterns that could be used for prompt injection
    dangerous_patterns = [
        r'ignore previous instructions',
        r'ignore above',
        r'ignore all previous',
        r'forget everything',
        r'new instructions',
        r'act as',
        r'pretend to be',
        r'you are now',
        r'system prompt',
        r'ignore the above',
        r'disregard previous',
        r'ignore all above',
        r'new system',
        r'override',
        r'bypass',
        r'ignore safety',
        r'ignore content policy',
        r'ignore guidelines',
        r'ignore rules',
        r'ignore restrictions',
        r'you must',
        r'you should',
        r'you will',
        r'change your role',
        r'stop being',
        r'become',
        r'now you are',
        r'from now on',
        r'starting now',
        r'forget your',
        r'disregard your',
        r'ignore your'
    ]
    
    for pattern in dangerous_patterns:
        text = re.sub(pattern, '[REDACTED]', text, flags=re.IGNORECASE)
    
    # Remove any remaining control characters
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Limit length to prevent token flooding
    if len(text) > 2000:
        text = text[:2000] + "..."
    
    return text.strip()

def validate_problem_name(problem_name):
    """Validate problem name format"""
    if not problem_name:
        return False, "Problem name cannot be empty"
    
    # Allow alphanumeric, spaces, hyphens, and common punctuation
    if not re.match(r'^[a-zA-Z0-9\s\-_.,()#]+$', problem_name):
        return False, "Invalid problem name format"
    
    # Length limits
    if len(problem_name) > 100:
        return False, "Problem name too long"
    
    return True, problem_name

def sanitize_conversation_history(history):
    """Sanitize conversation history to prevent injection"""
    if not history:
        return []
    
    sanitized_history = []
    for interaction in history[:10]:  # Limit to last 10 interactions
        if isinstance(interaction, dict):
            safe_user_input = sanitize_input(interaction.get('userInput', ''))
            safe_bot_response = sanitize_input(interaction.get('botResponse', ''))
            
            if safe_user_input and safe_bot_response:
                sanitized_history.append({
                    'userInput': safe_user_input,
                    'botResponse': safe_bot_response
                })
    
    return sanitized_history

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/landing')
def landing():
    return render_template('landing.html')

@app.route('/get_hint', methods=['POST'])
def get_hint():
    data = request.json

    if not data or 'problemName' not in data:
        return jsonify({'error': 'Problem name not provided'}), 400

    # Sanitize and validate all inputs
    raw_problem_name = data['problemName']
    raw_context = data.get('context', '').strip()
    raw_conversation_history = data.get('conversationHistory', [])
    request_type = data.get('requestType', 'first_hint')

    # Validate problem name
    is_valid, problem_result = validate_problem_name(raw_problem_name)
    if not is_valid:
        return jsonify({'error': problem_result}), 400

    # Sanitize inputs
    problem_name = sanitize_input(raw_problem_name)
    context = sanitize_input(raw_context)
    conversation_history = sanitize_conversation_history(raw_conversation_history)

    print(f"Received request for problem: {problem_name[:50]}...")
    print(f"Request type: {request_type}")
    if context:
        print(f"With context: {context[:100]}...")
    if conversation_history:
        print(f"With {len(conversation_history)} previous hints")

    # --- AI Prompt Definition (Secure Approach) ---
    # Use structured approach to prevent direct user input injection
    
    if request_type == 'first_hint':
        # Base system prompt without user input
        system_prompt = """You are a friendly and encouraging LeetCode Coach bot. Your primary goal is to help users who are stuck on a problem without discouraging them.
Your output should ONLY contain the hint, or the "not familiar" message.

Here are your instructions for *each problem query*:
1.  **Evaluate Their Approach (if context provided):** If the user provides context about their current approach, first briefly evaluate whether their thinking is on the right track. Be encouraging but honest.
2.  **Provide a Hint:** Give a single, conceptual hint for the specified problem. This hint should guide their thinking process.
    - DO NOT give away the direct algorithm or data structure (e.g., instead of saying "use a hash map," say "think of a way to quickly look up values").
    - DO NOT write any code.
    - Keep the hint to one or two sentences.
    - If the user provides additional context about their approach or what they've tried, tailor your hint to address their specific situation.

If you do not recognize the problem name or number provided by the user, respond with: "I'm not familiar with that problem. Could you please check the spelling or problem number and try again?"

PROBLEM TO ANALYZE: [PROBLEM_NAME]
USER CONTEXT: [USER_CONTEXT]"""

        # Replace placeholders with sanitized values
        prompt_text = system_prompt.replace("[PROBLEM_NAME]", problem_name)
        prompt_text = prompt_text.replace("[USER_CONTEXT]", context if context else "No additional context provided")

    else:  # another_hint
        # Base system prompt for additional hints
        system_prompt = """You are a friendly and encouraging LeetCode Coach bot. The user has already received some hints for this problem and is asking for a DIFFERENT approach or perspective.

IMPORTANT: You must provide a hint that is DIFFERENT from any previous hints given. Do not repeat the same approach or concept.

Here are your instructions:
1.  **Evaluate Their Progress (if context provided):** If the user provides context about their current approach, briefly assess their progress and whether they're moving in the right direction.
2.  **Provide a Different Hint:** Give a single, conceptual hint that approaches the problem from a different angle than previous hints.
    - DO NOT give away the direct algorithm or data structure (e.g., instead of saying "use a hash map," say "think of a way to quickly look up values").
    - DO NOT write any code.
    - Keep the hint to one or two sentences.
    - Make sure this hint is genuinely different from previous approaches.

PROBLEM TO ANALYZE: [PROBLEM_NAME]
USER CONTEXT: [USER_CONTEXT]
PREVIOUS HINTS: [PREVIOUS_HINTS]"""

        # Build previous hints section with sanitized data
        previous_hints_text = "No previous hints"
        if conversation_history:
            hints_list = []
            for i, interaction in enumerate(conversation_history, 1):
                hints_list.append(f"Hint {i}: {interaction['botResponse']}")
            previous_hints_text = "\n".join(hints_list)

        # Replace placeholders with sanitized values
        prompt_text = system_prompt.replace("[PROBLEM_NAME]", problem_name)
        prompt_text = prompt_text.replace("[USER_CONTEXT]", context if context else "No additional context provided")
        prompt_text = prompt_text.replace("[PREVIOUS_HINTS]", previous_hints_text)

    # --- Interact with Gemini API ---
    try:
        # Generate content using the model with the improved prompt structure
        response_gemini = model.generate_content(prompt_text)

        # Extract the text from the AI's response
        ai_full_response = response_gemini.text
        print(f"Gemini raw response:\n{ai_full_response}")

        # Parse the AI's response to separate hint and practice problem
        # Check for the "I'm not familiar" phrase first, as it's an exception case
        if "i'm not familiar with that problem" in ai_full_response.lower():
            hint_text = ai_full_response.strip()
            practice_problem_text = ""
        else:
            # Attempt to split if it's a normal hint/practice problem response
            parts = ai_full_response.split('\nTo practice this pattern, try: ', 1)

            hint_text = parts[0].strip()
            practice_problem_text = ""
            if len(parts) > 1:
                practice_problem_text = "To practice this pattern, try: " + parts[1].strip()

    except Exception as e:
        # Catch any errors during API call or response parsing
        print(f"Error calling Gemini API or parsing response: {e}")
        hint_text = "I'm sorry, I encountered an error trying to get a hint for you. Please try again in a moment."
        practice_problem_text = ""

    # Prepare the response to send back to the frontend
    response_for_frontend = {
        'hint': hint_text,
        'practiceProblem': practice_problem_text
    }

    return jsonify(response_for_frontend)

if __name__ == '__main__':
    # Production-ready configuration
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 