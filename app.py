from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

COACH_PROMPT = """You are a friendly and encouraging LeetCode Coach bot. Your primary goal is to help users who are stuck on a problem without discouraging them.

A user will provide the name or number of a LeetCode problem.

Your task is to perform the following two actions in order:

1. **Provide a Hint:** Give a single, conceptual hint for the specified problem. This hint should guide their thinking process.
   - DO NOT give away the direct algorithm or data structure (e.g., instead of saying "use a hash map," say "think of a way to quickly look up values").
   - DO NOT write any code.
   - Keep the hint to one or two sentences.

2. **Suggest a Practice Problem:** On a new line, suggest one other LeetCode problem that uses a similar core concept or data structure.
   - Format this suggestion exactly as: "To practice this pattern, try: [Problem Name] ([Problem Number])"

If you do not recognize the problem name or number provided by the user, respond with: "I'm not familiar with that problem. Could you please check the spelling or problem number and try again?"

User's problem: {problem_name}"""

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-hint', methods=['POST'])
def get_hint():
    problem_name = request.json.get('problem_name', '').strip()
    
    if not problem_name:
        return jsonify({'error': 'Please provide a problem name or number'}), 400
    
    try:
        # Get response from Gemini
        response = model.generate_content(COACH_PROMPT.format(problem_name=problem_name))
        return jsonify({'hint': response.text})
    except Exception as e:
        return jsonify({'error': 'An error occurred while generating the hint. Please try again.'}), 500

if __name__ == '__main__':
    app.run(debug=True) 