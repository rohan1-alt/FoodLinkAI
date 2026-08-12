# app/notifications.py
import os
import requests
from dotenv import load_dotenv

# Automatically load environment variables
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
# For a quick hackathon build, we can default to your personal chat ID
DEFAULT_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_alert(message: str, chat_id: str = None):
    """
    Sends a free custom text alert via a Telegram Bot.
    """
    target_chat = chat_id or DEFAULT_CHAT_ID
    
    if not TELEGRAM_BOT_TOKEN or not target_chat:
        print("❌ Error: Telegram credentials missing in .env file.")
        return None

    # The official Telegram API endpoint for sending messages
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": target_chat,
        "text": message,
        "parse_mode": "Markdown" # Allows us to use bolding and italics!
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json().get("result", {}).get("message_id")
    except Exception as e:
        print(f"❌ Failed to send Telegram message: {e}")
        return None