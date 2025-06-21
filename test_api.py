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

# Get the API key
api_key = os.getenv('GEMINI_API_KEY')

REQUIRED_MODEL = 'models/gemini-2.0-flash'

if api_key:
    masked_key = f"{api_key[:4]}...{api_key[-4:]}"
    print(f"\nAPI Key found: {masked_key}")
    
    try:
        genai.configure(api_key=api_key)
        print("Checking model availability...")
        available_models = [model.name for model in genai.list_models()]
        if REQUIRED_MODEL in available_models:
            print(f"✅ Model '{REQUIRED_MODEL}' is available to your API key.")
        else:
            print(f"❌ Model '{REQUIRED_MODEL}' is NOT available to your API key.")
            print("Available models:")
            for m in available_models:
                print(f"- {m}")
    except Exception as e:
        print("\n❌ Error checking model availability:", str(e))
else:
    print("❌ No API key found in .env file")
    print("Please make sure your .env file contains: GEMINI_API_KEY=your_key_here") 