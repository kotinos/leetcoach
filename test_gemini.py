import os
from dotenv import load_dotenv
import google.generativeai as genai
import socket

# --- Pre-flight network check ---
def check_dns_resolution(hostname):
    print(f"--- Running network pre-flight check for '{hostname}' ---")
    try:
        addr = socket.gethostbyname(hostname)
        print(f"✅ Successfully resolved '{hostname}' to IP address: {addr}")
        return True
    except socket.gaierror as e:
        print(f"\n❌ DNS resolution FAILED for '{hostname}'.")
        print(f"This is a network configuration issue on your machine or network.")
        print(f"Error: {e}")
        print("\nPlease check your internet connection, DNS settings, firewall, and any proxy/VPN configurations.")
        return False

# --- Main script logic ---
GEMINI_API_HOSTNAME = "generativelanguage.googleapis.com"
if not check_dns_resolution(GEMINI_API_HOSTNAME):
    exit(1) # Exit if DNS check fails


# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in environment variables or .env file.")
    print("Please ensure you have a .env file in the same directory as this script,")
    print("and it contains GEMINI_API_KEY=YOUR_API_KEY_HERE (no quotes).")
    exit()

try:
    # Configure Gemini API
    genai.configure(api_key=api_key)

    # Initialize the model
    model = genai.GenerativeModel('gemini-2.0-flash')

    # Simple test prompt
    test_prompt = "Tell me a short, encouraging programming tip."
    print(f"\nSending prompt to Gemini: '{test_prompt}'")

    # Generate content
    response = model.generate_content(test_prompt)

    # Print the response
    print("\n--- Gemini Response ---")
    print(response.text)

except Exception as e:
    print(f"\n--- Error connecting to Gemini ---")
    print(f"An error occurred: {e}")
    print("Possible causes:")
    print("1. Your internet connection might be unstable or blocked.")
    print("2. A firewall or proxy might be preventing the connection.")
    print("3. Your GEMINI_API_KEY might be incorrect or invalid.")
    print("   (Though this error strongly suggests network/DNS problems first).") 