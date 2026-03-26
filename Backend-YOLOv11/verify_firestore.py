import firebase_admin
from firebase_admin import credentials, firestore
import time
import os

CERT = "firebase-adminsdk.json"
if not os.path.exists(CERT):
    print("Cert not found")
    exit(1)

cred = credentials.Certificate(CERT)
firebase_admin.initialize_app(cred)
db = firestore.client()

print("Checking traffic_data collection...")
docs = db.collection("traffic_data").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(5).get()

print("Checking latest_counts document...")
doc_latest = db.collection("traffic_data").document("latest_counts").get()
if doc_latest.exists:
    data = doc_latest.to_dict()
    raw_ts = data.get("timestamp", 0)
    try:
        ts = float(raw_ts) / 1000
        time_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(ts))
    except:
        time_str = str(raw_ts)
    print(f"Latest Counts | Timestamp: {time_str} | Total: {data.get('total_vehicles')} | Cam: {data.get('camera_id')}")
else:
    print("latest_counts document not found.")

print("\nChecking for any document from today...")
today_start = int(time.time() // 86400 * 86400 * 1000)
docs_today = db.collection("traffic_data").where("timestamp", ">=", today_start).limit(5).get()
if not docs_today:
    print("No documents found from today yet.")
else:
    for doc in docs_today:
        data = doc.to_dict()
        raw_ts = data.get("timestamp", 0)
        ts = float(raw_ts) / 1000
        print(f"Doc ID: {doc.id} | Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(ts))} | Total: {data.get('total_vehicles')}")
