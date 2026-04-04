import firebase_admin
from firebase_admin import credentials, firestore
import datetime
import random

# Initialize Firebase
cred = credentials.Certificate("Backend-YOLOv11/firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

REPORTS = [
    {
        "type": "Pothole",
        "description": "Deep pothole at the main crossing. Very dangerous for two-wheelers.",
        "description_hi": "मुख्य चौराहे पर गहरा गड्ढा। दोपहिया वाहनों के लिए बहुत खतरनाक।",
        "location_name": "CBS Circle",
        "lat": 19.9975,
        "lng": 73.7898,
        "image_url": "https://images.unsplash.com/photo-1544980766-72b58ad9ca11" # Pothole
    },
    {
        "type": "Roadworks",
        "description": "Unannounced road digging for pipeline. Traffic is slow.",
        "description_mr": "पाईपलाईनसाठी अचानक रस्ता खोदणे सुरू आहे. वाहतूक मंद आहे.",
        "location_name": "Gangapur Road",
        "lat": 19.9850,
        "lng": 73.7900,
        "image_url": "https://images.unsplash.com/photo-1531266752426-aad472b7bdf4" # Construction
    },
    {
        "type": "Accident",
        "description": "Minor fender bender blocking the left lane.",
        "description_hi": "बाएं लेन में मामूली टक्कर, रास्ता जाम हो रहा है।",
        "location_name": "Nashik Road",
        "lat": 20.0060,
        "lng": 73.7720,
        "image_url": "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20" # Accident/Fire/Emergency
    },
    {
        "type": "Signal Issue",
        "description": "Signal is stuck on Red for more than 5 minutes.",
        "description_mr": "सिग्नल ५ मिनिटांपेक्षा जास्त वेळ लाल रंगावर अडकला आहे.",
        "location_name": "Dwarka Circle",
        "lat": 20.0010,
        "lng": 73.7770,
        "image_url": "https://images.unsplash.com/photo-1509017174183-0b7e0278f1ec" # Traffic light
    },
    {
        "type": "Pothole",
        "description": "Multiple potholes after last night's rain.",
        "location_name": "College Road",
        "lat": 19.9990,
        "lng": 73.7860,
        "image_url": "https://images.unsplash.com/photo-1621243804936-775306a8f2e3" # Cracked road
    }
]

def seed():
    print("Seeding citizen reports...")
    for report in REPORTS:
        report["timestamp"] = (datetime.datetime.now(datetime.UTC)).isoformat()
        db.collection("citizen_reports").add(report)
        print(f"Added: {report['type']} at {report['location_name']}")

if __name__ == "__main__":
    seed()
