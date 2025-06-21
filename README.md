# LeetCode Coach 🤖

**Master LeetCode with AI-Powered Hints**

LeetCode Coach is a web application designed to help you conquer LeetCode problems by providing intelligent, conceptual hints without spoiling the solution. It's the perfect companion for when you're stuck and need a gentle push in the right direction.

![LeetCode Coach Preview](static/img/landing.png) 

---

### **Live Demo**

*   **Main App:** `leetcoach.app`
*   **Landing Page:** `leetcoach.app/landing`

---

## ✨ Features

Based on the landing page, the app includes a wide range of features to enhance your learning experience:

*   **🤖 AI-Powered Hints:** Get intelligent, contextual guidance that helps you understand the underlying concepts without giving away the direct answer.
*   **🎯 Personalized Guidance:** Provide context about your current approach or code, and the AI will tailor its hints to your specific situation.
*   **🔄 Multiple Hint System:** If the first hint isn't enough, you can request another one that approaches the problem from a different angle.
*   **⏱️ Built-in Pomodoro Timer:** Stay focused and manage your study sessions effectively with an editable Pomodoro timer right in the header.
*   **🎨 Customizable UI:**
    *   **Dark & Light Mode:** Switch between themes for comfortable coding day or night.
    *   **Floating Code Particles:** An optional, aesthetically pleasing animated background that can be toggled on or off.
*   **🔒 Secure & Private:** All user inputs are sanitized to protect against prompt injection, ensuring your interactions are safe.
*   **🚀 Separate Landing Page:** A beautiful, responsive landing page to showcase the application to new users.

---

## 🛠️ Technologies Used

*   **Backend:** Python (Flask)
*   **Frontend:** HTML, CSS, JavaScript
*   **AI Engine:** Google Gemini API
*   **Deployment:** Gunicorn (for production WSGI)

---

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### **Prerequisites**

*   Python 3.x
*   An API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### **Installation**

1.  **Clone the repository:**
    ```bash
    git clone <your_repo_url>
    cd leetcode-coach
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Create
    python3 -m venv venv
    # Activate (macOS/Linux)
    source venv/bin/activate
    # Activate (Windows)
    .\venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables:**
    Create a file named `.env` in the project root and add your Gemini API key.
    ```
    GEMINI_API_KEY=your_actual_gemini_api_key
    ```

### **Running the Application**

1.  **Start the Flask server:**
    ```bash
    flask run
    # Or for production testing with gunicorn
    # gunicorn --bind 0.0.0.0:5000 app:app
    ```

2.  **Access the app in your browser:**
    *   **Main App:** `http://127.0.0.1:5000/`
    *   **Landing Page:** `http://127.0.0.1:5000/landing`

---

## 🧑‍💻 Built By

This project was built by **ayo.aaronlin**.

*   **Instagram:** [@ayo.aaronlin](https://www.instagram.com/ayo.aaronlin)
*   **Codédex:** [Profile](https://www.codedex.io/?utm_source=aaron&utm_medium=social_media&utm_campaign=ugc_creator_program)

---

## 📜 License

This project is open-source. Feel free to fork, modify, and use it as you see fit.