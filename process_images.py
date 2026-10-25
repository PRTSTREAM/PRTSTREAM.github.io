import os
import requests
from PIL import Image
from io import BytesIO
import json
import base64

# GitHub Repository की जानकारी
REPO_OWNER = os.getenv("GITHUB_REPOSITORY_OWNER")
REPO_NAME = os.getenv("GITHUB_REPOSITORY").split("/")[-1]
GITHUB_TOKEN = os.getenv("PAT")

def make_square_and_encoded(img_url):
    try:
        response = requests.get(img_url, timeout=10)
        if response.status_code != 200:
            return None
        
        img = Image.open(BytesIO(response.content)).convert("RGBA")
        width, height = img.size
        max_side = max(width, height)
        
        # 1:1 स्क्वायर फ्रेम बनाएँ (ट्रांसपेरेंट बैकग्राउंड)
        new_img = Image.new("RGBA", (max_side, max_side), (255, 255, 255, 0))
        offset = ((max_side - width) // 2, (max_side - height) // 2)
        new_img.paste(img, offset)
        
        # 300x300 पर रिसाइज करें
        new_img = new_img.resize((300, 300), Image.Resampling.LANCZOS)
        
        output = BytesIO()
        new_img.convert("RGB").save(output, format="JPEG", quality=90)
        
        # Base64 में एनकोड करें
        return base64.b64encode(output.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"Error: {e}")
        return None

def commit_to_github(filename, image_data):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/logos/{filename}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "message": f"Add processed square logo {filename}",
        "content": image_data,
        "branch": "main"
    }
    
    # पुरानी फ़ाइल का SHA चेक करें (अपडेट करने के लिए)
    response = requests.get(url, headers={"Authorization": f"token {GITHUB_TOKEN}"})
    if response.status_code == 200:
        data["sha"] = response.json()["sha"]
        
    put_response = requests.put(url, headers=headers, data=json.dumps(data))
    if put_response.status_code in [201, 200]:
        print(f"Successfully uploaded {filename}")
        return True
    else:
        print(f"Failed to upload {filename}: {put_response.text}")
        return False

# यहाँ वह इमेज URL डालें जिसे आप प्रोसेस करना चाहते हैं
IMAGE_URL = "यहाँ_IMAGE_URL_डालें"

if IMAGE_URL:
    encoded_image = make_square_and_encoded(IMAGE_URL)
    if encoded_image:
        filename = "logo.jpg" # आप फ़ाइल का नाम डायनामिक भी रख सकते हैं
        if commit_to_github(filename, encoded_image):
            raw_url = f"https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/main/logos/{filename}"
            print(f"File committed successfully. Raw URL: {raw_url}")
