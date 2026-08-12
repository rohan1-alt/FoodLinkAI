# test_notifications.py
from dotenv import load_dotenv
load_dotenv()

from app.notifications import send_alert

# Test sending a custom Telegram alert
message_id = send_alert(
    message="📦 *FoodLinkAI Alert:*\nDonation #123 has been claimed!\nPickup status: Ready"
)

if message_id:
    print(f"✅ Success! Message sent with ID: {message_id}")
else:
    print("❌ Failed to send message. Check terminal error logs.")