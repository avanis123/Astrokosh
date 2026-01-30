from google import genai

# Make sure this is your actual key string
MY_KEY = "AIzaSyABmwD-2MHNRy6CMiDLP-nGbFqJhKimbPc"

client = genai.Client(api_key=MY_KEY)

try:
    print("Fetching models...")
    # In the new SDK, use 'supported_actions'
    for model in client.models.list():
        if 'generateContent' in model.supported_actions:
            print(f"- {model.name}")
            
except Exception as e:
    print(f"\n❌ Error occurred: {e}")