import threading
import cv2
import json
import os
import time
from flask import Flask, Response, jsonify, render_template_string
from Main_code import CameraProcessor, FirebaseManager, load_config

app = Flask(__name__)

# Global state
processing_threads = {}
processors = {}
last_frames = {}

# Configuration
CONFIG_PATH = "cameras_config.json"
OUTPUT_DIR = "outputs"
FIREBASE_CERT = "firebase-adminsdk.json"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def frame_callback(cam_id, frame):
    _, buffer = cv2.imencode('.jpg', frame)
    last_frames[cam_id] = buffer.tobytes()

def run_processor(cam_cfg):
    cam_id = cam_cfg['id']
    # Use Firebase if cert exists
    firebase_mgr = FirebaseManager(FIREBASE_CERT) if os.path.exists(FIREBASE_CERT) else None
    proc = CameraProcessor(cam_cfg, OUTPUT_DIR, firebase_mgr=firebase_mgr)
    processors[cam_id] = proc
    try:
        proc.process(on_frame=frame_callback, loop=True)
    except Exception as e:
        print(f"Error in processor {cam_id}: {e}")

@app.route('/')
def index():
    html = """
    <html>
    <head>
        <title>MargVedha Local Backend</title>
        <style>
            body { font-family: sans-serif; margin: 20px; background: #f8f9fa; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .status { color: #28a745; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>MargVedha Traffic Analysis</h1>
            <p>Status: <span class="status">Running Locally</span></p>
            <h3>Live Camera Feeds</h3>
            <ul>
            {% for cam_id in cam_ids %}
                <li><a href="/video_feed/{{ cam_id }}">Camera: {{ cam_id }}</a></li>
            {% endfor %}
            </ul>
            <hr>
            <p><a href="/api/counts">View Real-time Counts (JSON)</a></p>
        </div>
    </body>
    </html>
    """
    return render_template_string(html, cam_ids=list(processors.keys()))

@app.route('/api/counts')
def get_counts():
    agg = {cam_id: proc.counts for cam_id, proc in processors.items()}
    return jsonify(agg)

def gen_frames(cam_id):
    while True:
        if cam_id in last_frames:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + last_frames[cam_id] + b'\r\n')
        time.sleep(0.05)

@app.route('/video_feed/<cam_id>')
def video_feed(cam_id):
    if cam_id not in processors:
        return "Camera not found", 404
    return Response(gen_frames(cam_id),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

def start_backend():
    if not os.path.exists(CONFIG_PATH):
        print(f"Config not found at {CONFIG_PATH}")
        return

    cfg = load_config(CONFIG_PATH)
    for cam in cfg.get('cameras', []):
        cam_id = cam['id']
        if cam_id in processing_threads and processing_threads[cam_id].is_alive():
            continue
            
        t = threading.Thread(target=run_processor, args=(cam,), daemon=True)
        t.start()
        processing_threads[cam_id] = t
        print(f"[*] Started local thread for {cam_id}")

if __name__ == '__main__':
    start_backend()
    # Local only
    print("[*] Dashboard available at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, threaded=True)
