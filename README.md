# LeetCode Coach

A friendly AI-powered coach that helps you learn LeetCode problems by providing conceptual hints and suggesting related practice problems.

## Features

- Clean, modern user interface
- Conceptual hints that guide your thinking without giving away solutions
- Related problem suggestions to reinforce learning
- Graceful error handling for unknown problems
- Responsive design that works on all devices

## Setup

1. Clone this repository
2. Set up a Python virtual environment (recommended):
   ```bash
   # Create a virtual environment
   python3 -m venv venv
   
   # Activate the virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   # .\venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   Note: If you're using Python 3, you might need to use `pip3` instead of `pip` depending on your system configuration.
4. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
5. Create a `.env` file in the project root:
   ```bash
   # Create the .env file
   touch .env
   
   # Add your API key to the .env file
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   ```
   Replace `your_gemini_api_key_here` with your actual Gemini API key from Google AI Studio.
   
   Note: Make sure to add `.env` to your `.gitignore` file to keep your API key secure.
6. Run the application:
   ```bash
   python app.py
   ```
7. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Enter a LeetCode problem name or number in the input box
2. Click "Get Hint" or press Enter
3. Read the conceptual hint and suggested practice problem
4. Try solving the problem with the hint in mind
5. Practice the suggested related problem to reinforce the concept

## Technologies Used

- Backend: Flask (Python)
- Frontend: HTML, CSS, JavaScript
- AI: Google Gemini API
- Styling: Custom CSS with modern design principles

## Contributing

Feel free to submit issues and enhancement requests!