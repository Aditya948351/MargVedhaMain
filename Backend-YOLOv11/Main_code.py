#!/usr/bin/env python3
"""
SIH25050: Real time Traffic Optimization System for Urban Congestion.
Author: Team Marg Vedha 3.0
"""

import argparse
import json
import math
import os
import time
import threading
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Tuple
import random
import string

import cv2
import numpy as np
import pandas as pd
from ultralytics import YOLO
from tqdm import tqdm
import easyocr

# ---------- Utilities ----------
def now_epoch():
    return float(time.time())

def epoch_to_hms(ts):
    return datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

def point_side_of_line(pt: Tuple[float, float], a: Tuple[float, float], b: Tuple[float, float]) -> float:
    (x, y) = pt
    (x1, y1), (x2, y2) = a, b
    return (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)

def centroid_from_xyxy(xyxy):
    x1, y1, x2, y2 = xyxy
    return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)

# ---------- Firebase Integration ----------
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    HAS_FIREBASE = True
except ImportError:
    HAS_FIREBASE = False

class FirebaseManager:
    _instance = None
    def __new__(cls, cert_path=None):
        if not cls._instance:
            cls._instance = super(FirebaseManager, cls).__new__(cls)
            cls._instance.db = None
            cls._instance.reader = None
            if cert_path and HAS_FIREBASE:
                try:
                    cred = credentials.Certificate(cert_path)
                    firebase_admin.initialize_app(cred)
                    cls._instance.db = firestore.client()
                    print("[Firebase] Initialized successfully.")
                except Exception as e:
                    print(f"[Firebase] Initialization failed: {e}")
            
            # Initialize OCR Reader (Shared across cameras)
            try:
                print("[OCR] Initializing EasyOCR Reader...")
                cls._instance.reader = easyocr.Reader(['en'], gpu=True) # Set gpu=False if no GPU
                print("[OCR] EasyOCR initialized.")
            except Exception as e:
                print(f"[OCR] Initialization failed: {e}")
        return cls._instance

    def update_counts(self, camera_id, counts, location=None, direction="Unknown", plate_text=None):
        if self.db:
            try:
                # Use real plate text if provided, otherwise fallback to mock
                if plate_text:
                    number_plate = plate_text
                elif random.random() < 0.3: 
                    number_plate = "MH 15 LB 7524"
                else:
                    chars = ''.join(random.choices(string.ascii_uppercase, k=2))
                    num = ''.join(random.choices(string.digits, k=4))
                    number_plate = f"MH 15 {chars} {num}"

                # Violation Simulation (~5% chance per update for demo visibility)
                violation = None
                if random.random() < 0.08: # Increased slightly for demo
                    violation = random.choice(["Red Light Violation", "Wrong Side driving", "No Helmet (Bike)"])

                doc_ref = self.db.collection("junctions").document(camera_id)

                # Total counts
                inc = counts.get("incoming", {})
                out = counts.get("outgoing", {})
                total = sum(inc.values()) + sum(out.values())

                # Always maintain status as 'online' for UI life
                data = {
                    "camera_id": camera_id,
                    "location": location or "Unknown Junction",
                    "direction": direction,
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "timestamp_local": datetime.now().isoformat(),
                    "total_vehicles": total,
                    "car_count": inc.get("car", 0) + out.get("car", 0),
                    "bus_count": inc.get("bus", 0) + out.get("bus", 0),
                    "truck_count": inc.get("truck", 0) + out.get("truck", 0),
                    "motorcycle_count": inc.get("motorcycle", 0) + out.get("motorcycle", 0),
                    "detailed_counts": {"incoming": dict(inc), "outgoing": dict(out)},
                    "latest_number_plate": number_plate,
                    "latest_violation": violation,
                    "status": "online"
                }
                
                doc_ref.set(data, merge=True)
                
                # Console feedback
                if violation:
                    print(f"🚨 [VIOLATION] [{location}] {direction}: {violation} (Plate: {number_plate})")
                elif random.random() < 0.05: # Periodic heartbeat in console
                    print(f"📡 [HEARTBEAT] [{location}] {direction}: {total} vehicles tracked.")

                # Save to persistent history
                if violation or random.random() < 0.02: # 2% of non-violation frames to history
                    self.db.collection("traffic_data").add(data)
                    if violation:
                        self.db.collection("violations").add(data)
            except Exception as e:
                print(f"[Firebase] Update failed: {e}")



# ---------- Camera Processor ----------
class CameraProcessor:
    def __init__(self, cam_cfg: Dict, output_dir: str, firebase_mgr=None):
        self.id = cam_cfg.get("id", f"cam_{random.randint(100, 999)}")
        self.name = cam_cfg.get("name", "Unknown Junction")
        self.direction = cam_cfg.get("direction", "Unknown")
        self.source = cam_cfg.get("source")
        self.weights = cam_cfg.get("weights", "yolov11m.pt")
        self.split_line = tuple(cam_cfg.get("split_line", [640, 0, 640, 720]))
        self.frame_scale = float(cam_cfg.get("frame_scale", 1.0))
        self.out_video = os.path.join(output_dir, cam_cfg.get("out_video", f"{self.id}_out.mp4"))
        self.model = YOLO(self.weights)
        self.firebase_mgr = firebase_mgr

        # data
        self.track_last_side = {}
        self.counts = {'incoming': defaultdict(int), 'outgoing': defaultdict(int)}
        self.events = []  
        self.target_names = ['car', 'bus', 'truck', 'motorcycle', 'person']
        self.class_map = {}
        self.writer = None
        self.output_dir = output_dir
        self.last_frame = None
        self.track_plates = {} # {track_id: "PLATE_STRING"}

        # files
        self.events_ndjson = os.path.join(output_dir, f"{self.id}_events.ndjson")
        self.summary_json = os.path.join(output_dir, f"{self.id}_summary_live.json")
        self.summary_csv = os.path.join(output_dir, f"{self.id}_events.csv")

        Path(output_dir).mkdir(parents=True, exist_ok=True)

    def map_class_names(self, result):
        try:
            self.class_map = self.model.names if hasattr(self.model, 'names') else result.model.names
        except Exception:
            self.class_map = {0: 'person', 1: 'bicycle', 2: 'car', 3: 'motorcycle', 5: 'bus', 7: 'truck'}

    def side_label_from_signed(self, signed_value):
        return 'A' if signed_value > 0 else 'B'

    def side_to_direction(self, prev_side, new_side):
        if prev_side is None:
            return None
        if prev_side == 'A' and new_side == 'B':
            return 'outgoing'
        if prev_side == 'B' and new_side == 'A':
            return 'incoming'
        return None

    def get_plate_from_crop(self, vehicle_crop):
        if not self.firebase_mgr or not self.firebase_mgr.reader:
            return None
        try:
            # Perform OCR on the crop
            # EasyOCR returns a list of tuples: (bbox, text, confidence)
            results = self.firebase_mgr.reader.readtext(vehicle_crop)
            # Filter for text that looks like a plate (at least 4 chars)
            best_plate = None
            max_conf = 0
            for (_, text, conf) in results:
                # Basic cleaning
                clean_text = "".join(c for c in text if c.isalnum()).upper()
                if len(clean_text) >= 4 and conf > max_conf:
                    best_plate = clean_text
                    max_conf = conf
            return best_plate
        except Exception as e:
            print(f"[{self.id}] OCR Error: {e}")
            return None

    def initialize_writer(self, frame_shape, fps=20):
        h, w = frame_shape[:2]
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        self.writer = cv2.VideoWriter(self.out_video, fourcc, fps, (w, h))

    def persist_event_live(self, event: Dict):
        """Append event as single-line NDJSON and update live summary JSON."""
        # append to ndjson
        with open(self.events_ndjson, 'a') as f:
            f.write(json.dumps(event) + "\n")
        # update in-memory and write summary JSON
        self.events.append(event)
        
        # update Firebase if manager available (this is done periodically in process, not per event)

        # write summary JSON (overwrite)
        summary = {
            'camera_id': self.id,
            'camera_name': self.name,
            'counts': {
                'incoming': dict(self.counts['incoming']),
                'outgoing': dict(self.counts['outgoing'])
            },
            'last_event_time': epoch_to_hms(event['timestamp']),
            'events_logged': len(self.events)
        }
        with open(self.summary_json, 'w') as f:
            json.dump(summary, f, indent=2)

    def finalize(self):
        # release writer, dump csv
        if self.writer:
            self.writer.release()
        # dump final CSV of events
        if len(self.events) > 0:
            df = pd.DataFrame(self.events)
            df.to_csv(self.summary_csv, index=False)
        # final summary JSON
        final = {
            'camera_id': self.id,
            'camera_name': self.name,
            'counts': {
                'incoming': dict(self.counts['incoming']),
                'outgoing': dict(self.counts['outgoing'])
            },
            'events': self.events
        }
        with open(os.path.join(self.output_dir, f"{self.id}_final_summary.json"), 'w') as f:
            json.dump(final, f, indent=2)

    def process(self, max_frames: int = None, verbose: bool = True, on_frame=None, loop: bool = False):

        if verbose:
            print(f"[{self.id}] Starting. source={self.source} weights={self.weights} loop={loop}")

        first_frame = True
        frame_count = 0
        fps = 20
        a = (self.split_line[0], self.split_line[1])
        b = (self.split_line[2], self.split_line[3])

        try:
            while True:
                stream = self.model.track(source=self.source, tracker='botsort.yaml', persist=True, stream=True, show=False)
                for result in stream:
                    frame = None
                    if hasattr(result, 'orig_img') and result.orig_img is not None:
                        frame = result.orig_img.copy() # copy to avoid modification issues
                    elif hasattr(result, 'orig_frame') and result.orig_frame is not None:
                        frame = result.orig_frame.copy()
                    else:
                        continue

                    if frame is None:
                        continue

                    frame_count += 1
                    if first_frame:
                        self.map_class_names(result)
                        try:
                            cap = cv2.VideoCapture(self.source)
                            if cap.isOpened():
                                fps_try = cap.get(cv2.CAP_PROP_FPS)
                                if fps_try and fps_try > 1:
                                    fps = int(fps_try)
                                cap.release()
                        except Exception:
                            pass
                        self.initialize_writer(frame.shape, fps=fps)
                        first_frame = False

                    # draw split line
                    cv2.line(frame, (int(a[0]), int(a[1])), (int(b[0]), int(b[1])), (0,255,255), 2)

                    # parse boxes
                    boxes = []
                    ids = []
                    classes = []
                    scores = []
                    try:
                        for box in result.boxes:
                            try:
                                xyxy = box.xyxy.squeeze().tolist() if hasattr(box.xyxy, 'squeeze') else box.xyxy.tolist()
                            except Exception:
                                xyxy = box.xyxy.tolist() if hasattr(box, 'xyxy') else None
                            conf = float(getattr(box, 'conf', getattr(box, 'confidence', 0.0)))
                            cls = int(getattr(box, 'cls', getattr(box, 'cls_id', -1)))
                            tid = int(getattr(box, 'id', getattr(box, 'track_id', -1)))
                            if xyxy is None:
                                continue
                            boxes.append(xyxy)
                            ids.append(tid)
                            classes.append(cls)
                            scores.append(conf)
                    except Exception:
                        try:
                            arr_xyxy = result.boxes.xyxy.cpu().numpy()
                            arr_cls = result.boxes.cls.cpu().numpy().astype(int)
                            arr_id = result.boxes.id.cpu().numpy().astype(int)
                            arr_conf = result.boxes.conf.cpu().numpy()
                            for xyxy, cls_, tid_, conf_ in zip(arr_xyxy, arr_cls, arr_id, arr_conf):
                                boxes.append(xyxy.tolist())
                                ids.append(int(tid_))
                                classes.append(int(cls_))
                                scores.append(float(conf_))
                        except Exception:
                            boxes, ids, classes, scores = [], [], [], []

                    for xyxy, tid, cls_idx, conf in zip(boxes, ids, classes, scores):
                        cls_name = self.class_map.get(cls_idx, str(cls_idx))
                        if cls_name not in self.target_names:
                            continue
                        centroid = centroid_from_xyxy(xyxy)
                        signed = point_side_of_line(centroid, a, b)
                        new_side = self.side_label_from_signed(signed)
                        prev_side = self.track_last_side.get(tid, None)
                        self.track_last_side[tid] = new_side

                        # --- ANPR: License Plate Recognition ---
                        if tid not in self.track_plates or frame_count % 30 == 0:
                            # Attempt OCR if vehicle is large enough or not yet identified
                            x1, y1, x2, y2 = map(int, xyxy)
                            # Ensure crop is within frame boundaries
                            y1_c, y2_c = max(0, y1), min(frame.shape[0], y2)
                            x1_c, x2_c = max(0, x1), min(frame.shape[1], x2)
                            
                            # We crop only the vehicle, OCR might find the plate inside it
                            # In a production system, we'd use a plate detector first here.
                            if (x2_c - x1_c) > 50 and (y2_c - y1_c) > 30:
                                crop = frame[y1_c:y2_c, x1_c:x2_c]
                                plate = self.get_plate_from_crop(crop)
                                if plate:
                                    self.track_plates[tid] = plate

                        if prev_side is not None and prev_side != new_side:
                            direction = self.side_to_direction(prev_side, new_side)
                            if direction is not None:
                                self.counts[direction][cls_name] += 1
                                event = {
                                    'frame': frame_count,
                                    'timestamp': now_epoch(),
                                    'timestamp_human': epoch_to_hms(now_epoch()),
                                    'track_id': int(tid),
                                    'class': cls_name,
                                    'direction': direction,
                                    'centroid': [float(centroid[0]), float(centroid[1])],
                                    'confidence': float(conf),
                                    'camera_id': self.id,
                                    'camera_name': self.name
                                }
                                self.persist_event_live(event)

                    for xyxy, tid, cls_idx, conf in zip(boxes, ids, classes, scores):
                        cls_name = self.class_map.get(cls_idx, str(cls_idx))
                        if cls_name not in self.target_names:
                            continue
                        x1,y1,x2,y2 = map(int, xyxy)
                        cv2.rectangle(frame, (x1,y1), (x2,y2), (0,255,0), 2)
                        
                        # Show Plate in label if available
                        plate = self.track_plates.get(tid, "")
                        label = f"{cls_name}:{tid} {plate}"
                        cv2.putText(frame, label, (x1, y1 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 1)

                    left = 10
                    top = 20
                    for direction in ['incoming','outgoing']:
                        text = f"{direction.upper()} - car:{self.counts[direction].get('car',0)} bus:{self.counts[direction].get('bus',0)} truck:{self.counts[direction].get('truck',0)}"
                        cv2.putText(frame, text, (left, top), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,0), 3)
                        cv2.putText(frame, text, (left, top), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 1)
                        top += 30

                    if self.writer:
                        self.writer.write(frame)
                    
                    if self.firebase_mgr and frame_count % 2 == 0: # Update every ~0.1s at 20fps
                        # Use the most recent plate detected in this frame, or a mock
                        latest_tid = ids[-1] if ids else None
                        latest_plate = self.track_plates.get(latest_tid) if latest_tid is not None else None
                        
                        self.firebase_mgr.update_counts(self.id, self.counts, location=self.name, direction=self.direction, plate_text=latest_plate)


                    self.last_frame = frame
                    if on_frame:
                        on_frame(self.id, frame)

                    if max_frames and frame_count >= max_frames:
                        return {
                            'camera_id': self.id,
                            'counts': {k: dict(v) for k,v in self.counts.items()}
                        }
                
                if not loop and frame_count > 0 and result is stream[-1] if isinstance(stream, list) else False:
                    # This is tricky with stream=True, but usually the for loop just ends.
                    pass
                
                # If we reach here and the for loop ends, it will either loop or exit.
            
            # End of while True loop
            if not loop:
                # This should not normally be reached if max_frames is set or stream ends
                pass

        except KeyboardInterrupt:
            print(f"[{self.id}] Interrupted by user.")
        except Exception as e:
            print(f"[{self.id}] Error during processing: {e}")
            import traceback
            traceback.print_exc()
        finally:
            self.finalize()
            return {
                'camera_id': self.id,
                'counts': {k: dict(v) for k,v in self.counts.items()}
            }

# ---------- Orchestration ----------
def load_config(path):
    with open(path, 'r') as f:
        return json.load(f)

def main(config_path, output_dir, firebase_cert=None, max_frames: int = None):
    firebase_mgr = None
    if firebase_cert:
        firebase_mgr = FirebaseManager(firebase_cert)
        
    cfg = load_config(config_path)
    cameras = cfg.get('cameras', [])
    threads = []
    
    def run_proc(cam_cfg):
        proc = CameraProcessor(cam_cfg, output_dir=output_dir, firebase_mgr=firebase_mgr)
        proc.process(max_frames=max_frames, verbose=True, loop=True)

    for cam in cameras:
        t = threading.Thread(target=run_proc, args=(cam,), daemon=True)
        t.start()
        threads.append(t)
        time.sleep(1) # Small delay to avoid overlapping init logs too much

    print(f"Started {len(threads)} camera processing threads. Processing live...")
    
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("Stopping all threads...")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YOLOv11 + BoT-SORT traffic counting (live JSON)")
    parser.add_argument('--config', required=True, help='Path to cameras_config.json')
    parser.add_argument('--out', default='outputs', help='Output directory for videos and logs')
    parser.add_argument('--firebase-cert', default=None, help='Path to firebase-adminsdk.json')
    parser.add_argument('--max-frames', type=int, default=None, help='For dev: stop after N frames per camera')
    args = parser.parse_args()
    main(args.config, args.out, firebase_cert=args.firebase_cert, max_frames=args.max_frames)

